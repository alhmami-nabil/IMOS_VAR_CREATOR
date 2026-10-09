/* Variables manager – front-end */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const ICONS = {
  family: `<svg viewBox="0 0 16 16"><path d="M1.5 3.5h5l1 1.5h7v9.5h-13z"/><path d="M1.5 6h13"/><circle cx="6" cy="9.3" r="1.4"/><circle cx="10" cy="9.3" r="1.4"/><circle cx="8" cy="12" r="1.4"/></svg>`,
  Article:  `<svg viewBox="0 0 16 16"><path class="fill" d="M4 2h9l-1 12H3z"/></svg>`,
  Surface:  `<svg viewBox="0 0 16 16"><path d="M1 4h14M1 7h14M1 10h14M1 13h14" stroke-dasharray="2 1"/></svg>`,
  Material: `<svg viewBox="0 0 16 16"><rect x="5" y="2" width="9" height="9"/><rect x="2" y="5" width="9" height="9" fill="currentColor" fill-opacity=".25"/></svg>`,
  Numeric:  `<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke-width="1.8"/></svg>`,
  Text:     `<svg viewBox="0 0 16 16"><path d="M3 3h10M8 3v10" stroke-width="1.8"/></svg>`,
  Other:    `<svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10"/><path d="M6 8h4"/></svg>`,
};

/* one icon per IMOS TYP code (16x16, drawn to resemble the IMOS tree) */
const S = b => `<svg viewBox="0 0 16 16">${b}</svg>`;
Object.assign(ICONS, {
  t2:   S(`<rect x="2" y="5" width="12" height="6" rx="1"/><path d="M10 5v6"/>`),                                   // Profile name
  t3:   S(`<path d="M1 3h14M1 6h14M1 9h14M1 12h14" stroke-dasharray="1.5 1"/>`),                                    // Surface
  t4:   S(`<rect class="fill" x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="5"/><rect x="2" y="9" width="5" height="5"/><rect class="fill" x="9" y="9" width="5" height="5"/>`), // Material
  t5:   S(`<path class="fill" d="M2 6h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v1H2v-3a2 2 0 1 0 0-4z"/>`),                  // Part definition
  t6:   S(`<circle class="fill" cx="5" cy="8" r="4"/><path class="fill" d="M8 6.5h6v3H8z"/>`),                         // Pull
  t7:   S(`<rect x="2" y="2" width="12" height="12"/><path d="M2 8h12M5 2v12"/><path class="fill" d="M5 2h-3v12h3z" fill-opacity=".4"/>`), // Shelf partition
  t8:   S(`<path d="M3 4l4-2h6v10l-4 2H3z"/><path d="M3 4h6v10M9 4l4-2"/>`),                                        // Side
  t12:  S(`<rect x="5" y="2" width="9" height="9"/><rect class="fill" x="2" y="5" width="9" height="9" fill-opacity=".5"/><rect x="2" y="5" width="9" height="9"/>`), // Back
  t13:  S(`<path class="fill" d="M4 2h9v12H4z" fill-opacity=".5"/><path d="M4 2h9v12H4zM3 2v12"/><circle class="fill" cx="11" cy="8" r=".9"/>`), // Door
  t25:  S(`<path class="fill" d="M4 2h9l-1 12H3z"/>`),                                                               // Article
  t28:  S(`<path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z"/><circle class="fill" cx="8" cy="8" r="2"/>`), // Design parameter
  t29:  S(`<path class="fill" d="M8 1.5a6.5 6.5 0 1 0 0 13c1.2 0 1.5-1 1-2s0-2 1.3-2H13a2 2 0 0 0 1.5-2A6.5 6.5 0 0 0 8 1.5z"/><circle cx="5" cy="6" r="1" stroke="none" style="fill:var(--tree-bg)"/><circle cx="8" cy="4.5" r="1" stroke="none" style="fill:var(--tree-bg)"/><circle cx="11" cy="6" r="1" stroke="none" style="fill:var(--tree-bg)"/>`), // Color principle
  t31:  S(`<path d="M1 6l2-3h10l2 3v7H1z"/><path d="M1 6h4l1 2h4l1-2h4"/>`),                                         // Drawer
  t32:  S(`<circle class="fill" cx="12" cy="4" r="2.2"/><circle class="fill" cx="4" cy="12" r="2.2"/><path d="M5.5 10.5l5-5" stroke-width="1.8"/>`), // Connector
  t33:  S(`<circle cx="8" cy="4.5" r="2.7"/><circle cx="4.5" cy="11" r="2.7"/><circle cx="11.5" cy="11" r="2.7"/>`), // Connection situation
  t35:  S(`<path d="M3 2v12h11"/><path class="fill" d="M3 2h3v9h8v3H3z" fill-opacity=".4"/><path d="M6 6h3"/>`),     // Stretchable purchase
  t36:  S(`<path d="M1 11l3-4h11l-3 4z"/><path d="M1 11v2h11l3-4V7"/><path d="M5 9h7" stroke-dasharray="1.5 1"/>`),  // Worksurfaces
  t37:  S(`<path class="fill" d="M4 2h8v2H4zM5 4h6v8H5zM3 12h10v2H3z"/>`),                                          // Base
  t38:  S(`<path d="M1 4h14M1 7h14" stroke-width="1.6"/><path d="M1 10h14M1 12.5h14" stroke-dasharray="1 1"/>`),     // Light valances
  t39:  S(`<path class="fill" d="M4 2h8v2l-1 1H5L4 4z"/><path d="M5.5 5v9M10.5 5v9M4 14h8"/>`),                       // Crown molding
  t40:  S(`<path d="M1 14h14"/><path class="fill" d="M2 9h2v5H2zM5 5h2v9H5zM8 7h2v7H8zM11 3h2v11h-2z"/>`),           // Calculation principle
  t100: S(`<path d="M5 5l6 6M11 5l-6 6" stroke-width="1.6"/>`),                                                     // Number
  t120: `<svg viewBox="0 0 16 16"><text x="0.5" y="12" font-size="10.5" font-family="Segoe UI,Arial" font-weight="600" fill="currentColor" stroke="none">ab</text></svg>`, // Text
});
/* ------------------------------------------------------------ IMOS icons
   Taken from the IMOS tree (16x16, white + transparency) and used as a CSS mask,
   so each icon takes the text colour: light on the tree, dark on the selected row. */
