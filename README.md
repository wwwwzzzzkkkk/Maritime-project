# MAREG — maritime compliance teaching prototype

默认浅色版保留原有 UI 与动态效果，仅调整排版并修复计算与证据表达。
The light edition retains the original glass UI and motion design, with layout, calculation and content corrections.

## This update

- Preserve original colors, fonts, glass materials, 3D tilt, sliding navigation pill, panel transitions and chart replay effects.
- Correct surplus penalties, baseline totals, supply-limited pooling and IMO/regional scenario separation.
- Clearly label demo data, CO₂-only ETS subtotals, teaching assumptions and unverified capabilities.
- Update active-vessel formula rows, official source links and current-state explanations/snapshots.
- Keep EUR/GBP separate. Charter splits remain illustrative, not contract defaults.
- Add market, human-workload and platform-ESG evidence plans using the original card/table styles.
- Wrap the desktop header and stack mobile KPI cards without replacing the visual design.

## Run

```sh
python3 -m http.server 48173 --bind 127.0.0.1
```

Open `http://127.0.0.1:48173/`. HTTP is required for ES modules; there is no build step. Leaflet is pinned locally; map tiles, geographic shading and original Google Fonts require network access.

## Minimal checks

```sh
npm ci
npm test
# With the local server running and a browser installed:
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:browser
```

The browser command is one bounded smoke check, not a broad audit. Outputs are ignored under `test-results/`. Alternatively install Playwright Chromium and omit `CHROME_PATH`.

[Model scope](docs/LIGHT_EDITION.md) · [Version / rollback](docs/ROLLBACK.md) · [Changes](CHANGELOG.md)

Changes live on `codex/light-audit-upgrade` until merged. GitHub Pages deploys `main`. The other edition and shared `js/data-and-i18n.js` remain unchanged.
