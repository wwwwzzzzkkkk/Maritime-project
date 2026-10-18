# v4.5.0 实际验收 / Actual Verification

2026-10-19 · Baseline `light-v4.4.1-baseline-2026-10-18` (`5878e4c`). **仅 Chrome / Chrome only**. 教室实体设备／网络未测试；无性能、哈希或全面浏览器认证。

## 命令与真实结果 / Actual commands and results

- `npm test`：初次 DeepSeek 适配后 28/28（[原始输出](npm-test.txt)）；抽取共用处理器后仅定向 5/5（[输出](shared-handler-test.txt)）；增加云端鉴权后完整测试 29/29、0 fail（[完整输出](final-npm-test.txt)）。随后根据真实回答补充币种／单位说明，仅补跑 `node --test tests/ai-service.test.mjs`，6/6、0 fail（[输出](final-ai-service-test.txt)），不重跑广泛套件。公开 JSON 边界随后补充 null 请求／null 情景条目校验，仅运行 AI origin 和 public Worker 两个定向用例，2/2 通过（[输出](boundary-test.txt)）。
- `git diff --exit-code light-v4.4.1-baseline-2026-10-18 -- js/compliance-engine.mjs js/data-and-i18n.js js/app-pro-max.js index-pro-max.html styles/pro-max.css`：exit 0，空输出（[记录](protected-diff.txt)）。没有修改引擎，MODEL_VERSION 仍为 light-4.2.0。
- `node tests/ai-cloud-ui.mjs`：通过真实云端 health/CORS/401；没码或没同意时按钮禁用，错误码得到 401 access 错误且无回答，金额不变。[断言](access-ui.json) · [输出](access-ui-log.txt)。这是实际部署的 Worker，不是模拟 HTTP；服务商调用数量由 mock 单元测试断言（错误码在调用前拒绝），未用云端供应商账单证明调用次数。
- Chrome 中文1440／英文375 页面宽度断言通过，无 pageerror。查看了[桌面图](access-ui-zh-1440.png)和[手机图](access-ui-en-375.png)，原玻璃、浮窗和其他动效保留；本阶段不重拍全站六图矩阵。截图中的中文问题属于用户输入；切换语言前产生的动态状态文本可保留原语言。
- Pro Max 冒烟通过，无 pageerror；其 Leaflet CDN 请求用未修改 vendor 文件替换；其他外部字体／底图阻断，未验证 CDN 可达性，未声称真实离线。
- `node --check server/ai-handler.mjs`、`node --check js/ai-explain.mjs`、`node --check worker.mjs`、`git diff --check` 通过。浏览器缓存版本位置见 [cache-versions.txt](cache-versions.txt)。页脚文字先升至4.5.0，href 暂留旧 Release，待新 Release 创建后用单独提交激活。

## 基准金额 / Benchmarks

通过 `git show` 读取基线引擎、与当前引擎分别真实计算并 deepEqual；[完整精度数据](benchmarks.json)。展示精度下：

| 项目 / Item | 旧 / Before | 新 / After |
| --- | ---: | ---: |
| EU ETS CO₂ | €88,000 | €88,000 |
| UK ETS CO₂ | £13,200 | £13,200 |
| FuelEU 单期 / single-period | €237,191.27 | €237,191.27 |
| FuelEU 6% 条件 / target condition | €619,346.72 | €619,346.72 |
| 船东 / owner (85%) | €276,413 | €276,413 |
| 租家 / charterer (15%) | €48,779 | €48,779 |

EUR/GBP 没有合并；示例／未核验／ETS仅CO₂／非法律意见／非标准租约默认比例等边界保持。

## 部署与真实模型 / Deployment and genuine model calls

- 初次本机浏览器→本机后端→DeepSeek 实际 HTTP200，provider deepseek、model deepseek-flash；[原始回答及引用](live-deepseek.json)、[截图](live-ai-panel.png)。这不证明其法规解释正确。该次回答错误地认为币种不明，因此后续发送固定的 metricUnits/assumptionUnits 明示币种和单位；未更改任何引擎金额。
- Cloudflare OAuth 首次等待超时；第二次授权后浏览器回调未连接本机，随后由本机回调处理完成登录。没有将一次性 code 或 token 写入仓库。
- 初次 dry-run 因 Wrangler 默认规则额外收集了 HTML/txt；已限制附加模块为 server/ai-handler.mjs 与 js/light-data.mjs。首次上传因入口被放到模块根而相对路径无效，返回10021；改用根目录 worker.mjs 后部署成功。期间 .env 文件被 CLI 作为全部 Secret 读取，后改为网站目录外只含两个 Secret 的私有 JSON，最终绑定只有公开配置与两项 Secret，不含 PORT。
- 官方注册表运行 Wrangler 4.151.1，`no_bundle:true`，没有项目新依赖／前端构建工具。部署使用 `npx --yes wrangler@4.151.1 deploy --secrets-file <private-two-secret-json>`。API key／课堂码不进入命令输出、QA、工作区、截图或报告。
- Worker `https://mareg-ai.mareg-light-edition.workers.dev` 已部署；部署输出已仅去除 CLI 行尾空格；最终服务版本 ID `89fd9bea-aa3a-4d9b-97d1-ea9b736344ef`（[实际部署输出](worker-deploy.txt)）；Chrome 实际 health 显示 configured:true / requiresAccessCode:true。本机 Node fetch 与 curl 两次尝试遇到 TLS handshake failure，随后 Chrome 访问及本机页面→Worker 检查通过；未绕过 TLS 校验，未断言所有网络均可达。
- 本机 AI 服务已停止。Pages 部署 5ff8735 成功后，实际执行 node --env-file=<private-env> tests/ai-cloud-ui.mjs --live（私有配置路径隐去），线上网页→Cloudflare Worker→DeepSeek 真实 HTTP200，provider deepseek / model deepseek-flash / incomplete:false；没有本地 AI 后端依赖。返回回答、七条固定日期引用、同意／访问码门控、基准€88,000及无pageerror断言通过。[真实结果](cloud-live.json) · [输出](cloud-live-log.txt) · [线上中文桌面图](cloud-live-zh-1440.png) · [线上英文手机图](cloud-live-en-375.png)。本轮仅一次本机真实调用加一次线上真实调用，没有为截图重复调用模型。

## 人工确认 / Manual checks

在教室网络打开网站，检查连接、用私下提供的课堂码提问。确认实际服务余额、提供商数据政策、Cloudflare/Workers 域名可达性。仅共享码教学演示，不是独立客户账户、精细配额、实时法律检索或商业可用性认证。回答和引用仍需核对；不要公开课堂码或 API key。