const IMOS_ICONS = {
 "t25": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAj0lEQVR42mP8//8/AxoQhdJ7obQuA3XAdCidhSzIxDDAgAWJzQOlt1DZ5zDAiU1wUIWAEJQ2o5FdbIMyBEYdgJwG/tLYLrZBHwJfaGwX52giHHXAoM8FtAb8gz4EvtPIjkdQumBQhgAjljbhfyqZfQpK+0PpFyMmF6yE0onEpK1BGQKMo0XxqANGHTCiHAAACoUS5wIDPzcAAAAASUVORK5CYII=",
 "t12": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABSklEQVR42mP8//8/AwEgAqWtGGgAmBgGGLDgkfOA0m5Q2pFCuz5C6d9QmnfQhQAsriOgtAaUVoXSBiSa/RdKv4DSXGjy8oMmBGBx7Q6lDaH0OSj9HEo/JdFsWPZ6BaXFoTQnlGYfFCHA+P///2NQthmUvgGl3yDHFQMDAyuJZsP0S6ClMeZBVw5YQtkToPQvNDWsRJaEP5HjFikExIdMSdiBVmLBQA2RIfALLQSGXl0A88EPNDV/aOmAAQ+BUQeMOmDUAfjahLAWjCyUfknArG/IbT0kgK6PEUrzDZr2AKzlIgSlJaG0E1pr+CpaW48BR61ZDaW3Q+mTaObB2gdbB10IJEBpfbS4OolG4+pK8UPpC1B6HlqrWAFKn4bSywddLihD88lJtFrSkIBZbGh8FbRW9TLkuB805QDj////G2hk9kc0n78clCUhAEpnQmvvcJ/PAAAAAElFTkSuQmCC",
 "t37": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAX0lEQVR42mP8//8/Aw5gD6UPMFAGGPFJMjEMMBh1wKgDRh0w6oBRB4w6YNQBow4YdcCoA0YdwIJH7hKUdhhxIfABSvNT2a6D2EJ0wEOAEUvf8D+t7RwyuYDa4P2gzAUAg/IMQKXkT7MAAAAASUVORK5CYII=",
 "t40": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAyUlEQVR42mP8//8/w0ACJoYBBiwMDAwpUPYhKH1rRIUA439EIuiH0kUjLg3AQ4NERz+C0tJQ+imUVoTSv4dcCBAL/qH5nAGNzwOl3w+JEBh1AAsNzV4OpSOg9E8obQWlzw37EJBE47NDablBFQKjDmDB4yhzKM2G1k54PuxDwAZKH0QTPwalrYd9COBqF3CPmFxwF62VzA+ll6GpWw2l1dByyUcovQ1KC6CJnxu0reKTUHoHnex+NmhC4AmONh6twdNBEwIjuzYEAFdKLUT/vCpOAAAAAElFTkSuQmCC",
 "t29": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABsUlEQVR42uXXzStEURjHccOICHlJSU0kZkGR8i42NhY2ajZSYmPhZTFZ2AgrfwClpCk2doooJFYWUlJKKBsNIoXIwjSuzffU7VdjzGpOuZvP6d57znSeec45z/U4jpOSzCs1JcmX95dnlViPPsyW977wBR/xBi8wYn0EMrEXu7EGP7AWc/AcL7Ecb/EEd/DMqgh4HMdJpz2MY1iF67iCHTiOQ/iAM9gukTvAedy3Jge6aE9iibxzjJv4iaN4hPeyCkz2H2IbTrtXiRURCMp6npNs7pHnzZghM7rDJlzEZQzgAvZZEwGTrWs4KzuhWefVmCdjDMQY2+wTRTH6BayJwBPtUmzFCnk3P8Gx+yWXGuW535qd0Kz/ETnFfDIDvaJ4Jf918R9/O2JNDoRov0kumCxuwBbpu4q7EoEJLIvz29fW5IDeS8Nc2fm25Aj3u2fiuh+Ksz98u88eK2vCqNR4e/iKBVgo/UxFlRVn5tvundfqqlgjsoGDOCURMqugU/qHpSZcct+3chXEuuowKKfjuxlL9hNTFZ9KpMLWVcWJ9qmQCHilVnyWCDxZ/W3o+fdfxz+qjWZmn382/QAAAABJRU5ErkJggg==",
 "t33": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABt0lEQVR42t3XTyhEURTH8RlDJIqy8i+mSErKhoaNrFDYsGChhI2ilFJ2lspCphQ2NsqOjWThz0KykBDZ+BMbyoLUZAwzNt9Tr19NM1bzxtt83rw3nd47995z7vPGYjFPkkcRtqMfv/EKd/AzmaAZnhQfmUn8JxensBpfMAsbsQSXMJr2GWjBLpzBY8zBDpzAbbxP+wy04SVuxhnbVclA/b/JgB2+BPe98lLRf1MH9nEAe/FE6kCnvNRF2mfAxrwcv7APW2Xs/TL23rTIgNfRDe2Nq6S2j8k6f8dK/ME77MYIruEr3jgz5Yo5kMf5IDZgKRbLbN+K0++tazbjkMwJy/CpMzOuyICt637pYgdYIfdtLDcklnXLJpzHB1lNVk9CrsmAda91XMAwZssYjuOzxLLruzgXJ07E2TVdkYEazvfkiT3y2+5PSiW0ow6nk4wz65oM2I4lgGdS4Xwyu2+lS3qkAtr/juLECTh3Sq7IQFDWpz3Uk6zfHlzEQ4ll14dltj9imXTToGu6YSHnI1grtd5q/Dku44fEysdR2RWH5PvhGldctx/IlvVcgG/yXRBOEPNPcVKegV8yK2cBb0yZwAAAAABJRU5ErkJggg==",
 "t32": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAxklEQVR42mP8//8/A5VBAJTuh9IKUPoBlC6E0hsYGBgYmBgGGDBSMQRgPl9PpPrAYRcC99HinBB4MOxCgCyDBjwEWKho1oMRnwaGZjlAjTTADqWdofQOKK0xJOoCSkKAB0r3opkVBaXfD4lygJJcMAWNnzPkS0JCLZlaKO0Ipf9A6WJKHDAo0gCpJdh25JKMgYHh55APAbJaMgwMDIrUcMCgCAFyCwLGYRECLOS2ZKgFBkUIFJJYDhQOqxBArg1J6tUOmxAAAMhZPzH+8QAbAAAAAElFTkSuQmCC",
 "t39": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAp0lEQVR42mP8//8/AxTYQOlNDLQFflD6CAMDAwMTwwADRqQQgAF+KK1IZbvuQ+mPyIIDHgIsWMQcofR6KtsVCKU3DPoQ+Amlv0BpHgrt+AGlf2OTHJQhcBlKF0JpBSgtQKLZX6H0YzRzB1cIYCsH0EEelA4l0eyDUHoSlH41ZNIAOlBEqyuIBS+hNBs+RQMeAqMOGHXAqANGHTDqgFEHjDpg1AGjDgAA0DIbha2zmxEAAAAASUVORK5CYII=",
 "t28": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABH0lEQVR42mP8//8/w0ACJoYBBqMOGHUACxl65KC0DJoZ96D0k2ETAhxQOgNKZ0JpNQJm3oDSM6H0DCj9Y1CGACOWktAOSs/G4eM9UHo+mngilHZBE7+PJn9w0IZAOpSehsNxK6F0FJTWwBH3y6B0OJr8PyhdCKUnDZoQKIOyOwmoVYfSylB6G5q8F5S+C6VvEjCvfNCUA7VEqn0DpQNwyOtC6ZNEmlczaEIA5qMtaCUgOvCA0nOgtD6a/Bw0dbjAFygdOOjKAUsovRZKS6KpfYfscgYGhkM4StD1UFoITf4lWm45N2jrAjEo3Y9W8qGD22h8VRzqYHVGCVpIDt7aEB3oo7UH3NBaRv/QWkI70NoDFwd1i4hxtGc06oAR7wAAn7dEEts2THMAAAAASUVORK5CYII=",
 "t13": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABR0lEQVR42mP8//8/Aw4gDqWjoDQrlP7IQB6A6ReE0v8YGBgYmBgGGLBgEfOG0pZQ2hZNfhmJdmhAaQdknzMwMAgNihBg/P//PyyuI6G0KZR+AKUl0OKwlMhQNYfSFmjyJ6B08aAJgX4o2wtKv4DS+6C0I5TmhtJbCJjJDKW1ofR+NPOuQekDgyYEvkPZn6A0esEA8/lDKC1CpNlboXQulP6GJn9g0JQDHFA2BwG1N9HilhB4jMPnKGBQloQr0PgROOoAXOpIAoMyBJYR6bNlwzYEoojUG0UNBwzKECA2LiOGbQjgArIkmq0OpX1xyIsOuRD4TqLZ8lDaHrkNiNRGfD7kQmAOgThFB7fQEroSlD4JpXcO+1wgCaW/QOk1aLXom0HTJjxPpNpHUFqOSPWw1vAuKL1jUJaEjP////ejkdnHkON60NYFAJ+RQglcpV4aAAAAAElFTkSuQmCC",
 "t31": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA1ElEQVR42mP8//8/w0ACJoYBBqMOYMEilg6lJals13MoPXNQhQAjUi4wgNLnaWynIZS+MOjSQDKU/gel9aD0MwrtkILSl9DsyR00aYAdzaewNOBCZbv2oKUBqUGTBvygbCEovYBGdsHMdYbSfoMmBJKg7L9Q+i2UtofSr6H0NRLN1oLSomjmwuxJGjS54C+BYhkmzwOlfxBZwf2C0sw41P0bNGmAkCNgPtgLpX8TaTYzMSE1KNLAgDYKR5tkow4YFOXAUyhbms52Px10reLRRDgyHQAALEswGIECf9cAAAAASUVORK5CYII=",
 "t38": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAs0lEQVR42mP8//8/w0ACJoYBBqMOGHXAqANYGBgYDozoEGD8//9/xIhPA7DKwAJKc9LYzu9Q+sSgSQOnoGw9KM1OYzt/QulLowXRoEkD4SM6F7AwMDAwQtmVUNoRSp+E0rpQ+j6UFoPS39DM4oLSr6C0IpS+DKXNofR+KB0waEIgA8reBaUjofRDKO2FJg8rL16imSWOnL8ZGBjcoPRrNHNhIZsxaHLBaEE06oBRB4xsBwAAGdYnUg8X8uoAAAAASUVORK5CYII=",
 "t4": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAZUlEQVR42mP8////fwbyACManyxzmBgGGLDQwExFKP2RgLp3wzYEYD5/PyTSwKgDRh0w6gDG0boAi08YqBQio4lw6KSB0VxAVktmWKUB9JbMO2rm89FsOOqAIdkzYhxRITDaIgIAYkcZAu4ddwEAAAAASUVORK5CYII=",
 "t100": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAyUlEQVR42mP8//8/w0ACJoYBBqMOGHXAqANYiFCTCKXnQekNUDoQTV0ElF4OpbuhdNmgDgFGEkrCA1DaHkrbQukzUPoSlGaF0rpQ+suQTwMwkAGlr0DpFii9FUqrQmkHYnw+JNMAA5rPq6H0D7TUnzTsygF08ACNzwGl3wzJkpCUNKAApS9D6SNQ+gOUDkUrH44PmxBgRisJLaG0DlouuI6WRgzR5IduLiiC0jZQugNK30BTNwFKV0DppmFXG442yUYdMOqA4ekAAJa/L+G1ishxAAAAAElFTkSuQmCC",
 "t5": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABCUlEQVR42tVX0Q2CMBAtxn/CBsQFNP4bo4sYWECcBCewbKAbGOMCjuAGhgXAn7uEvFBoGxKu7+fB0bS51+NdG7VtqwAp8VcNoyJ+EWvlgYWaGcvOc0FcEtfEG1CEMz8BKx8lZlcg6tTAh3gNY67EiSFjRO6ihCgFSqgFX7CSR+JfMAow9sR32PsxXKBmwvMBxsoxc8bDEC/AV7RYBTLim+dcZ6iFBOJpn2OK+AsqS4ezBe91bOOYImqgmXjO2HLcTowCOcQyeOdzwNPw3RVaXA1gH2cciLfQ1WrPrqn71hHZC/KJ1xjskiIVGLsH2Dqm1dkwKAWaKTMPUoExx3TKPEgFTEq8g74d/wEdcDnAzmzemQAAAABJRU5ErkJggg==",
 "t2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAdklEQVR42mP8//8/w0ACJoYBBqMOGHUACwMDA62zASOUhtmzEEonDJoQgAFFKP2RQjPfEZCPH1RpgPE/oigUgtLvKTTzP4E0MJoNRx0w6oBRB4w6YPC1BwYKJA26EHhHJzsLofT8QRMCjPRqe4xmw1EHDEoHAADgKBID4yd5HgAAAABJRU5ErkJggg==",
 "t6": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA70lEQVR42mP8//8/AxoQh9KJUDodTX4mlJ4PpV8yUACYGAYYMCKFgCCUroDS+VCaHU3PTyg9EUp3QOn3QzIEWJDYAVA6DIfPGdDEYepuoKWJoRcCsFRvDqUViNSrgKZvGzm5YlCEgCGUbUCmGTB9MHN2DLkQkEQrAUkFsDSwnUR9jYMuF0gOhAMGRQhwECj5hncIjDqAhYGB4QeUDaM5RlwIwGqvFyTWhsMnBJ6j1eOkhsBJKN0wZGvD81D2BbTajVgA03d+yOcCWFy6E5kWHqDpezlkQwAGNkBpDSidh6NkhJWYq9D0Df2+4cjsHQMA9XUvJCQ4IioAAAAASUVORK5CYII=",
 "t7": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABZUlEQVR42u3Wvy8EQRjG8V0uEhdC4YQoJIcEjWgIjVCgUopGqVepT63xV1DpXEHiVyNRHK1GIhokQi6R4IjRfN+4PMnebi6RG8lO89nszrw7885m5w2dc0FM68LpiOcZ/ArqaE1Bg1umxrNFnMd+LGEOJ3E/5l02Po/t3mXA9noFh3EIX/ETx3EM1yR2VjLZjTc4600GbIYLsrJLfMEB7JO91wxaVkckkyd4VH2/4RkInXPnXE/gNT7JCmyFzRGxziymjN/BA/mWTr35Bqa43saK9JlJGOsK13EL97z+E4bu9zDowbL0eUsYy8Y/4CYWIvr78w0Esvfvdcaq/MvTMJ1AOoF0ArVqwmzCGN+4LPetUlqNeGfO2wyM4lzM2Fs8lrPAWpvct3i91fWBVxlYkr0Lpe8HFvFQar1WOf3usBOfpTLa9S4DG9iBFzFj82KLPB/Ee6kNi95VRIU/il2WlT96+Sf8AfBGQvnkCJgBAAAAAElFTkSuQmCC",
 "t8": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABUElEQVR42mP8//8/Aw4gDqWjoDQrlP7IQB6A6edHFmRiGGDAgkXMG0pbQmlbNPllJNqhAaVtoLQWcogMihCAxXUklDaF0g+g9B20ONxAZKgao4WACJRmHnQhUAFle0HpF1D6FpRWhtLcUDqDgJmMUNoDSiug5SqGQZULGP////8dyl4OpX+hqYHFJReUPkwgn8NykQCUZsfngEERArCi0B5Kf0JTk4GWiltwmMUHpQ+S4oBBVRJehtLv0dS8QONfwGGWIDkOGPAQGHXAqANGHcBChBpYHSAHpX0JqBv6IcADpd3R2gPf0eoMdMBOpJ3/kGvVQVUbWqG1Cc2h9HEofR1K/yFQG27CIf8KrVW9YdClgXworQ6lH0Hpv2i5gIHIXPAFSp+F0qvRWl7vBk0aOI+Wyr/iaBkRG5pyaP2HA/haSoMiBPxoZPY+tLQwOEtCAFuMQjDf3ZP7AAAAAElFTkSuQmCC",
 "t35": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA7UlEQVR42u3XMQrCQBAF0IlKFMVGrD2GhYidnbVFLuAVbO1yAgUPYOERrPUA2lkIYiHaaKUYJK7ND8hHknRuZKZ5LAzhZyC7WccYY+R7deEQzmAbHqi/AZfQgz4cwx7ciojk5MflxEyg9ZlURO6wCEPqz8MAluENVuEV1q2YQCFFz4XWj5TP5r6A1mcrJqABNIAGiNsHXNrhQtrjO9S/gjvYhAvYhxM4sn4ChhR68wGfK3ADT3SGHOET7q2fQJT0lfJZ0aTWZFRTWvv6GWoADaABNEBm7gU1OtWSqvQ3N6MKnNPt2E34g/IydTt+A+sVNAc1pxLYAAAAAElFTkSuQmCC",
 "t3": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAdklEQVR42u1WQQ6AMAgryx7mV/QlvsS9xZfhBRI/ICWxJEtZeqIrMHN3BzEGyDEB2K8VGADOOBmld7oCRm6CHl3wfptylAc0B+SBFnNA/wGTByJfgUfgHnh9ybdQYIv8rqw8+VaTsLTy5Ft4gFJ58tqG2oZ0BR5YxUy3ODq4mgAAAABJRU5ErkJggg==",
 "t120": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABRklEQVR42mP8//8/w0ACJoYBBqMOGHUANRxgCcX3oTgYiodGCLBQwQw2KK0ApflGE+GQcgC2NACLS0co/R5K74DSP4g0WxxKe0FpZii9AUq/GXQhsB5Ku0DpO1BaF0p/h9JGUPo2DjPVoHQ7lOaH0hxQugVKWwy6EFgLpWOh9BcobQClz0PpMCjdisPMFCgdCaWPQOkCtJCpHhQhwIilRQTzsSuUVobS8Wg+gsnbQ+kDUHoOlE5FM5cHSr+G0o8HXRpYA6XdofROKH0DLRewEjDzGA7xL2g066AJAUsoG1aHh6DlCkEoXUykmU5Qej6auAaUFoHSZwZNCPCjidmgxX0xWklGCASg5fsbyPkeCcwcNCEAq+U2Q+lcNLoPSj8g0swpUDofrXZlQCtBNwzakhCW6n+j5VtygQxy/Y/enhiUITCy2oQAkwo+8jw4EL8AAAAASUVORK5CYII=",
 "t36": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAlElEQVR42mP8//8/w0ACJoYBBqMOYEFiwxIDIz35Ax4CjCM+F7AMoN2CIzYEBKH0/hEXAgZQesGICwGYzw9A6UIofX7Yh0AilK6D0glo8uuHbQjAfN4LpZ2gtCE28UERArSqDhWhdD6UdkALkQuDpj1AqxBYCKX10Xz+fsS0B/7h8/mwDgFYaj84ZNqEjKNdsxHtAADICyMaB8Jk4gAAAABJRU5ErkJggg==",
 "family": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABa0lEQVR42u3WPShGURzH8XO9pJSXhDJLIaUMZDGYnpLRpsRkkEzKIIrNoAw2BiWip8jA8uxYDHp6SAw2ZUASnjgG31NPv+HppnTPqee/fG735dxzfvfce25krV00v/WGa/hpildk/laT2GSMMWUm4aoo2G7HFH780z078NG7BHqwDislmWrM4bO0VYOdMqeuZU614qF3CWzjBg7jONbjOZ7iN/ZjAz7hPh7gGDZ6l0BenvmUPMt7nMFLSaAbMzKXpvFK7mO8S8BVFzbjJt7ggIxcE9zFNpyQdo33CVzgAw7hC1bhqly3JSOulXZcu33eJ5DFJZzDXrzFUbnuTkaYk3aywSTgVsETme3r2CLq/4FbI1aknXwwb4G+1xn58qVkrXB1hGd4XGzkQSTg6h3T8iVckPPcmrGHr3E6EEQCrnZwEEfkeFrOM0EkEFlrZ9mej5mK+1csl/1fcWZ9QS17k0CiHUg8gVIHSh34ARgCUGYZdMNPAAAAAElFTkSuQmCC"
};
(() => {
  const css = [".mi{display:block;width:16px;height:16px;background:currentColor;" +
               "-webkit-mask:var(--m) center/16px 16px no-repeat;mask:var(--m) center/16px 16px no-repeat}"]
    .concat(Object.entries(IMOS_ICONS).map(([k, uri]) => `.mi-${k}{--m:url("${uri}")}`));
  const st = document.createElement("style");
  st.textContent = css.join("\n");
  document.head.appendChild(st);
  for (const k of Object.keys(IMOS_ICONS)) ICONS[k] = `<i class="mi mi-${k}" aria-hidden="true"></i>`;
})();
const iconFor = v => ICONS["t" + String(v.type ?? "").trim()] || ICONS[v.icon] || ICONS.Other;
const CHEV = `<svg viewBox="0 0 10 10"><path d="M3 1l4 4-4 4"/></svg>`;

