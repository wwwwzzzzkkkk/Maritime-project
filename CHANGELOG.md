# Change log

## v4.7.2 · 2026-10-22

- Baseline: `light-v4.7.1-baseline-2026-10-22` (b999492).
- 二级弹窗打开220ms淡入＋轻移／缩放，关闭150ms淡出；原生display／overlay过渡保留退出画面，按钮、遮罩、Esc与程序关闭一致。
- Reduced-motion is immediate. Closing forms are inert, drafts remain mounted, reset waits for opacity exit, and interrupted reopen cannot execute a stale reset. Focus returns without scrolling the page.
- 更新项目完成度说明：核心演示链路已实现，完整气体／年度核验、全面政策变更、真实方案可行性／结果和商用保障仍需推进；不新增界面板块。
- Preserve glass, other card effects, protected sources and six benchmarks. UI/cache/snapshot/report4.7.2; backend/knowledge4.7.1 and engine light-4.2.0 unchanged. No backend deployment, dependency/build/hash/performance audit.
- [Release](docs/releases/v4.7.2.md) · [完成度 / Status](docs/PROJECT_STATUS.md) · [实际验收 / Evidence](docs/verification/v4.7.2/README.md)

## v4.7.1 · 2026-10-22

- Baseline: `light-v4.7.0-baseline-2026-10-22` (c20b2c2).
- 进入未来情景自动读取四个配置官方页：EU ETS、FuelEU、UK ETS和特定IMO会议资料；原文节选、实际获取时间、可用原站日期及失败分别显示，成功缓存15分钟。UK使用官方Content API；不接受任意URL抓取。
- Use a source to prefill an unsaved planning draft, without inventing publication dates, prices, legal status or approval. Saved retrieval provenance survives workspaces/reports and is distinguished from applicability verification in AI context.
- 船舶、政策／复核、运营输入、台账、规划条件、行动生成／说明八类人工表单改为原生二级弹窗；结果、已应用假设和日常滑块留在主页面。保留字段、范围、步长、确认门控与未提交草稿。
- Existing glass/motion/flat exceptions remain. Native focus/Escape/close behavior, valid-save return and input-tag jumps are preserved. No new dependencies, build tools, hash or performance audit.
- UI／缓存／报告／快照／知识4.7.1；五个受保护文件及六项基准不变，引擎light-4.2.0。
- [Release](docs/releases/v4.7.1.md) · [实际验收 / Evidence](docs/verification/v4.7.1/README.md) · [Sources](docs/OFFICIAL_SOURCES.md)

## v4.7.0 · 2026-10-22

- Baseline: `light-v4.6.0-baseline-2026-10-22` (0c21aa9).
- 已有政策记录新增“AI解释影响”，进入同一个助手，连接“政策条件→船队成本→经营建议”；没有增加网页模块。
- Selected-policy text/source plus anonymous stored-fleet amounts can be previewed and sent only after fresh explicit consent. No whole-workspace/raw-ledger/profile/reviewer-identity attachment; no automatic request, policy retrieval, budget change or action execution.
- 服务端校验边界、剔除额外字段并重算EUR／GBP独立合计；无数值条件保留null，不能当作零。用户来源标注未联网核验，建议按影响／建议／待核组织，不编造数字和实施效果。
- Answer staleness follows saved policy/fleet inputs; removing linked records blocks sending. Returning to vessel Q&A clears context/question/consent; original contracts remain supported.
- UI／缓存／快照／报告／知识4.7.0，引擎light-4.2.0；五个受保护文件及六项基准保留。玻璃、动效、既有平面例外保留。No dependency/build/hash/performance work.
- [Release](docs/releases/v4.7.0.md) · [实际验收 / Evidence](docs/verification/v4.7.0/README.md)

## v4.6.0 · 2026-10-21

- Baseline: `light-v4.5.2-baseline-2026-10-21` (4b6e937).
- 船队最多20份独立快照，唯一编号、资料编辑、明确载入／更新及EUR／GBP分列汇总；2026年度完整性待核，混合2%／6%条件提示可比性。
- Up to40 manual policy-evidence records: HTTPS source, dates, user-entered status, all/specified-vessel scope, explicit numeric conditions and self-entered second-person review. Evidence without conditions has unknown cost impact; no live retrieval or automatic budget/rule changes.
- 最多80条行动，保留生成时输入与政策版本，展示两币种、航时与WtW模型差异，记录负责人、日期、前提、风险、复核与实施自报；来源更新标记过期，推进需满足确认、限制与复核门控。不是认证专家批准、实际交易或防篡改审计。
- Workspace save/restore/export includes the records; HTML adds sections8–10 with frozen sources and history.10 MB file boundary, explicit local saving, no cloud sync. Reset preserves desk records; legacy workspaces supported.
- UI延续玻璃，按需展开表单，手机表转卡片；新增输入／阅读区域有意保持平面，原有动效与例外不变。AI知识同步4.6.0，不自动发送新本机记录或用户报告附件。
- Protected engine/shared-data/Pro Max sources and six benchmarks remain unchanged. No build tool, dependency, hash or performance audit.
- [Release](docs/releases/v4.6.0.md) · [验收 / Evidence](docs/verification/v4.6.0/README.md)

## v4.5.2 · 2026-10-19

- Baseline: light-v4.5.1-baseline-2026-10-19 (2ff062d).
- 按用户要求取消MAREG助手、租约碳成本分摊与方案对比、官方来源与模型说明、规划条件与成本比较四个板块及其内部控件的3D指针倾斜／空间视差。
- Keep the four work/read panels flat while retaining glass, glints, hover shadows, entry effects and tilt on other cards. Existing flat quick/simulation controls and the draggable budget remain.
- 两个容器新增稳定ID，扩展已有倾斜例外；计算、CSS材质、后端和五个受保护文件不变。UI／缓存／快照／报告4.5.2，AI知识4.5.1。
- [Release](docs/releases/v4.5.2.md) · [真实验收 / Evidence](docs/verification/v4.5.2/README.md)

