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