const state = {
  tree: {families: [], variables: []}, meta: {categories: [], read_only: true},
  expanded: new Set(["root"]), sel: {kind: "root", id: null},
  detail: null, dirty: false, filter: "", sections: {basic: true, usage: false},
};

/* ------------------------------------------------------------ API */
let currentDb = "";
try { currentDb = localStorage.getItem("imos_db") || ""; } catch {}

async function api(url, opts = {}) {
  const headers = {"Content-Type": "application/json"};
  if (currentDb) headers["X-Database"] = currentDb;
  const r = await fetch(url, {headers, ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined});
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `Request failed (${r.status})`);
  return data;
}
function toast(msg, err = false) {
  const t = $("#toast"); t.textContent = msg; t.className = "toast" + (err ? " err" : "");
  t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 2600);
}

/* ------------------------------------------------------------ tree */
function findFamilyPath(nodes, pred, path = []) {
  for (const f of nodes) {
    if (pred(f)) return [...path, f];
    const p = findFamilyPath(f.families, pred, [...path, f]);
    if (p) return p;
  }
  return null;
}
function matches(name) { return name.toLowerCase().includes(state.filter); }
function famVisible(f) {
  if (!state.filter) return true;
  return matches(f.name) || f.variables.some(v => matches(v.name)) || f.families.some(famVisible);
}
function hl(name) {
  if (!state.filter) return esc(name);
  const i = name.toLowerCase().indexOf(state.filter);
  if (i < 0) return esc(name);
  return esc(name.slice(0, i)) + "<mark>" + esc(name.slice(i, i + state.filter.length)) + "</mark>" + esc(name.slice(i + state.filter.length));
}
function isOpen(key) { return state.filter ? true : state.expanded.has(key); }
function isSel(kind, id) { return state.sel.kind === kind && state.sel.id === id; }

function renderTree(scrollToSel = false) {
  const out = [];
  const rootOpen = isOpen("root");
  out.push(row({kind: "root", id: null, depth: 0, hasKids: true, open: rootOpen,
    icon: `<span class="dollar">$</span>`, label: "Variables"}));
  if (rootOpen) {
    state.tree.families.filter(famVisible).forEach(f => renderFam(f, 1, out));
    state.tree.variables.filter(v => !state.filter || matches(v.name)).forEach(v => out.push(varRow(v, 1)));
  }
  $("#tree").innerHTML = out.join("");
  // only jump to the selected row when the selection changes, never when opening/closing a family
  if (scrollToSel) { const s = $("#tree .row.sel"); if (s) s.scrollIntoView({block: "nearest"}); }
}
function renderFam(f, depth, out) {
  const key = "f" + f.id, hasKids = f.families.length + f.variables.length > 0, open = hasKids && isOpen(key);
  out.push(row({kind: "family", id: f.id, depth, hasKids, open, icon: `<span class="ico">${ICONS.family}</span>`, label: hl(f.name)}));
  if (!open) return;
  f.families.filter(famVisible).forEach(c => renderFam(c, depth + 1, out));
  const showAll = !state.filter || matches(f.name);
  f.variables.filter(v => showAll || matches(v.name)).forEach(v => out.push(varRow(v, depth + 1)));
}
function varRow(v, depth) {
  return row({kind: "variable", id: v.id, depth, hasKids: false,
    icon: `<span class="ico">${iconFor(v)}</span>`, label: hl(v.name)});
}
function row({kind, id, depth, hasKids, open, icon, label}) {
  // only the grip on the right starts a move, so clicking the row never moves it by accident
  const grip = kind !== "root" && canMove()
    ? `<span class="grip" draggable="true" title="Drag to move"><svg viewBox="0 0 10 16"><circle cx="3" cy="3" r="1.3"/><circle cx="7" cy="3" r="1.3"/><circle cx="3" cy="8" r="1.3"/><circle cx="7" cy="8" r="1.3"/><circle cx="3" cy="13" r="1.3"/><circle cx="7" cy="13" r="1.3"/></svg></span>`
    : "";
  return `<div class="row${isSel(kind, id) ? " sel" : ""}" data-kind="${kind}" data-id="${esc(id ?? "")}" title="${label.replace(/<[^>]+>/g, "")}" style="padding-left:${12 + depth * 10}px">
    <span class="chev${open ? " open" : ""}">${hasKids ? CHEV : ""}</span>${icon}<span class="lbl">${label}</span>${grip}</div>`;
}
function toggle(kind, id) {
  const key = kind === "root" ? "root" : "f" + id;
  state.expanded.has(key) ? state.expanded.delete(key) : state.expanded.add(key);
  renderTree();
}

/* "Loading 2124… 12 s" with a spinner, so you can see it is working */
(() => {
  const st = document.createElement("style");
  st.textContent = `
    .loading{display:flex;align-items:center;gap:10px;margin:10px 15px;padding:12px 14px;border-radius:4px;
      background:var(--tree-top,#152030);border-left:3px solid var(--accent,#ea580c);color:var(--tree-text,#e2e8f0);font-size:13px}
    .loading .spin{width:16px;height:16px;flex:none;border-radius:50%;border:2px solid rgba(255,255,255,.2);
      border-top-color:var(--accent,#ea580c);animation:ldspin .8s linear infinite}
    .loading small{display:block;color:var(--tree-muted,#94a3b8);font-size:12px;margin-top:2px}
    @keyframes ldspin{to{transform:rotate(360deg)}}
    #btnRefresh.busy svg{animation:ldspin .8s linear infinite}`;
  document.head.appendChild(st);
})();
let loadingTimer = null;
function showLoading(what, hint = "") {
  clearInterval(loadingTimer);
  const t0 = Date.now();
  const draw = () => {
    const sec = Math.floor((Date.now() - t0) / 1000);
    const el = $("#tree .loading b");
    if (el) el.textContent = sec ? `${sec} s` : "";
  };
  $("#tree").innerHTML = `<div class="loading"><span class="spin"></span>
    <div>Loading ${esc(what)}… <b></b><small>${esc(hint)}</small></div></div>`;
  loadingTimer = setInterval(draw, 1000);
}
function stopLoading() { clearInterval(loadingTimer); loadingTimer = null; }

async function loadTree(force = false) {
  // only show the spinner if it takes more than a moment (data in memory comes back at once)
  const slow = setTimeout(() => showLoading(state.meta.database || "variables",
    force ? "Reading the whole IMOS table from SQL Server" : "First time for this database – next time it is instant"), 250);
  try { state.tree = await api(`/api/tree${force ? "?refresh=1" : ""}`); }
  catch (e) {
    clearTimeout(slow); stopLoading();
    $("#tree").innerHTML = `<div class="db-err">Can't read ${esc(state.meta.table || "IMOS")} from ${esc(state.meta.database || "the database")}.<br>${esc(e.message)}</div>`;
    return false;
  }
  clearTimeout(slow); stopLoading();
  state.treeInfo = state.tree.info || null;
  renderTree(); setDbLabel();
  return true;
}

/* ------------------------------------------------------------ selection */
/* Styled "unsaved changes" dialog (replaces the browser's confirm box).
   Resolves to "save", "discard" or "cancel". */
