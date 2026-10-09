"""
Variables manager – reads the IMOS table from SQL Server (database 2124_Test).
Run:  pip install -r requirements.txt  &&  python app.py  ->  http://127.0.0.1:5000
Edit config.py for the server name and column mapping.
"""
import datetime
import decimal
import re
import threading
import time
from collections import defaultdict
from flask import Flask, jsonify, request, render_template, g, abort

import config

app = Flask(__name__)
app.json.sort_keys = False   # keep the column order of the IMOS table

# Speed settings – can be overridden in config.py
QUERY_TIMEOUT = getattr(config, "QUERY_TIMEOUT", 30)     # seconds for normal queries
TREE_TIMEOUT = getattr(config, "TREE_TIMEOUT", 300)      # seconds to read a whole IMOS table
PREFETCH = getattr(config, "PREFETCH", True)             # preload the other databases in the background

CANDIDATES = {
    "id":       ["ID", "VAR_ID", "IDVAR", "ID_VAR", "VARID", "GUID", "UID"],
    "name":     ["NAME", "NOM", "VARNAME", "VAR_NAME"],
    "parent":   ["PARENT", "PARENT_ID", "PARENTID", "IDPARENT", "ID_PARENT", "PID"],
    "family":   ["FAMILY", "FAMILLE", "FAMILYNAME", "FAMILY_NAME", "GROUPNAME", "GRP", "FOLDER"],
    "type":     ["TYPE", "VARTYPE", "VAR_TYPE", "KIND", "DATATYPE"],
    "category": ["CATEGORY", "CATEGORIE", "CAT", "CATEGORYNAME"],
    "notes":    ["NOTES", "NOTE", "COMMENT", "COMMENTS", "REMARK", "DESCRIPTION", "DESCR"],
    "default":  ["DEFAULTVALUE", "DEFAULT_VALUE", "DEFAULT", "DEFVAL", "DEFVALUE", "VALUE"],
}


# ------------------------------------------------------------------ database
def connection_string(database):
    s = f"DRIVER={{{config.DRIVER}}};SERVER={config.SERVER};DATABASE={database};{config.EXTRA}"
    if config.TRUSTED_CONNECTION:
        return s + "Trusted_Connection=yes;"
    return s + f"UID={config.USERNAME};PWD={config.PASSWORD};"


def connect(database=None):
    import pyodbc
    return pyodbc.connect(connection_string(database or current_db()), timeout=10)


# ------------------------------------------------------------------ databases on the server
_DB_CACHE = {"at": 0, "list": []}


def list_databases(force=False):
    """User databases on the server, with a flag telling if they contain the IMOS table."""
    if force or time.time() - _DB_CACHE["at"] > 60 or not _DB_CACHE["list"]:
        cn = connect(config.DATABASE)
        try:
            cur = cn.cursor()
            cur.execute(
                "SELECT name, CASE WHEN HAS_DBACCESS(name) = 1 "
                "AND OBJECT_ID(QUOTENAME(name) + '.' + ?) IS NOT NULL THEN 1 ELSE 0 END "
                "FROM sys.databases WHERE database_id > 4 AND state = 0 ORDER BY name",
                [config.TABLE if "." in config.TABLE else "dbo." + config.TABLE])
            _DB_CACHE["list"] = [{"name": r[0], "has_table": bool(r[1])} for r in cur.fetchall()]
            _DB_CACHE["at"] = time.time()
        finally:
            cn.close()
    return _DB_CACHE["list"]


def current_db():
    """Database chosen in the combobox (sent by the page in the X-Database header)."""
    if "db_name" in g:
        return g.db_name
    wanted = (request.headers.get("X-Database") or "").strip() if request else ""
    name = config.DATABASE
    if wanted and wanted != config.DATABASE:
        if not re.fullmatch(r"[\w\-. ]{1,128}", wanted):
            abort(400, description="Invalid database name.")
        known = {d["name"].lower(): d for d in list_databases()}
        d = known.get(wanted.lower())
        if not d:
            abort(400, description=f"Database {wanted} doesn't exist on {config.SERVER}.")
        if not d["has_table"]:
            abort(400, description=f"Database {wanted} has no {config.TABLE} table.")
        name = d["name"]
    g.db_name = name
    return name


def read_only():
    """Writes are allowed only in the databases listed in WRITE_DATABASES (config.py)."""
    if config.READ_ONLY:
        return True
    allowed = {d.lower() for d in getattr(config, "WRITE_DATABASES", {config.DATABASE})}
    return current_db().lower() not in allowed


def get_db():
    if "db" not in g:
        g.db = connect()
        g.db.timeout = QUERY_TIMEOUT          # never wait forever (locks, network)
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def q(ident):
    """Quote an identifier for SQL Server: dbo.IMOS -> [dbo].[IMOS]."""
    return ".".join("[" + p.replace("]", "]]") + "]" for p in ident.split("."))


def to_json(v):
    if v is None or isinstance(v, (str, int, float, bool)):
        return v
    if isinstance(v, decimal.Decimal):
        return float(v)
    if isinstance(v, (datetime.date, datetime.datetime, datetime.time)):
        return v.isoformat(sep=" ") if isinstance(v, datetime.datetime) else v.isoformat()
    if isinstance(v, (bytes, bytearray, memoryview)):
        return f"<binary {len(bytes(v))} bytes>"
    return str(v)


# Structure of the IMOS table (columns, max lengths, column mapping), read once per database
_SCHEMA = {}


def _load_schema(cn):
    cur = cn.cursor()
    cur.execute(f"SELECT * FROM {q(config.TABLE)} WHERE 1=0")
    cols = [d[0] for d in cur.description]
    schema, _, table = config.TABLE.rpartition(".")
    limits = {}
    try:
        cur.execute("SELECT COLUMN_NAME, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS "
                    "WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?", [table, schema or "dbo"])
        limits = {r[0].upper(): int(r[1]) for r in cur.fetchall() if r[1] and int(r[1]) > 0}
    except Exception:
        pass
    return {"cols": cols, "limits": limits, "map": _mapping_for(cols)}


def schema_for(db, cn=None):
    k = db.lower()
    if k not in _SCHEMA:
        own = cn is None
        c = cn or connect(db)
        try:
            _SCHEMA[k] = _load_schema(c)
        finally:
            if own:
                c.close()
    return _SCHEMA[k]


def table_columns():
    return schema_for(current_db(), get_db())["cols"]


def column_limits():
    """Max length of each text column of the IMOS table, e.g. {"NAME": 50, "OPTINFO": 255}."""
    return schema_for(current_db(), get_db())["limits"]


def field_limits():
    """Same limits, by logical field (name, notes, category, default, parent)."""
    m, lim = mapping(), column_limits()
    return {k: lim.get(m[k].upper()) for k in ("name", "notes", "category", "default", "parent") if m[k]}


LABELS = {"name": "Name", "notes": "Notes", "category": "Category", "default": "Default Value", "parent": "Family"}


