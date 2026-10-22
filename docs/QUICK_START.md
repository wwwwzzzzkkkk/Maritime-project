# MAREG 使用文档：新手快速上手 / Beginner Quick Start

**运行网址 / Open the website:** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)

[中文操作](#中文快速上手) · [English instructions](#english-quick-start) · [公式与来源 / Formulas and sources](#附录--appendices) · [返回 README / Back to README](../README.md)

适用：默认浅色版 v4.7.0，2026-10-22 文档。无需安装或登录。正文介绍操作；附录按需展开。

For the default light edition v4.7.0, documented on 22 October 2026. No installation or login is needed. Follow the steps first; expand the appendices when you need the formulas.

## 中文快速上手

**v4.5.1 MAREG 助手：** 在“帮助与说明”点击“连接 AI” → 输入私下提供的课堂访问码 → 同意并提问。常用问题可直接填入，回答来源可展开。不要填写 DeepSeek API key。/ **Classroom AI:** Help & About → Connect AI → private classroom code → consent → ask. Suggestions fill the question; references expand below the answer. Never enter the API key. [说明 / Setup](AI_SETUP.md)

**v4.4.0 新增：** 顶栏“分析与报告”可保存／恢复及导出可打印报告；“方案比较”可展开统一 CSV 台账；“未来情景”可保存并载入明确的规划条件；“帮助与说明”提供默认未连接的本机 AI 接口。[完整操作](WORKFLOWS.md) · [AI 配置](AI_SETUP.md)。台账只作普通范围初筛；数据未核验，非法律意见。

### 用AI解释政策对船队的影响（v4.7.0）

先保存船队，再在“未来情景”录入政策资料和明确条件。点击该记录的 **“AI解释影响”**，会进入原有助手，并填好问题；不会自动发送。连接AI并输入课堂访问码，展开“查看将发送的摘要”，检查政策说明与匿名金额，重新勾选同意后发送。

回答说明影响、经营选择与待核事项；数字来自已有计算，不由AI创造。匿名编号按船队列表顺序对应；专门的船名／客户编号、原始台账及复核姓名不会附带，但手填说明请勿含敏感信息。没有数值条件时，影响是“无法量化”，不是零。单船滑块不会自动改变已存船队；明确更新快照／政策后，旧回答提示依据改变。“返回单船问答”清除关联和同意，重新填写问题即可。

### 新增：从单船走向船队决策（v4.6.0）

1. **预算总览 → 添加船舶**：先应用单船输入，再填名称、唯一编号、总吨和基准航速，存为独立记录。下一艘可以继续用当前输入或先切换模板／应用台账。重复用模板不代表已有真实五艘船数据。
2. 修改已存船：先在该行“载入分析”，调节并应用，再点该行“更新分析”。船队汇总不会跟着单船滑块偷偷改变。EUR／GBP始终分开，2026活动输入的完整性仍待核。
3. **未来情景 → 新增政策证据**：填HTTPS来源、日期、整理人、变化和待核点；需要算影响才填价格／目标条件，选择全部或指定船舶。证据只有文字时显示“无可计算条件”，不等于影响为零。记录另一位成员的复核后再生成行动。
4. **方案比较 → 行动与复核**：选船和候选类型生成草稿；填负责人、日期、前提和风险，另一人填写复核。只有确认与限制均满足才可标为计划；“已实施”还需凭证和结果，仍是自报，不执行真实交易。
5. **保存／导出项目**：通过顶栏“分析与报告”保存本机、导出JSON或可读报告。新报告增加船队、政策、行动三节。文件上限10 MB，本机保存容量受浏览器限制。重置基准只重置单船推演，不删除这些记录。来源／输入更新后旧行动标记为过期，重新生成才能继续复核。

资料保存在本机浏览器，需明确保存；不自动上传、不跨设备同步。姓名和复核意见不经过身份认证，也不等于专家批准。地图仍为示意，用户标注“已生效”不构成法律核验。

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

“方案比较”的航次、燃料与组池推演控件保持平面，避免鼠标移动使操作区倾斜。

在 **预算总览** 左侧拖动滑块：

- **EUA 碳价**：改变 EU ETS 预算；不是实时市场报价。
- **航速调整**：尝试较低航速，观察成本和排放模型变化；不代表已验证的准时到港方案。
- **示例低碳燃料能源占比**：观察燃料情景，留意认证、供给与价格尚未核实的提示。
- **FuelEU 目标条件**：比较 2025–2029 的 2% 与 2030 的 6% 目标；其他活动量与价格保持当前输入，不是实际未来账单预测。

地图可缩放、拖动和点击港口。航段按钮可筛选下方台账；筛选不会改变整船示例预算。手机导航显示“总览 / 方案 / 依据 / 未来 / 帮助”五个短名称，切换后直接定位到对应内容；费用卡只在总览显示，宽表格可横向滑动。

电脑或手机上，原费用卡滚出视野或切换到其他模块时，会自动出现**实时预算浮窗**，随参数同步更新。拖动浮窗标题可移动位置；点“收起 / 展开”调整占用空间，点“归位”恢复默认位置。回到原费用卡区域，浮窗自动隐藏。欧元和英镑仍分开显示。

### 3. 到“方案比较”比较方案

先使用默认可见的五个快速输入：范围内燃油消耗（等效吨）、燃油价、低碳燃料溢价、组池报价、允许增加的航时。组池报价旁显示已应用可用量，点击“修改”进入高级区。EUA 继续在总览滑块调整。

默认 4,000 等效吨 = 164,000,000 MJ；41,000 MJ/吨仅用于 VLSFO 等效换算，不适用于所有实际燃料。高级区可直接输入 MJ，两种单位同步，计算和快照只保存 MJ。

“高级假设”默认折叠，分燃料与价格、组池、运营限制三组，原字段仍可编辑。字段旁有默认标记和还原按钮；ⓘ 可点击或用键盘聚焦阅读，Esc 关闭。上方假设标签可定位输入，高级项自动展开；有草稿时标签明确提示仍显示已应用值。修改后点击“应用输入并比较”，否则结果仍使用上次已应用的输入。越界、空值或不符步长会显示行内提示并阻止应用。

“确认以上假设”区域保留三项声明，可用主按钮一次确认。修改表单输入后重新应用会取消此前确认；“重置基准”也恢复未确认。“载入演示假设并确认”将当前船舶的表单恢复默认值并确认三项，仅用于演示，不代表真实核验；不会修改滑块。

四个按钮均为演示预设，只调整既有滑块：基准设燃料 0%、航速 0.0 kn、组池 0；慢航只设航速 −1.0 kn；低碳燃料只设占比 20%；组池抵扣只设请求 200 tCB。后三项保留其他滑块不变，全部预设均不修改价格、能源、供给和确认状态。慢航预设在默认距离下会超过 24 小时限制，这是用于观察约束的演示，不是可直接执行的建议。

距离、能源、排放台账和新增航时必须属于同一声明范围与比较期间；地图不提供自动测距。每日时间成本填写非燃油增量，避免重复计费。燃料兼容性、认证与供给、组池参与条件及运营输入需自行核对；点击确认不等于外部核验。

表格比较 **保持现状、当前方案、仅航速、仅燃料、仅组池、组合搜索** 六类结果。先看范围内欧元支出及相对基准差额，再看新增航时和条件状态。超出时间或燃料限制的当前方案会明确标出；未知条件只显示待确认候选。UK 英镑费用独立查看，当前搜索只最小化表列欧元成本，不是完整航次成本。

候选结果显示合规费用、燃料净增量和时间成本；点击“载入候选参数”只更新滑块，不执行采购或申报。电脑与手机在原费用卡离开视野时都会显示可拖动的玻璃预算浮窗。

拖动 **组池** 滑块，可申请用假设盈余补缺口。申请量不一定等于实际分配量：系统最多使用本船缺口和假设供给内的数量。供给不足时仍有罚款。

GENCON、NYPE、50:50 按钮用于选择**示例分摊比例**，不是标准合同默认条款。换一种分摊会改变谁承担费用，不会改变该船总排放或整船支出。首页船东卡只分摊合规部分；方案表还将营运增量按同一示例比例分给双方，英国费用不包含其中。

### 4. 到“计算依据”看原因

“输入、公式与结果”默认展开，直接查看当前船舶的计算明细。官方来源在同页下方按需展开。双环中心数字中，**负百分比表示相对基准下降，0 表示未变，正值表示上升**；满环 = ±30%，超过按满环显示，中心为真实百分比；非零变化至少显示 3% 弧长，0% 无圆弧。下降用 accent，上升用 warn，不能把费用下降理解为排放下降。

基准使用**同一船舶输入、同一价格、同一目标**，但不做航速、燃料或组池调整。所以只改碳价时，账单会变，而方案相对基准的变化百分比仍可能为 0。

费用下降不等于实际减排。特别是只使用组池时，财务结果可以改善，但本船 WtW 模型值不变。

### 5. 其他模块与保存结果

- **未来情景**：看三种监管路径下需要核对的事项。它不自动修改区域账单，不计算假设的全球收费，也不表示发生概率。
- **帮助与说明**：看操作步骤、预设常见问题及产品能力范围。预设解释跟随当前计算；另有云端 DeepSeek 解释：检查预填服务地址、输入课堂访问码并勾选发送同意后提问；不需要 Mac 开机。课程与商业验证材料已移到仓库文档。
- **分析与报告 → 导出 JSON**：保存当前输入、假设、来源与结果；关掉弹窗可点 `✕` 或按 `Esc`。新手不必读 JSON，可留作核对或与团队讨论。

**刷新或“重置基准”会回到默认教学情景。** 如需保留当前结果，请先导出；旧计算快照不能恢复；请导出“可恢复工作区”，或使用本机保存记录手动恢复。

### 三个小练习

每个练习开始前都先点 **重置基准**。

| 操作 | 应观察到什么 |
| --- | --- |
| 把 EUA 从 €80 调到 €100 | EU ETS 从 €88,000 变为 €110,000；这不代表物理排放增加。 |
| 在第二页把组池申请量调到 375 | 2% 基准缺口可被补足，FuelEU 罚款为 €0；实际分配约 371.1648 tCB，组池费用仍需计入，物理模型变化为 0。实际分配可在快照查看。 |
| 把 FuelEU 目标切到 2030 的 6% | 固定默认活动量和强度时，基础金额约 €619,346.72；它是目标条件比较。 |

地图没有加载时，先检查网络；数值和台账仍可查看。想了解一个数字怎么算，再展开下面附录即可。

## English quick start

### Explain a policy's fleet impact with AI (v4.7.0)

Store your fleet and an existing policy-evidence record. Choose **Explain impact with AI** on that record to open the existing assistant with a suggested question. Nothing sends automatically. Connect, enter the private classroom code, review the selected text/source and anonymous amounts, then consent and send. Dedicated profile/identity fields and raw ledgers are excluded; keep sensitive content out of free-text notes. Anonymous numbers follow fleet-list order.

Answers cover impact, business options and checks. Figures come from the model; evidence without numeric conditions has unknown impact, not zero. Updating a saved fleet snapshot or source marks prior answers stale. Editing an unsaved single-vessel analysis does not silently update the fleet. Return to vessel Q&A clears the linked context, question and consent.

### New in v4.6.0: vessel → evidence → action

1. **Budget Overview → Add a vessel** stores the applied analysis under a unique reference. Reusing a template does not establish real fleet data. Load a stored vessel before editing, then explicitly **Update snapshot**; sliders do not silently change stored totals.
2. **Future Scenarios → Add policy evidence** records an HTTPS source, dates, preparer, before/after conditions and uncertainty. Set explicit numeric conditions only when comparing costs. Select all or specific vessels; record a different team member’s review. Text-only evidence has unknown cost impact, not zero.
3. **Compare Options → Actions & review** generates a draft from a stored vessel and candidate. Complete owner, date, prerequisites, risks and another person’s review. Planning requires confirmed inputs and satisfied limits; self-reported implementation also requires evidence/outcomes. No purchase or filing is executed.
4. **Analysis & Reports** saves locally or exports JSON/HTML including fleet, evidence and actions. JSON limit10 MB; local storage is browser-limited. Reset keeps these records. Changed sources mark previous actions stale; regenerate and review.

EUR and GBP remain separate. Figures summarize scoped2026 inputs, not verified annual accounts. Names/reviews are self-entered, not authenticated expert approval. Records require explicit saving and do not synchronize across devices.


**New in v4.4.0:** Analysis & Reports saves/restores and exports printable reports. Compare offers unified CSV ledgers, Future offers explicit named planning conditions, and Help offers local AI integration, disconnected by default. [Workflow guide](WORKFLOWS.md) · [AI setup](AI_SETUP.md). Scope screening is preliminary; data is unverified and not legal advice.

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

The voyage/fuel/pooling controls in Compare Options stay flat when the pointer moves.

Use the controls in **Budget Overview**:

- **EUA price** changes the EU ETS budget; it is not a live market quotation.
- **Speed change** explores lower-speed cost and emissions estimates; no verified JIT arrival plan is provided.
- **Illustrative fuel energy share** explores fuel scenarios; certification, supply and prices remain unverified.
- **FuelEU target condition** compares the 2% target for 2025–2029 with 6% for 2030, holding other current activity and price inputs fixed. It is not an actual future-bill forecast.

Zoom/pan the map or click ports. Activity buttons filter the ledger without changing the overall illustrative budget. On mobile, the short tabs Home / Compare / Basis / Future / Help open their content immediately. Budget cards appear in Home only; wide tables scroll horizontally.

On desktop and mobile, a **live budget window** appears when the original cards leave view or you open another module. Values update as you change inputs. Drag its title to move it, use Collapse / Expand to save space, or Reset to restore its position. It hides when the original cards return to view. EUR and GBP remain separate.

### 3. Compare options in “Compare Options”

Start with five visible numeric inputs: scoped fuel consumption in equivalent tonnes, base fuel price, fuel premium, pool quote and allowed extra sailing time. The quote row shows applied pool availability; Edit opens its advanced field. EUA remains on the overview slider.

The default 4,000 equivalent tonnes equals 164,000,000 MJ. The 41,000 MJ/tonne conversion is VLSFO equivalence, not a universal fuel heating value. Advanced assumptions also allow direct MJ input; both units stay synchronized, while calculations and snapshots retain MJ only.

Advanced assumptions are collapsed into Fuel and prices / Pooling / Operating limits. All original fields remain editable, with default markers and restore buttons. Click or keyboard-focus ⓘ to read the explanation; Escape closes it. Assumption tags focus the linked input and open Advanced when necessary. Unapplied drafts are labelled and do not replace applied tags or results. Apply Inputs & Compare submits valid edits; inline errors block empty, out-of-range or step-invalid values.

The confirmation area retains all three declarations and offers one action to confirm them. Applying edited form inputs or resetting clears confirmation. Load & Confirm Demo Assumptions restores the active vessel's form defaults and confirms all three declarations; it does not change sliders and is for demonstration only, not real verification.

The four demo presets only set existing sliders: Baseline sets fuel 0%, speed 0.0 kn and pool 0; Slow steaming sets speed −1.0 kn only; Low-carbon fuel sets fuel 20% only; Pooling offset sets requested pool 200 tCB only. Non-baseline presets retain other sliders. None changes prices, energy, supply or confirmation. Slow steaming exceeds the default 24-hour allowance at the default distance: this demonstrates the constraint, not an executable recommendation.

Distance, energy, emissions records and extra time must refer to the same declared scope and comparison period. The map does not measure this distance. Daily time cost excludes separately counted fuel costs. Confirm operating inputs, fuel compatibility/certification/supply and pool participation conditions; confirmation is not external verification.

Six rows compare baseline, current, speed-only, fuel-only, pooling-only and combined search. Read scoped EUR expenditure/delta, extra hours and condition status. The current option is flagged if outside numerical limits; unknown conditions remain pending. UK GBP is separate and excluded from the EUR objective. Results are not full-voyage costs.

Load Candidate Inputs only updates controls, without purchasing or filing. The same draggable glass budget appears on desktop and mobile when the original cards leave view.

The pooling slider requests surplus allocation. The actual allocation is capped by the ship's deficit and assumed available supply. Insufficient supply leaves a remaining penalty.

GENCON, NYPE and 50:50 buttons select **illustrative reimbursement splits**, not standard-contract defaults. Changing the split changes who pays, not vessel emissions or overall cost. Table party amounts include operating deltas; the headline owner KPI covers compliance only.

### 4. Inspect “Calculation Basis”

The inputs/formulas/results disclosure is open by default to trace the active vessel's calculations. Official references are in a separate disclosure below. For the central gauge readings, **negative percentages mean a decrease from baseline, zero means unchanged, and positive means an increase**. Full ring = ±30%; larger changes cap at a full ring, while the centre shows the true percentage. Non-zero changes use at least 3% of the ring; zero has no arc. Decreases use accent and increases use warn, without equating cost savings to emissions reductions.

The baseline uses the **same vessel, prices and target**, but no speed/fuel/pooling adjustment. A price-only change therefore changes the bill while the active-option percentage difference can remain zero.

Lower expenditure is not automatically physical decarbonisation. Pooling alone may improve costs while leaving the vessel's WtW model estimate unchanged.

### 5. Explore the other views and save

- **Future Scenarios** explains what to review under three possible regulatory paths. It does not change regional bills, calculate hypothetical global charges or assign probabilities.
- **Help & About** contains getting-started steps, preset FAQs and product scope. Preset explanations follow current calculations; cloud DeepSeek explanations require checking the prefilled connection, entering the classroom code and consenting; the Mac need not run. Course and venture plans are now in repository documents.
- **Analysis & Reports → Export JSON** saves current inputs, assumptions, sources and outputs. Close with `✕` or `Esc`. Beginners need not read JSON; keep it for reference or discuss it with your team.

**Refreshing or selecting Reset returns to the default teaching scenario.** Export first if you need a record; old snapshots are not restorable; export a workspace or explicitly restore a locally saved analysis.

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
实际组池分配 / Allocated pool = min(requested, applied available supply, max(−CBg, 0) / 1,000,000)
组池后余额 / Net CBg = CBg + allocated pool × 1,000,000
基础罚款 EUR / Base penalty = max(−Net CBg, 0) / (I × 41,000) × 2,400
组池费用 EUR / Pool fee = allocated pool × 180
```

正余额不计罚。400 tCB 是可编辑的初始示例供给上限，€180 是报价假设；真实组池还需满足参与、分配与核验条件。

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
extraHours = distanceNm / newSpeed − distanceNm / baseSpeed
extraAuxFuel = extraHours / 24 × auxFuelPerDay
E = E₀ × F + extraAuxFuel × 41,000
I = I₀ × (1 − 0.32 × b)
新增辅助 CO₂ / Extra auxiliary CO₂ = extraAuxFuel × auxCo2Factor × (1 − 0.26 × b)
航行 CO₂ / Sailing CO₂ = original CO₂ × r² × (1 − 0.26 × b)
港内 CO₂ / Port CO₂ = original CO₂ × (1 − 0.26 × b)
```

这是同一声明范围的固定航程近似，原港内 CO₂ 不随降速变化；新增航时辅助燃油单独计入能源和 EU ETS（AUX 行），其覆盖比例由输入确定。88/12 和 0.26/0.32 来自项目模型假设，不是法规规定、燃料证书或已验证 JIT 效果。来源：计算引擎的 `ASSUMPTIONS` 与 `computeScenario()`。

This is a fixed-distance approximation within the declared scope; original port CO₂ does not change with speed. Extra-time auxiliary fuel is added to energy and the EU ETS AUX row at the entered coverage. The 88/12 and 0.26/0.32 coefficients are project assumptions, not legal requirements, fuel certificates or verified JIT savings. Source: `ASSUMPTIONS` and `computeScenario()` in the engine.

### B4. 方案总额与船东分摊 / Option totals and owner allocation

```text
Q₀ = E₀ / 41,000                       (t VLSFO-equivalent)
省油金额 / Fuel savings = (E₀ − E) / 41,000 × applied bunker price
燃料溢价 / Fuel premium = E / 41,000 × b × applied fuel premium
欧元总净支出 / Total EUR = EU ETS + FuelEU penalty + pool fee + fuel premium − fuel savings + time cost
船东承担 / Owner = (EU ETS + FuelEU penalty + pool fee) × owner share
合同偿付方 / Reimbursing party = same compliance sum × (1 − owner share)
```

550、260 和分摊比例为项目假设。营运增量只按本模型的范围内能源估算；表内总额不包含完整基准燃油账单、全部航次成本或改造成本，新增航时费仅采用输入的日费率。UK 英镑不参与欧元合计；首页船东卡不包含营运增量，下表双方金额包含按同一示例比例分摊的营运增量。来源：引擎 `computeScenario()` 和页面 `computeComplianceMetrics()`；合同参考见 C5。

The 550/260 prices and allocation shares are assumptions. Operating deltas use the model's in-scope energy; the table excludes the full baseline fuel bill, all voyage costs and retrofits, while extra time uses the entered daily rate. UK GBP is excluded. The headline owner KPI excludes operating deltas; table party amounts include those deltas at the same illustrative share. Sources: engine `computeScenario()`, UI `computeComplianceMetrics()`; contractual reference in C5.

### B5. 双环百分比 / Gauge percentages

```text
范围内 WtW 估算 / In-scope WtW estimate (tCO₂e) = I × E / 1,000,000
变化 / Change (%) = (current − baseline) / baseline × 100
```

财务比较使用 B4 欧元总净支出；物理比较使用范围内 WtW 估算。基准保持同一船舶、碳价和 FuelEU 目标，取消航速、燃料与组池调整。组池不直接改变 `I` 或 `E`。圆弧按 ±30% 满环绘制，非零最小弧长为满环的 3%，超过满环封顶；中心显示真实变化。来源：引擎 `compareOptions()`、页面 `renderApp()`。

Financial comparison uses the B4 EUR total; physical comparison uses the in-scope WtW estimate. The baseline keeps the same vessel, allowance prices and FuelEU target, with no speed/fuel/pooling adjustment. Pooling does not directly change `I` or `E`. Arcs use ±30% as full scale, cap larger magnitudes, hide zero and apply a disclosed 3% minimum non-zero arc; centre values remain the true changes. Sources: engine `compareOptions()` and UI `renderApp()`.

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

这些数值来自项目 A1/情景规划输入，保存在代码中；不是市场研究成果。额外内部成本、获客和投资回收需另计，工时估值未必成为现金。来源：引擎 `clientValue()`、[情景数据](../js/light-data.mjs) 与原有双语数据中的 A1/A2 示例。

These values are project A1/scenario planning inputs stored in code, not market research findings. Additional internal costs, acquisition and investment recovery need separate treatment; time value may not become cash. Sources: engine `clientValue()`, linked scenario data and the original bilingual A1/A2 examples.

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


## v4.2.0：新增成本与搜索口径 / Added costs and search scope

```text
新增时间成本 / Time cost = extraHours / 24 × dailyTimeCost
燃料节省金额（可为负）/ Fuel savings (may be negative) = (E₀ − E) / 41,000 × bunkerPrice
燃料溢价 / Fuel premium = E / 41,000 × blendShare × blendPremium
范围内欧元支出 / Scoped EUR = EU ETS + FuelEU penalty + pool fee + fuel premium − fuel savings + time cost
表内船东 / Table owner = compliance owner + operating delta × illustrative owner share
表内租家 / Table charterer = scoped EUR − table owner
```

新增示例输入：同范围距离 6,000 海里、允许新增 24 小时、非燃油时间成本 €5,000/天、辅助燃油 2 t VLSFO-eq/天、CO₂ 因子 3.114 t/t、辅助 ETS 覆盖 100%、燃料占比上限 30%。均可编辑，均不是适用于所有船舶的官方参数。原 ETS 台账和 FuelEU 能源仍独立给定；编辑能源/强度不自动重建原 ETS 吨数，必须另行对账。

New demo inputs: 6,000 nm within scope, 24 extra hours allowed, €5,000/day non-fuel time cost, 2 t VLSFO-eq/day auxiliary fuel, 3.114 t/t CO₂ factor, 100% auxiliary ETS coverage and 30% fuel-share limit. Editable assumptions, not universal regulatory parameters. Original ETS and FuelEU records remain independently specified; editing energy/intensity does not rebuild the original ETS tonnages.

搜索航速 0 至 −2 kn，步长 0.2；燃料步长 5 个百分点并包含输入上限；组池比较 0 与供给/缺口上限两端，并纳入当前满足限制的方案。组池成本在固定燃料/航速下呈线性，故比较两个端点。优先在用户确认条件的组合中选最低欧元成本者；若均未确认，只展示最低模型成本待确认候选。不是连续全局最优、完整成本预测或执行承诺。

Search speed from 0 to −2 kn in 0.2 steps, fuel share in 5-point steps plus the exact cap, and pooling at zero or capped supply/deficit; include the valid current option. Pool costs are linear for fixed speed/fuel, so compare endpoints. Prefer the cheapest user-confirmed candidate; otherwise show a pending model candidate. This is not continuous global optimization, full-cost forecasting or execution assurance.

比较表和候选金额采用“合规费用＋营运增量”的费用比较口径，没有加回各方案共有的基准燃油账单，因此数值可能为负；不是负的应付账单、现金退款或利润。首页合规卡仍为对应费用预算。
Comparison values combine compliance costs with operating deltas, excluding common baseline fuel costs. They can be negative; they are not negative payable bills, cash refunds or profit. Headline compliance cards retain their separate budget meaning.


## v4.2.1 展示变化 / Presentation changes

比较表位于滑块和分摊/推荐两栏下方，默认五列；勾选“显示全部列”查看新增航时与费用构成，首列在横滚时固定。推荐卡和“载入候选参数”仍位于分摊区域。公式明细默认展开；外部指南、来源、更新记录在新标签页打开，不替换当前演示页。

The comparison is below the sliders and allocation/recommendation columns. Five core fields show by default; Show All Columns reveals time and components, with the first column sticky when scrolling. The recommendation/action stays with allocation. The main trace opens by default. External guides, sources and release notes open separately.

地图“全航线”和重置基准按当前航段坐标适配；阴影使用本地 Natural Earth 50m 数据，仍不是法律覆盖范围。外网字体/底图不可用时，已加载页面或本地 HTTP 运行仍可使用本地航线、阴影、金额与台账。验证通过请求拦截模拟，不是真实离线，也不保证未缓存时首次打开。

Full Route and Reset fit current route coordinates. Local Natural Earth 50m shading remains geographical illustration, not legal scope. Loaded pages/local HTTP operation can retain local route, shading and calculations when external fonts/tiles are unavailable. Verification uses request interception, not real offline, and does not guarantee uncached first load.


## v4.3.1：阅读与操作 / Reading and interaction

保持原来的玻璃外观。辅助文字更清晰、字号更大；将指针放入表格或来源列表正文后，相关卡片平滑恢复平面，方便横滚和阅读；标题区域和展示卡仍保留原倾斜。系统设置“减少动态效果”时不再倾斜，概览快速调节器继续保持平面。滑块输入按帧合并，金额仍按同一模型更新，弹窗打开时显示当前数据。

The original glass appearance remains. Text is larger/more legible. Hovering inside a table or reference list settles its card flat for reading; titles and display cards keep their tilt. Reduced-motion preference disables tilt, and overview quick controls remain flat. Slider inputs are batched by frame using the same model; open map popups stay current.

宽表仍可在自身区域横向滚动，EUR/GBP 与演示/未核验/CO₂ 范围说明不变。
Wide tables still scroll locally; currencies and demo/verification/CO₂ boundaries are unchanged.