function askUnsaved() {
  return new Promise(resolve => {
    const name = state.detail ? esc(currentName()) : "this item";
    const ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = `
      <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="uTitle" aria-describedby="uText" style="width:430px">
        <div class="modal-head"><span id="uTitle">Unsaved changes</span>
          <button class="modal-x" data-a="cancel" aria-label="Close">×</button></div>
        <div class="modal-body" style="display:flex;gap:14px;align-items:flex-start;padding:18px 16px">
          <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" style="flex:none;fill:none;stroke:var(--accent);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round">
            <path d="M12 3 2 20h20z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".6" style="fill:var(--accent)"/></svg>
          <div id="uText" style="font-size:13px;line-height:1.5;color:var(--text)">
            You changed <b>${name}</b> but didn't save it.<br>
            <span style="color:var(--muted)">Save your changes before leaving?</span></div>
        </div>
        <div class="modal-foot">
          <button class="btn" data-a="discard" style="margin-right:auto;color:var(--danger)">Discard changes</button>
          <button class="btn" data-a="cancel">Cancel</button>
          <button class="btn primary" data-a="save">Save</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const done = a => { document.removeEventListener("keydown", key, true); ov.remove(); resolve(a); };
    const key = e => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); done("cancel"); }
      if (e.key === "Enter")  { e.preventDefault(); e.stopPropagation(); done("save"); }
    };
    document.addEventListener("keydown", key, true);
    ov.addEventListener("click", e => {
      const b = e.target.closest("[data-a]");
      if (b) done(b.dataset.a);
      else if (e.target === ov) done("cancel");
    });
    ov.querySelector('[data-a="save"]').focus();
  });
}

/* true = OK to leave the current item (nothing unsaved, saved, or discarded) */
async function confirmLeave() {
  if (!state.dirty) return true;
  const a = await askUnsaved();
  if (a === "cancel") return false;
  if (a === "save") { await save(); return !state.dirty; }   // stays if the save failed
  setDirty(false);
  return true;
}
async function select(kind, id) {
  if (isSel(kind, id)) return;
  if (!(await confirmLeave())) return;
  state.sel = {kind, id}; setDirty(false);
  renderTree(true); updateToolbar();
  await loadDetail();
}
async function loadDetail() {
  const {kind, id} = state.sel;
  if (kind === "variable") state.detail = await api(`/api/variable/${encodeURIComponent(id)}`);
  else if (kind === "family") state.detail = await api(`/api/family/${encodeURIComponent(id)}`);
  else state.detail = null;
  renderDetail();
}

/* ------------------------------------------------------------ detail */
state.sections.raw = true;
const sectionHead = (key, title) =>
  `<div class="section${state.sections[key] ? " open" : ""}" data-sec="${key}">${CHEV}<span>${title}</span></div>`;
const prop = (label, html) => `<div class="prop"><div class="k">${esc(label)}</div><div class="v">${html}</div></div>`;
const roCell = v => `<div class="ro">${v === null || v === undefined || v === "" ? "&nbsp;" : esc(v)}</div>`;

function rawSection(raw) {
  if (!raw) return "";
  return sectionHead("raw", `All columns (${esc(state.meta.table || "IMOS")})`) +
    (state.sections.raw ? Object.entries(raw).map(([k, v]) => prop(k, roCell(v))).join("") : "");
}

async function renderDetail() {
  const el = $("#detail"), {kind} = state.sel, d = state.detail;
  if (kind === "root" || !d) {
    el.innerHTML = `<div class="empty">Select a family or a variable in the tree.</div>`; return;
  }
  if (kind === "family") {
    const f = d.family, info = d.info, ro = state.meta.read_only, dis = ro ? " disabled" : "";
    let basic = "";
    if (info) {          // family row of the IMOS table: same Basic data as in IMOS
      basic = [
        info.has.notes ? prop("Notes", `<input data-f="notes" value="${esc(info.notes)}"${ml("notes")}${dis}>`) : "",
        info.has.category ? prop("Category", ro ? roCell(info.category) : categorySelect(info.category)) : "",
        prop("Type", roCell("Family")),
      ].join("");
    } else {             // family derived from a FAMILY column value
      basic = prop("Family", roCell(d.path)) + prop("Variables", roCell(d.variable_count));
    }
    el.innerHTML = `
      <div class="crumb"><span class="ico">${ICONS.family}</span>${esc(f.name)}</div>
      ${titleHtml(f.name)}
      <div class="grid">
        <div class="grid-head"><div>Name</div><div>Value</div></div>
        ${sectionHead("basic", "Basic data")}
        ${state.sections.basic ? basic : ""}
        <div id="vsBox"></div>
      </div>`;
    loadValueSets(f.id);
    return;
  }
  const v = d.variable, ro = state.meta.read_only, dis = ro ? " disabled" : "";
  const freeText = ["100", "120"].includes(String(v.type).trim());
  let options = [];
  if (v.has.default && !freeText) {
    try { options = await api(`/api/catalog?type=${encodeURIComponent(v.type)}`); } catch { options = []; }
  }
  if (v.default_value && !options.some(o => o.code === v.default_value)) options.unshift({code: v.default_value, description: ""});

  const basic = [
    v.has.notes ? prop("Notes", `<input data-f="notes" value="${esc(v.notes)}"${ml("notes")}${dis}>`) : "",
    v.has.category ? prop("Category", ro ? roCell(v.category) : categorySelect(v.category)) : "",
    v.has.type ? prop("Type", roCell(v.type_label || v.type)) : "",
    v.has.default ? prop("Default Value", ro ? roCell(v.default_value) : freeText
        ? `<input data-f="default_value" value="${esc(v.default_value)}"${ml("default")}>`
        : `<select data-f="default_value"><option value="">Please select...</option>${options.map(o =>
            `<option value="${esc(o.code)}"${o.code === v.default_value ? " selected" : ""}>${esc(o.code)}</option>`).join("")}</select>
           <button class="dots" id="btnPick" title="Browse values">...</button>`) : "",
  ].join("");

  el.innerHTML = `
    <div class="crumb"><span class="ico">${iconFor(v)}</span>${esc(v.name)}</div>
    ${titleHtml(v.name)}
    <div class="grid">
      <div class="grid-head"><div>Name</div><div>Value</div></div>
      ${basic ? sectionHead("basic", "Basic data") + (state.sections.basic ? basic : "") : ""}
      ${rawSection(d.raw)}
    </div>`;
}

function categorySelect(current) {
  const cats = !current || state.meta.categories.includes(current) ? state.meta.categories : [current, ...state.meta.categories];
  return `<select data-f="category"><option value="">Please select...</option>${cats.map(c =>
    `<option${c === current ? " selected" : ""}>${esc(c)}</option>`).join("")}</select>`;
}

function collectForm() {
  const data = {};
  document.querySelectorAll("#detail [data-f]").forEach(i => data[i.dataset.f] = i.value);
  return data;
}
function setDirty(v) { state.dirty = v; if (!v) state.titleNew = null; refreshSave(); }
/* Save is active when something was changed below, or a new valid name was typed in the title */
function refreshSave() { $("#tbSave").disabled = state.meta.read_only || !(state.dirty || state.titleNew); }

async function save() {
  if (state.meta.read_only) return;
  const t = $("#titleName");
  if (t && t.value.trim() && t.value.trim().toUpperCase() !== String(state.sel.id).toUpperCase()) {
    if (titleCheck()) return addFromTitle();                  // new name in the title = add a copy
    toast($("#titleHint").textContent || "Choose another name.", true); return;
  }
  if (!state.dirty) return;
  const {kind, id} = state.sel;
  const cur = kind === "variable" ? state.detail.variable : state.detail.info;
  if (!cur) return;
  const data = {...cur, ...collectForm()};
  const body = {notes: data.notes, category: data.category};
  if (kind === "variable") body.default_value = data.default_value;   // families have no default value
  try {
    await api(`/api/variable/${encodeURIComponent(id)}`, {method: "PUT", body});
    setDirty(false); await loadDetail(); toast("Saved");
  } catch (e) { toast(e.message, true); }
}
function syncDraft() {
  if (!state.detail) return;
  const cur = state.sel.kind === "variable" ? state.detail.variable : state.detail.info;
  if (cur) Object.assign(cur, collectForm());
}

/* ------------------------------------------------------------ toolbar */
function updateToolbar() {
  const k = state.sel.kind, ro = state.meta.read_only, derived = String(state.sel.id || "").startsWith("fam:");
  const canCreate = !ro && state.meta.can_create;
  $("#tbNewVar").disabled = !canCreate || derived;          // root = top level, family = inside it
  $("#tbNewFam").disabled = !canCreate || k === "variable" || derived;
  $("#tbRename").disabled = ro || k === "root" || derived;
  $("#tbDelete").disabled = ro || k === "root" || derived;
  $("#tbMove").disabled = !canMove() || k === "root" || derived;
  if ($("#tbCopy")) {
    $("#tbCopy").disabled = !canMove() || k === "root" || derived;
    $("#tbCopy").title = ro ? "Read-only: set READ_ONLY = False in config.py" : "Copy this variable or family";
  }
  const why = ro ? "Read-only: set READ_ONLY = False in config.py" : "";
  ["#tbRename", "#tbDelete", "#tbSave", "#tbNewVar", "#tbNewFam"].forEach(b => $(b).title = why);
  $("#tbMove").title = why || "Move to another family (or drag it in the tree)";
}

function modal({title, body, onOk, okText = "OK"}) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = body;
  $("#modalErr").textContent = "";
  $("#modalOk").textContent = okText;
  $("#overlay").hidden = false;
  const first = $("#modalBody input:not([disabled]), #modalBody select:not([disabled]), #modalBody textarea");
  if (first) { first.focus(); first.select?.(); }
  const close = () => { $("#overlay").hidden = true; document.removeEventListener("keydown", key); };
  const ok = async () => {
    try { await onOk(); close(); } catch (e) { $("#modalErr").textContent = e.message; }
  };
  const key = e => { if (e.key === "Escape") close(); if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); ok(); } };
  document.addEventListener("keydown", key);
  $("#modalOk").onclick = ok; $("#modalCancel").onclick = close; $("#modalX").onclick = close;
}

async function newVariable() {
  if ($("#tbNewVar").disabled || !(await confirmLeave())) return;
  // default family: the selected family, the family of the selected variable, or the top level
  const {kind, id} = state.sel;
  const start = kind === "family" ? id : kind === "variable" ? parentOf("variable", id) : "";
  const famOptions = [{id: "", name: "— Variables (top level, no family) —", depth: 0}, ...flatFamilies()]
    .map(f => `<option value="${esc(f.id)}"${f.id === start ? " selected" : ""}>${"\u00a0\u00a0".repeat(f.depth)}${esc(f.name)}</option>`).join("");
  modal({title: "New variable", okText: "Create variable",
    body: mGrid(
      mrow("Family", `<select id="mFam">${famOptions}</select>`) +
      mrow("Name", `<input id="mName" placeholder="e.g. TEST_NAL_VAR5"${ml("name")}>`) +
      mrow("Notes", `<input id="mNotes"${ml("notes")}>`) +
      mrow("Category", mCategory()) +
      mrow("Type", `<select id="mType">${state.meta.types.map(t =>
        `<option value="${t.code}"${t.code === 25 ? " selected" : ""}>${esc(t.name)}</option>`).join("")}</select>`)),
    onOk: async () => {
      const fam = $("#mFam").value;
      const r = await api("/api/variable", {method: "POST", body: {
        name: $("#mName").value, type: $("#mType").value, family_id: fam,
        notes: $("#mNotes").value, category: $("#mCat").value}});
      if (fam) (findFamilyPath(state.tree.families, f => f.id === fam) || []).forEach(f => state.expanded.add("f" + f.id));
      state.expanded.add("root"); setDirty(false);
      await loadTree(); state.sel = {kind: "", id: null}; await select("variable", r.id);
      toast(`${r.id} created${fam ? " in " + fam : " at the top level"}`);
    }});
  $("#mName").focus();
}

/* maxlength="50" etc. from the real column size in SQL Server (sent by /api/meta) */
const ml = field => {
  const n = (state.meta.limits || {})[field];
  return n ? ` maxlength="${n}" title="Maximum ${n} characters"` : "";
};
const nameMax = () => {          // a family name must also fit in its children's FAMILY column
  const n = ["name", "parent"].map(f => (state.meta.limits || {})[f]).filter(Boolean);
  return n.length ? Math.min(...n) : 0;
};
const mlName = () => { const n = nameMax(); return n ? ` maxlength="${n}" title="Maximum ${n} characters"` : ""; };

const mrow = (label, html) => `<div class="mrow"><div class="mk">${esc(label)}</div><div class="mv">${html}</div></div>`;
const mCategory = () => `<select id="mCat"><option value="">Please select...</option>${
  state.meta.categories.map(c => `<option>${esc(c)}</option>`).join("")}</select>`;
const mGrid = rows => `<div class="mgrid">${rows}</div>`;

async function newFamily() {
  if ($("#tbNewFam").disabled || !(await confirmLeave())) return;
  const parent = state.sel.kind === "family" ? state.sel.id : "";
  let suggested = "new_family";
  try { suggested = (await api("/api/next-name?base=new_family")).name; } catch {}
  modal({title: parent ? "New sub-family" : "New family", okText: "Create family",
    body: mGrid(
      (parent ? mrow("Inside family", `<div class="mro">${esc(parent)}</div>`) : "") +
      mrow("Name", `<input id="mName" value="${esc(suggested)}"${mlName()}>`) +
      mrow("Notes", `<input id="mNotes"${ml("notes")}>`) +
      mrow("Category", mCategory()) +
      mrow("Type", `<div class="mro">Family</div>`)),
    onOk: async () => {
      const r = await api("/api/family", {method: "POST", body: {
        name: $("#mName").value, parent_id: parent, notes: $("#mNotes").value, category: $("#mCat").value}});
      state.expanded.add(parent ? "f" + parent : "root"); setDirty(false);
      await loadTree(); state.sel = {kind: "", id: null}; await select("family", r.id);
      toast(`${r.id} created`);
    }});
}

const currentName = () => {
  const d = state.detail;
  if (!d) return "";
  return state.sel.kind === "variable" ? d.variable.name : d.family.name;
};

function rename() {
  if ($("#tbRename").disabled) return;
  const {kind, id} = state.sel;
  modal({title: "Rename", okText: "Rename",
    body: `<label>New name</label><input id="mName" value="${esc(currentName())}"${kind === "family" ? mlName() : ml("name")}>`,
    onOk: async () => {
      const r = await api(`/api/rename/${kind}/${encodeURIComponent(id)}`, {method: "PUT", body: {name: $("#mName").value}});
      if (kind === "family" && r.id !== id && state.expanded.has("f" + id)) state.expanded.add("f" + r.id);
      state.sel.id = r.id;
      await loadTree(); await loadDetail(); renderTree(true); toast("Renamed");
    }});
}
function del() {
  if ($("#tbDelete").disabled) return;
  const {kind, id} = state.sel;
  modal({title: "Delete", okText: "Delete",
    body: `<p style="margin:0">Delete <b>${esc(currentName())}</b> from ${esc(state.meta.table)}? ${kind === "family" ? " Everything inside this family is deleted too." : ""} This deletes the rows in SQL Server.</p>`,
    onOk: async () => {
      await api(`/api/${kind}/${encodeURIComponent(id)}`, {method: "DELETE"});
      setDirty(false); state.sel = {kind: "root", id: null}; state.detail = null;
      await loadTree(); updateToolbar(); renderDetail(); toast("Deleted");
    }});
}
function feedback() {
  modal({title: "Feedback", okText: "Send feedback",
    body: `<label>What should we improve?</label><textarea id="mText"></textarea>`,
    onOk: async () => { await api("/api/feedback", {method: "POST", body: {text: $("#mText").value}}); toast("Feedback sent"); }});
}
async function pickValue() {
  const v = state.detail.variable;
  let chosen = $('#detail [data-f="default_value"]').value;
  modal({title: "Choose default value", okText: "Use value",
    body: `<input id="mQ" placeholder="Filter values"><div class="pick-list" id="mList"></div>`,
    onOk: async () => {
      const sel = $('#detail [data-f="default_value"]');
      if (chosen && ![...sel.options].some(o => o.value === chosen)) sel.add(new Option(chosen, chosen));
      sel.value = chosen; setDirty(true);
    }});
  let total = null;                                   // number of values without filter
  const label = v.type_label || "default";
  const draw = async () => {
    const q = $("#mQ").value;
    const rows = await api(`/api/catalog?type=${encodeURIComponent(v.type)}&q=${encodeURIComponent(q)}`);
    if (!q) total = rows.length;
    $("#mList").innerHTML = rows.length ? rows.map(r =>
      `<div data-code="${esc(r.code)}" class="${r.code === chosen ? "on" : ""}"><b>${esc(r.code)}</b>${esc(r.description)}</div>`).join("")
      : `<div class="muted">No values match this filter.</div>`;
    // count shown at the bottom left of the popup, e.g. "114 Surface default values"
    const plural = n => `${n} ${esc(label)} default value${n === 1 ? "" : "s"}`;
    const text = q && total !== null ? `${rows.length} of ${plural(total)}` : plural(rows.length);
    $("#modalErr").innerHTML = `<span style="color:var(--muted)">${text}</span>`;
  };
  $("#mQ").oninput = draw;
  $("#mList").onclick = e => { const d = e.target.closest("[data-code]"); if (!d) return; chosen = d.dataset.code; draw(); };
  $("#mList").ondblclick = e => { if (e.target.closest("[data-code]")) $("#modalOk").click(); };
  draw();
}

/* ------------------------------------------------------------ move */
function canMove() { return !state.meta.read_only && state.meta.mode === "parent"; }

/* all families as a flat list, in tree order: [{id, name, depth}] */
function flatFamilies(nodes = state.tree.families, depth = 0, out = []) {
  for (const f of nodes) { out.push({id: f.id, name: f.name, depth}); flatFamilies(f.families, depth + 1, out); }
  return out;
}
/* id of the family that contains this item ("" = top level) */
function parentOf(kind, id) {
  const hit = findFamilyPath(state.tree.families, f =>
    kind === "family" ? f.families.some(c => c.id === id) : f.variables.some(v => v.id === id));
  return hit ? hit[hit.length - 1].id : "";
}
/* ids of a family and everything below it (a family can't go inside itself) */
function familyAndBelow(id) {
  const path = findFamilyPath(state.tree.families, f => f.id === id);
  if (!path) return new Set([id]);
  const out = new Set();
  (function walk(f) { out.add(f.id); f.families.forEach(walk); })(path[path.length - 1]);
  return out;
}
function isValidTarget(kind, id, target) {
  if (kind === "family" && target && familyAndBelow(id).has(target)) return false;
  return parentOf(kind, id) !== target;
}

async function doMove(kind, id, target) {
  try {
    await api(`/api/move/${kind}/${encodeURIComponent(id)}`, {method: "PUT", body: {target}});
  } catch (e) { toast(e.message, true); return; }
  // open the destination so the moved item is visible, and keep it selected
  if (target) (findFamilyPath(state.tree.families, f => f.id === target) || []).forEach(f => state.expanded.add("f" + f.id));
  state.expanded.add("root");
  await loadTree();
  state.sel = {kind, id};
  renderTree(true); updateToolbar(); await loadDetail();
  toast(`${id} moved to ${target || "Variables (top level)"}`);
}

async function moveDialog() {
  if ($("#tbMove").disabled) return;
  if (!(await confirmLeave())) return;
  const {kind, id} = state.sel;
  const here = parentOf(kind, id);
  const blocked = kind === "family" ? familyAndBelow(id) : new Set();
  const all = [{id: "", name: "Variables (top level)", depth: -1}, ...flatFamilies()];
  let chosen = null;
  modal({title: `Move ${kind}`, okText: "Move here",
    body: `<div style="font-size:12px;color:var(--label);margin:0 0 8px">
             Move <b style="color:var(--text)">${esc(id)}</b> from <b style="color:var(--text)">${esc(here || "Variables (top level)")}</b> to:</div>
           <input id="mQ" placeholder="Filter families"><div class="pick-list" id="mList"></div>`,
    onOk: async () => {
      if (chosen === null) throw new Error("Choose the destination family.");
      await doMove(kind, id, chosen);
    }});
  const draw = () => {
    const f = $("#mQ").value.trim().toLowerCase();
    const list = all.filter(x => !f || x.id === "" || x.name.toLowerCase().includes(f));
    $("#mList").innerHTML = list.map(x => {
      const off = blocked.has(x.id) || x.id === here;
      const note = x.id === here ? " (current)" : blocked.has(x.id) ? " (inside it)" : "";
      return `<div data-t="${esc(x.id)}" class="${x.id === chosen ? "on" : ""}${off ? " off" : ""}"
        style="padding-left:${10 + Math.max(0, x.depth) * 14}px">
        <span class="ico" style="margin:0">${x.id === "" ? '<span class="dollar" style="margin:0">$</span>' : ICONS.family}</span>${esc(x.name)}<i>${note}</i></div>`;
    }).join("") || `<div class="muted">No family matches this filter.</div>`;
    const n = all.length - 1;
    $("#modalErr").innerHTML = `<span style="color:var(--muted)">${n} famil${n === 1 ? "y" : "ies"}</span>`;
  };
  $("#mQ").oninput = draw;
  $("#mList").onclick = e => {
    const d = e.target.closest("[data-t]"); if (!d || d.classList.contains("off")) return;
    chosen = d.dataset.t; draw();
  };
  $("#mList").ondblclick = e => { const d = e.target.closest("[data-t]"); if (d && !d.classList.contains("off")) $("#modalOk").click(); };
  draw();
}

/* ---- drag and drop in the tree ---- */
let dragItem = null, hoverTimer = null;
const clearDrop = () => document.querySelectorAll("#tree .drop-ok").forEach(r => r.classList.remove("drop-ok"));
$("#tree").addEventListener("dragstart", e => {
  const g = e.target.closest(".grip"); if (!g) { e.preventDefault(); return; }
  const r = g.closest(".row");
  dragItem = {kind: r.dataset.kind, id: r.dataset.id};
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", dragItem.id);
  e.dataTransfer.setDragImage(r, 20, 12);          // show the whole row while dragging
  r.classList.add("dragging");
});
$("#tree").addEventListener("dragend", e => {
  dragItem = null; clearDrop(); clearTimeout(hoverTimer);
  document.querySelectorAll("#tree .dragging").forEach(r => r.classList.remove("dragging"));
});
$("#tree").addEventListener("dragover", e => {
  if (!dragItem) return;
  const r = e.target.closest('.row[data-kind="family"], .row[data-kind="root"]');
  const target = r ? (r.dataset.kind === "root" ? "" : r.dataset.id) : null;
  if (target === null || !isValidTarget(dragItem.kind, dragItem.id, target)) { clearDrop(); return; }
  e.preventDefault(); e.dataTransfer.dropEffect = "move";
  if (!r.classList.contains("drop-ok")) {
    clearDrop(); r.classList.add("drop-ok");
    // hovering a closed family for a moment opens it, so you can drop deeper
    clearTimeout(hoverTimer);
    if (target && !state.expanded.has("f" + target)) hoverTimer = setTimeout(() => {
      state.expanded.add("f" + target); renderTree();
      const again = document.querySelector(`#tree .row[data-kind="family"][data-id="${CSS.escape(target)}"]`);
      if (again) again.classList.add("drop-ok");
    }, 700);
  }
});
$("#tree").addEventListener("dragleave", e => { if (!e.relatedTarget || !$("#tree").contains(e.relatedTarget)) clearDrop(); });
$("#tree").addEventListener("drop", async e => {
  e.preventDefault(); clearTimeout(hoverTimer);
  const r = e.target.closest('.row[data-kind="family"], .row[data-kind="root"]');
  const item = dragItem; dragItem = null; clearDrop();
  if (!r || !item) return;
  const target = r.dataset.kind === "root" ? "" : r.dataset.id;
  if (!isValidTarget(item.kind, item.id, target)) return;
  if (!(await confirmLeave())) return;
  modal({title: `Move ${item.kind}`, okText: "Move",
    body: `<p style="margin:0;line-height:1.5">Move <b>${esc(item.id)}</b><br>into <b>${esc(target || "Variables (top level)")}</b>?</p>`,
    onOk: () => doMove(item.kind, item.id, target)});
});

