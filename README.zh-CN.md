# MAREG — 海事多法规合规成本分析与数字孪生决策平台（中文文档）

> **Current website / 当前网页：v4.4.0** · [Release notes / 更新说明](https://github.com/wwwwzzzzkkkk/Maritime-project/releases/tag/v4.4.0) · [Project plans / 项目计划](docs/PROJECT_PLANNING.md) · [Course map / 课程映射](docs/COURSE_MAPPING.md)

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


[中英双语主文档](README.md) · [English documentation](README.en.md)

**🌐 在线运行网址：** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)

**新手入口：** [快速上手指南（中英文，附计算公式与来源）](docs/QUICK_START.md#中文快速上手)

## 1. 项目简介与版本

**MAREG（Maritime-project）** 是南洋理工大学海事研究硕士课程 **MT6503 Group Venture Project，Track B：合规与监管科技（Compliance & RegTech）** 的交互式教学原型。项目以管理约 **5–20 艘船舶**的中小型船东及船舶管理公司为目标客户假设，用于解释多制度预算、航次情景、合同分摊与创业风险；客户需求和付费意愿仍需验证。

| 入口 | 定位与当前状态 |
| --- | --- |
| [`index.html`](index.html) | 默认浅色版。面向客户整理五个模块，保留原有玻璃材质及动态效果；快速调节器保持平面，手机保留可拖动预算浮窗。 |
| [`index-pro-max.html`](index-pro-max.html) | 保留的 Pro Max 历史工作台版本。本次未修改或重新审查其计算及交互。 |

默认页继续使用原双语基础数据，并在页面内接入独立的 [`js/compliance-engine.mjs`](js/compliance-engine.mjs) 和 [`js/light-data.mjs`](js/light-data.mjs)。两版不再被描述为使用同一套已验证的新计算逻辑。

## 2. 在线访问与本地运行

**默认浅色版运行网址：** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)

