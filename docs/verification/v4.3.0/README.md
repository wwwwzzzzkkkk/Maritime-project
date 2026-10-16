# v4.3.0 验收材料 / Verification

Baseline: `light-v4.2.1-baseline-2026-10-16` (`cdec884`). Chrome only.

## 调整后的范围 / Final scope

评估过清爽模式，按用户决定取消。本版没有风格开关、data-style=clean、localStorage、prefers-contrast 自动回退或相关预留。性能对比、三次中位数、GPU 成本评估和性能预算也按用户决定取消，不提供速度提升结论。旧的异常记录仅保留在本地 test-results，不纳入发布材料。
Clean mode and performance comparison were cancelled by the user. No clean-mode UI/storage/automatic high-contrast mode, GPU-cost claim or speed-up claim is delivered.

## 计算与受保护文件

| 指标 | v4.2.1 | v4.3.0 |
| --- | ---: | ---: |
| EU ETS CO₂ | €88,000 | €88,000 |
| UK ETS CO₂ | £13,200 | £13,200 |
| FuelEU 单期 | €237,191.27 | €237,191.27 |
| FuelEU 6% 条件 | €619,346.72 | €619,346.72 |
| 船东 85% | €276,413 | €276,413 |
| 租家 15% | €48,779 | €48,779 |

`npm test`: 14 tests, 14 pass, 0 fail. [真实完整输出](npm-test.txt)。受保护五文件的 `git diff --exit-code` 返回 0、输出为空；[命令和实际结果](reliability.json)。没有再次计算哈希。

## 截图像素取样

| 场景 | 改前前景 / 背景 / 字号 / 比值 | 改后前景 / 背景 / 字号 / 比值 | 改前→改后取样点（视口 CSS px） |
| --- | --- | --- | --- |
| KPI 说明 | `#64748b` / `#f8fbff` / 11.5px / **4.585:1** | `#475569` / `#f8fbff` / 12px / **7.301:1** | (141.2, 370.9) → (142.9, 393.7) |
| 徽章 | `#334155` / `#fefeff` / 10.5px / **10.273:1** | `#334155` / `#fefeff` / 12px / **10.273:1** | (309.7, 286.1) → (167.6, 310.6) |
| 滑块提示 | `#64748b` / `#f9fdfe` / 11px / **4.648:1** | `#475569` / `#f8fcfe` / 12px / **7.342:1** | (197.2, 624.6) → (204.2, 651.2) |
| 台账首项 | `#0f172a` / `#eff9ff` / 12.5px / **16.717:1** | `#0f172a` / `#eff9ff` / 12.5px / **16.717:1** | (487.2, 650.9) → (487.2, 639.6) |
| 公式文字 | `#0284c7` / `#fdfeff` / 11px / **4.056:1** | `#0369a1` / `#fdfeff` / 12px / **5.876:1** | (499.9, 604.4) → (504.4, 630.7) |
| 展开摘要 | `#0284c7` / `#f7fcff` / 13px / **3.963:1** | `#0369a1` / `#f7fcff` / 13px / **5.742:1** | (177.1, 508.0) → (177.1, 533.1) |
| 页脚 | `#64748b` / `#e5eef6` / 11.5px / **4.055:1** | `#475569` / `#e5eef6` / 12px / **6.456:1** | (380.2, 958.4) → (393.1, 957.7) |

方法：Playwright 在 DPR1、1440×1000 Chrome 下对元素截图，再临时只隐藏文字墨迹（包括文字阴影），保留元素尺寸、位置、背景、玻璃与底层内容。取第一行文字中心附近 3×3 像素中位 RGB，以实际前景色按 WCAG sRGB 相对亮度公式计算。不是仅用令牌估算；两个时间点的位置可因字号/排版变化而不同。

上述“台账首项”取样是首项文本，不冒称表头。固定底色公式复算仍为：#64748b / #edf1f7 = 4.198:1；#0284c7 / white = 4.095:1。实际玻璃上的 KPI 说明与徽章原本已经过线，不能把所有小字笼统判为低对比度。只保证这些取样位置的结果，不据此认证整个页面所有背景/状态。