/* ------------------------------------------------------------ value sets (family) */
(() => {
  const st = document.createElement("style");
  st.textContent = `
    .vs-head{justify-content:flex-start}
    .vs-tools{margin-left:auto;display:flex;gap:4px;padding-right:4px}
    .vs-tools button{width:28px;height:26px;border:0;background:none;border-radius:4px;color:var(--text);display:flex;align-items:center;justify-content:center}
    .vs-tools button:hover{background:var(--toolbar);color:var(--accent)}
    .vs-tools svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2}
    .vs-table{margin:0 0 10px 18px}
    .vs-th{background:var(--head-bg);color:var(--head-text);font-weight:600;font-size:12px;height:26px;display:flex;align-items:center;padding-left:28px}
    .vs-sethead{display:flex;align-items:center;gap:8px;height:28px;background:var(--toolbar);border-bottom:1px solid var(--panel-line);padding:0 4px 0 6px;font-size:13px;color:var(--text)}
    .vs-sethead .tog{width:18px;height:18px;border:0;background:none;color:var(--accent);font-weight:700;font-size:16px;line-height:1;padding:0}
    .vs-sethead .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .vs-sethead .nm i{font-style:normal;color:var(--muted);font-size:12px;margin-left:6px}
    .vs-sethead .menu{width:28px;height:24px;border:0;background:none;border-radius:4px;color:var(--text);font-size:16px}
    .vs-sethead .menu:hover{background:#e2e8f0}
    .vs-row{display:flex;align-items:center;min-height:26px;border-bottom:1px solid var(--panel-line)}
    .vs-row .k{width:45%;max-width:302px;flex:none;padding:0 8px 0 24px;font-size:12px;color:var(--label);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .vs-row .v{flex:1;display:flex;min-width:0}
    .vs-row select{flex:1;min-width:0;border:1px solid var(--field-line);height:24px;padding:0 26px 0 10px;font:inherit;font-size:12px;color:var(--text);border-radius:3px;
      appearance:none;background:var(--field) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23475569' stroke-width='1.3'/%3E%3C/svg%3E") no-repeat right 8px center/10px}
    .vs-row select:focus{outline:none;border-color:var(--accent)}
    .vs-row input.vs-in{flex:1;min-width:0;border:1px solid var(--field-line);height:24px;padding:0 10px;font:inherit;font-size:12px;
      color:var(--text);background:var(--field);border-radius:3px}
    .vs-row input.vs-in::placeholder{color:var(--muted)}
    .vs-row input.vs-in:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}
    .vs-row select.inh{color:var(--muted)}
    .vs-row .ro{flex:1;min-width:0;background:var(--ro);border:1px solid var(--field-line);height:24px;padding:3px 10px;font-size:12px;color:var(--disabled);border-radius:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .vs-empty{padding:8px 28px;font-size:12px;color:var(--muted)}
    .vs-pop{position:fixed;z-index:30;background:var(--page);border:1px solid var(--panel-line);border-radius:6px;box-shadow:0 8px 24px rgba(15,23,42,.2);padding:4px;min-width:150px}
    .vs-pop button{display:block;width:100%;text-align:left;border:0;background:none;padding:7px 12px;border-radius:4px;font-size:13px;color:var(--text)}
    .vs-pop button:hover{background:var(--accent-soft);color:var(--accent-text)}
    .vs-pop button.danger{color:var(--danger)}`;
  document.head.appendChild(st);
})();

