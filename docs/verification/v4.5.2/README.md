# v4.5.2 实际验收 / Actual Verification

2026-10-19 · Baseline light-v4.5.1-baseline-2026-10-19 (2ff062d). **仅 Chrome / Chrome only**. 无性能／哈希工作，无真实AI调用或Worker部署。

实际命令 / Commands actually run:

- npm test：运行一次，33 tests / 33 pass / 0 fail。[完整输出](npm-test.txt)。
- node --input-type=module --check < js/app.js：通过。
- git diff --exit-code light-v4.5.1-baseline-2026-10-19 -- js/compliance-engine.mjs js/data-and-i18n.js js/app-pro-max.js index-pro-max.html styles/pro-max.css：一次执行，exit0，[空差异](protected-diff.txt)。
- node test-results/four-flat-panels/check.mjs：一次定向会话通过。[输出](browser-log.txt) · [结构化结果](check.json) · [实际脚本副本](check-script.txt)。副本保留原本从test-results/four-flat-panels执行的相对导入路径；它是执行记录，不是从此目录直接运行的脚本。
- git diff --check：通过。缓存／UI／快照／报告为4.5.2，[缓存位置](cache-versions.txt)。AI知识仍4.5.1，计算引擎仍light-4.2.0；后端及CSS材质未改。

## 悬停断言 / Hover assertions

| 板块 / Panel | 标题rx/ry | 内部rx/ry | 结果 |
| --- | --- | --- | --- |
| MAREG Assistant | 0deg / 0deg | 0deg / 0deg | Flat |
| 租约碳成本分摊与方案对比 | 0deg / 0deg | 0deg / 0deg | Flat, nested control also checked |
| 官方来源与模型说明 | 0deg / 0deg | 0deg / 0deg | Flat after expanding sources |
| 规划条件与成本比较 | 0deg / 0deg | 0deg / 0deg | Flat, form input checked |

各目标的is-tilting为false，px/py/tz/lift均为0；鼠标高光坐标继续更新。非目标KPI仍有is-tilting:true，rx3.02deg / ry−4.51deg，证明没有全局移除倾斜。只扩展既有例外选择器，原快速调节器／推演平面例外保留。

NYPE切换仍显示船东18%，EU总额保持€88,000；切回GENCON后默认结果恢复。六项基准用基线与当前引擎分别实际计算并deepEqual，完全相同：

| 项目 | 旧 | 新 |
| --- | ---: | ---: |
| EU ETS CO₂ | €88,000 | €88,000 |
| UK ETS CO₂ | £13,200 | £13,200 |
| FuelEU单期 | €237,191.27 | €237,191.27 |
| FuelEU 6%条件 | €619,346.72 | €619,346.72 |
| 船东85% | €276,413 | €276,413 |
| 租家15% | €48,779 | €48,779 |

原始完整精度见check.json。EUR/GBP分列，未核验／演示／仅CO₂／非法律意见／非标准租约默认比例等含义保留。

## 画面与范围 / Screens and scope

- [分摊1440](charterAllocationPanel-1440.png) · [分摊375](charterAllocationPanel-375.png)
- [助手1440](liveAiPanel-1440.png) · [助手375](liveAiPanel-375.png)

1440/375页面宽度断言通过、无pageerror；已查看分摊桌面与助手手机图。静态截图用于看材质／排版，角度变化由真实鼠标悬停断言验证。既有预算浮窗可拖动／收起，截图中的展开浮窗可能覆盖正文，未修改它的行为。

Pro Max一次冒烟通过、无pageerror；其Leaflet CDN请求替换成未修改vendor文件，其他字体／底图请求阻断。未验证CDN可达性、真实离线或其他浏览器。没有为本次动效修正重做AI回答、法规或全站视觉审核。

发布顺序：实现提交、标签与GitHub Release，再以单独提交激活页脚链接；预发布截图和缓存清单中的旧Release href属于这一发布步骤，不是404链接。
