# MAREG — 海事多法规合规成本分析与数字孪生决策平台 | Multi-Regime Maritime Compliance & Digital Twin Platform

<p align="left">
  <a href="#-中文说明-chinese-version"><strong>🇨🇳 中文说明 (Chinese)</strong></a> &nbsp;|&nbsp;
  <a href="#-english-documentation"><strong>🇬🇧 English Documentation</strong></a> &nbsp;|&nbsp;
  <a href="./README.zh-CN.md">独立中文文档 (README.zh-CN.md)</a> &nbsp;|&nbsp;
  <a href="./README.en.md">Standalone English (README.en.md)</a>
</p>

> **NTU MSc Maritime Studies · MT6503 Group Venture Project — Track B: Compliance & RegTech**  
> **GitHub Repository:** [https://github.com/wwwwzzzzkkkk/Maritime-project](https://github.com/wwwwzzzzkkkk/Maritime-project)  
> **🌐 在线访问网址 (Live Web URL — 浅灰液态玻璃 3D 版):** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)  
> **🌐 在线访问网址 (Live Web URL — UI/UX Pro Max 工作台版):** [https://wwwwzzzzkkkk.github.io/Maritime-project/index-pro-max.html](https://wwwwzzzzkkkk.github.io/Maritime-project/index-pro-max.html)  
> **Project Name:** `Maritime-project` · **Developer Role:** Member 10 (APP & AI Prototype Developer)

---

# 🇨🇳 中文说明 (Chinese Version)

## 1. 项目简介与双版本架构

本项目（**MAREG · `Maritime-project`**）是为南洋理工大学（NTU）海事研究硕士课程 **MT6503（Track B：合规与监管科技 RegTech）** 开发的交互式 Web 原型系统，面向中小型航运企业（SME，5–20 艘船队），解决跨 **EU ETS、FuelEU Maritime、UK ETS 及 IMO 净零框架（NZF）** 的碎片化碳合规预算、数字孪生航次推演、租约分摊（GENCON / NYPE / Blue GA）及反漂绿双轨审计痛点。

仓库内同时提供 **两套完整且可一键互跳的前端交互版本**，共享同一套确定性白盒公式计算引擎（[`js/data-and-i18n.js`](./js/data-and-i18n.js)）：

| 版本入口文件 | 设计语言与定位 | 核心交互与视觉亮点 |
| :--- | :--- | :--- |
| **[`index.html`](./index.html)**<br>*(v3.4 日间液态玻璃 3D 版)* | **Apple Daylight Liquid Glass & Spatial 3D Tilt**<br>（建筑浅冷灰背景 + 日间水晶液态玻璃 + 空间 3D 视差） | • 浅冷灰坐标网格画布（`#edf1f7`）搭配 `#0f172a` 高对比深岩灰文字<br>• SVG 斯涅尔光学折射滤镜（`#apple-liquid-refract`）与随光标法线旋转的 `1.25px` 斜切高光边框<br>• 实时三维俯仰/横滚卡片视差（`rotateX / rotateY`）与核心数字分层悬浮投影<br>• 免 Key 真实 Esri 浅灰海图（`World_Light_Gray_Base`）与五大模块组合切换动效 |
| **[`index-pro-max.html`](./index-pro-max.html)**<br>*(v1.0 Pro Max 工作台版)* | **UI/UX Pro Max Split-Pane Command Workbench**<br>（深色分屏舰桥指挥台 + 常驻数字孪生推演栏 + 白盒抽屉） | • 严格遵循 `ui-ux-pro-max` 10 项优先级规范（WCAG AA+ 暗色对比度、全内联 SVG 矢量图标）<br>• **左侧 `320px` 常驻数字孪生推演台**：在任意视图拖动滑块，右侧海图/审计表/双环仪表同步实时重算<br>• **右侧滑出式白盒公式验算抽屉（`f(x) A3`）**：实时展开每一步法规公式的当前参数代入过程<br>• 支持键盘快捷键 `1–5` 秒切五大功能模块、`Esc` 关闭验算抽屉，海图内置 300 海里防规避转运圈 |

---

## 2. 快速运行指南

无需安装任何后端依赖或申请地图 API Key，支持以下任一方式直接启动：

1. **浏览器直接双击打开**：在 Finder / 资源管理器中直接双击 [`index.html`](./index.html) 或 [`index-pro-max.html`](./index-pro-max.html)。
2. **本地静态服务器启动（推荐）**：
   ```bash
   python3 -m http.server 8080
   ```
   随后在浏览器访问 `http://localhost:8080/index.html` 或 `http://localhost:8080/index-pro-max.html`。

---

## 3. 核心功能模块与报告对齐（Appendices A1, A2, A3）

1. **中英双语瞬时切换（`中 / EN`）**
   - 顶栏右侧内置中英切换开关，一键实时切换五大模块标题、表格表头、海图弹窗、法规状态标签及 AI 问答解释。
2. **白盒确定性多法规核算引擎（严格复现报告附录 A3 基准）**
   - 以 **10,000 GT 多用途远洋货船（`MV A3-BENCHMARK`）** 为基准船型（另含课件 60,000 DWT 巴拿马散货船 `MV PACIFIC HORIZON` 与生物燃料支线集装箱船 `MV NORDIC BREEZE`）：
     - **EU ETS（欧元单列）**：`E1 进出欧盟 (1,000t × 50% = 500t) + E2 欧盟内 (500t × 100% = 500t) + E3 欧盟港内停泊 (100t × 100% = 100t) = 1,100 tCO₂ × €80 = €88,000`（同步展示 `€60 / €100` 敏感性区间 `€66,000 / €110,000`）。内置 **2026 `CH₄/N₂O` 数据缺失门禁（Data Hygiene Gate）**，严禁将缺失气体默认归零。
     - **UK ETS（英镑单列）**：`U1 英国国内航段 (200t) + U2 英国港内停泊 (20t) = 220 tCO₂ × £60 = £13,200`（严格以英镑 `GBP £` 独立列示，绝不与欧元账单擅自按固定汇率混加）。
     - **FuelEU Maritime（全生命周期 WtW 强度）**：在 `164,000,000 MJ` 欧盟能源与 `91.6 gCO₂e/MJ` 实际强度下，对比 `2025–2029 (-2% · 89.3368)` 目标得出 `-371.165 t` 赤字与 **`€237,191.27` 罚款**；对比 `2030 (-6% · 85.6904)` 条件得出 `-969.174 t` 赤字与 **`€619,346.72` 罚款**。
3. **跨管辖区真实 GIS 数字孪生海图**
   - 支持 **亚欧全航线（`CNSHA → SGSIN → EGPSD → MAPTM → NLRTM`）**、**欧英北海核心合规区（`EU 100% + UK ETS`）** 与 **苏伊士/直布罗陀 300 海里防碳泄漏转运港（`EGPSD / MAPTM`）** 三大视角平滑切换与航段过滤。
4. **数字孪生推演与租约碳成本分摊器（Section 3 & Week 8）**
   - 支持调节 **EUA 碳价**、**JIT 准时到港降速（三次方定律 $P \propto v^3$）**、**生物燃料/绿甲醇掺烧比例**（掺烧 `>20%` 自动触发港口加注供给瓶颈提示）与 **授权 FuelEU 组池（Pooling）抵扣**。
   - 支持切换 **GENCON 航次租船（船东 85% / 租家 15%）**、**NYPE 期租 + BIMCO 条款（船东 18% / 租家 82%）** 与 **Blue GA 50:50 共担条款**。
5. **反身检验与防漂绿双轨监控（Section 4 · 占评分权重 25%）**
   - 双环仪表并列呈现 **财务合规支出变动（%）** 与 **物理全生命周期 WtW 排放变动（%）**；当仅通过外部组池或碳价变动降低账单而本船物理排放未降时，自动触发琥珀色反漂绿预警。
6. **IMO 三情景压力测试与附录 A1/A2 商业治理模型（Section 5）**
   - 涵盖 **情景 1：原样通过（70 家客户盈亏平衡）**、**情景 2：修订通过（67 家盈亏平衡）**、**情景 3：持续僵局（57 家盈亏平衡）**，以及 **附录 A1 客户投资回报率计算器**（年省 `120h × €40 + €2,000 = €6,800` 毛收益，扣除 `€4,800` 年费与 `€600` 首年导入费后首年净收益 `€1,400`）和 **附录 A2 五大风险登记册**。

---

# 🇬🇧 English Documentation

## 1. Overview & Dual-Edition Architecture

**MAREG (`Maritime-project`)** is an interactive decision-support web prototype developed for the Nanyang Technological University (NTU) MSc Maritime Studies course **MT6503 (Track B: Compliance & RegTech)**. Designed for small-to-medium shipping enterprises (SMEs operating 5–20 vessels), it resolves multi-jurisdictional regulatory fragmentation across **EU ETS, FuelEU Maritime, UK ETS, and the pending IMO Net-Zero Framework (NZF)** while preventing greenwashing and charterparty disputes.

This repository ships with **two complete, one-click switchable frontend editions** powered by a shared deterministic calculation engine ([`js/data-and-i18n.js`](./js/data-and-i18n.js)):

| Entry File | Design Paradigm | Key Architectural & Interactive Highlights |
| :--- | :--- | :--- |
| **[`index.html`](./index.html)**<br>*(v3.4 Daylight Liquid Glass 3D)* | **Apple Daylight Liquid Glass & Spatial 3D Tilt**<br>(Cool Light-Gray Canvas + Translucent Crystal Glass + 3D Parallax) | • Cool architectural silver-gray canvas (`#edf1f7`) paired with high-contrast `#0f172a` obsidian slate typography<br>• Inline SVG Snell's-law optical displacement filter (`#apple-liquid-refract`) + angle-sensitive `1.25px` masked specular bevel rims<br>• Real-time 3D perspective pitch/roll tilt (`rotateX / rotateY`) with multi-plane Z-axis foreground parallax on KPI numbers and gauges<br>• Keyless Esri `World_Light_Gray_Base` interactive GIS maritime map + 5-effect choreographed tab transitions |
| **[`index-pro-max.html`](./index-pro-max.html)**<br>*(v1.0 Pro Max Workbench)* | **UI/UX Pro Max Split-Pane Command Workbench**<br>(Dark Tactical Bridge Console + Persistent Twin Dock + Audit Drawer) | • Built strictly to the `ui-ux-pro-max` 10-priority design intelligence specification (WCAG AA+ dark contrast, 100% crisp inline SVG icons)<br>• **Persistent 320px Left Digital Twin Telemetry Dock**: adjust any slider while viewing any module and watch all tables/maps/gauges recompute live<br>• **Slide-Over White-Box Formula Trace Drawer (`f(x) A3`)**: inspect step-by-step live variable substitution and legal citations on demand<br>• Keyboard shortcuts (`1–5` to switch views, `Esc` to close drawer) + `<300nm` anti-evasion radius rings on the GIS map |

---

## 2. Quick Start

No backend dependencies, build steps, or map API keys are required:

1. **Direct Browser Launch**: Double-click [`index.html`](./index.html) or [`index-pro-max.html`](./index-pro-max.html) in Finder / File Explorer.
2. **Local HTTP Server (Recommended)**:
   ```bash
   python3 -m http.server 8080
   ```
   Then open `http://localhost:8080/index.html` or `http://localhost:8080/index-pro-max.html`.

---

## 3. Core Capabilities & Venture Report Alignment (Appendices A1, A2, A3)

1. **Instant Bilingual Toggle (`中 / EN`)**
   - Top-right language switch translates all 5 modules, tables, map popups, legal status badges, and AI explanations without page reload or layout shift.
2. **Deterministic Multi-Regime Calculation Engine (`Appendix A3` Verified)**
   - Anchored by the **10,000 GT General Cargo Reference Vessel (`MV A3-BENCHMARK`)**, alongside the Lecture 3/8 **60,000 DWT Panamax Bulker (`MV PACIFIC HORIZON`)** and biofuel-blended feeder (`MV NORDIC BREEZE`):
     - **EU ETS (EUR Only)**: `Leg E1 Extra-EU (1,000t × 50% = 500t) + Leg E2 Intra-EU (500t × 100% = 500t) + Leg E3 EU Berth (100t × 100% = 100t) = 1,100 tCO₂ × 100% × €80 = €88,000` (with `€60 / €100` sensitivity band `€66,000 / €110,000`). Enforces the **2026 `CH₄/N₂O` Data Hygiene Gate** (missing gases are never defaulted to zero).
     - **UK ETS (GBP Separate)**: `Leg U1 UK Domestic (200t) + Leg U2 UK Berth (20t) = 220 tCO₂ × £60 = £13,200` (strictly isolated in `GBP £` with zero unauthorized FX blending).
     - **FuelEU Maritime (WtW Lifecycle Intensity)**: At `164,000,000 MJ` EU energy and `91.6 gCO₂e/MJ` actual intensity, computes the `2025–2029 (-2% · 89.3368)` compliance deficit (`-371.165 t` → **`€237,191.27` penalty**) and `2030 (-6% · 85.6904)` condition comparison (`-969.174 t` → **`€619,346.72` penalty**).
3. **Interactive Multi-Jurisdiction GIS Route Digital Twin**
   - One-click camera presets across **Full Eurasia Corridor (`CNSHA → NLRTM`)**, **North Sea EU 100% + UK ETS Core**, and **Suez (`EGPSD`) & Gibraltar (`MAPTM`) `<300nm` Neighboring Transshipment Port Anti-Evasion Zones**.
4. **Digital Twin Simulation & Charterparty Cost Allocation (`Section 3` & `Week 8`)**
   - Live sliders for **EUA Carbon Price**, **JIT Speed Reduction (Cube Law $P \propto v^3$)**, **Certified Biofuel / e-Methanol Blend** (triggers **Green Fuel Supply Bottleneck Alert** above 20%), and **Verified FuelEU Pooling Surplus**.
   - Compares statutory surrender vs. contractual reimbursement across **GENCON Voyage Charter (85% / 15%)**, **NYPE Time Charter + BIMCO Clauses (18% / 82%)**, and **Blue GA 50:50 Rider**.
5. **Reflexive Anti-Greenwashing Dual-Track Monitor (`Section 4` — 25% Rubric Weight)**
   - Simultaneously tracks **Financial Compliance Cost Delta (%)** alongside **Physical Well-to-Wake (WtW) Emissions Delta (%)**, issuing an explicit anti-greenwashing warning whenever financial liabilities drop via external pooling without shipboard physical emissions reduction.
6. **IMO 3-Scenario Stress-Test Matrix & Appendices A1/A2 Governance (`Section 5`)**
   - Evaluates client compliance exposure and platform break-even across **Scenario 1: Adopted As-Is (70 clients B/E)**, **Scenario 2: Amended (67 clients B/E)**, and **Scenario 3: Continued Deadlock (57 clients B/E)**, paired with the interactive **Appendix A1 5-Ship SME ROI Model** (`120h × €40 + €2,000 = €6,800` gross value → `€2,000` recurring net benefit / `€1,400` Year-1 net benefit) and **Appendix A2 Risk Register**.

---

## 4. Repository Structure | 项目文件结构

```text
Maritime-project/
├── index.html               # v3.4 Apple Daylight Liquid Glass + Spatial 3D Tilt Edition (Light-Gray)
├── index-pro-max.html       # v1.0 UI/UX Pro Max Split-Pane Command Workbench Edition (Dark)
├── styles/
│   ├── tokens.css           # Daylight Liquid Glass & Slate Typography Design Tokens (v3.4)
│   ├── main.css             # Liquid Glass Refraction, 3D Tilt & Choreographed Tab Motion (v3.4)
│   └── pro-max.css          # UI/UX Pro Max Master Tokens, Split-Pane & Audit Drawer Styles (v1.0)
├── js/
│   ├── data-and-i18n.js     # Bilingual Data Store (ZH/EN) & Appendix A1/A2/A3 Reference Dataset
│   ├── app.js               # Core Engine, Esri Light-Gray GIS Map & 3D Tilt Controller (for index.html)
│   └── app-pro-max.js       # Workbench Engine, Persistent Twin Dock & Formula Trace Drawer (for index-pro-max.html)
├── design-system/
│   └── MASTER.md            # UI/UX & Design Token Architecture Specification
├── README.md                # Bilingual Documentation (Chinese & English)
├── README.zh-CN.md          # Standalone Chinese Documentation
└── README.en.md             # Standalone English Documentation
```