const VS = {fid: null, data: null, open: new Set(), catalog: {}};
const ADD_SVG = `<svg viewBox="0 0 16 16"><path d="M8 2v12M2 8h12"/></svg>`;
const EXPAND_SVG = `<svg viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="1"/><path d="M6 10l4-4M7 6h3v3"/></svg>`;

async function loadValueSets(fid) {
  const box = $("#vsBox"); if (!box) return;
  if (VS.fid !== fid) { VS.fid = fid; VS.data = null; VS.open = new Set(); }
  if (!VS.data) {
    box.innerHTML = "";
    try { VS.data = await api(`/api/valuesets/${encodeURIComponent(fid)}`); }
    catch (e) { box.innerHTML = sectionHead("vs", "Value sets") + `<div class="vs-empty" style="color:var(--danger)">${esc(e.message)}</div>`; return; }
    if (state.sel.kind !== "family" || state.sel.id !== fid) return;
    VS.data.sets.forEach(s => VS.open.add(s.name));
    // the lists of values, one per type (same lists as Default Value)
    const types = [...new Set(VS.data.children.filter(c => c.kind === "variable" && c.editable).map(c => c.type))];
    await Promise.all(types.filter(t => !VS.catalog[currentDb + "|" + t]).map(async t => {
      try { VS.catalog[currentDb + "|" + t] = (await api(`/api/catalog?type=${encodeURIComponent(t)}`)).map(o => o.code); }
      catch { VS.catalog[currentDb + "|" + t] = []; }
    }));
  }
  renderValueSets();
}

function vsChoices(c) {
  return c.kind === "family" ? (c.options || []) : (VS.catalog[currentDb + "|" + c.type] || []);
}

function renderValueSets() {
  const box = $("#vsBox"); if (!box || !VS.data) return;
  // like IMOS: an empty family (no sub-family, no variable) has no Value sets section
  if (!VS.data.children.length) { box.innerHTML = ""; return; }
  const ro = state.meta.read_only, open = state.sections.vs !== false;
  const tools = ro ? "" : `<span class="vs-tools">
      <button data-vs="add" title="New value set">${ADD_SVG}</button>
      <button data-vs="expand" title="Open / close all value sets">${EXPAND_SVG}</button></span>`;
  let html = `<div class="section vs-head${open ? " open" : ""}" data-sec="vs">${CHEV}<span>Value sets</span>${tools}</div>`;
  if (open) {
    const {children, sets} = VS.data;
    html += `<div class="vs-table"><div class="vs-th">Name of value sets</div>`;
    if (!sets.length) html += `<div class="vs-empty">No value set yet${ro ? "." : " – click + to add one."}</div>`;
    for (const set of sets) {
      const isOpen = VS.open.has(set.name);
      html += `<div class="vs-set" data-set="${esc(set.name)}">
        <div class="vs-sethead"><button class="tog" data-vs="toggle" title="${isOpen ? "Close" : "Open"}">${isOpen ? "−" : "+"}</button>
          <span class="nm">${esc(set.name)}${set.local ? "<i>not saved yet – choose a value to save it</i>" : ""}</span>
          ${ro ? "" : `<button class="menu" data-vs="menu" title="Rename, duplicate or delete">☰</button>`}</div>`;
      if (isOpen) {
        if (!children.length) html += `<div class="vs-empty">This family is empty.</div>`;
        for (const c of children) {
          const label = `${c.name} (${c.kind === "family" ? "Family" : c.type_label})`;
          const cur = set.values[c.name] || "";
          // first set: no value = empty WERT; other sets: no value = the default (first set) value
          const inherit = set.first ? "<> (←)" : `<${c.default}> (←)`;
          let cell;
          if (!c.editable || ro) {
            const shown = !c.editable ? `<${c.default}> (←)` : (cur && !set.first ? cur : (cur ? cur : inherit));
            cell = `<div class="ro" title="${esc(shown)}">${esc(shown)}</div>`;
          } else if (c.free) {
            cell = `<input class="vs-in" data-var="${esc(c.name)}" value="${esc(cur)}" placeholder="${esc(set.first ? "<> (←)" : inherit)}"
                      title="${esc(cur || (set.first ? "" : inherit))}" spellcheck="false" autocomplete="off"
                      maxlength="${(state.meta.limits || {}).default || 4000}">`;
          } else {
            const choices = vsChoices(c);
            const list = cur && !choices.includes(cur) ? [cur, ...choices] : choices;
            cell = `<select data-var="${esc(c.name)}" class="${cur ? "" : "inh"}">
                <option value="">${esc(inherit)}</option>
                ${list.map(o => `<option value="${esc(o)}"${o === cur ? " selected" : ""}>${esc(o)}</option>`).join("")}
              </select><button class="dots" data-vs="pick" data-var="${esc(c.name)}" title="Browse values">...</button>`;
          }
          html += `<div class="vs-row"><div class="k" title="${esc(label)}">${esc(label)}</div><div class="v">${cell}</div></div>`;
        }
      }
      html += `</div>`;
    }
    html += `</div>`;
  }
  // keep the cursor in the field you were in (Tab to the next row keeps working after a save)
  const a = document.activeElement, keep = a && box.contains(a) && a.dataset.var
    ? {set: a.closest("[data-set]")?.dataset.set, v: a.dataset.var, tag: a.tagName} : null;
  box.innerHTML = html;
  if (keep) {
    const again = [...box.querySelectorAll(`[data-var]`)].find(x =>
      x.dataset.var === keep.v && x.tagName === keep.tag && x.closest("[data-set]")?.dataset.set === keep.set);
    if (again) again.focus();
  }
}

async function vsSetValue(setName, varName, value) {
  const set = VS.data.sets.find(s => s.name === setName);
  try {
    await api(`/api/valuesets/${encodeURIComponent(VS.fid)}/value`, {method: "POST",
      body: {set: setName, var: varName, value, first: !!set.first}});
    if (value) set.values[varName] = value; else delete set.values[varName];
    if (set.first) {                          // the default value changed: the other sets show it as <value> (←)
      const c = VS.data.children.find(x => x.name === varName);
      if (c) c.default = value;
    }
    set.local = false;
    toast(value ? `${setName}: ${varName} = ${value}` : `${setName}: ${varName} back to its default`);
  } catch (e) { toast(e.message, true); }
  renderValueSets();
}

function vsUniqueName(base) {
  const used = new Set(VS.data.sets.map(s => s.name.toUpperCase()));
  if (!used.has(base.toUpperCase())) return base;
  let i = 1; while (used.has(`${base}_${i}`.toUpperCase())) i++;
  return `${base}_${i}`;
}

