# MAREG — 海事多法规合规成本分析与数字孪生决策平台（中文文档）

[中英双语主文档](README.md) · [English documentation](README.en.md)

**🌐 在线运行网址：** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)

## 1. 项目简介与版本

**MAREG（Maritime-project）** 是南洋理工大学海事研究硕士课程 **MT6503 Group Venture Project，Track B：合规与监管科技（Compliance & RegTech）** 的交互式教学原型。项目以管理约 **5–20 艘船舶**的中小型船东及船舶管理公司为目标客户假设，用于解释多制度预算、航次情景、合同分摊与创业风险；客户需求和付费意愿仍需验证。

| 入口 | 定位与当前状态 |
| --- | --- |
| [`index.html`](index.html) | 默认浅色版。保留原有浅灰液态玻璃、SVG 折射效果、鼠标高光、3D 卡片倾斜、导航滑块、切页及图表回放动效；本轮主要修正计算、内容与响应式排版。 |
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

然后访问 [http://127.0.0.1:48173/](http://127.0.0.1:48173/)。默认页使用 ES modules，需要通过 HTTP 访问，不能直接双击文件运行。没有构建步骤或后台服务；Leaflet 1.9.4 已随仓库保存，Esri 底图、地理底色与原有 Google Fonts 仍需要网络。

## 3. 五个功能模块

| 模块 | 功能及证据边界 |
| --- | --- |
| 概览与航线 | 当前船舶、分制度预算、示例地理航线与活动台账；范围为预设教学输入，不自动判断真实法律适用性。 |
| 数字孪生与租约 | 比较未调整基准、当前组合与假设供给内的 FuelEU 组池；EUA、航速、燃料与合同分摊用于条件推演。 |
| 白盒审计与反漂绿 | 跟随当前船舶与输入展开公式；并列财务变化与范围内 WtW 模型变化，避免把省钱直接表述为实际减排。 |
| IMO 情景压力 | 原样通过、修订通过、持续僵局三种创业压力测试；切换情景不再暗改区域法规目标与 EUA 价格。 |
| 解释与商业模型 | 当前结果的预设解释、官方法规链接、A1 客户价值、A2 风险，以及市场、人的负担与平台自身 ESG 测量计划。 |

顶栏支持 `中 / EN` 切换。原有视觉材质及动效保留；桌面顶栏换行、手机 KPI 单列和表格局部滚动用于解决裁切。当前计算快照可导出为 JSON，记录输入、来源、假设及输出。

## 4. A3 基准算例与计算修复

以下为 `MV A3-BENCHMARK` 的固定教学输入，未进行外部核验。金额不能作为真实船舶完整账单。

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

解释为预设模板，未接入真实 AI、RAG、专家审批、真实数据导入、后台或自动申报。快照不代表授权台账、人工批准或鉴证。[完整方法及官方来源](docs/LIGHT_EDITION.md)

## 6. 必要检查与版本回退

本轮完成 9 项核心算式回归及一次页面操作检查，按要求未扩大为大范围审计。

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
