# MAREG — Multi-Regime Maritime Compliance & Digital Twin Platform (English Documentation)

[Bilingual main documentation](README.md) · [中文文档](README.zh-CN.md)

**🌐 Live website:** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)

## 1. Overview and editions

**MAREG (`Maritime-project`)** is an interactive teaching prototype for the NTU MSc Maritime Studies **MT6503 Group Venture Project, Track B: Compliance & RegTech**. It explores multi-regime budgets, voyage scenarios, reimbursement and venture risk for a proposed customer segment of owners/managers operating **5–20 ships**. Demand and willingness to pay remain hypotheses requiring validation.

| Entry point | Purpose and current status |
| --- | --- |
| [`index.html`](index.html) | Default light edition. Retains the original daylight glass, SVG refraction, pointer highlights, 3D card tilt, sliding navigation, panel transitions and chart replays. This update corrects calculations, content and responsive layout. |
| [`index-pro-max.html`](index-pro-max.html) | Preserved historical Pro Max workbench. Its calculations and interactions were not changed or re-audited in this update. |

The default page retains its bilingual base data while using the independent [`js/compliance-engine.mjs`](js/compliance-engine.mjs) and [`js/light-data.mjs`](js/light-data.mjs). The two editions should not be described as sharing the same newly verified calculation logic.

## 2. Live website and local setup

**Default light-edition URL:** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)