**Pro Max 历史版本网址：** [https://wwwwzzzzkkkk.github.io/Maritime-project/index-pro-max.html](https://wwwwzzzzkkkk.github.io/Maritime-project/index-pro-max.html)

直接访问上述网址即可使用，无需安装。GitHub Pages 根据 `main` 分支自动部署；合并或推送后的发布进度可在 [Actions](https://github.com/wwwwzzzzkkkk/Maritime-project/actions) 查看。

如需本地运行，在仓库目录启动静态服务器：

```sh
python3 -m http.server 48173 --bind 127.0.0.1
```

然后访问 [http://127.0.0.1:48173/](http://127.0.0.1:48173/)。默认页使用 ES modules，需要通过 HTTP 访问，不能直接双击文件运行。核心网页无需构建或后台；可选本机 AI 服务需另行配置；Leaflet 1.9.4 已随仓库保存，Esri 底图与原有 Google Fonts 仍需要网络；国家轮廓已随仓库保存。

## 3. 五个功能模块

| 模块 | 功能及证据边界 |
| --- | --- |
| 预算总览 | 当前船舶、分制度预算、示例航线与活动台账；首页明确演示模式与时间范围，不自动判断真实法律适用性。 |
| 方案比较 | 比较基准、当前、航速、燃料、组池和组合搜索；计入新增航时与辅助燃油，明确限制、候选状态及双方承担。 |
| 计算依据 | 跟随当前船舶与输入展开公式；并列财务变化与范围内 WtW 模型变化，避免把省钱直接表述为实际减排。 |
| 未来情景 | 三种可能监管路径及客户需要核对的事项；不自动改变区域预算，也不计入假设全球收费。 |
| 帮助与说明 | 快速上手、随当前结果更新的预设常见问题、能力范围及指南入口；预设问答不使用 AI；另提供默认未连接的本机 AI 接口。 |

顶栏支持 `中 / EN` 切换。原有视觉材质及动效保留；桌面顶栏换行、手机 KPI 单列和表格局部滚动用于解决裁切。当前计算快照可导出为 JSON，记录输入、来源、假设及输出。

## 4. A3 基准算例与计算修复

以下为界面中的 `MV DEMO-01`（内部数据名 `MV A3-BENCHMARK`）的固定示例输入，未进行外部核验。金额不能作为真实船舶完整账单。

| 算例 | 输入与结果 |
| --- | --- |
| EU ETS CO₂ 部分 | `(1,000 × 50% + 500 + 100) × €80 = €88,000`；EUA €60 / €100 时分别为 €66,000 / €110,000。 |
| UK ETS CO₂ 部分 | `(200 + 20) × £60 = £13,200`；UK 示例活动为 2026 年 7–12 月，英镑独立列示。 |
| FuelEU 2% 条件 | 范围内能源 164,000,000 MJ、强度 91.6 gCO₂e/MJ、目标 89.3368，余额 −371.1648 tCO₂e，单期基础金额 €237,191.27。 |
| FuelEU 6% 条件 | 固定其他输入，目标改为 85.6904，余额 −969.1744 tCO₂e，单期基础金额 €619,346.72；不是实际 2030 年账单预测。 |

本轮修复了正余额误计罚款、基准价格与总额不一致、组池缺口写死以及审计行未跟随船舶的问题。组池只使用缺口及假设供给内的数量，供给不足时保留剩余罚款。

EU/UK ETS 当前只计算 **CO₂ 部分**。CH₄/N₂O 缺失不等于零，完整 ETS 总额不可用。FuelEU 能源和 ETS 活动台账分别给定，未完成同一燃料台账的物理对账。

## 5. 模型假设、商业与课程内容

- 航速按固定航程近似；未验证 JIT 到港窗口。燃料能源占比对应的 0.26 / 0.32 系数为教学假设，不是通用认证燃料因子。
- FuelEU 盈余价格和可用量为商业情景，不代表取得真实组池资源。默认界面演示单期基础金额，完整灵活机制、认证与历史缺口仍需实际材料。
- GENCON、NYPE 与 50:50 按钮为**演示分摊**；85/15、18/82、50/50 不是标准租约或 BIMCO 默认法律比例。
- 客户价值基准：`120h × €40 + €2,000 − €4,800 − €600 = €1,400` 首年净收益。工时未必兑现为现金，不能重复计算顾问节省；无顾问节省时首年为 −€600。
- 三情景经营结果示例为 −€30,000 / −€5,000 / −€4,000，经营平衡为 70 / 67 / 57 个全年等效客户，不保证经营存续。
- 12 家访谈、3 家付费试点、平台自身 ESG 和人的工作量指标均是**验证计划**，不是已完成结果。课程映射依据取得的 Brief 缓存，最新课程通知仍需确认。

常见问题仍为预设模板；另有可配置本机 AI 接口，公开网页默认未连接。支持本机 CSV 台账，不代表核验；未提供实时 RAG、客户后台、专家审批或自动申报。快照不代表授权台账、人工批准或鉴证。[完整方法及官方来源](docs/LIGHT_EDITION.md)

## 6. 必要检查与版本回退

v4.0 完成 9 项核心算式回归及一次页面操作检查。v4.1.0 检查内容和布局。v4.2.0 完成原有 9 项与新增 5 项计算/约束检查，以及一次针对性的桌面/手机操作检查。

```sh
npm ci
npm test
# 保持本地服务器运行；使用已安装的 macOS Chrome：
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:browser
```

也可安装 Playwright Chromium 后省略 `CHROME_PATH`。检查输出保存在被 Git 忽略的 `test-results/`。

- [修改前 v3.4 固定版本](https://github.com/wwwwzzzzkkkk/Maritime-project/tree/light-v3.4-baseline-2026-10-15)
- [保留原 UI 的 v4.0 代码检查点](https://github.com/wwwwzzzzkkkk/Maritime-project/tree/light-v4.0-original-ui-2026-10-15)
- [回退说明](docs/ROLLBACK.md) · [更新记录](CHANGELOG.md) · [本轮验证与截图](docs/QA.md)

合并记录和标签保留历史；回退应新增恢复提交或回退 PR，不重写已发布历史。本站的固定网址显示 `main` 当前部署版本。

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