## v4.5.1 · 2026-10-19

- Baseline: light-v4.5.0-baseline-2026-10-19 (f4563ed).
- 新增双语项目知识与回答规范，Node／Worker 共用；明确演示假设、计算与使用路径，当前已应用数据覆盖默认值。不是微调、持续记忆或实时检索。
- Simpler question-first assistant; settings, references and help expand on demand. Suggestions fill without sending; access-code and consent gates remain.
- 安全段落／列表显示替代裸露 Markdown／HTML／引用代码，保留来源链接、金额与单位；动态状态随中英文切换，只有真实输入变化才提示回答过期。
- Preserve glass/motion, protected sources and all six benchmarks; UI/cache/report/snapshot version4.5.1. No dependencies/build/performance/hash work.
- [知识与规范 / Knowledge](docs/AI_KNOWLEDGE.md) · [Release](docs/releases/v4.5.1.md) · [验收 / Evidence](docs/verification/v4.5.1/README.md)

## v4.5.0 · 2026-10-19

- Baseline: `light-v4.4.1-baseline-2026-10-18` (`5878e4c`).
- 接入 DeepSeek 官方 deepseek-flash，Node/Cloudflare Worker 共用安全边界；仅显式选择 OpenAI 时使用原适配器，不自动回退。
- Deploy a separate Cloudflare Worker; prefill its URL, require a private classroom code plus consent, and keep provider keys server-side. No Mac dependency for classroom use.
- 访问码不保存进浏览器记录／报告；区分访问码、密钥、余额与限流错误；回答保留引用、未核验及过期提示，不改变计算。
- 保留原玻璃与动效、五个受保护文件及默认金额；版本／缓存／快照／报告统一为 4.5.0。无前端构建工具、新依赖、性能或哈希工作。
- [使用与维护 / Setup](docs/AI_SETUP.md) · [Release notes](docs/releases/v4.5.0.md) · [真实验收 / Evidence](docs/verification/v4.5.0/README.md)

## v4.4.1 · 2026-10-18

- Baseline: `light-v4.4.0-baseline-2026-10-18`.
- 用户指定的“航次、燃料与组池数字孪生推演”卡片及所有嵌套控件取消指针倾斜／空间视差；保留玻璃材质、跟随高光、悬停阴影及其他展示卡动效。
- Keep the voyage/fuel/pooling panel and descendants flat; preserve material, glints, shadows and motion elsewhere. Calculation/source/protected files unchanged; UI/cache/report version 4.4.1.
- [Release notes](docs/releases/v4.4.1.md)

## v4.4.0 · 2026-10-18

- Baseline: `light-v4.3.1-baseline-2026-10-18` (`c1de121`).
- 本机显式保存／恢复、可恢复工作区 JSON、含六类方案／条件／公式／来源的独立 HTML 报告及浏览器打印入口。旧快照仍为只读证据。
- Add validated local CSV ledger input and ordinary-2026 preliminary scope screening; derive energy, CO2, intensity and coverage-weighted distance from common fuel rows. Keep derived fields read-only; retained what-if/time estimates are not certified voyage predictions.
- 编辑台账清空旧预览；恢复工作区同时恢复编辑区（含带逗号／引号来源）。无效文件及不支持范围不覆盖预算。
- Add named explicit policy conditions with independent EUR/GBP comparisons and deliberate Load; preserve saved vessel/data and avoid invented global charges/probabilities.
- 新增可配置本机 AI 接口，密钥仅服务端；同意后发送摘要，展示来源与回答过期提示。按用户决定默认未连接，只完成本地后端与接入；没有真实模型调用或公网部署验收。
- Correct workspace validation to accept the existing pool request/supply range up to 10000 tCB, rather than incorrectly rejecting legitimate requests above 400. Default values/ranges remain unchanged.
- Protected engine/shared-data/Pro Max bytes, six benchmark amounts, glass/motion design, currency separation and all material limitations remain unchanged. No CSV-to-regulator filing or full certified-fuel calculation is claimed.
- [操作说明 / Workflows](docs/WORKFLOWS.md) · [发布说明 / Release notes](docs/releases/v4.4.0.md) · [验收 / Evidence](docs/verification/v4.4.0/README.md)

## v4.3.1 · 2026-10-18

- Baseline: `light-v4.3.0-baseline-2026-10-18` (`04c4dc5`). This release follows v4.3.0.
- 默认五个快速数值输入；组池可用量通过同一行的修改入口进入高级区。原 14 字段完整保留，高级区按三组折叠。
- Add VLSFO-equivalent tonnes/MJ display conversion using the engine's exported constant. Canonical energy and snapshot fields remain MJ; do not treat equivalent tonnes as measured fuel mass.
- 新增默认值标记、单项还原、可键盘操作的说明、已应用假设标签及未应用草稿提示；输入边界校验显示双语行内错误。
- Four explicit demo presets only set existing sliders. The speed −1.0 kn preset intentionally exceeds the default time allowance; other controls/prices/confirmations are preserved.
- 三项声明合并一次确认；另提供“载入演示假设并确认”，明确不代表真实核验。重置恢复未确认，应用修改后的输入也撤销确认。
- Preserve glass styling, motion, protected files, benchmarks, separate currencies and legal/data limitations. No CSV import, clean mode, performance assessment, engine or planner algorithm change.
- [双语发布说明 / Release notes](docs/releases/v4.3.1.md) · [验收材料 / Evidence](docs/verification/v4.3.1/README.md)

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
