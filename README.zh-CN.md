# MAREG — 海事多法规合规成本分析与数字孪生决策平台（中文文档）

<p align="left">
  <a href="./README.md">🌐 中英双语主文档 (Bilingual README.md)</a> &nbsp;|&nbsp;
  <a href="./README.en.md">🇬🇧 English Version (README.en.md)</a>
</p>

> **南洋理工大学（NTU）海事研究硕士课程 · MT6503 小组创业项目（Track B：合规与监管科技 RegTech）**  
> **GitHub 仓库地址：** [https://github.com/wwwwzzzzkkkk/Maritime-project](https://github.com/wwwwzzzzkkkk/Maritime-project)  
> **🌐 在线演示网址（浅灰液态玻璃 3D 版）：** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)  
> **🌐 在线演示网址（UI/UX Pro Max 工作台版）：** [https://wwwwzzzzkkkk.github.io/Maritime-project/index-pro-max.html](https://wwwwzzzzkkkk.github.io/Maritime-project/index-pro-max.html)  
> **项目名称：** `Maritime-project` · **角色分工：** 第 10 号成员（APP 与 AI 原型开发负责人）

---

## 1. 项目定位与双版本架构

本系统面向运营 5–20 艘船舶的中小型航运企业（SME），提供跨 **EU ETS、FuelEU Maritime、UK ETS 及 IMO 净零框架（NZF）** 的分航段白盒合规成本核算、数字孪生航次推演、租约碳成本分摊（GENCON / NYPE / Blue GA）与反漂绿双轨监控。

仓库内包含两套共享同一底层计算引擎（[`js/data-and-i18n.js`](./js/data-and-i18n.js)）的独立前端版本，可通过页面右上角按钮一键互跳：

1. **[`index.html`](./index.html) —— 浅灰日间液态玻璃与空间 3D 视差版（`v3.4`）**
   - 采用建筑浅冷灰画布（`#edf1f7`）与 `#0f172a` 深岩灰高对比度字体，结合 SVG 斯涅尔光学折射滤镜（`#apple-liquid-refract`）、随光标法线旋转的 `1.25px` 斜切高光边框、三维卡片俯仰/横滚视差（`rotateX / rotateY`）与 Esri `World_Light_Gray_Base` 浅色真实海图。
2. **[`index-pro-max.html`](./index-pro-max.html) —— UI/UX Pro Max 双栏舰桥指挥工作台版（`v1.0`）**
   - 严格遵循 `ui-ux-pro-max` 10 项设计优先级规范，采用 **左侧 `320px` 常驻数字孪生推演台 + 右侧自适应高密度主舞台** 分屏架构。支持在任意视图拖动滑块实时重算全局数据，配备 **右侧滑出式白盒公式实时验算抽屉（`f(x) A3`）**、键盘数字键 `1–5` 视图快捷键以及苏伊士/直布罗陀 **300 海里防碳泄漏转运半径圈**。

---

## 2. 快速启动

直接双击打开 [`index.html`](./index.html) 或 [`index-pro-max.html`](./index-pro-max.html)，或在项目目录下启动本地静态服务：

```bash
python3 -m http.server 8080
```

---

## 3. 核心核算指标（对齐报告附录 A1 / A2 / A3）

- **EU ETS 年度账单（欧元单列）**：`E1 (500t) + E2 (500t) + E3 (100t) = 1,100 tCO₂ × €80 = €88,000`（`€60 / €100` 敏感性区间：`€66,000 / €110,000`），内置 2026 `CH₄/N₂O` 缺失数据门禁。
- **UK ETS 国内海事账单（英镑单列）**：`U1 (200t) + U2 (20t) = 220 tCO₂ × £60 = £13,200`（严格以英镑单列，不混加未授权汇率）。
- **FuelEU Maritime 强度罚款（欧元单列）**：`164,000,000 MJ` 欧盟能源、`91.6 gCO₂e/MJ` 实际强度下，`2025 (-2% · 89.3368)` 罚款为 **`€237,191.27`**；`2030 (-6% · 85.6904)` 条件对比罚款为 **`€619,346.72`**。
- **附录 A1 客户 ROI 模型（5 船船队）**：年节省人工 `120h × €40 = €4,800` + 可取消外部顾问费 `€2,000` = 年总毛收益 `€6,800`；扣除年费 `€4,800` 后经常性年净收益 **`€2,000`**，扣除首年导入费 `€600` 后首年净收益 **`€1,400`**。