def check_length(field, value):
    """Stop with a clear message instead of SQL Server's 'String or binary data would be truncated'."""
    limit = field_limits().get(field)
    value = "" if value is None else str(value)
    if limit and len(value) > limit:
        abort(400, description=f"{LABELS.get(field, field)} is too long: {len(value)} characters "
                               f"(maximum {limit} in {config.TABLE}).")


def _mapping_for(cols):
    """Logical field -> real column (or None), using config first, then guessing."""
    by_upper = {c.upper(): c for c in cols}
    m = {}
    for key_, cands in CANDIDATES.items():
        wanted = config.COLUMNS.get(key_)
        if wanted:
            m[key_] = by_upper.get(wanted.upper())
        else:
            m[key_] = next((by_upper[c] for c in cands if c in by_upper), None)
    if not m["name"]:
        raise RuntimeError(f"No NAME column found in {config.TABLE}. Set COLUMNS['name'] in config.py.")
    if not m["id"]:
        m["id"] = m["name"]
    if not m["parent"] and m["family"] and m["id"] == m["name"]:
        m["parent"] = m["family"]       # FAMILY holds the NAME of the parent family
    if m["default"] in (m["id"], m["name"]):
        m["default"] = None
    return m


def mapping():
    return schema_for(current_db(), get_db())["map"]


def _mode(m):
    return "parent" if m["parent"] else "family" if m["family"] else "flat"


def tree_mode():
    return _mode(mapping())


def rows(sql, params=()):
    cur = get_db().cursor()
    cur.execute(sql, params)
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, (to_json(v) for v in r))) for r in cur.fetchall()]


def where_filter(prefix="WHERE"):
    if config.NAME_FILTER:
        return f" {prefix} {q(mapping()['name'])} LIKE ?", [config.NAME_FILTER]
    return "", []


def icon_for(type_value):
    if type_value is None:
        return "Other"
    return config.TYPE_ICONS.get(str(type_value).strip().upper(), "Other")


def type_label(type_value):
    if type_value in (None, ""):
        return ""
    try:
        code = int(float(type_value))
    except (TypeError, ValueError):
        return str(type_value)
    name = getattr(config, "TYPES", {}).get(code)
    return name if name else str(code)


def stamp():
    """Extra SET clause for the last-change date column, if configured."""
    col = getattr(config, "DATE_COLUMN", None)
    return f", {q(col)} = GETDATE()" if col and col in table_columns() else ""


def sid(v):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    return str(v).strip()


# Sort like IMOS / SQL Server: "_" first, then digits, then letters, upper/lower case ignored
#   ___CATALOG, ___MODEL_NAME, 23_IS_BI_T, 461, 830, addArt_1, ...
_SORT_TABLE = str.maketrans({"_": "\x01"})


def name_order(v):
    return sid(v).upper().translate(_SORT_TABLE)


def key(v):
    """Comparison key: SQL Server compares names case-insensitively and ignores trailing spaces."""
    return sid(v).upper()


# ------------------------------------------------------------------ errors
@app.errorhandler(Exception)
def handle(e):
    if hasattr(e, "code") and isinstance(getattr(e, "code"), int):
        return jsonify(error=getattr(e, "description", str(e))), e.code
    text = str(e)
    if "HYT00" in text or "HYT01" in text or "timeout expired" in text.lower():
        return jsonify(error="SQL Server didn't answer in time. The IMOS table may be locked by IMOS "
                             "or the server is busy. Wait a moment and press Refresh."), 504
    app.logger.exception(e)
    return jsonify(error=text), 500


# Data kept in memory per database: the tree, the categories, the default values per type.
# Cleared when the app writes to that database, or with the Refresh button.
_TREES, _CATS, _CATALOG = {}, {}, {}
_TREE_LOCKS = defaultdict(threading.Lock)
_PREFETCH = {"running": False}


def invalidate(db):
    """A write is coming: forget the category list and the default values (cheap to read again).
    The tree is NOT reloaded – it is updated in memory by patch_tree() (milliseconds instead of minutes)."""
    k = db.lower()
    _CATS.pop(k, None)
    for ck in [c for c in _CATALOG if c[0] == k]:
        _CATALOG.pop(ck, None)


def guard_write():
    invalidate(current_db())                  # this request changes the data: forget the old copy
    if read_only():
        abort(403, description=f"{current_db()} is read-only. Add it to WRITE_DATABASES in config.py "
                               f"(and set READ_ONLY = False) to edit it.")


# ------------------------------------------------------------------ pages
@app.route("/")
def index():
    return render_template("index.html")


# ------------------------------------------------------------------ API
@app.get("/api/schema")
def schema():
    """Debug: shows the real columns and how they were mapped."""
    return jsonify(table=config.TABLE, database=current_db(), columns=table_columns(),
                   mapping=mapping(), tree_mode=tree_mode(), read_only=read_only())


@app.get("/api/databases")
def databases():
    dbs = [dict(d, ready=d["name"].lower() in _TREES)
           for d in list_databases(force=request.args.get("refresh") == "1")]
    return jsonify(default=config.DATABASE, databases=dbs, prefetching=_PREFETCH["running"])


@app.get("/api/meta")
def meta():
    m, db = mapping(), current_db()
    if request.args.get("refresh") == "1":
        _SCHEMA.pop(db.lower(), None)
        _CATS.pop(db.lower(), None)
        m = mapping()
    cats = _CATS.get(db.lower())
    if cats is None:
        cats = []
        if m["category"]:
            cats = [r["c"] for r in rows(
                f"SELECT DISTINCT {q(m['category'])} AS c FROM {q(config.TABLE)} WITH (NOLOCK) "
                f"WHERE {q(m['category'])} IS NOT NULL ORDER BY 1")]
        _CATS[db.lower()] = cats
    types = [{"code": c, "name": n} for c, n in sorted(getattr(config, "TYPES", {}).items(), key=lambda x: x[1].lower())
             if str(c) not in config.FAMILY_TYPES]
    return jsonify(read_only=read_only(), mode=tree_mode(), mapping=m, types=types,
                   can_create=bool(m["parent"]) and bool(getattr(config, "INSERT_DEFAULTS", None)),
                   categories=[str(c) for c in cats if str(c).strip()], table=config.TABLE,
                   database=current_db(), default_database=config.DATABASE, limits=field_limits())


