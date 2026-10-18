# MAREG v4.5.0：分析、台账与规划 / Analysis, Ledgers & Planning

[打开网页 / Open site](https://wwwwzzzzkkkk.github.io/Maritime-project/) · [AI 配置 / AI setup](AI_SETUP.md)

## 中文操作

### 1. 保存、恢复、导出报告

顶栏打开“分析与报告”。填写分析名称，保存到本机浏览器，或导出可恢复工作区 JSON。刷新后不会自动载入：重新打开此入口，选择记录并恢复，或选择工作区文件。最多保留 20 条本机记录、每个工作区 12 个规划情景；JSON 文件最大 2 MB，过大时减少保留情景。记录包含当前船舶、已应用输入、用户确认状态、统一台账和规划情景，未应用草稿不保存。恢复重新计算，不信任文件提供的结果。旧“计算快照”是只读计算证据，不是可恢复工作区。

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

AI 入口位于“帮助与说明”，已预填云端地址。检查连接、输入私下提供的课堂访问码、勾选发送同意后才能提问。教室电脑无需 Mac 开机，不要填写 DeepSeek API 密钥。请求仅含问题、计算摘要、已有规划情景摘要和已保存参考资料，不发送原始 CSV。回答显示引用，输入变化后显示过期提示，不修改任何预算或规则。不是实时法规检索、核验或法律意见。

## English instructions

### Save, restore and report

Open **Analysis & Reports**. Save applied inputs locally or download a restorable workspace JSON. Reload does not auto-restore: select a saved record or import the workspace. Limits: 20 local records, 12 planning cases and a 2 MB workspace file; reduce cases if too large. Unapplied drafts are excluded. Restore recomputes from validated inputs instead of trusting stored outputs. Old calculation snapshots are evidence records, not workspaces.

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

The cloud AI URL is prefilled. Check its connection, enter the privately shared classroom code and consent before asking. The Mac need not run; never enter a DeepSeek API key in the webpage. Only calculated summaries, saved-case summaries, the question and bundled references are sent; raw CSV is excluded. Answers show references and become marked stale when inputs change. AI does not change calculations, retrieve live regulations, verify compliance or provide legal advice.

## 方法来源 / Method sources

Initial screening source review: 2026-10-18; limited to the implemented ordinary-scope checks, not a complete legal review.

- [European Commission — maritime ETS scope and phase-in](https://climate.ec.europa.eu/areas-action/transport-decarbonisation/reducing-emissions-shipping-sector_en)
- [FuelEU Maritime — scope and Norway/Iceland status](https://transport.ec.europa.eu/transport-modes/maritime/decarbonising-maritime-transport-fueleu-maritime_en)
- [Regulation (EU) 2023/1805 — Article 2 and Annex IV](https://eur-lex.europa.eu/eli/reg/2023/1805/oj/eng)
- [UK maritime ETS guidance — activities, exclusions and period](https://www.gov.uk/guidance/uk-emissions-trading-scheme-for-maritime-how-to-comply)

Official-reference text bundled for AI retains its own 2026-10-15 review date; the service is not a live policy feed. Recheck legal status, actual ports, certified factors, supply and scope before real use.
