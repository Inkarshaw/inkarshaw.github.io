# CDR Analyzer vendored libraries

Pinned local copies used by /cdranalysis/ so CDR parsing, charts and map UI do not require third-party JavaScript execution.

- SheetJS CE 0.18.5 — Apache-2.0 — source: SheetJS/sheetjs dist/xlsx.full.min.js
- Chart.js 4.4.7 — MIT — source distribution copied from a vendored jsDelivr 4.4.7 UMD build
- Leaflet 1.9.4 — BSD-2-Clause — source distribution
- Leaflet.heat 0.2.0 — MIT

OpenStreetMap map tiles are still requested from tile.openstreetmap.org when the map is used; the JavaScript/CSS libraries themselves are local.