function vsAskName(title, value, okText, onOk) {
  modal({title, okText, body: `<label>Name of the value set</label><input id="mVs" value="${esc(value)}">`,
    onOk: async () => {
      const n = $("#mVs").value.trim();
      if (!n) throw new Error("Enter a name.");
      if (/['"]/.test(n)) throw new Error("No quotes in the name.");
      await onOk(n);
    }});
}

function vsMenu(btn, setName) {
  document.querySelectorAll(".vs-pop").forEach(p => p.remove());
  const r = btn.getBoundingClientRect(), pop = document.createElement("div");
  pop.className = "vs-pop";
  const isFirst = !!(VS.data.sets.find(x => x.name === setName) || {}).first;
  pop.innerHTML = `<button data-a="rename">Rename</button><button data-a="dup">Duplicate</button>` +
    `<button data-a="del" class="danger">Delete</button>`;
  pop.style.top = (r.bottom + 4) + "px"; pop.style.left = Math.max(8, r.right - 160) + "px";
  document.body.appendChild(pop);
  const close = () => { pop.remove(); document.removeEventListener("mousedown", out, true); };
  const out = e => { if (!pop.contains(e.target)) close(); };
  setTimeout(() => document.addEventListener("mousedown", out, true));
  pop.onclick = e => {
    const a = e.target.closest("[data-a]")?.dataset.a; if (!a) return;
    close();
    const set = VS.data.sets.find(s => s.name === setName);
    const fidUrl = `/api/valuesets/${encodeURIComponent(VS.fid)}`;
    if (a === "rename") vsAskName("Rename value set", setName, "Rename", async n => {
      if (n.toUpperCase() !== setName.toUpperCase() && VS.data.sets.some(s => s.name.toUpperCase() === n.toUpperCase())) throw new Error(`${n} already exists.`);
      if (!set.local) await api(`${fidUrl}/rename`, {method: "POST", body: {old: setName, new: n}});
      set.name = n; VS.open.delete(setName); VS.open.add(n); renderValueSets(); toast("Value set renamed");
    });
    if (a === "dup") vsAskName("Duplicate value set", vsUniqueName(setName + "_COPY"), "Duplicate", async n => {
      if (VS.data.sets.some(s => s.name.toUpperCase() === n.toUpperCase())) throw new Error(`${n} already exists.`);
      if (!set.local) await api(`${fidUrl}/duplicate`, {method: "POST", body: {set: setName, new: n}});
      VS.data.sets.push({name: n, values: {...set.values}, local: set.local || !Object.keys(set.values).length});
      VS.data.sets.sort((a, b) => (b.first ? 1 : 0) - (a.first ? 1 : 0) || a.name.localeCompare(b.name));
      VS.open.add(n); renderValueSets(); toast("Value set duplicated");
    });
    if (a === "del") modal({title: "Delete value set", okText: "Delete",
      body: set.first
        ? `<p style="margin:0 0 8px">Delete the default value set <b>${esc(setName)}</b> of <b>${esc(VS.fid)}</b>?</p>
           <p style="margin:0;color:var(--muted);font-size:12px;line-height:1.5">Only the name of the set is removed (WERT of the family).
           The variables keep their own Default Value. The next <b>+</b> creates a new default set.</p>`
        : `<p style="margin:0">Delete the value set <b>${esc(setName)}</b> of <b>${esc(VS.fid)}</b>?</p>`,
      onOk: async () => {
        if (!set.local) await api(`${fidUrl}/delete`, {method: "POST", body: {set: setName}});
        VS.data.sets = VS.data.sets.filter(s => s !== set); renderValueSets(); toast("Value set deleted");
      }});
  };
}

function vsPick(setName, varName) {
  const c = VS.data.children.find(x => x.name === varName);
  const set = VS.data.sets.find(s => s.name === setName);
  let chosen = set.values[varName] || "";
  const all = vsChoices(c);
  modal({title: `${setName} – ${varName}`, okText: "Use value",
    body: `<input id="mQ" placeholder="Filter values"><div class="pick-list" id="mList"></div>`,
    onOk: async () => { await vsSetValue(setName, varName, chosen); }});
  const draw = () => {
    const f = $("#mQ").value.toLowerCase();
    const list = all.filter(x => !f || x.toLowerCase().includes(f));
    $("#mList").innerHTML = `<div data-code="" class="${chosen === "" ? "on" : ""}"><b>&lt;${esc(set.first ? "" : c.default)}&gt; (←)</b>${set.first ? "empty" : "default"}</div>` +
      list.map(x => `<div data-code="${esc(x)}" class="${x === chosen ? "on" : ""}"><b>${esc(x)}</b></div>`).join("");
    $("#modalErr").innerHTML = `<span style="color:var(--muted)">${list.length} value${list.length === 1 ? "" : "s"}</span>`;
  };
  $("#mQ").oninput = draw;
  $("#mList").onclick = e => { const d = e.target.closest("[data-code]"); if (!d) return; chosen = d.dataset.code; draw(); };
  $("#mList").ondblclick = e => { if (e.target.closest("[data-code]")) $("#modalOk").click(); };
  draw();
}

/* clicks and changes inside the Value sets section */
document.addEventListener("click", e => {
  const b = e.target.closest("#vsBox [data-vs]"); if (!b) return;
  e.stopPropagation();
  const setEl = b.closest("[data-set]"), setName = setEl ? setEl.dataset.set : null;
  const a = b.dataset.vs;
  if (a === "add") {
    state.sections.vs = true;
    const hasFirst = VS.data.sets.some(x => x.first);
    const n = vsUniqueName("New");
    (async () => {
      try {
        if (!hasFirst) {                      // first set = default values: its name goes into the WERT of the family
          await api(`/api/valuesets/${encodeURIComponent(VS.fid)}/first`, {method: "POST", body: {name: n}});
          const values = {};
          VS.data.children.forEach(c => { if (c.default) values[c.name] = c.default; });
          VS.data.sets.unshift({name: n, values, first: true});
        } else {
          VS.data.sets.push({name: n, values: {}, local: true});
        }
        VS.open.add(n); renderValueSets();
        toast(`Value set ${n} added – ☰ to rename it`);
      } catch (e) { toast(e.message, true); }
    })();
  }
  if (a === "expand") {
    const allOpen = VS.data.sets.every(s => VS.open.has(s.name));
    VS.open = allOpen ? new Set() : new Set(VS.data.sets.map(s => s.name)); renderValueSets();
  }
  if (a === "toggle") { VS.open.has(setName) ? VS.open.delete(setName) : VS.open.add(setName); renderValueSets(); }
  if (a === "menu") vsMenu(b, setName);
  if (a === "pick") vsPick(setName, b.dataset.var);
}, true);
document.addEventListener("change", e => {
  const el = e.target.closest("#vsBox select[data-var], #vsBox input.vs-in"); if (!el) return;
  const setName = el.closest("[data-set]").dataset.set, set = VS.data.sets.find(x => x.name === setName);
  if (el.tagName === "INPUT" && (set.values[el.dataset.var] || "") === el.value.trim()) return;   // nothing changed
  vsSetValue(setName, el.dataset.var, el.value.trim());
});
document.addEventListener("keydown", e => {
  const el = e.target.closest("#vsBox input.vs-in"); if (!el) return;
  if (e.key === "Enter") { e.preventDefault(); el.blur(); }                       // blur -> change -> saved
  if (e.key === "Escape") {                                                      // put the saved value back
    const set = VS.data.sets.find(x => x.name === el.closest("[data-set]").dataset.set);
    el.value = set.values[el.dataset.var] || ""; el.blur();
  }
});

/* ------------------------------------------------------------ title: type a new name + Add */
(() => {
  const st = document.createElement("style");
  st.textContent = `
    .title-row{display:flex;align-items:center;gap:8px;margin:14px 0 4px;max-width:100%}
    .title-input{flex:1;min-width:0;max-width:520px;font:inherit;font-size:18px;color:var(--text);height:36px;padding:0 10px;
      border:1px solid transparent;border-radius:4px;background:transparent;transition:border-color .12s,background .12s}
    .title-input:hover{border-color:var(--field-line)}
    .title-input:focus{outline:none;border-color:var(--accent);background:var(--field);box-shadow:0 0 0 2px var(--accent-soft)}
    .title-row .btn{height:34px;display:flex;align-items:center;gap:6px;flex:none}
    .title-row .btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.4}
    .title-row .btn:disabled{opacity:.45;cursor:default}
    .title-hint{font-size:12px;color:var(--muted);margin:0 0 10px 11px;min-height:16px}
    .title-hint.bad{color:var(--danger)}`;
  document.head.appendChild(st);
})();

/* editable title: change the name and press Add to create a copy at the same place */
function titleHtml(name) {
  if (state.meta.read_only || !canMove()) return `<div class="title">${esc(name)}</div>`;
  return `<div class="title-row">
      <input id="titleName" class="title-input" value="${esc(name)}" spellcheck="false" autocomplete="off"
             title="Type a new name, then Save to create a copy in the same family" aria-label="Name"${state.sel.kind === "family" ? mlName() : ml("name")}>
    </div><div class="title-hint" id="titleHint"></div>`;
}
function titleCheck() {
  const inp = $("#titleName"); if (!inp) return false;
  const {kind, id} = state.sel, nn = inp.value.trim(), where = parentOf(kind, id) || "Variables (top level)";
  let msg = "", bad = false;
  if (!nn || nn.toUpperCase() === String(id).toUpperCase()) msg = "";
  else if (/[\s\/\\'"]/.test(nn)) { msg = "No spaces, slashes or quotes in a name."; bad = true; }
  else if (allNames().has(nn.toUpperCase())) { msg = `${nn} already exists.`; bad = true; }
  else msg = `Save creates ${kind === "family" ? "the family" : "the variable"} ${nn} in ${where}, with the same values` +
             (state.dirty ? " and the changes you made below" : "") + (kind === "family" ? " (without its content)." : ".") +
             ` ${id} itself is not changed.`;
  $("#titleHint").textContent = msg;
  $("#titleHint").classList.toggle("bad", bad);
  const ok = !!msg && !bad;
  state.titleNew = ok ? nn : null;
  refreshSave();
  return ok;
}
async function addFromTitle() {
  if (!titleCheck()) return;
  const {kind, id} = state.sel, nn = $("#titleName").value.trim();
  const target = parentOf(kind, id);
  const edited = state.dirty ? collectForm() : null;          // changes typed below go to the NEW item
  $("#tbSave").disabled = true;
  try {
    const r = await api("/api/copy", {method: "POST", body: {kind, id, target, names: {[id]: nn}}});
    if (edited) {
      const body = {notes: edited.notes, category: edited.category};
      if (kind === "variable" && "default_value" in edited) body.default_value = edited.default_value;
      await api(`/api/variable/${encodeURIComponent(r.id)}`, {method: "PUT", body});
    }
    setDirty(false); state.titleNew = null;                   // the original keeps its old values
    if (target) (findFamilyPath(state.tree.families, f => f.id === target) || []).forEach(f => state.expanded.add("f" + f.id));
    await loadTree(); state.sel = {kind: "", id: null}; await select(kind, r.id);
    toast(`${r.id} added in ${target || "Variables (top level)"}`);
  } catch (e) {
    toast(e.message, true); titleCheck();
  }
}

/* ------------------------------------------------------------ copy */
/* Copy button, added next to Move (no change needed in index.html) */
(() => {
  return;                                   // Copy button removed: copy = change the name in the title + Save
  if ($("#tbCopy") || !$("#tbMove")) return;
  const b = document.createElement("button");
  b.className = "tb"; b.id = "tbCopy"; b.disabled = true;
  b.innerHTML = `<svg viewBox="0 0 32 32"><rect x="10" y="10" width="17" height="19" rx="2"/><path d="M6 23V5a2 2 0 0 1 2-2h13"/></svg><span>Copy</span>`;
  $("#tbMove").after(b);
})();

/* every name in the tree (upper case), to warn about names that already exist */
function allNames() {
  const out = new Set();
  (function walk(fams) { for (const f of fams) { out.add(f.name.toUpperCase()); f.variables.forEach(v => out.add(v.name.toUpperCase())); walk(f.families); } })(state.tree.families);
  state.tree.variables.forEach(v => out.add(v.name.toUpperCase()));
  return out;
}
/* everything inside a family, in tree order: [{id, kind, depth}] */
function insideOf(id) {
  const path = findFamilyPath(state.tree.families, f => f.id === id);
  const out = [];
  if (!path) return out;
  (function walk(f, depth) {
    f.families.forEach(c => { out.push({id: c.id, kind: "family", depth}); walk(c, depth + 1); });
    f.variables.forEach(v => out.push({id: v.id, kind: "variable", depth}));
  })(path[path.length - 1], 1);
  return out;
}
/* new name of a row inside the copied family: replace text (upper/lower case ignored), or add _COPY */
function renamed(old, find, repl) {
  if (find && old.toLowerCase().includes(find.toLowerCase())) {
    return old.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), repl);
  }
  return old + "_COPY";
}

async function copyDialog() {
  if ($("#tbCopy").disabled) return;
  if (!(await confirmLeave())) return;
  const {kind, id} = state.sel;
  const here = parentOf(kind, id);
  const inside = kind === "family" ? insideOf(id) : [];
  const blocked = kind === "family" ? familyAndBelow(id) : new Set();
  let suggested = id + "_COPY";
  try { suggested = (await api(`/api/next-name?base=${encodeURIComponent(id + "_COPY")}`)).name; } catch {}
  const famOptions = [{id: "", name: "— Variables (top level, no family) —", depth: 0}, ...flatFamilies()]
    .filter(f => !blocked.has(f.id))
    .map(f => `<option value="${esc(f.id)}"${f.id === here ? " selected" : ""}>${"\u00a0\u00a0".repeat(f.depth)}${esc(f.name)}</option>`).join("");
  const nFam = inside.filter(x => x.kind === "family").length, nVar = inside.length - nFam;

  let body = mGrid(
    mrow(kind === "family" ? "Copy of family" : "Copy of variable", `<div class="mro">${esc(id)}</div>`) +
    mrow("New name", `<input id="mName" value="${esc(suggested)}"${kind === "family" ? mlName() : ml("name")}>`) +
    mrow("Into family", `<select id="mFam">${famOptions}</select>`) +
    (inside.length ? mrow("Content", `<label style="display:flex;align-items:center;gap:8px;margin:0;font-size:12px;color:var(--text)">
        <input type="checkbox" id="mDeep" checked style="width:auto;height:auto;margin:0">
        Also copy what's inside (${nFam} famil${nFam === 1 ? "y" : "ies"}, ${nVar} variable${nVar === 1 ? "" : "s"})</label>`) +
      mrow("Rename inside: replace", `<input id="mFind" value="${esc(id)}">`) +
      mrow("with", `<input id="mRepl" value="${esc(suggested)}">`) : ""));
  if (inside.length) body += `<div id="mPrevWrap" style="margin-top:10px">
      <div style="font-size:12px;color:var(--label);margin-bottom:4px">New names</div>
      <div class="pick-list" id="mPrev" style="max-height:200px"></div></div>`;

  let plan = null;            // {names: {old: new}, conflicts}
  modal({title: kind === "family" ? "Copy family" : "Copy variable", okText: "Copy",
    body,
    onOk: async () => {
      compute();
      if (plan.conflicts) throw new Error(`${plan.conflicts} name(s) already exist or are repeated – change the names first.`);
      const r = await api("/api/copy", {method: "POST", body: {kind, id, target: $("#mFam").value, names: plan.names}});
      const fam = $("#mFam").value;
      if (fam) (findFamilyPath(state.tree.families, f => f.id === fam) || []).forEach(f => state.expanded.add("f" + f.id));
      state.expanded.add("root"); setDirty(false);
      await loadTree(); state.sel = {kind: "", id: null}; await select(kind, r.id);
      toast(`${r.id} created${r.created > 1 ? ` with ${r.created - 1} item(s) inside` : ""}`);
    }});

  const existing = allNames();
  let replTouched = false;
  function compute() {
    const newName = $("#mName").value.trim();
    const deep = inside.length && $("#mDeep").checked;
    const names = {[id]: newName};
    const list = [{id, kind, depth: 0, nn: newName}];
    if (deep) {
      const find = $("#mFind").value.trim(), repl = $("#mRepl").value.trim();
      inside.forEach(x => { const nn = renamed(x.id, find, repl); names[x.id] = nn; list.push({...x, nn}); });
    }
    const seen = new Map();
    list.forEach(x => seen.set(x.nn.toUpperCase(), (seen.get(x.nn.toUpperCase()) || 0) + 1));
    let conflicts = 0;
    list.forEach(x => {
      x.bad = !x.nn ? "empty" : existing.has(x.nn.toUpperCase()) ? "exists" : seen.get(x.nn.toUpperCase()) > 1 ? "repeated" : "";
      if (x.bad) conflicts++;
    });
    plan = {names, conflicts, list, deep};
    return plan;
  }
  function draw() {
    const p = compute();
    if ($("#mPrevWrap")) {
      $("#mPrevWrap").hidden = !p.deep;
      $("#mFind").disabled = $("#mRepl").disabled = !p.deep;
      $("#mPrev").innerHTML = p.list.map(x => `<div style="padding-left:${10 + x.depth * 14}px;cursor:default;${x.bad ? "color:var(--danger)" : ""}">
          <span class="ico" style="margin:0">${x.kind === "family" ? ICONS.family : (iconFor(findVar(x.id) || {}) )}</span>
          <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.nn || "(empty)")}</span>
          <i>${x.bad ? "– " + x.bad : (x.depth ? "← " + esc(x.id) : "")}</i></div>`).join("");
    }
    const n = p.list.length;
    $("#modalErr").innerHTML = p.conflicts
      ? `${p.conflicts} name${p.conflicts === 1 ? "" : "s"} already exist${p.conflicts === 1 ? "s" : ""} or ${p.conflicts === 1 ? "is" : "are"} repeated`
      : `<span style="color:var(--muted)">${n} row${n === 1 ? "" : "s"} will be created</span>`;
  }
  $("#mName").addEventListener("input", () => { if (!replTouched && $("#mRepl")) $("#mRepl").value = $("#mName").value; draw(); });
  if (inside.length) {
    $("#mRepl").addEventListener("input", () => { replTouched = true; draw(); });
    $("#mFind").addEventListener("input", draw);
    $("#mDeep").addEventListener("change", draw);
  }
  draw();
  $("#mName").focus(); $("#mName").select();
}
/* the variable object in the tree (for its icon) */
function findVar(id) {
  let hit = state.tree.variables.find(v => v.id === id);
  (function walk(fams) { for (const f of fams) { if (hit) return; hit = f.variables.find(v => v.id === id); walk(f.families); } })(state.tree.families);
  return hit;
}

/* ------------------------------------------------------------ events */
$("#tree").addEventListener("click", e => {
  const r = e.target.closest(".row"); if (!r) return;
  const kind = r.dataset.kind, id = r.dataset.id || null;
  if (e.target.closest(".chev")) return toggle(kind, id);
  select(kind, id);
});
$("#tree").addEventListener("dblclick", e => {
  const r = e.target.closest(".row"); if (!r || r.dataset.kind === "variable") return;
  toggle(r.dataset.kind, r.dataset.id || null);
});
$("#tree").addEventListener("keydown", e => {
  const rows = [...document.querySelectorAll("#tree .row")];
  const i = rows.findIndex(r => r.classList.contains("sel"));
  const go = r => r && select(r.dataset.kind, r.dataset.id || null);
  const cur = rows[i]; if (!cur) return;
  const kind = cur.dataset.kind, id = cur.dataset.id || null, key = kind === "root" ? "root" : "f" + id;
  if (e.key === "ArrowDown") { e.preventDefault(); go(rows[i + 1]); }
  else if (e.key === "ArrowUp") { e.preventDefault(); go(rows[i - 1]); }
  else if (e.key === "ArrowRight" && kind !== "variable" && !state.expanded.has(key)) toggle(kind, id);
  else if (e.key === "ArrowLeft" && state.expanded.has(key)) toggle(kind, id);
  else if (e.key === "F2") rename();
  else if (e.key === "Delete") del();
});

$("#detail").addEventListener("click", e => {
  const s = e.target.closest(".section");
  if (s && s.dataset.sec === "vs") { state.sections.vs = state.sections.vs === false; renderValueSets(); return; }
  if (s) { syncDraft(); state.sections[s.dataset.sec] = !state.sections[s.dataset.sec]; renderDetail(); return; }
  if (e.target.id === "btnPick") pickValue();
});
$("#detail").addEventListener("input", e => {
  if (e.target.dataset.f) { setDirty(true); titleCheck(); }
  if (e.target.id === "titleName") titleCheck();
});
$("#detail").addEventListener("keydown", e => {
  if (e.target.id !== "titleName") return;
  if (e.key === "Enter") { e.preventDefault(); save(); }
  if (e.key === "Escape") { e.target.value = state.sel.id; titleCheck(); }
});
$("#detail").addEventListener("focusin", e => { const p = e.target.closest(".prop"); if (p) p.classList.add("focus"); });
$("#detail").addEventListener("focusout", e => { const p = e.target.closest(".prop"); if (p) p.classList.remove("focus"); });

$("#tbSave").onclick = save;
$("#tbNewVar").onclick = newVariable;
$("#tbNewFam").onclick = newFamily;
$("#tbRename").onclick = rename;
$("#tbMove").onclick = moveDialog;
if ($("#tbCopy")) $("#tbCopy").onclick = copyDialog;
$("#tbDelete").onclick = del;
$("#tbFeedback").onclick = feedback;

$("#btnSearch").onclick = () => {
  const b = $("#searchBox"); b.hidden = !b.hidden;
  if (b.hidden) { b.value = ""; state.filter = ""; renderTree(); } else b.focus();
};
$("#searchBox").addEventListener("input", e => { state.filter = e.target.value.trim().toLowerCase(); renderTree(); });
$("#btnRefresh").onclick = async () => {
  if ($("#btnRefresh").classList.contains("busy")) return;
  if (!(await confirmLeave())) return; setDirty(false);
  $("#btnRefresh").classList.add("busy");
  try { state.meta = await api("/api/meta?refresh=1"); } catch {}
  VS.fid = null; VS.catalog = {};
  const ok = await loadTree(true);
  $("#btnRefresh").classList.remove("busy");
  if (!ok) return;
  if (state.sel.kind !== "root") await loadDetail().catch(() => { state.sel = {kind: "root", id: null}; state.detail = null; renderDetail(); renderTree(); });
  toast("Refreshed");
};

document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
});
window.addEventListener("beforeunload", e => { if (state.dirty) { e.preventDefault(); e.returnValue = ""; } });