**Historical Pro Max URL:** [https://wwwwzzzzkkkk.github.io/Maritime-project/index-pro-max.html](https://wwwwzzzzkkkk.github.io/Maritime-project/index-pro-max.html)

Use the live URLs without installing anything. GitHub Pages deploys `main` automatically; see [Actions](https://github.com/wwwwzzzzkkkk/Maritime-project/actions) for publication progress after a merge or push.

For local use, start a static server in the repository:

```sh
python3 -m http.server 48173 --bind 127.0.0.1
```

Open [http://127.0.0.1:48173/](http://127.0.0.1:48173/). The default page uses ES modules and must be served over HTTP rather than opened by double-clicking the file. No build step or backend is required. Leaflet 1.9.4 is vendored locally; Esri tiles, geographic shading and the original Google Fonts still require network access.

## 3. Five functional modules

| Module | Capability and evidence boundary |
| --- | --- |
| Overview and route | Active vessel, separate regime budgets, illustrative geography and activity ledger. Coverage is preset teaching input, not automatic real-world legal-scope determination. |
| Twin and charter | Compare an unmodified baseline, the active mix and supply-limited pooling. EUA prices, speed, fuel and reimbursement are conditional inputs. |
| Formula audit and anti-greenwashing | Trace current-vessel calculations and compare financial changes with in-scope WtW model changes; savings are not automatically physical reductions. |
| IMO scenarios | Venture stress tests for adoption as agreed, adoption with amendments and continued deadlock. Scenario selection does not silently alter regional targets or EUA prices. |
| Explanations and business model | Current-result explanation templates, official references, A1 customer value, A2 risks, market hypotheses, human workload and platform-ESG measurement plans. |

The `中 / EN` control switches languages. Existing visual materials and effects are retained; header wrapping, stacked mobile metrics and local table scrolling address clipping. A working JSON snapshot records current inputs, sources, assumptions and outputs.

## 4. A3 benchmarks and calculation fixes

These are fixed teaching inputs for `MV A3-BENCHMARK`, without external verification. They are not complete real-vessel bills.

| Example | Inputs and results |
| --- | --- |
| EU ETS CO₂ subtotal | `(1,000 × 50% + 500 + 100) × €80 = €88,000`; EUA sensitivity at €60 / €100 gives €66,000 / €110,000. |
| UK ETS CO₂ subtotal | `(200 + 20) × £60 = £13,200`; the UK example covers July–December 2026 and remains in GBP. |
| FuelEU 2% condition | 164,000,000 MJ, actual intensity 91.6 gCO₂e/MJ and target 89.3368 yield −371.1648 tCO₂e and a €237,191.27 single-period base amount. |
| FuelEU 6% condition | Holding other inputs fixed, target 85.6904 yields −969.1744 tCO₂e and €619,346.72. This is not a forecast of an actual 2030 bill. |

The update fixes penalties on positive balances, inconsistent baseline prices/totals, hard-coded pooling deficits and audit rows that failed to follow the active vessel. Pooling uses only the deficit and assumed available supply; insufficient supply leaves a residual penalty.

EU/UK ETS currently calculate **CO₂ subtotals only**. Missing CH₄/N₂O is not zero, and complete ETS totals are unavailable. FuelEU energy and ETS activity inputs are independently specified and have not been reconciled to one actual fuel ledger.

## 5. Assumptions, business model and coursework

- Speed uses a fixed-distance approximation, without a verified JIT arrival window. Fuel energy-share reduction coefficients 0.26 / 0.32 are teaching assumptions, not universal certified-fuel factors.
- FuelEU surplus prices and availability are commercial scenarios, not secured resources. The retained UI demonstrates a single-period base amount; full flexibility mechanisms, certification and deficit history need actual evidence.
- GENCON, NYPE and 50:50 controls are **illustrative allocations**. The 85/15, 18/82 and 50/50 splits are not standard-charter or BIMCO legal defaults.
- Customer value benchmark: `120h × €40 + €2,000 − €4,800 − €600 = €1,400` year-one net benefit. Time may not become cash and adviser work must not be double-counted. Without adviser savings, year one is −€600.
- Illustrative scenario operating results are −€30,000 / −€5,000 / −€4,000, with break-even at 70 / 67 / 57 full-year equivalent clients; these do not guarantee survival.
- Twelve interviews, three paid pilots, platform ESG and human-workload metrics are **validation plans**, not completed results. Coursework mapping uses the available cached Brief; current course notices still need confirmation.

Explanations are templates. No live AI/RAG, expert-approval service, real-data import, backend or automated filing is implemented. Snapshots are not authorized source ledgers, human approvals or assurance. [Methods and official references](docs/LIGHT_EDITION.md)

## 6. Minimal checks and rollback

The delivery used nine core calculation regressions and one bounded page smoke check, without expanding to a broad audit.

```sh
npm ci
npm test
# Keep the local server running; use an installed macOS Chrome:
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:browser
```

Alternatively install Playwright Chromium and omit `CHROME_PATH`. Outputs go to Git-ignored `test-results/`.

- [Original v3.4 baseline](https://github.com/wwwwzzzzkkkk/Maritime-project/tree/light-v3.4-baseline-2026-10-15)
- [v4.0 code checkpoint retaining the original UI](https://github.com/wwwwzzzzkkkk/Maritime-project/tree/light-v4.0-original-ui-2026-10-15)
- [Rollback instructions](docs/ROLLBACK.md) · [Change log](CHANGELOG.md) · [Verification and screenshots](docs/QA.md)

Merge history and tags preserve previous versions. Use a recovery commit or revert PR instead of rewriting published history. The fixed live URL shows the current deployment from `main`.

## Repository structure / 项目结构

```text
Maritime-project/
├── index.html                 # Default light UI / 默认浅色版
├── index-pro-max.html         # Historical other edition / 另一历史版本
├── styles/
│   ├── tokens.css             # Original light palette and materials
│   ├── main.css               # Original effects + appended layout fixes
│   └── pro-max.css            # Other edition, unchanged
├── js/
│   ├── app.js                 # Original UI interactions + corrected calculations
│   ├── compliance-engine.mjs  # Deterministic light-edition engine
│   ├── light-data.mjs         # Teaching inputs and official references
│   ├── data-and-i18n.js       # Preserved bilingual base data
│   └── app-pro-max.js         # Other edition, unchanged
├── vendor/leaflet/            # Pinned Leaflet and license
├── tests/                     # Core regressions and bounded smoke check
├── docs/                      # Methods, verification and rollback
├── CHANGELOG.md
├── README.md                  # Complete bilingual documentation
├── README.zh-CN.md            # Standalone Chinese documentation
└── README.en.md               # Standalone English documentation
```
