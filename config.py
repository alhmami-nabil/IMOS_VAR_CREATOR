"""
Connection + column mapping for the IMOS table in SQL Server.
Only this file should need editing.
"""

# ------------------------------------------------------------------ connection
DRIVER = "ODBC Driver 17 for SQL Server"   # or "ODBC Driver 18 for SQL Server"
SERVER = "BXL-SQL-IMD"           # same server name as in SSMS "Connect"
DATABASE = "2124_Test"
TRUSTED_CONNECTION = True                  # Windows login, like in SSMS
USERNAME = ""                              # only if TRUSTED_CONNECTION = False
PASSWORD = ""
EXTRA = "TrustServerCertificate=yes;"      # needed with Driver 18 on internal servers


def connection_string():
    s = f"DRIVER={{{DRIVER}}};SERVER={SERVER};DATABASE={DATABASE};{EXTRA}"
    if TRUSTED_CONNECTION:
        s += "Trusted_Connection=yes;"
    else:
        s += f"UID={USERNAME};PWD={PASSWORD};"
    return s


# ------------------------------------------------------------------ table
TABLE = "IMOS"            # can be "dbo.IMOS"

# Show only some rows, same as your query  WHERE NAME LIKE 'TEST_NAL%'
# None = show the whole table.
NAME_FILTER = None        # e.g. "TEST_NAL%"

# Read-only by default: the app never writes to the IMOS table.
# Set too False to enable Save / Rename / Delete.
READ_ONLY = False

WRITE_DATABASES = {"2124_Test", "imos_test"}

# ------------------------------------------------------------------ columns
# Structure of the IMOS table (TYP, NAME, OPTNR, WERT, OPTINFO, POS, LENGTH, ORDERID,
# CATALOG_ID, WORKPLAN_ID, CATEGORY, FAMILY, DATE_LASTCHANGE, SOURCE, PRODUCER, SYS, FROMSPEC)
# - NAME is the key
# - FAMILY holds the NAME of the parent family row ('' = top level)
# - TYP = 30 means the row is a family
COLUMNS = {
    "id": "NAME",
    "name": "NAME",
    "parent": "FAMILY",
    "family": None,
    "type": "TYP",
    "category": "CATEGORY",
    "notes": "OPTINFO",
    "default": "WERT",
}
DATE_COLUMN = "DATE_LASTCHANGE"     # set to GETDATE() on every insert / update

FAMILY_TYPES = {"30"}

# TYP code -> label shown in the interface
TYPES = {
    25: "Article", 12: "Back", 37: "Base", 40: "Calculation Principle", 29: "Color Principle",
    33: "Connection Situation", 32: "Connector", 39: "Crown Molding", 28: "Design parameter",
    13: "Door", 31: "Drawer", 38: "Light Valances", 4: "Material", 100: "Number",
    5: "Part Definition", 2: "Profile Name", 6: "Pull", 7: "Shelf/Partition", 8: "Side",
    35: "Stretchable Purchased Part", 3: "Surface", 120: "Text", 36: "Work Surfaces",
    30: "Family",
}

# TYP code -> tree icon (Article, Material, Surface, Numeric, Text; others get a generic icon)
TYPE_ICONS = {"25": "Article", "4": "Material", "3": "Surface", "100": "Numeric", "120": "Text"}

# Values written for the other columns when you create a variable or a family
# (same as your INSERT INTO IMOS ... statement)
SOURCE_USER = "n.alhmami"
INSERT_DEFAULTS = {
    "OPTNR": 0, "WERT": "", "OPTINFO": "", "POS": 0, "LENGTH": 0, "ORDERID": "",
    "CATALOG_ID": 0, "WORKPLAN_ID": 0, "CATEGORY": "", "PRODUCER": "", "SYS": 0, "FROMSPEC": 0,
}