def _build_tree(data, m, mode):
    """Rows (id, name, parent, family, type) -> nested families / variables."""
    def var(r):
        return {"id": sid(r["id"]), "name": sid(r["name"]), "type": sid(r.get("type")),
                "icon": icon_for(r.get("type"))}

    if mode == "flat":
        return {"families": [], "variables": [var(r) for r in data]}

    if mode == "family":
        fams = {}
        loose = []
        for r in data:
            fname = sid(r.get("family")).strip()
            if not fname:
                loose.append(var(r))
                continue
            # "A\B\C" or "A/B/C" family paths become nested families
            parts = [x for x in fname.replace("\\", "/").split("/") if x]
            level, path = fams, ""
            node = None
            for part in parts:
                path = f"{path}/{part}" if path else part
                node = level.setdefault(part, {"id": "fam:" + path, "name": part,
                                               "_kids": {}, "variables": []})
                level = node["_kids"]
            node["variables"].append(var(r))

        def finish(level):
            out = []
            for n in sorted(level.values(), key=lambda x: x["name"].lower()):
                out.append({"id": n["id"], "name": n["name"],
                            "families": finish(n["_kids"]), "variables": n["variables"]})
            return out
        return {"families": finish(fams), "variables": loose}

    # mode == "parent": FAMILY of each row = NAME of its parent family row
    fam_types = {key(t) for t in config.FAMILY_TYPES}
    parent_keys = {key(r.get("parent")) for r in data if key(r.get("parent")) not in ("", "0")}
    nodes, order = {}, []
    for r in data:
        k = key(r["id"])
        if not k or k in nodes:
            continue
        is_fam = k in parent_keys or key(r.get("type")) in fam_types
        n = ({"id": sid(r["id"]), "name": sid(r["name"]), "type": sid(r.get("type")), "families": [], "variables": []}
             if is_fam else var(r))
        nodes[k] = (n, is_fam, key(r.get("parent")))
        order.append(k)

    def attach_to(k):
        """Parent key to attach under, or None = top level (parent missing, not a family, or a loop)."""
        pk = nodes[k][2]
        if pk == k or pk not in nodes or not nodes[pk][1]:
            return None
        seen, cur = {k}, pk
        while cur in nodes and nodes[cur][1]:
            if cur in seen:
                return None
            seen.add(cur)
            cur = nodes[cur][2]
        return pk

    top_f, top_v = [], []
    for k in order:
        n, is_fam, _ = nodes[k]
        pk = attach_to(k)
        if pk is None:
            (top_f if is_fam else top_v).append(n)
        else:
            parent = nodes[pk][0]
            (parent["families"] if is_fam else parent["variables"]).append(n)
    return {"families": top_f, "variables": top_v}


def load_tree(db, force=False):
    """Tree of one database. Read from SQL Server the first time (or on Refresh), then from memory."""
    k = db.lower()
    with _TREE_LOCKS[k]:                      # the background preload and a click never read it twice
        if not force and k in _TREES:
            return _TREES[k], True
        t0 = time.perf_counter()
        cn = connect(db)
        try:
            cn.timeout = TREE_TIMEOUT
            m = schema_for(db, cn)["map"]
            sel = {f: m[f] for f in ("id", "name", "parent", "family", "type") if m[f]}
            cols = ", ".join(f"{q(c)} AS {q(f)}" for f, c in sel.items())
            where, params = "", []
            if config.NAME_FILTER:
                where, params = f" WHERE {q(m['name'])} LIKE ?", [config.NAME_FILTER]
            cur = cn.cursor()
            # WITH (NOLOCK): read even while IMOS is writing, instead of waiting for its locks
            cur.execute(f"SELECT {cols} FROM {q(config.TABLE)} WITH (NOLOCK){where}", params)
            names = [d[0] for d in cur.description]
            data = []
            while True:
                chunk = cur.fetchmany(5000)
                if not chunk:
                    break
                data.extend(dict(zip(names, (to_json(v) for v in r))) for r in chunk)
            t_sql = time.perf_counter() - t0
            data.sort(key=lambda r: name_order(r.get("name")))   # sorting in Python is faster than ORDER BY
            result = _build_tree(data, m, _mode(m))
        finally:
            cn.close()
        took = time.perf_counter() - t0
        result["_rows"] = data
        result["info"] = {"rows": len(data), "took_ms": int(took * 1000), "sql_ms": int(t_sql * 1000),
                          "loaded_at": time.time()}
        _TREES[k] = result
        app.logger.warning(f"[tree] {db}: {len(data)} rows, SQL {t_sql:.1f}s, total {took:.1f}s")
        return result, False


def patch_tree(db, change):
    """Apply a change made by this app to the tree kept in memory, without reading SQL Server again."""
    k = db.lower()
    with _TREE_LOCKS[k]:
        old = _TREES.get(k)
        if old is None:
            return
        data = old["_rows"]
        change(data)
        data.sort(key=lambda r: name_order(r.get("name")))
        m = schema_for(db)["map"]
        new = _build_tree(data, m, _mode(m))
        new["_rows"] = data
        new["info"] = dict(old["info"], rows=len(data))
        _TREES[k] = new


def _set_parent(r, value):
    for f in ("parent", "family"):
        if f in r:
            r[f] = value


@app.get("/api/tree")
def tree():
    result, cached = load_tree(current_db(), force=request.args.get("refresh") == "1")
    info = dict(result["info"], cached=cached, age_s=int(time.time() - result["info"]["loaded_at"]))
    return jsonify(families=result["families"], variables=result["variables"], info=info)


@app.post("/api/prefetch")
def prefetch():
    """After the first database is shown, quietly load the other ones so switching is instant."""
    if not PREFETCH or _PREFETCH["running"]:
        return jsonify(started=False)
    dbs = [d["name"] for d in list_databases() if d["has_table"] and d["name"].lower() not in _TREES]

    def work():
        _PREFETCH["running"] = True
        try:
            for name in dbs:
                try:
                    load_tree(name)
                except Exception as e:                      # one bad database must not stop the others
                    app.logger.warning(f"[prefetch] {name}: {e}")
        finally:
            _PREFETCH["running"] = False

    threading.Thread(target=work, daemon=True).start()
    return jsonify(started=True, databases=dbs)


def fetch_row(rid):
    m = mapping()
    # "NAME = ?" lets SQL Server use its index (SQL Server ignores trailing spaces in = anyway)
    r = rows(f"SELECT * FROM {q(config.TABLE)} WITH (NOLOCK) WHERE {q(m['id'])} = ?", [rid])
    if not r:
        abort(404, description="This row no longer exists in the table. Refresh the tree.")
    return r[0]


def describe(row):
    m = mapping()
    pick = lambda k: row.get(m[k]) if m[k] else None
    return {
        "id": sid(row.get(m["id"])), "name": sid(row.get(m["name"])),
        "type": sid(pick("type")), "type_label": type_label(pick("type")), "icon": icon_for(pick("type")),
        "category": sid(pick("category")), "notes": sid(pick("notes")),
        "default_value": sid(pick("default")),
        "has": {k: bool(m[k]) for k in ("type", "category", "notes", "default")},
    }


@app.get("/api/variable/<path:rid>")
def get_variable(rid):
    row = fetch_row(rid)
    return jsonify(variable=describe(row), raw=row, read_only=read_only())


@app.get("/api/family/<path:fid>")
def get_family(fid):
    if fid.startswith("fam:"):           # family derived from a FAMILY column
        m = mapping()
        name = fid[4:]
        w, p = where_filter("AND")
        n = rows(f"SELECT COUNT(*) AS n FROM {q(config.TABLE)} WHERE "
                 f"(CAST({q(m['family'])} AS NVARCHAR(4000)) = ? OR CAST({q(m['family'])} AS NVARCHAR(4000)) LIKE ?){w}",
                 [name, name + "/%"] + p)[0]["n"]
        return jsonify(family={"id": fid, "name": name.split("/")[-1]}, path=name,
                       variable_count=n, raw=None, read_only=True)
    row = fetch_row(fid)
    d = describe(row)
    return jsonify(family={"id": d["id"], "name": d["name"]}, info=d, path=None,
                   variable_count=None, raw=row, read_only=read_only())


