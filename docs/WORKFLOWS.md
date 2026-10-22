# MAREG v4.7.0：分析、台账与规划 / Analysis, Ledgers & Planning

[打开网页 / Open site](https://wwwwzzzzkkkk.github.io/Maritime-project/) · [AI 配置 / AI setup](AI_SETUP.md)

## 中文操作

### 1. 保存、恢复、导出报告

顶栏打开“分析与报告”。填写分析名称，保存到本机浏览器，或导出可恢复工作区 JSON。刷新后不会自动载入：重新打开此入口，选择记录并恢复，或选择工作区文件。最多保留 20 条本机记录、每个工作区 12 个规划情景；JSON 文件最大 10 MB，过大时减少保留情景。记录包含当前船舶、已应用输入、用户确认状态、统一台账和规划情景，未应用草稿不保存。恢复重新计算，不信任文件提供的结果。旧“计算快照”是只读计算证据，不是可恢复工作区。

“导出可读报告”下载独立 HTML，包含预算、六类方案、条件状态、公式、台账来源、规划情景及边界。用浏览器打开后可打印／另存 PDF；未做自动申报或鉴证。报告用当前选择的中／英文生成。真正的打印机/PDF 分页仍需在所用设备上确认。

本机记录不上传、不跨设备同步，也不是加密或多客户隔离。重置清空当前分析和情景，不删除已保存记录；要删除记录请在列表中明确删除。

### 2. 统一燃料台账与初步适用检查

在“方案比较”展开“统一燃料台账与适用范围检查”。先下载模板或填入示例，再填写船名、GT、船型、基准航速和范围声明。示例台账与默认 A3 算例不同，填入／检查不会改变预算，明确应用才会替换当前船舶的数据。

CSV 列必须依次为：

```text
id,date,activity,from,to,fuelTonnes,lhvMJPerKg,co2Factor,wtwIntensity,distanceNm,source
```

- id：唯一行号，AUX 为模型保留编号。
- date：2026 年有效日期。期间固定为 2026-01-01 至 2026-12-31；完整性由资料负责人核对。
- activity：sailing（航行）或 port（港内）。港内 from 与 to 相同、距离为 0。
- from/to：五位 UN/LOCODE。EU27/GB 由国家前缀初筛；有效挂靠、实际港口及特别安排仍需核对。
- fuelTonnes：实际燃料吨数，不能填成 MJ 或未经说明的等效吨。
- lhvMJPerKg：该燃料低位热值 MJ/kg；示例 41 不是通用值。
- co2Factor：该燃料的 CO₂ 因子 tCO₂/t；wtwIntensity 为生命周期 gCO₂e/MJ。示例因子未经认证。
- distanceNm：本条航行距离（海里）；source 为可定位的原始记录来源，不代表系统已读取或验证该文件。

每行能源＝吨数×1,000×热值；每行 CO₂＝吨数×CO₂ 因子。范围内能源和强度按覆盖加权，ETS 排放来自相同燃料行。覆盖加权距离用于现有模型的范围推演，**不是实际航程或到港延误证明**。航速仍采用原 88%/12% 与平方近似，燃料系数仍为 0.26/0.32。

本版只将普通、无已知特殊安排、GT>5,000、有有效 EU 范围能源与航行距离的 2026 年货船／客船台账载入现有估算器。EU ETS 一般门槛 ≥5,000 GT、FuelEU >5,000 GT 的差别明确显示；边界、其他船型、挪威/冰岛、豁免或不支持的台账只检查，不出最终结论。UK 仅计 7 月 1 日起相关国内／港内活动；国际航次和排除项不复制 EU 的 50%逻辑。仅港内、无 EU 范围、零 CO₂ 因子等不在本版计算支持范围。

应用后能源、强度及距离从台账推导，快速输入中对应字段只读，需回到台账修改。价格等其他假设仍可编辑。修改草稿清空旧预览，检查并应用后才改变预算。地图保持演示示意，不作为上传路线或费用分配的证据。CH₄/N₂O 仍缺失，不当作零，不称完整 ETS 总额。

### 3. 规划情景与 AI 解释

“未来情景”中的监管路径只提供讨论背景，不自动更改法律或收费。在“规划条件与成本比较”明确输入名称、EUA、UKA、FuelEU 目标、组池报价／可用量，保存后可并列比较 EUR、GBP 和新增航时；载入才改变当前输入。每个情景保留保存时的船舶、台账和其他输入，恢复时展示对应对象。无全球假设收费或发生概率。

“帮助与说明”首先显示 MAREG 助手，云端地址已预填在折叠设置中。点击“连接 AI”、输入私下提供的课堂访问码、勾选发送同意后才能提问。教室电脑无需 Mac 开机，不要填写 DeepSeek API 密钥。请求仅含问题、计算摘要、已有规划情景摘要和已保存参考资料，不发送原始 CSV。回答按简短段落／步骤显示，来源链接可展开，输入变化后显示过期提示，不修改任何预算或规则。不是实时法规检索、核验或法律意见。

## English instructions

### Save, restore and report

Open **Analysis & Reports**. Save applied inputs locally or download a restorable workspace JSON. Reload does not auto-restore: select a saved record or import the workspace. Limits: 20 local records, 12 planning cases and a 10 MB workspace file; reduce cases if too large. Unapplied drafts are excluded. Restore recomputes from validated inputs instead of trusting stored outputs. Old calculation snapshots are evidence records, not workspaces.

Export Readable Report downloads standalone HTML containing budgets, six option families, conditions, formulas, source records, planning cases and limitations. Open it in a browser to print/save PDF. Reports use the selected UI language. Actual print/PDF pagination remains device-dependent and was not certified.

Storage is browser-local, not encrypted, shared or synchronized. Reset clears current analysis/cases but preserves explicitly saved records. Delete selected records explicitly.

### Unified ledger and preliminary screening

Expand the ledger editor in **Compare Options**. Use the CSV template and enter vessel name, GT, cargo/passenger type, speed and scope declaration. The ledger demo differs from the A3 benchmark; filling/screening does not change budgets until Apply.

Use the exact CSV headers above. Each row needs a unique ID, valid 2026 date, sailing/port activity, five-character UN/LOCODEs, actual fuel tonnes, LHV in MJ/kg, CO₂ factor in tCO₂/t, lifecycle intensity in gCO₂e/MJ, nautical-mile distance and source. A port row has identical ports and zero distance. Quoted commas, CRLF and BOM are supported. CSV maximum: 1 MB / 500 rows. Sources identify records; they do not establish that those records were read or verified.

Energy = tonnes × 1,000 × LHV; CO₂ = tonnes × CO₂ factor. Scoped energy/intensity and distance use coverage weights. Distance/time are accounting-scope approximations, not verified voyage/arrival timings. Existing speed and fuel what-if assumptions remain unchanged.

Only ordinary 2026 cargo/passenger ledgers with GT>5,000 and supported EU-scoped energy/distance load into this estimator. ETS ≥5,000 versus FuelEU >5,000 is distinguished. Other types, thresholds, Norway/Iceland and special/exempt activities need review. UK begins on 1 July; EU coverage is not copied to international UK voyages. Port-only, no-EU and zero-CO₂-factor ledgers are outside this calculator's supported scope. All screening remains preliminary; CH₄/N₂O is missing, not zero.

After Apply, energy/intensity/distance are derived read-only views; edit ledger records to change them. Other prices remain editable. Draft edits clear old previews. The map stays illustrative and is not linked to imported routes/costs.

### Planning and AI

Policy paths are context only. Set explicit prices, FuelEU target and pool assumptions, save named cases and compare EUR/GBP separately. Loading restores the saved vessel/data/conditions; no automatic global fee or probability is introduced.

MAREG Assistant is first in Help & About; its cloud URL is prefilled in expandable settings. Select Connect AI, enter the privately shared classroom code and consent before asking. The Mac need not run; never enter a DeepSeek API key in the webpage. Only calculated summaries, saved-case summaries, the question and bundled references are sent; raw CSV is excluded. Answers use readable paragraphs/steps with expandable references and become marked stale when inputs change. AI does not change calculations, retrieve live regulations, verify compliance or provide legal advice.

## 方法来源 / Method sources

Initial screening source review: 2026-10-18; limited to the implemented ordinary-scope checks, not a complete legal review.

- [European Commission — maritime ETS scope and phase-in](https://climate.ec.europa.eu/areas-action/transport-decarbonisation/reducing-emissions-shipping-sector_en)
- [FuelEU Maritime — scope and Norway/Iceland status](https://transport.ec.europa.eu/transport-modes/maritime/decarbonising-maritime-transport-fueleu-maritime_en)
- [Regulation (EU) 2023/1805 — Article 2 and Annex IV](https://eur-lex.europa.eu/eli/reg/2023/1805/oj/eng)
- [UK maritime ETS guidance — activities, exclusions and period](https://www.gov.uk/guidance/uk-emissions-trading-scheme-for-maritime-how-to-comply)

Official-reference text bundled for AI retains its own 2026-10-15 review date; the service is not a live policy feed. Recheck legal status, actual ports, certified factors, supply and scope before real use.


## v4.6.0：船队、证据与行动 / Fleet, evidence and actions

### 中文

- **船队**：预算总览中添加最多20艘船，唯一编号防止混淆；逐船保留已应用输入、台账、确认状态和资料。修改资料保留原计算输入；修改分析先载入对应船舶再明确更新。模型仍以三个模板为起点，不将模板误称为真实船舶记录；导入台账仍未核验。
- **预算**：仅加总存入的2026活动输入；EUR和GBP分别汇总，不换汇。2%与6%混用会提示可比性问题；6%条件不构成完整2030年度账户。不是完整航次成本，也不保证年度覆盖完整。
- **政策证据**：最多40条；HTTPS来源不自动抓取，合法性及适用范围由团队核对。状态可选规划／提案／用户标注已生效；没有数值条件时不计算影响。数值条件只改变比较副本，不改当前预算或引擎法律规则。可选全部／指定船；新资料或复核生成新版本。
- **行动**：最多80条，从已存船舶与既有方案搜索生成；原输入、建议参数与关联政策版本冻结。比较原条件和所列数值情景中的两币种差额、航时和范围内WtW模型变化；费用下降不等于实际减排。没有数值情景时明确仅有基准证据。
- **复核和门控**：姓名由用户填写，不验证身份。负责人、日期、前提、风险、另一人复核、全部关联政策复核、输入确认与限制满足后才可记为计划；已实施还需凭证与结果。重大支出标记不代替专业复核。后续来源变化会标记旧行动需重新生成。每项最多40条事件，不是防篡改审计。
- **保存**：记录通过同一“分析与报告”入口保存／恢复／导出，HTML报告新增8–10节。默认不自动保存、不上传；本机库最多20份工作区，文件最大10 MB，浏览器容量可能更小。刷新后需恢复；重置基准保留本轮船队／政策／行动。原旧工作区仍可恢复，但不会包含新记录。
- **AI边界**：云端知识说明更新为4.6.0；请求仍只含用户同意发送的当前单船计算与既有规划摘要，不自动上传整个船队、证据、行动或项目报告附件。AI看不到未发送的本机记录。

### English

- **Fleet:** up to20 uniquely referenced vessels, each storing applied inputs, confirmations, profile and optional unverified ledger. Edit a profile without changing saved calculations; load the matching vessel before explicitly updating its snapshot. Templates are not real fleet evidence.
- **Totals:** scoped2026 activity estimates only, with EUR/GBP separate. Mixed2%/6% conditions are flagged;6% does not create a verified2030 account. Coverage and annual completeness remain unverified.
- **Policy:** up to40 manual records, explicit sources/dates/status/scope/uncertainty and optional numeric conditions. No URL retrieval, legal verification or automatic rule changes. Evidence-only impact is unknown. Comparisons use copies, never mutate the active budget. Edits/reviews create revisions.
- **Actions:** up to80 frozen proposal/source snapshots using the existing planner. Baseline and numeric-policy comparisons retain currencies, time and scoped WtW model estimates. Names/reviews are self-entered, not authenticated approval. Planning requires complete ownership, fresh reviews, confirmed inputs and satisfied limits; implementation additionally needs self-reported evidence/outcomes. Material spending still needs professional review. Changed sources require regeneration. Maximum40 events/action; editable history is not tamper-proof.
- **Recovery/reporting:** one Analysis & Reports entry saves/restores/exports all records and HTML sections8–10. Explicit save only; no upload or cross-device synchronization. Maximum20 saved workspaces and10 MB/file, subject to browser quota. Reset preserves decision records. Older workspaces remain supported but contain no new records.
- **AI:** knowledge version4.6.0 explains the new workflow. Consented requests still contain only current single-vessel calculations and existing bounded planning summaries; local fleet/evidence/actions and the project-report attachment are not automatically sent.


### 新汇总怎么算 / Aggregation calculation

船队EUR = 每艘已存分析的EUR比较值之和；该值沿用引擎的EU ETS CO₂＋FuelEU罚款＋组池费用＋燃料净增量＋航时费用。GBP只累加UK ETS CO₂部分，不换汇。政策差额 = 同船条件副本 − 原已存分析；行动差额 = 同条件候选 − 原方案。不存在把船东承担再加一次的步骤。WtW变化仍为模型估算，组池本身不减少本船物理排放。

Fleet EUR sums the existing per-vessel comparison value (EU ETS CO₂ + FuelEU penalty + pool fee + net fuel delta + time cost). GBP sums UK ETS CO₂ separately, without FX conversion. Policy impact subtracts the original snapshot from its conditional copy; action impact subtracts the original option from the candidate under identical conditions. Owner allocation is not added again. WtW changes remain model estimates; pooling does not reduce this vessel's physical estimate.


## v4.7.0：政策影响接入已有AI / Policy impact in the existing assistant

中文：在“未来情景”的已有政策记录点击“AI解释影响”。先存入船队，才能解释其成本影响。助手显示所选记录、版本、涉及船数和两币种差额；可展开检查全部准备发送的摘要。点击入口不会连接或发送，且会取消之前的同意；连接与课堂码照旧，勾选新范围的同意后才能发送。政策或船队被移除时禁止发送该关联，不会静默切成单船问题；可主动“返回单船问答”。

English: choose Explain impact with AI on an existing record in Future Scenarios. Store fleet vessels first. The same assistant shows the selected record/revision, coverage and separate currency deltas, with a preview of the outbound summary. Opening does not connect/send and clears previous consent. Connection/code gates remain. Removed sources/fleet records block the linked send, rather than silently changing scope; Return to vessel Q&A is explicit.

发送内容 / Outbound fields:

- 所选政策：标题、HTTPS来源、发布日期／核对日／生效日、用户标注状态、版本、前后说明、待核点、明确数值条件及是否有团队复核（只含布尔值）。手填内容可能包含敏感信息，发送前自行检查。/ Selected policy title, source, dates, user-entered status/revision, before/after/uncertainty text, explicit conditions and review-exists boolean. Review free text for sensitive information.
- 匿名船队：按列表顺序的Vessel1…编号、是否在本记录范围、原／条件EUR及GBP金额。服务端重算摘要合计与差额，EUR／GBP分列。/ Anonymous ordered labels, scope flags and original/conditional per-currency figures; server reconstructs totals/deltas separately.
- 不附带专门的船舶资料、船名／客户编号字段、原始CSV、作者／复核姓名、行动历史或完整工作区，也不附带用户报告附件。只读JSON预览不保存访问码。/ No dedicated vessel-profile/name/customer-reference fields, raw CSV, author/reviewer names, action history, entire workspace or original report attachment. Preview contains no access code.

AI按照“影响／建议／待核”三段解释，以所选匿名金额为依据；建议仍须客户结合条件判断，不自动转为采购、执行、核验或申报。用户来源标注为未联网核验；已有官方参考资料保留原核对日期。没有数值条件时后金额和差额为null，不当作零；6%仍是固定活动量条件，不是真实2030账单。/ Answers use Impact / Options / Checks, supplied anonymous figures and visible evidence limits. They do not create transactions, implementation, verification or filings. User-entered sources are not retrieved/verified online; bundled references retain their dates. No numeric conditions means null impact, never zero.6% is a fixed-activity comparison, not a verified2030 bill.

回答过期按已发送范围判断：更新已存船舶／政策或改换关联记录，会提示依据变化；仅改当前单船滑块不会使一个未变化的已存船队回答过期。原有单船问答请求仍支持。/ Staleness follows the sent scope: saved snapshot/source/context changes matter; changing only the active single-vessel sliders does not invalidate an unchanged saved-fleet answer. Original vessel Q&A remains supported.