/* ------------------------------------------------------------ databases */
function setDbLabel() {
  const m = state.meta, i = state.treeInfo;
  $("#dbLabel").textContent = `${m.database} · ${m.table}${m.read_only ? " · read-only" : ""}`;
  $("#dbLabel").title = i
    ? (i.cached ? `In memory – read from SQL Server ${Math.round(i.age_s / 60)} min ago (press Refresh to read again)`
                : `Read from SQL Server in ${(i.took_ms / 1000).toFixed(1)} s (SQL ${(i.sql_ms / 1000).toFixed(1)} s)`)
    : "";
  $("#dbLabel").classList.toggle("warn", !m.read_only && m.database !== m.default_database);
}

async function loadDatabases() {
  const sel = $("#dbSelect");
  try {
    const r = await api("/api/databases");
    if (!currentDb || !r.databases.some(d => d.name === currentDb && d.has_table)) currentDb = r.default;
    sel.innerHTML = r.databases.map(d =>
      `<option value="${esc(d.name)}"${d.has_table ? "" : " disabled"}${d.name === currentDb ? " selected" : ""}>` +
      `${esc(d.name)}${d.has_table ? (d.ready ? "  ⚡" : "") : "  (no IMOS table)"}</option>`).join("");
    return r;
  } catch (e) {
    sel.innerHTML = `<option>${esc(currentDb || "default database")}</option>`;
    sel.disabled = true;
  }
}

let prefetchStarted = false;
async function startPrefetch() {
  if (prefetchStarted) return;
  prefetchStarted = true;
  try { await api("/api/prefetch", {method: "POST"}); } catch { return; }
  // update the ⚡ marks in the database list while the other databases are being loaded
  const poll = setInterval(async () => {
    try { const r = await loadDatabases(); if (!r || !r.prefetching) clearInterval(poll); }
    catch { clearInterval(poll); }
  }, 10000);
}

async function openDatabase() {
  try {
    state.meta = await api("/api/meta");
  } catch (e) {
    state.tree = {families: [], variables: []};
    $("#tree").innerHTML = `<div class="db-err">Can't open ${esc(currentDb)}.<br>${esc(e.message)}</div>`;
    updateToolbar(); renderDetail();
    return;
  }
  state.treeInfo = null;
  setDbLabel();
  updateToolbar();
  if (await loadTree()) startPrefetch();
}

$("#dbSelect").addEventListener("change", async e => {
  const next = e.target.value;
  if (!(await confirmLeave())) { e.target.value = currentDb; return; }
  currentDb = next; VS.fid = null; VS.catalog = {};
  try { localStorage.setItem("imos_db", next); } catch {}
  setDirty(false);
  state.sel = {kind: "root", id: null}; state.detail = null;
  state.expanded = new Set(["root"]); state.filter = "";
  $("#searchBox").value = ""; $("#searchBox").hidden = true;
  renderDetail();
  showLoading(next);
  await openDatabase();
  toast(`Opened ${next}`);
});

/* ------------------------------------------------------------ resizable tree */
(() => {
  const left = $(".left"), bar = $("#splitter");
  const clamp = w => Math.max(240, Math.min(w, window.innerWidth * 0.85));
  const apply = w => { left.style.width = clamp(w) + "px"; };
  const store = w => { try { localStorage.setItem("imos_tree_width", String(Math.round(w))); } catch {} };
  try { const w = +localStorage.getItem("imos_tree_width"); if (w) apply(w); } catch {}

  bar.addEventListener("pointerdown", e => {
    e.preventDefault();
    bar.setPointerCapture(e.pointerId);
    bar.classList.add("active"); document.body.classList.add("resizing");
    const startX = e.clientX, startW = left.getBoundingClientRect().width;
    const moveH = ev => apply(startW + ev.clientX - startX);
    const upH = () => {
      bar.removeEventListener("pointermove", moveH); bar.removeEventListener("pointerup", upH);
      bar.classList.remove("active"); document.body.classList.remove("resizing");
      store(left.getBoundingClientRect().width);
    };
    bar.addEventListener("pointermove", moveH); bar.addEventListener("pointerup", upH);
  });
  bar.addEventListener("dblclick", () => {
    left.style.width = ""; try { localStorage.removeItem("imos_tree_width"); } catch {}
  });
  bar.addEventListener("keydown", e => {                      // keyboard: arrows, Shift = bigger steps
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const step = (e.shiftKey ? 60 : 20) * (e.key === "ArrowLeft" ? -1 : 1);
    apply(left.getBoundingClientRect().width + step); store(left.getBoundingClientRect().width);
  });
  window.addEventListener("resize", () => { if (left.style.width) apply(parseFloat(left.style.width)); });
})();

/* ------------------------------------------------------------ init */
(async () => {
  await loadDatabases();
  await openDatabase();
})();