@app.put("/api/variable/<path:rid>")
def update_variable(rid):
    guard_write()
    m, data = mapping(), request.get_json(force=True)
    sets, params = [], []
    for field, key in (("notes", "notes"), ("category", "category"), ("default_value", "default")):
        if m[key] and field in data:
            check_length(key, data[field])
            sets.append(f"{q(m[key])} = ?")
            params.append(data[field] if data[field] is not None else "")   # IMOS columns are NOT NULL: empty = ''
    if sets:
        db = get_db()
        db.cursor().execute(f"UPDATE {q(config.TABLE)} SET {', '.join(sets)}{stamp()} "
                            f"WHERE LTRIM(RTRIM(CAST({q(m['id'])} AS NVARCHAR(4000)))) = ?", params + [rid])
        db.commit()
    return get_variable(rid)


@app.put("/api/rename/<kind>/<path:rid>")
def rename(kind, rid):
    guard_write()
    if rid.startswith("fam:"):
        abort(400, description="Families come from a column value; rename them in SQL Server.")
    name = (request.get_json(force=True).get("name") or "").strip()
    if not name or " " in name:
        abort(400, description="Enter a name without spaces.")
    check_length("name", name)
    if kind == "family":
        check_length("parent", name)      # the children's FAMILY column will hold this name
    m = mapping()
    if rows(f"SELECT 1 AS x FROM {q(config.TABLE)} WHERE LTRIM(RTRIM({q(m['name'])})) = ? "
            f"AND LTRIM(RTRIM(CAST({q(m['id'])} AS NVARCHAR(4000)))) <> ?", [name, rid]):
        abort(400, description=f"{name} already exists in {config.TABLE}.")
    db = get_db()
    cur = db.cursor()
    cur.execute(f"UPDATE {q(config.TABLE)} SET {q(m['name'])} = ?{stamp()} "
                f"WHERE LTRIM(RTRIM(CAST({q(m['id'])} AS NVARCHAR(4000)))) = ?", [name, rid])
    # children point to their family by NAME: move them to the new name
    if m["parent"] and m["id"] == m["name"]:
        cur.execute(f"UPDATE {q(config.TABLE)} SET {q(m['parent'])} = ? "
                    f"WHERE LTRIM(RTRIM(CAST({q(m['parent'])} AS NVARCHAR(4000)))) = ?", [name, rid])
    db.commit()
    new_id = name if m["id"] == m["name"] else rid

    def ren(data):
        for r in data:
            if key(r.get("id")) == key(rid):
                r["name"] = name
                r["id"] = new_id
            elif m["id"] == m["name"] and key(r.get("parent", r.get("family"))) == key(rid):
                _set_parent(r, name)
    patch_tree(current_db(), ren)
    if tv_has_table():                        # value sets follow the new name
        extra, ep = _tv_stamp()
        c2 = get_db().cursor()
        c2.execute(f"UPDATE {q(TV['table'])} SET {q(TV['var'])} = ?{extra} WHERE {q(TV['var'])} = ?", [name] + ep + [rid])
        get_db().commit()
    return jsonify(ok=True, id=new_id)


@app.put("/api/move/<kind>/<path:rid>")
def move(kind, rid):
    """Move a variable or a family into another family = change its FAMILY column.
    target "" = top level (directly under Variables)."""
    guard_write()
    if kind not in ("variable", "family"):
        abort(404)
    m = mapping()
    if not m["parent"] or rid.startswith("fam:"):
        abort(400, description="Moving needs a FAMILY column that points to the parent family.")
    target = (request.get_json(force=True).get("target") or "").strip()
    fetch_row(rid)                                    # 404 if the item no longer exists
    idcol = f"LTRIM(RTRIM(CAST({q(m['id'])} AS NVARCHAR(4000))))"
    pcol = f"LTRIM(RTRIM(CAST({q(m['parent'])} AS NVARCHAR(4000))))"

    if target:
        t = rows(f"SELECT {q(m['id'])} AS id, {q(m['type'])} AS typ FROM {q(config.TABLE)} WHERE {idcol} = ?", [target])
        if not t:
            abort(400, description=f"The family {target} doesn't exist.")
        is_fam = key(t[0]["typ"]) in {key(x) for x in config.FAMILY_TYPES} or rows(
            f"SELECT TOP 1 1 AS x FROM {q(config.TABLE)} WHERE {pcol} = ?", [target])
        if not is_fam:
            abort(400, description=f"{target} is a variable, not a family.")
        target = sid(t[0]["id"])
        if key(target) == key(rid):
            abort(400, description="A family can't be moved into itself.")
        if kind == "family":                         # not into one of its own sub-families
            frontier, inside = [rid], set()
            while frontier:
                marks = ",".join("?" * len(frontier))
                kids = [sid(r["k"]) for r in rows(
                    f"SELECT {q(m['id'])} AS k FROM {q(config.TABLE)} WHERE {pcol} IN ({marks})", frontier)]
                kids = [k for k in kids if key(k) not in inside]
                inside |= {key(k) for k in kids}
                frontier = kids
            if key(target) in inside:
                abort(400, description=f"{target} is inside {rid}. A family can't be moved into its own sub-family.")
        check_length("parent", target)

    current = rows(f"SELECT {q(m['parent'])} AS p FROM {q(config.TABLE)} WITH (NOLOCK) WHERE {q(m['id'])} = ?", [rid])[0]["p"]
    if key(current) == key(target):
        abort(400, description=f"{rid} is already there.")
    db = get_db()
    db.cursor().execute(f"UPDATE {q(config.TABLE)} SET {q(m['parent'])} = ?{stamp()} WHERE {idcol} = ?", [target, rid])
    db.commit()

    def mov(data):
        for r in data:
            if key(r.get("id")) == key(rid):
                _set_parent(r, target)
    patch_tree(current_db(), mov)
    return jsonify(ok=True, id=rid, target=target)


