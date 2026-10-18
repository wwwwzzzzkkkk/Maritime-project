# v4.5.1 实际验收 / Actual Verification

2026-10-19 · Baseline light-v4.5.0-baseline-2026-10-19 (f4563ed). **仅 Chrome / Chrome only**. 无性能、哈希或跨浏览器认证；模型复核仅针对实测发现的问题。

## 实际命令与结果 / Actual commands and results

- node --check js/ai-answer.mjs、js/ai-explain.mjs、server/ai-handler.mjs、server/ai-knowledge.mjs：通过。
- npm test：仅运行一次，33 tests / 33 pass / 0 fail；[完整真实输出](npm-test.txt)。新增格式显示用例验证 Markdown/HTML 转段落／列表、币种单位负号保留；共用服务用例验证两种供应商都收到同一知识规范、改变后的真实输入和有日期参考资料，不透传原始CSV／船名字段，拒绝无效外部摘要。
- git diff --exit-code light-v4.5.0-baseline-2026-10-19 -- js/compliance-engine.mjs js/data-and-i18n.js js/app-pro-max.js index-pro-max.html styles/pro-max.css：一次执行，exit0、[空差异](protected-diff.txt)。引擎版本仍light-4.2.0。
- 基线和当前引擎分别实际计算并deepEqual，六项完全相同，见[完整精度结果](benchmarks.json)。EUR与GBP分列，没改法规／业务数值。
- node tests/ai-knowledge-ui.mjs：首次因测试硬编码了错误的浮点尾数而失败（371.1647999999996 vs 371.16479999999916）；[首次输出](browser-attempt-1.txt)。只把测试断言改为距371.1648小于1e-7，没改产品计算；第二次定向会话通过，[输出](browser-log.txt)、[结构化结果](browser-results.json)。未重跑npm。
- 界面网络回答为**明确模拟**：401访问码错误→重新填入→200富格式回答。真实DOM验证短设置默认折叠、AI优先、键盘建议只填入不发送、码与同意门控、段落／编号列表、安全文本节点、保留负金额和引用链接、语言切换状态翻译、实际输入变化才过期。请求包含已应用运营／基础能源摘要，不含原始CSV及独立船名字段。
- Pro Max加载、无pageerror；Leaflet CDN以未修改vendor同版本替换，字体／底图阻断。没有验证CDN可达性或真实离线。
- 中文／英文 ×1440／375宽度页面无横向裁切，无pageerror。空白状态与回答状态截图见下。浮窗保持既有可拖动／收起行为；它可能覆盖正文，用户可移动或收起。已有中文问题／回答不会因UI切换而自动翻译。
- git diff --check通过。新增模块与第一方资源引用均4.5.1，[位置清单](cache-versions.txt)。页脚版本文字先升级，href在Release创建后再单独启用。

| 基准项目 | 旧 | 新 |
| --- | ---: | ---: |
| EU ETS CO₂ | €88,000 | €88,000 |
| UK ETS CO₂ | £13,200 | £13,200 |
| FuelEU单期 | €237,191.27 | €237,191.27 |
| FuelEU 6%条件 | €619,346.72 | €619,346.72 |
| 船东85% | €276,413 | €276,413 |
| 租家15% | €48,779 | €48,779 |

## 截图 / Screenshots

- [改前1440](before-1440.png) · [改前375](before-375.png)
- [改后空白1440](after-empty-1440.png) · [改后空白375](after-empty-375.png)
- [回答中文1440](after-answer-zh-1440.png) · [回答中文375](after-answer-zh-375.png)
- [回答英文1440](after-answer-en-1440.png) · [回答英文375](after-answer-en-375.png)

已实际查看空白桌面／手机、中文桌面回答和英文手机回答。截图用于局部UI检查，未为截图禁用产品玻璃或动效；瞬时光斑／导航动画位置可不同。不声称全站视觉或无障碍认证。

## 云端与范围 / Cloud and scope

使用官方npm的Wrangler4.151.1，原生模块no_bundle，未增加构建工具或项目依赖。实际命令：npx --yes wrangler@4.151.1 deploy --secrets-file <private-two-secret-json>（私有路径隐去）；[部署输出](worker-deploy.txt)仅去除行尾空格，Secret值未输出。Worker版本a96fe2ac-2949-4843-b019-794cc6a1d4d4已上线；包含新的知识模块。Node与Worker共用同一模块。

第一次线上真实提问HTTP200，knowledgeVersion4.5.1，显示162字，无裸露格式标记；[原始结果](first-live-result.json)与[first log](first-live-log.txt)保留。内容有一句把足额覆盖称为覆盖不足，已补强“不得编造参数选择目的、区分船舶缺口与供给不足”的规则；仅补跑格式3项与共用知识1项，均通过（[格式输出](format-followup.txt)、[知识输出](knowledge-followup.txt)），未重跑npm／完整UI会话。也清理了引用移除后的中文标点前空格。首次截图实际没有成功收起预算浮窗，已更正其说明，不把它记成已收起。\n\n修正后Worker版本3db13b7c-076a-41e5-893e-46234f5eba57已部署，[最终部署输出](final-worker-deploy.txt)。待Pages更新后只对该问题做一次真实定向复核，不宣称所有AI回答可靠。前面的富格式回答是模拟，不能当作真实模型表现。

知识维护日期2026-10-19不等于法规重新核对日期；官方来源仍各自保留2026-10-15等原有日期。没有微调、持续对话记忆、实时法规检索、核验／申报或真实组池申请。AI短回答规范是指令，不能保证所有可能问题都严格同样长度。格式化层不改变金额，但不核验模型陈述的真实性。课堂网络、实际来源／供给／合同与模型回答仍需人工确认。
