# MAREG — Multi-Regime Maritime Compliance & Digital Twin Platform (English Documentation)

> **Current website / 当前网页：v4.5.1** · [Release notes / 更新说明](https://github.com/wwwwzzzzkkkk/Maritime-project/releases/tag/v4.5.1) · [Project plans / 项目计划](docs/PROJECT_PLANNING.md) · [Course map / 课程映射](docs/COURSE_MAPPING.md)

> **v4.5.1 · MAREG 助手 / Assistant:** 后端加入项目知识与简短回答规范；AI 入口前置，设置、来源及使用帮助按需展开。回答按段落／步骤显示，去除裸露 Markdown、HTML 和引用代码，保留来源及金额单位。
> Versioned project knowledge and concise response rules; a question-first AI panel with expandable settings, references and help. Safe paragraph/list display hides raw formatting while keeping citations and units. [知识说明 / Knowledge](docs/AI_KNOWLEDGE.md) · [验收 / Evidence](docs/verification/v4.5.1/README.md)

> **v4.5.0 · 课堂云端 AI / Classroom cloud AI:** DeepSeek 云端后端已配置；在“帮助与说明”检查连接、输入私下提供的课堂访问码并同意后提问。教室电脑不依赖 Mac 开机，API 密钥不进入网页。
> Cloud-hosted DeepSeek: check the prefilled connection in Help & About, enter the privately shared classroom code and consent. No Mac is needed; API keys remain server-side. [使用与维护 / Setup](docs/AI_SETUP.md) · [验收 / Evidence](docs/verification/v4.5.0/README.md)

> **v4.4.1:** “航次、燃料与组池数字孪生推演”及内部控件取消指针倾斜；保留玻璃、高光、其他卡片动效与计算。
> Keep the voyage/fuel/pooling controls flat while preserving glass, highlights, other card motion and calculations.

> **v4.4.0 · 分析工作流 / Analysis workflow:** 本机保存恢复、可恢复工作区、可打印决策报告；统一 CSV 台账与初步适用检查；具名规划情景、可配置本机 AI 接口（默认未连接）。原玻璃风格、五项快速输入和基准金额保留。
> Local save/restore, printable reports, unified CSV ledger screening, named planning cases and configurable local AI integration (disconnected by default). Original glass design, five quick inputs and benchmarks remain. [操作说明 / Workflow guide](docs/WORKFLOWS.md) · [AI 配置 / AI setup](docs/AI_SETUP.md)

> **v4.3.1 · 输入体验简化 / Simpler inputs:** 默认五个快速数值输入；等效吨与 MJ 双向换算，高级假设分组折叠，保留原字段。支持假设标签定位、四个演示预设、行内提示及统一确认；演示确认不代表真实核验。默认玻璃风格、计算引擎与基准金额不变。
> Five quick numeric inputs with equivalent-tonne/MJ conversion, grouped advanced assumptions, linked assumption tags, four demo presets, inline errors and consolidated confirmation. Demo confirmation is not verification. Glass styling, engine and benchmark amounts are unchanged. [更新说明 / Release notes](docs/releases/v4.3.1.md)

> **v4.3.0 · 可读性 / Readability:** 小字与文字对比度提升，保留默认玻璃、光斑、折射和展示卡倾斜；表格/来源正文内局部归零，标题仍可倾斜。
> Larger/more legible text with the existing glass design. Tilt settles only inside reading regions, remains on titles/display cards, and respects reduced motion. [验收材料 / Evidence](docs/verification/v4.3.0/README.md)


> **v4.2.1 · 首屏与演示修正 / Presentation and demo fixes:** 比较表独占整行，默认五列、可展开全部列；地图按航线适配并使用本地 50m 国家轮廓；变化环按 ±30% 满环并明确最小弧长；公式明细默认展开、外部链接新窗口打开。计算引擎输出与基准金额不变。
>
> Full-width five-column comparison with expandable detail; route-fitted map with local 50m country outlines; signed ±30% change rings with a disclosed minimum non-zero arc; open calculation trace and separate-tab external links. Calculation-engine outputs and benchmark amounts are unchanged.



> **v4.2.0:** “方案比较”新增可编辑能源/强度、价格、航时与供给限制，六类方案及有条件的最低成本候选；双方金额明确包含营运增量。电脑与手机均支持可拖动玻璃预算浮窗。预算仍为声明范围内的示例估算，非完整航次成本或法定核验。
>
> Compare six option families using editable energy/intensity, prices, time and supply limits. Conditional candidates and party amounts include operating deltas. The draggable glass budget now works on desktop and mobile. Results remain scoped demo estimates, not full-voyage costs or statutory verification.


[Bilingual main documentation](README.md) · [中文文档](README.zh-CN.md)

**🌐 Live website:** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)

**New users:** [Quick-start guide (bilingual, with formulas and sources)](docs/QUICK_START.md#english-quick-start)

## 1. Overview and editions

**MAREG (`Maritime-project`)** is an interactive teaching prototype for the NTU MSc Maritime Studies **MT6503 Group Venture Project, Track B: Compliance & RegTech**. It explores multi-regime budgets, voyage scenarios, reimbursement and venture risk for a proposed customer segment of owners/managers operating **5–20 ships**. Demand and willingness to pay remain hypotheses requiring validation.

| Entry point | Purpose and current status |
| --- | --- |
| [`index.html`](index.html) | Default light edition. Customer-oriented modules with the original glass and motion design. Quick controls remain flat; mobile retains the draggable live budget window. |
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

Open [http://127.0.0.1:48173/](http://127.0.0.1:48173/). The default page uses ES modules and must be served over HTTP rather than opened by double-clicking the file. No build step or backend is required for the calculator; AI uses a separate hosted service or an explicitly configured local backend. Leaflet 1.9.4 is vendored locally; Esri tiles and the original Google Fonts require network access; country outlines are now stored in the repository.

## 3. Five functional modules

| Module | Capability and evidence boundary |
| --- | --- |
| Budget Overview | Active vessel, separate regime budgets, illustrative geography and activity ledger. Coverage is preset teaching input, not automatic real-world legal-scope determination. |
| Compare Options | Compare baseline, current, speed, fuel, pooling and combined search with time/auxiliary costs, constraints, candidate status and party allocations. |
| Calculation Basis | Trace current-vessel calculations and compare financial changes with in-scope WtW model changes; savings are not automatically physical reductions. |
| Future Scenarios | Three possible regulatory paths and customer review steps; no automatic change to regional budgets or hypothetical global charges. |
| Help & About | MAREG Assistant first; expandable quick-start, preset FAQs, product scope and guide. Course and business plans remain in repository documents. |

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

FAQs remain templates. Local CSV import and a cloud DeepSeek backend are implemented; connect manually, enter the classroom code and consent before asking. Live RAG, customer-account backend, expert approval and automated filing are not provided. Snapshots are not authorized source ledgers, human approvals or assurance. [Methods and official references](docs/LIGHT_EDITION.md)

## 6. Minimal checks and rollback

v4.0 used nine core calculation regressions and one bounded page smoke check. v4.1.0 checked content/layout. v4.2.0 passed the existing nine plus five targeted calculation/constraint checks and one focused desktop/mobile interaction check.

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