@app.delete("/api/<kind>/<path:rid>")
def delete(kind, rid):
    if kind not in ("variable", "family"):
        abort(404)
    guard_write()
    if rid.startswith("fam:"):
        abort(400, description="Families come from a column value; delete their rows in SQL Server.")
    m = mapping()
    ids = [rid]
    if kind == "family" and m["parent"]:      # also delete everything inside the family
        frontier = [rid]
        while frontier:
            marks = ",".join("?" * len(frontier))
            kids = [sid(r["k"]) for r in rows(
                f"SELECT {q(m['id'])} AS k FROM {q(config.TABLE)} "
                f"WHERE LTRIM(RTRIM(CAST({q(m['parent'])} AS NVARCHAR(4000)))) IN ({marks})", frontier)]
            kids = [k for k in kids if k not in ids]
            ids += kids
            frontier = kids
    db = get_db()
    cur = db.cursor()
    for i in range(0, len(ids), 500):
        chunk = ids[i:i + 500]
        cur.execute(f"DELETE FROM {q(config.TABLE)} WHERE LTRIM(RTRIM(CAST({q(m['id'])} AS NVARCHAR(4000)))) "
                    f"IN ({','.join('?' * len(chunk))})", chunk)
    db.commit()
    if tv_has_table():                        # their value-set rows go too
        c2 = get_db().cursor()
        for chunk in _in_chunks(ids):
            c2.execute(f"DELETE FROM {q(TV['table'])} WHERE {q(TV['var'])} IN ({','.join('?' * len(chunk))})", chunk)
        get_db().commit()
    gone = {key(i) for i in ids}
    patch_tree(current_db(), lambda data: data.__setitem__(slice(None), [r for r in data if key(r.get("id")) not in gone]))
    return jsonify(ok=True, deleted=len(ids))


def insert_row(name, typ, parent, category="", notes=""):
    """INSERT INTO IMOS (...) VALUES (...) – same columns as the SSMS statement."""
    m = mapping()
    name = (name or "").strip()
    if not name or any(c in name for c in " /\\'\""):
        abort(400, description="Enter a name without spaces, slashes or quotes.")
    check_length("name", name)
    check_length("parent", parent)
    check_length("category", category)
    check_length("notes", notes)
    if rows(f"SELECT 1 AS x FROM {q(config.TABLE)} WHERE LTRIM(RTRIM({q(m['name'])})) = ?", [name]):
        abort(400, description=f"{name} already exists in {config.TABLE}.")
    cols = table_columns()
    values = {c: v for c, v in config.INSERT_DEFAULTS.items() if c in cols}
    values[m["name"]] = name
    values[m["type"]] = typ
    values[m["parent"]] = parent or ""
    if m["category"] and category:
        values[m["category"]] = category
    if m["notes"] and notes:
        values[m["notes"]] = notes
    if "SOURCE" in cols:
        values["SOURCE"] = config.SOURCE_USER
    names = list(values)
    date_col = getattr(config, "DATE_COLUMN", None)
    extra_col, extra_val = ("", "")
    if date_col and date_col in cols:
        extra_col, extra_val = f", {q(date_col)}", ", GETDATE()"
    db = get_db()
    db.cursor().execute(
        f"INSERT INTO {q(config.TABLE)} ({', '.join(q(c) for c in names)}{extra_col}) "
        f"VALUES ({', '.join('?' * len(names))}{extra_val})", [values[c] for c in names])
    db.commit()

    def add(data):
        r = {"id": name, "name": name, "type": str(typ)}
        if m["parent"]:
            r["parent"] = parent or ""
        if m["family"]:
            r["family"] = parent or ""
        data.append(r)
    patch_tree(current_db(), add)
    return name


# ================================================================== value sets (TRANSVAR table)
# One row per value:  CODEWERT = value set name,  FUER_VAR = variable / sub-family of the family,
#                     IMOSWERT = value in this set,  TYP = type of FUER_VAR.
# No row = the variable keeps its own default value, shown as  <default> (←)  like in IMOS.
TV = {"table": "TRANSVAR", "set": "CODEWERT", "value": "IMOSWERT", "var": "FUER_VAR", "type": "TYP"}
TV.update(getattr(config, "TRANSVAR", {}))
_TV_SCHEMA = {}
_NUMERIC = {"int", "bigint", "smallint", "tinyint", "bit", "decimal", "numeric", "float", "real", "money", "smallmoney"}


def tv_schema():
    """Columns of TRANSVAR in the current database: name -> (nullable, data type, max length)."""
    k = current_db().lower()
    if k not in _TV_SCHEMA:
        schema, _, table = TV["table"].rpartition(".")
        data = rows("SELECT COLUMN_NAME AS c, IS_NULLABLE AS n, DATA_TYPE AS t, CHARACTER_MAXIMUM_LENGTH AS l "
                    "FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ? ORDER BY ORDINAL_POSITION",
                    [table, schema or "dbo"])
        if not data:
            abort(400, description=f"The table {TV['table']} doesn't exist in {current_db()}.")
        _TV_SCHEMA[k] = {r["c"]: (r["n"] == "YES", (r["t"] or "").lower(), int(r["l"]) if r["l"] and int(r["l"]) > 0 else None)
                         for r in data}
    return _TV_SCHEMA[k]


def tv_has_table():
    try:
        tv_schema()
        return True
    except Exception:
        return False


def tv_check_len(col, value, label):
    lim = tv_schema().get(col, (True, "", None))[2]
    if lim and len(value) > lim:
        abort(400, description=f"{label} is too long: {len(value)} characters (maximum {lim}).")


def family_children(fid):
    """Direct content of a family: sub-families first, then variables, in IMOS order."""
    m = mapping()
    data = rows(f"SELECT {q(m['name'])} AS name, {q(m['type'])} AS typ, "
                f"{q(m['default']) if m['default'] else 'NULL'} AS wert FROM {q(config.TABLE)} WITH (NOLOCK) "
                f"WHERE {q(m['parent'])} = ?", [fid])
    fams = {key(x) for x in config.FAMILY_TYPES}
    out = [{"name": sid(r["name"]), "type": sid(r["typ"]), "type_label": type_label(r["typ"]),
            "kind": "family" if key(r["typ"]) in fams else "variable", "default": sid(r["wert"])} for r in data]
    for c in out:           # every row can get a value; numbers and texts are typed in a text field
        c["editable"] = True
        c["free"] = c["kind"] == "variable" and c["type"] in ("100", "120")
    out.sort(key=lambda c: (c["kind"] != "family", name_order(c["name"])))
    return out


def _in_chunks(values, size=500):
    for i in range(0, len(values), size):
        yield values[i:i + size]


