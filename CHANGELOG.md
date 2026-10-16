# Change log

## v4.3.0 · 2026-10-16

- Baseline: `light-v4.2.1-baseline-2026-10-16` (`cdec884`). CSS-only consolidation is an independent commit `86d3f20`; controlled three-width screenshots are pixel-identical.
- Raise copy contrast via text-only tokens; minimum CSS text size 12px, body 15px, KPI values 30px. Preserve decorative colors/materials.
- Keep original glows/refraction. Pointer delegation/rAF and input scheduleRender coalesce work; no performance comparison/budget or speed-up claim. Popup binding is no longer repeated per render.
- Intentional local reading-region exception: flatten only while the pointer is in .table-wrap or .reference-list (baseline sticky drift ~2px); retain title/display-card tilt and hover highlights. Reduced motion disables tilt; quick adjuster remains flat.
- Move inline presentation to classes and dynamic widths to --w; remove permanent will-change and non-Leaflet !important. Keep a small unsupported-blur opaque-background fallback.
- 纠正初始评审：缓存原本已为 4.2.1；徽章正文用 secondary；当前 Chrome 顶栏是普通 blur，导航/KPI 使用折射。保留默认光斑与折射。
- 本阶段评估过清爽模式，按用户决定取消；未提供开关、存储或高对比度自动模式。性能对比与 GPU 成本评估也取消。
- Engine/shared data/Pro Max sources and all benchmark amounts remain unchanged. [Evidence](docs/verification/v4.3.0/README.md) · [Release notes](docs/releases/v4.3.0.md)


## v4.2.1 · 2026-10-16

- 基线 / Baseline: `light-v4.2.0-baseline-2026-10-16` (`05cd7de`).
- Move the unchanged numeric comparison into a full-width card with five core columns, expandable detail and a sticky first column. Keep allocation/recommendation/action in the right card.
- Fit the map to the current full route, use responsive height and vendor Natural Earth 50m countries with EU27/GBR styling by ADM0_A3.
- Use a signed change-ring scale: ±30% full, 3% minimum non-zero arc, zero hidden, accent down / warn up, with bilingual accessible disclosure.
- Default the primary trace open; open external links separately; fix target formatting and light-only course references/unused reset write.
- 表格、地图、比例环与答辩链接安全修正；计算引擎、默认金额、共享基础数据及 Pro Max 源码不变。
- [中英文发布说明 / Bilingual release notes](docs/releases/v4.2.1.md) · [评审核实 / Review findings](docs/REVIEW_STAGE1.md)


## v4.2.0 · 2026-10-15

- Expose editable base inputs, prices and operating/supply limits; keep draft/applied states explicit.
- Add extra-time and auxiliary-fuel accounting, six option families and conditional finite-search candidates with party allocations.
- Extend the draggable glass budget to desktop when original KPIs leave view.
- 新增基础输入、运营约束、航时与辅助燃油成本、六类方案和有条件的候选建议；电脑端支持同款玻璃预算浮窗。
- Preserve original effects, flat quick controls and unchanged default benchmarks; update complete bilingual documentation.
- [中英文详细说明 / Full bilingual notes](docs/releases/v4.2.0.md) · [GitHub Release](https://github.com/wwwwzzzzkkkk/Maritime-project/releases/tag/v4.2.0)


## v4.1.0 · 2026-10-15

- Reorganize the customer workflow around budgets, comparisons, calculation evidence, future scenarios and help.
- Show demo/data-period/CO₂ limitations prominently; retain formula/source disclosures and live mobile budgets.
- Move course, unit-economics, venture-risk and validation/ESG plans into public repository documents with an original-content archive.
- Preserve bilingual READMEs/guides, original glass/motion design and the flat quick adjuster; leave calculation engine and Pro Max unchanged.
- 客户页面改为预算、方案、依据、未来与帮助；课程及商业材料移入公开项目文档，保留全部版本记录。
- [完整中英文更新说明 / Full bilingual notes](docs/releases/v4.1.0.md) · [GitHub Release](https://github.com/wwwwzzzzkkkk/Maritime-project/releases/tag/v4.1.0)


## Quick adjuster motion · 2026-10-15

- Remove pointer tilt and spatial parallax from the overview quick adjuster and its nested controls, retaining glass styling and pointer highlights.

## Mobile live budget window · 2026-10-15

- Show a compact glass budget window when original mobile budget cards leave view, including in other modules.
- Reuse the existing calculated amounts; keep EUR and GBP separate and update with every input change.
- Support touch dragging, keyboard movement, collapse/expand and position reset; hide when original cards return to view.
- Keep desktop layout and existing visual effects intact. Add bilingual quick-start instructions.

## Mobile layout follow-up · 2026-10-15

- Fit all five mobile tabs using short bilingual names while retaining full accessible names and the original sliding pill.
- Keep multi-row vessel/context content inside a padded rounded glass container.
- Show shared budget cards on mobile overview only; keep scenario controls available in the IMO view.
- Position selected module content below the sticky header immediately, retaining the original panel effects.
- Desktop layout, calculations and original materials/effect definitions are unchanged.

## Light update · 2026-10-15

- Retain the original glass UI, colors, fonts, 3D pointer tilt, sliding navigation, transitions, stagger and chart replays, as requested.
- Adjust header wrapping, narrow-screen cards and table scrolling.
- Fix positive-balance penalties, baseline consistency, limited pooling, dynamic audit rows and IMO/regional parameter coupling.
- Label demo data, CO₂-only subtotals, contract examples and unverified capabilities accurately.
- Add official references, market/human-workload/ESG plans and a current-state JSON snapshot.
- Queue hidden-map camera work until visible, retaining the original visible animation.
- Keep the original version under `light-v3.4-baseline-2026-10-15`; use separate commits and a final tag for rollback.

The other edition and its shared data are unchanged. Verification is deliberately limited to necessary math checks and one page smoke check.
