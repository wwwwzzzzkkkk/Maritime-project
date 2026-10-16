# Delivery verification · original UI retained

Final scope follows the user's request to retain the existing visual and motion design and avoid excessive checks.

Completed:

- 9 core calculation regression tests passed, covering A3 values, positive balances, baseline identity, pooling limits, repeated deficits and negative client economics.
- One bounded Chrome page smoke check passed: baseline figures, surplus vessel, JSON snapshot, native Escape close, reset while the map was hidden, and desktop/mobile layout.
- No page runtime errors in that smoke check.
- Original `styles/tokens.css` is unchanged. The original `styles/main.css` content is retained with appended responsive layout/modal-sizing rules; original effect definitions and timing values were not replaced.

No further full-site scan or broad compatibility audit was performed after the user's latest instruction. Real-vessel verification, Safari/Firefox and full WCAG certification remain outside this verification scope.

![Preserved original desktop design](previews/original-ui-desktop.png)

![Preserved original mobile design](previews/original-ui-mobile.png)

## Mobile layout follow-up

One focused browser session checked 320/390px Chinese/English tab and context containment, immediate content visibility when switching the five mobile views, continued IMO-control availability, and desktop summary retention. No page runtime errors were observed. No calculation or broad browser suite was rerun for this layout-only change.

![Mobile audit content visible immediately after switching](previews/mobile-audit.png)


## v4.1.0 customer-content delivery · 2026-10-15

One focused Chrome desktop (1440px) / mobile (390px) session passed:

- New bilingual five-tab navigation, demo notice and the unchanged €88,000 / €237,191.27 baseline.
- Input-linked comparison delta, collapsed/open calculation trace and seven official reference links.
- Future scenario selection leaves regional budgets unchanged and shows no venture break-even figures.
- Preset customer FAQs in Chinese/English, native snapshot export containing `uiVersion: 4.1.0` and `etsComplete: false`.
- Mobile navigation/float, page-width containment and the flat quick adjuster; no page runtime errors.

Desktop/mobile screenshots were inspected locally. Source syntax and whitespace checks passed. No new calculation-engine changes, repeated full suites, live-vessel validation or cross-browser certification were performed. Source/reference dates are retained from the prior review, not a new regulatory audit.


## v4.2.0 scoped planning and desktop float · 2026-10-15

Passed the existing nine engine checks and five focused planner/accounting checks. New checks cover independent extra-time/auxiliary-cost calculations, party accounting identities, time/fuel limits, confirmed versus uncertain supply, uneconomic pooling and non-grid fuel caps. No additional repeated broad suites were run.

One Chrome desktop (1440px) / mobile (390px) interaction session passed: original budget values, desktop automatic floating budget and mouse drag/collapse/reset, input drafts and native required-field validity, editable UK price, six option rows, constraint violations, conditional candidate loading, GENCON/NYPE allocation without changing total, bilingual labels, snapshot versions and applied input/search provenance, mobile containment and vessel/reset behavior. No page runtime errors. Screenshots were visually inspected; Google Fonts were blocked in the check to avoid external font-loading delay. This is not a live-data, regulatory, full accessibility or cross-browser audit. Final table ordering prioritizes scoped total and party amounts; component columns remain horizontally scrollable.


## v4.2.1 · Stage 1 · 2026-10-16

Baseline: **light-v4.2.0-baseline-2026-10-16** (`05cd7de`).

实际执行 / Commands actually run:

```sh
npm test
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' BASE_URL=http://127.0.0.1:48179 node tests/stage1.mjs
node --input-type=module --check < js/app.js
node --check js/planning-ui.mjs
git diff --check
git diff --exit-code light-v4.2.0-baseline-2026-10-16 -- js/compliance-engine.mjs js/data-and-i18n.js js/app-pro-max.js index-pro-max.html styles/pro-max.css
```

`npm test` 实际运行一次：14 tests, 14 pass, 0 fail。完整输出保存在 [npm-test.txt](verification/v4.2.1/npm-test.txt)。基准值及引擎 SHA-256 逐项相同，默认 planner 结果做了 deep comparison。未改引擎函数、共享数据或 Pro Max 源码。

浏览器检查第一次在固定列位置断言处失败；随后仅把检查改为鼠标移开并等待保留的 hover 动画稳定后测量，第二次运行通过。未因此修改产品动效，两个日志均保留。未重复运行 npm test。