@app.get("/api/valuesets/<path:fid>")
def get_valuesets(fid):
    m = mapping()
    children = family_children(fid)
    names = [c["name"] for c in children]
    sets = {}
    if names and tv_has_table():
        for chunk in _in_chunks(names):
            for r in rows(f"SELECT {q(TV['set'])} AS s, {q(TV['var'])} AS v, {q(TV['value'])} AS w "
                          f"FROM {q(TV['table'])} WITH (NOLOCK) WHERE {q(TV['var'])} IN ({','.join('?' * len(chunk))})", chunk):
                sname = sid(r["s"])
                if sname:
                    sets.setdefault(sname, {})[sid(r["v"])] = sid(r["w"])
        # for a sub-family, the choices are the value sets of that sub-family
        subfams = [c["name"] for c in children if c["kind"] == "family"]
        opts = {}
        for chunk in _in_chunks(subfams):
            for r in rows(f"SELECT DISTINCT i.{q(m['parent'])} AS f, t.{q(TV['set'])} AS s "
                          f"FROM {q(TV['table'])} t WITH (NOLOCK) JOIN {q(config.TABLE)} i WITH (NOLOCK) "
                          f"ON i.{q(m['name'])} = t.{q(TV['var'])} "
                          f"WHERE i.{q(m['parent'])} IN ({','.join('?' * len(chunk))})", chunk):
                opts.setdefault(key(r["f"]), set()).add(sid(r["s"]))
        for c in children:
            if c["kind"] == "family":
                c["options"] = sorted(opts.get(key(c["name"]), set()) - {""}, key=name_order)
    # first value set = the default: its name is the WERT of the family row, its values the WERT of each child
    first_name = ""
    if m["default"]:
        fr = rows(f"SELECT {q(m['default'])} AS w FROM {q(config.TABLE)} WITH (NOLOCK) WHERE {q(m['name'])} = ?", [fid])
        first_name = sid(fr[0]["w"]) if fr else ""
    out = []
    if first_name:
        out.append({"name": first_name, "first": True,
                    "values": {c["name"]: c["default"] for c in children if c["default"]}})
    out += [{"name": n, "values": v} for n, v in sorted(sets.items(), key=lambda x: name_order(x[0]))
            if key(n) != key(first_name)]
    for c in children:       # a sub-family also offers its own default value set
        if c["kind"] == "family" and c["default"] and c["default"] not in c.get("options", []):
            c["options"] = [c["default"]] + c.get("options", [])
    return jsonify(children=children, sets=out, table_ok=tv_has_table())


def _child_or_404(fid, var):
    c = next((c for c in family_children(fid) if key(c["name"]) == key(var)), None)
    if not c:
        abort(400, description=f"{var} is not in the family {fid}. Refresh the tree.")
    return c


def _tv_insert(cur, values):
    """INSERT one TRANSVAR row; columns we don't know get a neutral value (NULL, 0 or '')."""
    sch = tv_schema()
    date_col = getattr(config, "DATE_COLUMN", None)
    cols, params, marks = [], [], []
    for col, (nullable, dtype, _l) in sch.items():
        if col == date_col:
            cols.append(col); marks.append("GETDATE()"); continue
        if col in values:
            v = values[col]
        elif col == "SOURCE":
            v = config.SOURCE_USER
        elif nullable:
            continue
        else:
            v = 0 if dtype in _NUMERIC else ""
        cols.append(col); marks.append("?"); params.append(v)
    cur.execute(f"INSERT INTO {q(TV['table'])} ({', '.join(q(c) for c in cols)}) VALUES ({', '.join(marks)})", params)


def _tv_stamp():
    sch = tv_schema()
    parts, params = [], []
    date_col = getattr(config, "DATE_COLUMN", None)
    if date_col in sch:
        parts.append(f"{q(date_col)} = GETDATE()")
    if "SOURCE" in sch:
        parts.append(f"{q('SOURCE')} = ?"); params.append(config.SOURCE_USER)
    return (", " + ", ".join(parts)) if parts else "", params


@app.post("/api/valuesets/<path:fid>/value")
def set_value(fid):
    """Set (or clear) the value of one variable in one value set."""
    guard_write()
    d = request.get_json(force=True)
    sname, var, value = (d.get("set") or "").strip(), (d.get("var") or "").strip(), (d.get("value") or "").strip()
    if not sname:
        abort(400, description="The value set has no name.")
    c = _child_or_404(fid, var)
    if not c["editable"]:
        abort(400, description=f"{c['type_label']} variables can't be set in a value set.")
    if d.get("first"):                        # default value set = WERT of the variable in IMOS
        m = mapping()
        if not m["default"]:
            abort(400, description="No default value column (WERT) in the IMOS table.")
        check_length("default", value)
        db = get_db()
        db.cursor().execute(f"UPDATE {q(config.TABLE)} SET {q(m['default'])} = ?{stamp()} WHERE {q(m['name'])} = ?",
                            [value, c["name"]])
        db.commit()
        return jsonify(ok=True)
    tv_check_len(TV["set"], sname, "Value set name")
    tv_check_len(TV["value"], value, "Value")
    db = get_db(); cur = db.cursor()
    where = f"{q(TV['set'])} = ? AND {q(TV['var'])} = ?"
    if not value:
        cur.execute(f"DELETE FROM {q(TV['table'])} WHERE {where}", [sname, c["name"]])
    else:
        cur.execute(f"SELECT COUNT(*) FROM {q(TV['table'])} WHERE {where}", [sname, c["name"]])
        if cur.fetchone()[0]:
            extra, ep = _tv_stamp()
            cur.execute(f"UPDATE {q(TV['table'])} SET {q(TV['value'])} = ?{extra} WHERE {where}", [value] + ep + [sname, c["name"]])
        else:
            _tv_insert(cur, {TV["type"]: int(float(c["type"])) if c["type"] else 0, TV["set"]: sname,
                             TV["value"]: value, TV["var"]: c["name"]})
    db.commit()
    return jsonify(ok=True)


def _first_set_name(fid):
    m = mapping()
    if not m["default"]:
        return ""
    r = rows(f"SELECT {q(m['default'])} AS w FROM {q(config.TABLE)} WITH (NOLOCK) WHERE {q(m['name'])} = ?", [fid])
    return sid(r[0]["w"]) if r else ""


@app.post("/api/valuesets/<path:fid>/first")
def create_first_set(fid):
    """The first value set of a family: its name is written in the WERT of the family row."""
    guard_write()
    name = (request.get_json(force=True).get("name") or "").strip()
    if not name:
        abort(400, description="Enter a name for the value set.")
    if _first_set_name(fid):
        abort(400, description="This family already has its first value set.")
    m = mapping()
    check_length("default", name)
    db = get_db()
    db.cursor().execute(f"UPDATE {q(config.TABLE)} SET {q(m['default'])} = ?{stamp()} WHERE {q(m['name'])} = ?", [name, fid])
    db.commit()
    return jsonify(ok=True)


def _set_rows_where(fid):
    names = [c["name"] for c in family_children(fid)]
    if not names:
        abort(400, description="This family is empty.")
    return names


