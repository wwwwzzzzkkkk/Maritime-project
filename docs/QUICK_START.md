# MAREG 使用文档：新手快速上手 / Beginner Quick Start

**运行网址 / Open the website:** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)

[中文操作](#中文快速上手) · [English instructions](#english-quick-start) · [公式与来源 / Formulas and sources](#附录--appendices) · [返回 README / Back to README](../README.md)

适用：默认浅色版 v4.1.0，2026-10-15 文档。无需安装或登录。正文介绍操作；附录按需展开。

For the default light edition v4.1.0, documented on 15 October 2026. No installation or login is needed. Follow the steps first; expand the appendices when you need the formulas.

## 中文快速上手

### 1. 打开网站，先用默认船舶

打开上方网址，点击右上角 `中 / EN` 选择语言。第一次使用，保持 **MV DEMO-01**，或点击 **重置基准**。

默认应看到：

| 首页卡片 | 默认数值 | 怎么理解 |
| --- | --- | --- |
| EU ETS | €88,000 | 欧盟制度的 CO₂ 部分预算。 |
| FuelEU | €237,191.27 | 当前简化条件下的罚款估算。 |
| UK ETS | £13,200 | 英国制度的 CO₂ 部分预算，英镑单列。 |
| 船东承担 | 约 €276,413 | 欧元合规费用的示例分摊，**不是新增费用**，不要再加进前面的账单。 |

这是演示示例。黄色“缺失 CH₄/N₂O”提示表示数据范围有限，不是你操作出错；当前没有完整 ETS 总额。

### 2. 一次改一个参数，看哪里发生变化

在 **预算总览** 左侧拖动滑块：

- **EUA 碳价**：改变 EU ETS 预算；不是实时市场报价。
- **航速调整**：尝试较低航速，观察成本和排放模型变化；不代表已验证的准时到港方案。
- **示例低碳燃料能源占比**：观察燃料情景，留意认证、供给与价格尚未核实的提示。
- **FuelEU 目标条件**：比较 2025–2029 的 2% 与 2030 的 6% 目标；其他活动量与价格保持当前输入，不是实际未来账单预测。

地图可缩放、拖动和点击港口。航段按钮可筛选下方台账；筛选不会改变整船示例预算。手机导航显示“总览 / 方案 / 依据 / 未来 / 帮助”五个短名称，切换后直接定位到对应内容；费用卡只在总览显示，宽表格可横向滑动。

手机上，原费用卡滚出视野或切换到其他模块时，会自动出现**实时预算浮窗**，随参数同步更新。拖动浮窗标题可移动位置；点“收起 / 展开”调整占用空间，点“归位”恢复默认位置。回到原费用卡区域，浮窗自动隐藏。欧元和英镑仍分开显示。

### 3. 到“方案比较”比较方案

这里比较 **未调整基准、当前组合、假设组池** 三行。先看“总净支出”，再看费用构成。它只包含表内项目，不是完整航次总成本；UK 英镑费用另外查看。

拖动 **组池** 滑块，可申请用假设盈余补缺口。申请量不一定等于实际分配量：系统最多使用本船缺口和假设供给内的数量。供给不足时仍有罚款。

GENCON、NYPE、50:50 按钮用于选择**示例分摊比例**，不是标准合同默认条款。换一种分摊会改变谁承担费用，不会改变该船总排放。

### 4. 到“计算依据”看原因

展开“输入、公式与结果”，查看当前船舶的计算明细。官方来源在同页下方按需展开。双环中心数字中，**负百分比表示相对基准下降，0 表示未变，正值表示上升**；圆弧是示意动效，以中心读数为准。

基准使用**同一船舶、同一价格、同一目标**，但不做航速、燃料或组池调整。所以只改碳价时，账单会变，而方案相对基准的变化百分比仍可能为 0。

费用下降不等于实际减排。特别是只使用组池时，财务结果可以改善，但本船 WtW 模型值不变。

### 5. 其他模块与保存结果

- **未来情景**：看三种监管路径下需要核对的事项。它不自动修改区域账单，不计算假设的全球收费，也不表示发生概率。
- **帮助与说明**：看操作步骤、预设常见问题及产品能力范围。解释跟随当前计算值，未连接 AI 服务。课程与商业验证材料已移到仓库文档。
- **当前计算快照 → 导出 JSON**：保存当前输入、假设、来源与结果；关掉弹窗可点 `✕` 或按 `Esc`。新手不必读 JSON，可留作核对或与团队讨论。

**刷新或“重置基准”会回到默认教学情景。** 如需保留当前结果，请先导出；当前没有重新导入快照自动恢复情景的功能。

### 三个小练习

每个练习开始前都先点 **重置基准**。

| 操作 | 应观察到什么 |
| --- | --- |
| 把 EUA 从 €80 调到 €100 | EU ETS 从 €88,000 变为 €110,000；这不代表物理排放增加。 |
| 在第二页把组池申请量调到 375 | 2% 基准缺口可被补足，FuelEU 罚款为 €0；实际分配约 371.1648 tCB，组池费用仍需计入，物理模型变化为 0。实际分配可在快照查看。 |
| 把 FuelEU 目标切到 2030 的 6% | 固定默认活动量和强度时，基础金额约 €619,346.72；它是目标条件比较。 |

地图没有加载时，先检查网络；数值和台账仍可查看。想了解一个数字怎么算，再展开下面附录即可。

## English quick start

### 1. Open the site and start with the default vessel

Open the link above and use `中 / EN` to select a language. For your first session, keep **MV DEMO-01**, or click **Reset**.

| Overview card | Default value | Meaning |
| --- | --- | --- |
| EU ETS | €88,000 | CO₂ budget subtotal for the EU scheme. |
| FuelEU | €237,191.27 | Penalty estimate under the current simplified conditions. |
| UK ETS | £13,200 | UK CO₂ budget subtotal, kept in GBP. |
| Owner allocation | About €276,413 | An illustrative share of EUR compliance costs, **not an additional charge**. Do not add it to those costs again. |

These are demonstration examples. The yellow missing-CH₄/N₂O notice describes the data limitation, not an operating mistake. Complete ETS totals are unavailable.

### 2. Change one input at a time

Use the controls in **Budget Overview**:

- **EUA price** changes the EU ETS budget; it is not a live market quotation.
- **Speed change** explores lower-speed cost and emissions estimates; no verified JIT arrival plan is provided.
- **Illustrative fuel energy share** explores fuel scenarios; certification, supply and prices remain unverified.
- **FuelEU target condition** compares the 2% target for 2025–2029 with 6% for 2030, holding other current activity and price inputs fixed. It is not an actual future-bill forecast.

Zoom/pan the map or click ports. Activity buttons filter the ledger without changing the overall illustrative budget. On mobile, the short tabs Home / Compare / Basis / Future / Help open their content immediately. Budget cards appear in Home only; wide tables scroll horizontally.

On mobile, a **live budget window** appears when the original cards leave view or you open another module. Values update as you change inputs. Drag its title to move it, use Collapse / Expand to save space, or Reset to restore its position. It hides when the original cards return to view. EUR and GBP remain separate.

### 3. Compare options in “Compare Options”

Compare **Unmodified baseline**, **Active option** and **Assumed pooling option**. Read total net expenditure, then its components. It includes the listed items only, not the full voyage cost; inspect UK GBP costs separately.

The pooling slider requests surplus allocation. The actual allocation is capped by the ship's deficit and assumed available supply. Insufficient supply leaves a remaining penalty.

GENCON, NYPE and 50:50 buttons select **illustrative reimbursement splits**, not standard-contract defaults. Changing the split changes who pays, not the vessel's total emissions.

### 4. Inspect “Calculation Basis”

Expand the inputs/formulas/results disclosure to trace the active vessel's calculations. Official references are in a separate disclosure below. For the central gauge readings, **negative percentages mean a decrease from baseline, zero means unchanged, and positive means an increase**. Arcs are illustrative animation; read the central numbers.

The baseline uses the **same vessel, prices and target**, but no speed/fuel/pooling adjustment. A price-only change therefore changes the bill while the active-option percentage difference can remain zero.

Lower expenditure is not automatically physical decarbonisation. Pooling alone may improve costs while leaving the vessel's WtW model estimate unchanged.

### 5. Explore the other views and save

- **Future Scenarios** explains what to review under three possible regulatory paths. It does not change regional bills, calculate hypothetical global charges or assign probabilities.
- **Help & About** contains getting-started steps, preset FAQs and product scope. Explanations follow current calculations without an AI service. Course and venture plans are now in repository documents.
- **Current Snapshot → Export JSON** saves current inputs, assumptions, sources and outputs. Close with `✕` or `Esc`. Beginners need not read JSON; keep it for reference or discuss it with your team.

**Refreshing or selecting Reset returns to the default teaching scenario.** Export first if you need a record; automatic restoration by importing a snapshot is not implemented.

### Three short exercises

Select **Reset** before each exercise.

| Action | Expected observation |
| --- | --- |
| Change EUA from €80 to €100 | EU ETS changes from €88,000 to €110,000. This does not mean physical emissions increased. |
| Request 375 in the pooling slider | The default 2% deficit can be covered and FuelEU penalty becomes €0. Actual allocation is about 371.1648 tCB; pool fees still apply and physical-model change is zero. Inspect actual allocation in the snapshot. |
| Select the 2030 6% FuelEU target | With default activity and intensity held fixed, the base amount is about €619,346.72. This is a target-condition comparison. |

If the basemap does not load, check the network; calculations and the ledger remain available. Expand an appendix only when you want to trace a number.

## 附录 / Appendices

<details>
<summary><strong>附录 A：数据从哪里来、单位怎么看 / Appendix A: Inputs, origins and units</strong></summary>

### A1. 三类来源 / Three source types

| 类型 / Type | 本页采用值 / Values used | 来源及性质 / Origin and status |
| --- | --- | --- |
| 法规参数 / Rule parameters | FuelEU 91.16、2% / 6%、41,000、€2,400；示例 EU 范围 50% / 100% | 见附录 C 官方文件。实际适用范围及例外需按个案判断。 / Official documents in Appendix C; real scope and exceptions require case-specific review. |
| 教学输入 / Demo inputs | A3：E1/E2/E3 CO₂＝1,000/500/100 t；U1/U2＝200/20 t；E₀＝164,000,000 MJ；I₀＝91.6；v₀＝13.5 kn | 承接项目原有 A3 教学算例，保存于 [light-data.mjs](../js/light-data.mjs)。不是真实船舶监测或核验数据。 / Inherited project A3 teaching example, stored in the linked dataset; not real monitored/verified vessel data. |
| 价格假设 / Price assumptions | EUA €80；UKA £60；组池 €180/tCB；燃油 €550/t VLSFO-eq；燃料溢价 €260/t VLSFO-eq | 项目演示假设，非实时行情或法定收费。 / Project demonstration assumptions, not live quotations or statutory rates. |
| 模型假设 / Model assumptions | 航行 / 其余能源＝88% / 12%；燃料系数 0.26 / 0.32；假设可用盈余 400 tCB | 当前代码常量，不是官方通用系数或已取得供给。 / Current code constants, not universal official factors or secured supply. |
| 商业假设 / Business assumptions | 分摊 85/15、18/82、50/50；工时 €40/h；年费 €4,800；首次接入 €600；可取消顾问费 €2,000 | 项目规划输入，非标准合同默认条款或客户实测成果。 / Project planning inputs, not contractual defaults or measured customer outcomes. |

### A2. 四个常用单位 / Four useful units

- **t**：吨；1 t＝1,000,000 g。 / A tonne; 1 t = 1,000,000 g.
- **MJ**：兆焦，表示能源量。 / Megajoule, a unit of energy.
- **gCO₂e/MJ**：每单位能源的温室气体当量，即强度；WtW（Well-to-Wake）覆盖能源生产到船舶使用的生命周期。 / Greenhouse-gas equivalent per unit of energy; WtW covers the lifecycle from energy production to ship use.
- **tCB**：用 tCO₂e 表示的合规余额，不是本船实际排放或实际减排量。 / Compliance balance expressed in tCO₂e, not actual vessel emissions or reductions.

当前 ETS 示例只含 CO₂；缺失 CH₄/N₂O 没有被补零。FuelEU 能源与 ETS 台账独立给定，未完成物理对账。

The ETS examples contain CO₂ only; missing CH₄/N₂O is not filled with zero. FuelEU energy and ETS records are independently specified and not physically reconciled.

</details>

<details>
<summary><strong>附录 B：计算公式与小算例 / Appendix B: Formulas and worked examples</strong></summary>

实现对应 [计算引擎](../js/compliance-engine.mjs)；页面取值与显示对应 [app.js](../js/app.js)。公式使用未提前舍入的数值，部分卡片金额取整。

Implemented in the linked engine, with UI mapping/display in app.js. Calculations retain precision before display; some cards round amounts to whole units.

### B1. EU ETS 与 UK ETS / EU and UK ETS

```text
每段 CO₂ 小计 / Leg CO₂ subtotal = CO₂ tonnes × coverage × allowance price
EU EUR = (E1 × 50% + E2 × 100% + E3 × 100%) × EUA
UK GBP = (U1 + U2) × UKA
```

默认例 / Default: `(1,000×0.5 + 500 + 100)×€80 = €88,000`；`(200+20)×£60 = £13,200`。

来源：覆盖规则见 C1/C2；吨数与价格是 A1 的教学输入/假设。本页固定 2026 ETS 活动输入，UK 示例为 7–12 月；不是完整三气体账单。调整航速/燃料后先用 B3 更新吨数。

Sources: coverage in C1/C2; tonnes/prices are the A1 demo inputs/assumptions. ETS activities remain fixed to 2026, with July–December for the UK example; these are not complete three-gas bills. B3 adjusts tonnes when speed/fuel changes.

### B2. FuelEU、组池与罚款 / FuelEU, pooling and penalty

`E`＝范围内 MJ；`I`＝实际模型强度 gCO₂e/MJ；`CBg`＝以 gCO₂e 表示的余额。

`E` is in-scope MJ; `I` is modelled actual intensity in gCO₂e/MJ; `CBg` is the balance in gCO₂e.

```text
目标 / Target = 91.16 × (1 − target reduction)
CBg = (Target − I) × E
实际组池分配 / Allocated pool = min(requested, 400, max(−CBg, 0) / 1,000,000)
组池后余额 / Net CBg = CBg + allocated pool × 1,000,000
基础罚款 EUR / Base penalty = max(−Net CBg, 0) / (I × 41,000) × 2,400
组池费用 EUR / Pool fee = allocated pool × 180
```

正余额不计罚。400 tCB 是本项目假设供给上限，€180 是报价假设；真实组池还需满足参与、分配与核验条件。

A positive balance has no penalty. The 400 tCB cap and €180 price are project assumptions; real pooling also requires eligible participants, allocation and verification.

| 固定 A3 算例 / Fixed A3 example | 2% 目标 / 2% target | 6% 目标 / 6% target |
| --- | --- | --- |
| Target | 89.3368 | 85.6904 |
| CBg（无组池 / unpooled） | −371,164,800 g | −969,174,400 g |
| Base penalty | €237,191.27 | €619,346.72 |

来源：目标与基础罚款方法见 C3，组池见 C4。当前界面演示单期 `n=1`；连续罚款年可能有加成，不能把此金额视为任何历史下的最终罚款。41,000 用于 VLSFO 等效换算，不是所有燃料的通用热值。

Sources: targets/base penalty in C3, pooling in C4. The UI uses a single-period `n=1` example; repeated penalty years may escalate the amount. The 41,000 value is a VLSFO-equivalent conversion, not a universal heating value for every fuel.

### B3. 航速与燃料如何改变输入 / How speed and fuel change inputs

`b`＝燃料能源百分比÷100；`r`＝新航速÷基准航速；`F`＝能源调整比例。

`b` is fuel energy percentage divided by 100; `r` is new/base speed; `F` is the energy adjustment factor.

```text
r = (v₀ + speed change) / v₀
F = 0.88 × r² + 0.12
E = E₀ × F
I = I₀ × (1 − 0.32 × b)
航行 CO₂ / Sailing CO₂ = original CO₂ × r² × (1 − 0.26 × b)
港内 CO₂ / Port CO₂ = original CO₂ × (1 − 0.26 × b)
```

这是固定航程近似，港内 CO₂ 不随降速变化。88/12 和 0.26/0.32 来自项目模型假设，不是法规规定、燃料证书或已验证 JIT 效果。来源：计算引擎的 `ASSUMPTIONS` 与 `computeScenario()`。

This is a fixed-distance approximation; port CO₂ does not change with speed. The 88/12 and 0.26/0.32 coefficients are project assumptions, not legal requirements, fuel certificates or verified JIT savings. Source: `ASSUMPTIONS` and `computeScenario()` in the engine.

### B4. 方案总额与船东分摊 / Option totals and owner allocation

```text
Q₀ = E₀ / 41,000                       (t VLSFO-equivalent)
省油金额 / Fuel savings = Q₀ × (1 − F) × 550
燃料溢价 / Fuel premium = Q₀ × F × b × 260
欧元总净支出 / Total EUR = EU ETS + FuelEU penalty + pool fee + fuel premium − fuel savings
船东承担 / Owner = (EU ETS + FuelEU penalty + pool fee) × owner share
合同偿付方 / Reimbursing party = same compliance sum × (1 − owner share)
```

550、260 和分摊比例为项目假设。营运增量只按本模型的范围内能源估算；表内总额不包含完整基准燃油账单、全部航次成本、改造或延误成本。UK 英镑不参与欧元合计；船东分摊不包含营运增量或 UK 费用。来源：引擎 `computeScenario()` 和页面 `computeComplianceMetrics()`；合同参考见 C5。

The 550/260 prices and allocation shares are assumptions. Operating deltas use the model's in-scope energy; the table does not include the full baseline fuel bill, all voyage costs, retrofits or delay costs. UK GBP is excluded from EUR totals. Owner allocation excludes operating deltas and UK costs. Sources: engine `computeScenario()`, UI `computeComplianceMetrics()`; contractual reference in C5.

### B5. 双环百分比 / Gauge percentages

```text
范围内 WtW 估算 / In-scope WtW estimate (tCO₂e) = I × E / 1,000,000
变化 / Change (%) = (current − baseline) / baseline × 100
```

财务比较使用 B4 欧元总净支出；物理比较使用范围内 WtW 估算。基准保持同一船舶、碳价和 FuelEU 目标，取消航速、燃料与组池调整。组池不直接改变 `I` 或 `E`。圆弧只保留示意动效。来源：引擎 `compareOptions()`、页面 `renderApp()`。

Financial comparison uses the B4 EUR total; physical comparison uses the in-scope WtW estimate. The baseline keeps the same vessel, allowance prices and FuelEU target, with no speed/fuel/pooling adjustment. Pooling does not directly change `I` or `E`. Arcs remain illustrative animation. Sources: engine `compareOptions()` and UI `renderApp()`.

### B6. 客户收益与创业盈亏 / Customer value and venture economics

```text
年度总价值 / Gross annual value = hours saved × 40 + cancellable adviser fee
扣年费净益 / Recurring net = gross annual value − 4,800
首年净收益 / Year-one net = gross annual value − 4,800 − 600
经营结果 / Operating result = clients × contribution per client − fixed cost
经营平衡客户数 / Break-even clients = round up(fixed cost / contribution per client)
```

例 / Example: `120×40 + 2,000 − 4,800 − 600 = €1,400`；没有顾问费节省时 / without adviser savings: `120×40 − 4,800 − 600 = −€600`。

僵局情景例 / Deadlock example: `55×€3,200 − €180,000 = −€4,000`；`180,000/3,200` 向上取整 / rounded up = **57** 个全年等效客户 / full-year equivalent clients。

这些数值来自项目 A1/情景规划输入，保存在代码中；不是市场研究成果。额外内部成本、获客和投资回收需另计，工时估值未必成为现金。来源：页面 `computeComplianceMetrics()`、[情景数据](../js/light-data.mjs) 与原有双语数据中的 A1/A2 示例。

These values are project A1/scenario planning inputs stored in code, not market research findings. Additional internal costs, acquisition and investment recovery need separate treatment; time value may not become cash. Sources: UI `computeComplianceMetrics()`, linked scenario data and the original bilingual A1/A2 examples.

</details>

<details>
<summary><strong>附录 C：官方规则与实现来源 / Appendix C: Official and implementation sources</strong></summary>

规则来源核读日期 / Official-source review date: **2026-10-15**。本指南解释当前原型；实际使用仍需核对完整适用条件。 / This guide explains the current prototype; real use requires the complete applicable conditions.

| 编号 / ID | 用来说明什么 / Used for | 来源 / Source |
| --- | --- | --- |
| C1 | EU ETS 覆盖与气体范围 / EU ETS coverage and gases | [European Commission: shipping emissions and EU ETS](https://climate.ec.europa.eu/areas-action/transport-decarbonisation/reducing-emissions-shipping-sector_en) |
| C2 | UK 国内及港内海事适用范围 / UK domestic and in-port maritime scope | [GOV.UK: UK ETS for maritime — how to comply](https://www.gov.uk/guidance/uk-emissions-trading-scheme-for-maritime-how-to-comply) |
| C3 | FuelEU 目标、余额与罚款 / FuelEU targets, balance and penalty | [Regulation (EU) 2023/1805: Article 4, Article 23 and Annex IV](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1805) |
| C4 | 真实组池的要求 / Real pooling requirements | [European Commission FuelEU Q&A: Article 21](https://transport.ec.europa.eu/transport-modes/maritime/decarbonising-maritime-transport-fueleu-maritime/questions-and-answers-regulation-eu-20231805-use-renewable-and-low-carbon-fuels-maritime-transport_en) |
| C5 | 合同责任与偿付参考，不为固定比例背书 / Contractual responsibility and reimbursement; not a source for fixed percentages | [BIMCO ETS Allowances Clause for Time Charter Parties 2022](https://www.bimco.org/contractual-affairs/bimco-clauses/current-clauses/etsa_clause/) |
| Code | 输入、参数、完整实现 / Inputs, parameters and implementation | [light-data.mjs](../js/light-data.mjs) · [compliance-engine.mjs](../js/compliance-engine.mjs) · [app.js](../js/app.js) · [基础双语示例 / Original bilingual examples](../js/data-and-i18n.js) |

**来源区分：法规规定方法，项目提供示例输入与商业/技术假设；“数值由公式算出”不等于输入已经核实。**

**Keep the source types separate: rules provide methods; the project supplies demo inputs and business/technical assumptions. A formula-derived number does not mean its inputs were verified.**

</details>


项目团队资料 / For the project team: [课程映射 / Course map](COURSE_MAPPING.md) · [商业验证与治理计划 / Venture and governance plans](PROJECT_PLANNING.md)。这些是公开文档，不是客户操作步骤。These public documents are separate from the customer workflow.