- 1440: table clientWidth/scrollWidth = 1246/1246；768: 674/674；均五列且无需横滚。
- 375: 321/508，仍为表格内部横滚；全部列可展开为 11 列，首列固定。
- 三种宽度均断言 E1/E2/U1 所有坐标在默认视野内，且本地 242 个国家要素加载，EU27 使用 accent 阴影、GBR 单独着色，法国 ISO_A2 确认是 -99。
- 窄屏“滑块 → 分摊 → 推荐 → 表格”顺序通过；推荐和载入按钮仍在右栏对应卡片。
- 0% 无圆弧；非零最小长度为 251×3%=7.529999999999999; 正向增量为 warn，下降为 accent，超过 ±30% 封顶，重播使用相同映射；中英文 aria 说明已检查。
- 12 个外部链接逐个触发新标签页，原页 URL 和已调整金额不变；公式主体默认展开；2030 显示 85.6904。
- 通过请求拦截屏蔽字体、底图等外部域名，仍断言本地航线、国家阴影、金额、台账正常。**通过请求拦截模拟，不是真实离线，也不保证未缓存时首次打开。**
- Pro Max 冒烟通过：页面、Leaflet 图层及交互计算正常；ukEtsPrice 从 60 改为 70 后，UK 显示从 £13,200 到 £15,400，证明该共享变量仍被其使用。测试将其 Leaflet CDN 请求替换为仓库未修改的 1.9.4 文件；未验证 CDN 可达性。
- 成功运行未出现 pageerror；前后截图已查看。仅 Chrome，未扩大为跨浏览器或真实离线审计。

[原始数据、日志与基准对照](verification/v4.2.1/README.md) · [三种宽度的前后截图](previews/v4.2.1/README.md) · [评审核实及不准确之处](REVIEW_STAGE1.md)


## v4.3.0 · Readability · 2026-10-16

Baseline: `light-v4.2.1-baseline-2026-10-16` (`cdec884`). Only Chrome. 本阶段评估过清爽模式，按用户决定取消；不提供该功能。性能对比、中位数、GPU 评估和性能预算按后续指示取消，不给性能结论。原先异常数据仅保留在本地 test-results。

实际命令与结果：

```sh
node tests/stage2-lab.mjs baseline
node tests/stage2-lab.mjs baseline --resume
node tests/stage2-lab.mjs consolidated
node test-results/stage2/compare-css.cjs
python3 test-results/stage2/implement.py
node tests/stage2-lab.mjs after
python3 test-results/stage2/pixels.py
npm test
node tests/stage2.mjs
node test-results/stage2/final-screens.cjs
node --input-type=module --check < js/app.js
git diff --check
```

初始采样脚本在选择隐藏模块 summary 时失败；已完成的性能样本没有重跑，后续只恢复采样。一次恢复脚本出现重复声明语法错误，修复后采样完成。随后按用户取消决定移除了该脚本的性能部分，因此历史 --resume 命令只是执行记录，不是当前脚本的推荐复现方式。取样点、截图和 axe 结果均为真实运行所得。

纯 CSS 整理首批截图存在指针/地图动画时刻差异；以新页面、固定动画时刻、等待地图原有动画结束做成对比较后，1440/768/375 的不同像素数均为 0，组件计算样式一致。仅 CSS 提交为 `86d3f20`，文字/交互修改在独立提交。未为截图差异删除原有动效。

`npm test` 仅运行一次，14 pass / 0 fail，真实完整输出保存在 [npm-test.txt](verification/v4.3.0/npm-test.txt)。`tests/stage2.mjs` 内实际执行受保护五文件 `git diff --exit-code` 一次，exit 0、输出为空；默认六项金额旧/新一致。180 帧连续 input 最终 €132,000，通过；中英文×三宽布局通过；sticky 阅读区偏移 0，标题仍倾斜，KPI 原强度与减少动态行为通过；弹窗更新而不重复绑定；Pro Max 冒烟通过。外网请求在测试中阻断，Pro Max 的 Leaflet CDN 请求用未修改的本地同版本文件替代，未验证 CDN 可达性。主动阻断产生的资源加载错误不作为应用错误。

最终六张截图第一次可能捕捉到尚未结束的 850ms 地图飞行动画，因此只重拍截图并等待 1100ms；没有重跑 npm、受保护 diff 或整套可靠性检查。截图中的无限光斑在固定动画时刻暂停，仅用于可比截图，不是默认产品行为。发布链接在 Release 创建后再启用，预发布截图页脚仍指向旧 Release。

像素取样不只用令牌：隐藏文字墨迹而不改布局/材质，在第一行文字中心取 3×3 实际背景中位色，记录视口点与 PNG。7 组改前/改后样本的改后对比度均 ≥4.5:1；不覆盖页面所有可能背景。axe-core 4.10.3 检测确定违规均为 0，passes 均 28；仍有 aria-prohibited-attr、color-contrast、link-in-text-block 三类 incomplete（颜色节点改前124/改后125）。axe 无官方百分制评分，未虚构分数，也不声称认证通过。

纠正过的评审判断：缓存已在阶段1统一为4.2.1；徽章正文实际是 secondary；Chrome 顶栏最终为普通 blur、导航与 KPI 才使用折射。保留默认光斑与折射的决定不变。无高对比度自动模式；不支持 blur 的回退只有一小段 @supports not，本机 Chrome 支持 blur，未实测不支持 blur 的浏览器。

[完整证据、基准表、含像素坐标的对比度表、缓存位置及人工项](verification/v4.3.0/README.md) · [中英文三宽截图](previews/v4.3.0/README.md)