@app.post("/api/valuesets/<path:fid>/rename")
def rename_set(fid):
    guard_write()
    d = request.get_json(force=True)
    old, new = (d.get("old") or "").strip(), (d.get("new") or "").strip()
    if not new:
        abort(400, description="Enter a name for the value set.")
    first = _first_set_name(fid)
    if first and key(new) == key(first) and key(old) != key(first):
        abort(400, description=f"The value set {new} already exists in this family.")
    if first and key(old) == key(first):      # rename the default set = WERT of the family row
        m = mapping()
        check_length("default", new)
        db = get_db(); cur = db.cursor()
        cur.execute(f"UPDATE {q(config.TABLE)} SET {q(m['default'])} = ?{stamp()} WHERE {q(m['name'])} = ?", [new, fid])
        if tv_has_table():                    # a parent family that points to it follows the new name
            extra, ep = _tv_stamp()
            cur.execute(f"UPDATE {q(TV['table'])} SET {q(TV['value'])} = ?{extra} "
                        f"WHERE {q(TV['var'])} = ? AND {q(TV['value'])} = ?", [new] + ep + [fid, old])
        db.commit()
        return jsonify(ok=True)
    tv_check_len(TV["set"], new, "Value set name")
    names = _set_rows_where(fid)
    db = get_db(); cur = db.cursor()
    for chunk in _in_chunks(names):
        marks = ",".join("?" * len(chunk))
        cur.execute(f"SELECT COUNT(*) FROM {q(TV['table'])} WHERE {q(TV['set'])} = ? AND {q(TV['var'])} IN ({marks})", [new] + chunk)
        if cur.fetchone()[0] and key(new) != key(old):
            abort(400, description=f"The value set {new} already exists in this family.")
    extra, ep = _tv_stamp()
    for chunk in _in_chunks(names):
        marks = ",".join("?" * len(chunk))
        cur.execute(f"UPDATE {q(TV['table'])} SET {q(TV['set'])} = ?{extra} "
                    f"WHERE {q(TV['set'])} = ? AND {q(TV['var'])} IN ({marks})", [new] + ep + [old] + chunk)
    # a parent family that points to this value set follows the new name
    cur.execute(f"UPDATE {q(TV['table'])} SET {q(TV['value'])} = ?{extra} "
                f"WHERE {q(TV['var'])} = ? AND {q(TV['value'])} = ?", [new] + ep + [fid, old])
    db.commit()
    return jsonify(ok=True)


@app.post("/api/valuesets/<path:fid>/delete")
def delete_set(fid):
    guard_write()
    sname = (request.get_json(force=True).get("set") or "").strip()
    if sname and key(sname) == key(_first_set_name(fid)):
        # first (default) set: only its name is removed (WERT of the family row = '').
        # The variables keep their own Default Value (their WERT is not touched).
        m = mapping()
        db = get_db(); cur = db.cursor()
        cur.execute(f"UPDATE {q(config.TABLE)} SET {q(m['default'])} = ?{stamp()} WHERE {q(m['name'])} = ?", ["", fid])
        if tv_has_table():                    # a parent family that pointed to this set goes back to <> (←)
            cur.execute(f"DELETE FROM {q(TV['table'])} WHERE {q(TV['var'])} = ? AND {q(TV['value'])} = ?", [fid, sname])
        db.commit()
        return jsonify(ok=True)
    names = _set_rows_where(fid)
    db = get_db(); cur = db.cursor()
    for chunk in _in_chunks(names):
        cur.execute(f"DELETE FROM {q(TV['table'])} WHERE {q(TV['set'])} = ? "
                    f"AND {q(TV['var'])} IN ({','.join('?' * len(chunk))})", [sname] + chunk)
    db.commit()
    return jsonify(ok=True)


@app.post("/api/valuesets/<path:fid>/duplicate")
def duplicate_set(fid):
    guard_write()
    d = request.get_json(force=True)
    src, new = (d.get("set") or "").strip(), (d.get("new") or "").strip()
    if not new:
        abort(400, description="Enter a name for the new value set.")
    tv_check_len(TV["set"], new, "Value set name")
    names = _set_rows_where(fid)
    db = get_db(); cur = db.cursor()
    originals = []
    for chunk in _in_chunks(names):
        marks = ",".join("?" * len(chunk))
        cur.execute(f"SELECT COUNT(*) FROM {q(TV['table'])} WHERE {q(TV['set'])} = ? AND {q(TV['var'])} IN ({marks})", [new] + chunk)
        if cur.fetchone()[0]:
            abort(400, description=f"The value set {new} already exists in this family.")
        if key(new) == key(_first_set_name(fid)):
            abort(400, description=f"The value set {new} already exists in this family.")
        if key(src) == key(_first_set_name(fid)):
            continue                          # taken from IMOS below
        cur.execute(f"SELECT * FROM {q(TV['table'])} WHERE {q(TV['set'])} = ? AND {q(TV['var'])} IN ({marks})", [src] + chunk)
        cols = [x[0] for x in cur.description]
        originals += [dict(zip(cols, r)) for r in cur.fetchall()]
    if key(src) == key(_first_set_name(fid)):
        originals = [{TV["type"]: int(float(c["type"])) if c["type"] else 0, TV["var"]: c["name"], TV["value"]: c["default"]}
                     for c in family_children(fid) if c["default"] and c["editable"]]
    date_col = getattr(config, "DATE_COLUMN", None)
    for r in originals:
        r = {k: v for k, v in r.items() if k != date_col}
        r[TV["set"]] = new
        if "SOURCE" in r:
            r["SOURCE"] = config.SOURCE_USER
        _tv_insert(cur, r)
    db.commit()
    return jsonify(ok=True, copied=len(originals))