[坐标、3×3 最低比值与取样文件](contrast-pixels.json) · [改前文字/背景 PNG](baseline) · [改后文字/背景 PNG](after)

## axe

axe-core 4.10.3，规则标签 wcag2a/wcag2aa/wcag21aa。axe 没有官方百分制评分，未虚构分数。

| | 改前 | 改后 |
| --- | ---: | ---: |
| 已确定违规规则 | 0 | 0 |
| 通过规则 | 28 | 28 |
| 需人工复核规则 | 3 | 3 |
| color-contrast 待复核节点 | 124 | 125 |

违规列表均为空。待复核规则为 aria-prohibited-attr（1 节点）、color-contrast、link-in-text-block（1 节点）。玻璃/透明背景使自动颜色判断不完整；像素取样补充关键位置，但不是全站认证。
[改前原始 axe 结果](baseline/results.json) · [改后原始 axe 结果](after/results.json)

## CSS 整理与交互

- 纯 CSS 整理提交：`86d3f20`，只改 styles/main.css；随后独立提交文字与交互修改。
- 统一为新页面、固定动画时刻并等待地图原有飞行动画结束后，375/768/1440 的整理前后截图不同像素数均为 0。[结果](css-consolidation.json)。首次截图受到先前指针/地图动画状态影响，未用该差异判断 CSS 改动，也未为此改变产品动效。
- 中英文×三个宽度显示正常，没有整页横向溢出；宽表仍在自身容器内滚动。最终相册在 [截图索引](../../previews/v4.3.0/README.md)。预发布截图的页脚仍指向先前已存在的 Release；正式发布后单独启用新链接。
- 180 帧逐帧 input 后显示 €132,000，通过；不作耗时或性能对比。
- 阅读区优先采用小例外：进入 .table-wrap/.reference-list 后卡片平滑归零，标题仍倾斜。sticky 相对偏移实测 0px；KPI ry=3.74°（原映射预期 3.75°，坐标舍入容差内）。
- reduced-motion 完全禁用指针倾斜；快速调节器仍保持平面；弹窗在打开时计算内容、打开期间跟随输入更新，180 帧输入未增加 bindPopup 次数。
- Pro Max 加载/交互冒烟通过。使用未修改的本地 Leaflet 1.9.4 字节代替其 CDN 请求；未测 CDN 可达性。没有应用 pageerror/console error；主动阻断外网资源产生的 net::ERR_FAILED 不作为应用错误。
- 不支持 backdrop-filter 的回退只有一个 4 行 @supports not 块；Chrome 本机支持模糊，未冒称测试过不支持模糊的实际浏览器。

## 核实与纠正

1. 初始缓存判断已过时：阶段开始前第一方资源已为 4.2.1，不是 4.0。
2. 徽章正文实际为 --text-secondary，而非低对比度 muted/accent；公式等组件才需针对性加深。
3. 当前 Chrome 顶栏最终使用普通 blur；导航/KPI 使用折射。保留默认光斑与折射，不评估 GPU 成本、不默认暂停或删除。

## 缓存版本实际替换

- index.html: tokens.css、main.css、data-and-i18n.js、app.js → ?v=4.3.0。
- js/app.js: planning-ui.mjs、compliance-engine.mjs、mobile-budget.mjs、light-data.mjs imports → ?v=4.3.0。
- js/planning-ui.mjs: option-planner.mjs import → ?v=4.3.0。
- js/option-planner.mjs: compliance-engine.mjs import → ?v=4.3.0。
- Node 测试中引用 planner 的查询版本同步；未改计算引擎或共享数据的文件内容。

## 人工确认

建议在答辩设备上看更大的字与换行是否合适，以及表格/来源正文内平稳、标题区仍倾斜的局部行为。axe 的三类 incomplete 项仍需人工复核。只测 Chrome，没有跨浏览器、真实离线或无障碍认证。