@app.post("/api/copy")
def copy_item():
    """Copy a variable, or a family (alone or with everything inside it).
    body: {kind, id, target, names: {old_name: new_name, ...}}
      - names must give a new name for the item, and for every row inside the family when copying its content
      - target = family that receives the copy ("" = top level)
    Every column is copied; NAME, FAMILY, SOURCE and DATE_LASTCHANGE get new values. One transaction: all or nothing."""
    guard_write()
    d = request.get_json(force=True)
    kind, rid = d.get("kind"), (d.get("id") or "").strip()
    target = (d.get("target") or "").strip()
    names = {key(k): (v or "").strip() for k, v in (d.get("names") or {}).items()}
    if kind not in ("variable", "family") or not rid:
        abort(400, description="Choose the variable or family to copy.")
    m = mapping()
    if not m["parent"]:
        abort(400, description="Copying needs a FAMILY column that points to the parent family.")
    pcol = f"LTRIM(RTRIM(CAST({q(m['parent'])} AS NVARCHAR(4000))))"
    fams = {key(x) for x in config.FAMILY_TYPES}

    # destination family
    if target:
        t = rows(f"SELECT {q(m['id'])} AS id, {q(m['type'])} AS typ FROM {q(config.TABLE)} WHERE {q(m['id'])} = ?", [target])
        if not t:
            abort(400, description=f"The family {target} doesn't exist. Refresh the tree.")
        if key(t[0]["typ"]) not in fams:
            abort(400, description=f"{target} is a variable, not a family.")
        target = sid(t[0]["id"])

    # rows to copy: the item, plus everything inside it if the names of the content were given
    ids = [rid]
    if kind == "family" and len(names) > 1:
        frontier = [rid]
        while frontier:
            marks = ",".join("?" * len(frontier))
            kids = [sid(r["k"]) for r in rows(
                f"SELECT {q(m['id'])} AS k FROM {q(config.TABLE)} WITH (NOLOCK) WHERE {pcol} IN ({marks})", frontier)]
            kids = [k for k in kids if key(k) not in {key(i) for i in ids}]
            ids += kids
            frontier = kids
        if target and key(target) in {key(i) for i in ids}:
            abort(400, description="A family can't be copied into itself.")

    # every row needs a valid, unique, free new name
    missing = [i for i in ids if key(i) not in names]
    if missing:
        abort(400, description=f"No new name for {len(missing)} row(s), e.g. {missing[0]}. Refresh and try again.")
    new_names = [names[key(i)] for i in ids]
    for n in new_names:
        if not n or any(c in n for c in " /\\'\""):
            abort(400, description=f"'{n}' is not a valid name (no spaces, slashes or quotes).")
        check_length("name", n)
    if kind == "family":
        check_length("parent", names[key(rid)])     # its children's FAMILY column will hold this name
    dup = {n for n in new_names if [key(x) for x in new_names].count(key(n)) > 1}
    if dup:
        abort(400, description=f"The same new name is used twice: {sorted(dup)[0]}")
    taken = []
    for i in range(0, len(new_names), 500):
        chunk = new_names[i:i + 500]
        taken += [sid(r["n"]) for r in rows(
            f"SELECT {q(m['name'])} AS n FROM {q(config.TABLE)} WITH (NOLOCK) "
            f"WHERE {q(m['name'])} IN ({','.join('?' * len(chunk))})", chunk)]
    if taken:
        more = f" (and {len(taken) - 1} more)" if len(taken) > 1 else ""
        abort(400, description=f"{taken[0]}{more} already exists in {config.TABLE}. Choose other names.")

    # read the original rows as they are (no conversion), then insert the copies
    db = get_db()
    cur = db.cursor()
    cols = table_columns()
    date_col = getattr(config, "DATE_COLUMN", None)
    date_col = date_col if date_col in cols else None
    originals = []
    for i in range(0, len(ids), 500):
        chunk = ids[i:i + 500]
        cur.execute(f"SELECT * FROM {q(config.TABLE)} WHERE {q(m['id'])} IN ({','.join('?' * len(chunk))})", chunk)
        names_desc = [x[0] for x in cur.description]
        originals += [dict(zip(names_desc, r)) for r in cur.fetchall()]
    by_key = {key(r[m["id"]]): r for r in originals}
    ins_cols = [c for c in cols if c != date_col]
    sql = (f"INSERT INTO {q(config.TABLE)} ({', '.join(q(c) for c in ins_cols)}"
           f"{', ' + q(date_col) if date_col else ''}) VALUES ({', '.join('?' * len(ins_cols))}"
           f"{', GETDATE()' if date_col else ''})")
    created = []
    try:
        for old in ids:
            r = dict(by_key[key(old)])
            new = names[key(old)]
            parent_new = target if key(old) == key(rid) else names[key(r[m["parent"]])]
            r[m["name"]] = new
            if m["id"] != m["name"]:
                abort(400, description="Copy needs NAME as the key of the table.")
            r[m["parent"]] = parent_new
            if "SOURCE" in r:
                r["SOURCE"] = config.SOURCE_USER
            cur.execute(sql, [r[c] for c in ins_cols])
            created.append({"id": new, "name": new, "type": sid(r.get(m["type"])), "parent": parent_new})
        db.commit()
    except Exception:
        db.rollback()
        raise

    def add(data):
        for c in created:
            row = {"id": c["id"], "name": c["name"], "type": c["type"]}
            if m["parent"]:
                row["parent"] = c["parent"]
            if m["family"]:
                row["family"] = c["parent"]
            data.append(row)
    patch_tree(current_db(), add)
    return jsonify(ok=True, id=names[key(rid)], created=len(created)), 201


@app.post("/api/variable")
def create_variable():
    guard_write()
    d = request.get_json(force=True)
    try:
        typ = int(d.get("type"))
    except (TypeError, ValueError):
        abort(400, description="Choose a variable type.")
    if str(typ) in config.FAMILY_TYPES:
        abort(400, description="Use New Family to create a family.")
    family = (d.get("family_id") or "").strip()          # "" = top level, directly under Variables
    if family:
        m = mapping()
        f = rows(f"SELECT {q(m['id'])} AS id, {q(m['type'])} AS typ FROM {q(config.TABLE)} "
                 f"WHERE LTRIM(RTRIM(CAST({q(m['id'])} AS NVARCHAR(4000)))) = ?", [family])
        if not f:
            abort(400, description=f"The family {family} doesn't exist. Refresh the tree.")
        if key(f[0]["typ"]) not in {key(x) for x in config.FAMILY_TYPES}:
            abort(400, description=f"{family} is a variable, not a family.")
        family = sid(f[0]["id"])
    return jsonify(id=insert_row(d.get("name"), typ, family,
                                 d.get("category") or "", d.get("notes") or "")), 201


@app.post("/api/family")
def create_family():
    guard_write()
    d = request.get_json(force=True)
    fam_type = int(sorted(config.FAMILY_TYPES)[0])
    name = (d.get("name") or "").strip() or next_free_name("new_family")
    return jsonify(id=insert_row(name, fam_type, d.get("parent_id") or "",
                                 d.get("category") or "", d.get("notes") or "")), 201


@app.get("/api/next-name")
def next_name():
    return jsonify(name=next_free_name(request.args.get("base") or "new_family"))


def next_free_name(base):
    """new_family, new_family_1, new_family_2 ... – first name not used in the table (like IMOS)."""
    m = mapping()
    used = {key(r["n"]) for r in rows(
        f"SELECT {q(m['name'])} AS n FROM {q(config.TABLE)} WHERE {q(m['name'])} LIKE ?", [base + "%"])}
    if key(base) not in used:
        return base
    i = 1
    while key(f"{base}_{i}") in used:
        i += 1
    return f"{base}_{i}"


@app.get("/api/catalog")
def catalog():
    """Values offered in the Default Value list: distinct values already used in the table
    for variables of the same type (read once per type, then kept in memory)."""
    m = mapping()
    if not m["default"]:
        return jsonify([])
    t, flt = request.args.get("type", ""), (request.args.get("q") or "").lower()
    ck = (current_db().lower(), t)
    codes = _CATALOG.get(ck)
    if codes is None:
        sql = (f"SELECT DISTINCT CAST({q(m['default'])} AS NVARCHAR(4000)) AS code "
               f"FROM {q(config.TABLE)} WITH (NOLOCK) WHERE {q(m['default'])} IS NOT NULL")
        params = []
        if m["type"] and t:
            try:
                params.append(int(float(t)))
                sql += f" AND {q(m['type'])} = ?"
            except ValueError:
                params.append(t)
                sql += f" AND LTRIM(RTRIM(CAST({q(m['type'])} AS NVARCHAR(4000)))) = ?"
        codes = sorted({sid(r["code"]) for r in rows(sql, params)} - {""})
        _CATALOG[ck] = codes
    hits = [c for c in codes if flt in c.lower()] if flt else codes
    return jsonify([{"code": c, "description": ""} for c in hits[:1000]])


@app.post("/api/feedback")
def feedback():
    text = (request.get_json(force=True).get("text") or "").strip()
    if not text:
        abort(400, description="Write your feedback before sending.")
    with open("feedback.log", "a", encoding="utf-8") as f:
        f.write(text.replace("\n", " ") + "\n")
    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)