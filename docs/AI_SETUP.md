# DeepSeek AI 配置与课堂使用 / DeepSeek AI & Classroom Setup

v4.5.0 · 2026-10-19

## 中文：教室里怎么用

1. 在教室电脑打开 [原网站](https://wwwwzzzzkkkk.github.io/Maritime-project/)，进入“帮助与说明”。Mac 不需要开机，也不用在教室安装 Node。
2. AI 服务地址已预填 `https://mareg-ai.mareg-light-edition.workers.dev`，点击“检查连接”。连接成功只表示服务可达，真正提问成功才验证模型调用。
3. 输入小组私下提供的**课堂访问码**，勾选发送同意，再提问。课堂访问码不是 DeepSeek API key；不要把 API key 填进网页。
4. 可以问：“解释当前 EUR 与 GBP 预算分别包含什么，还有哪些假设需要确认？”输入变化后旧回答会显示过期提示。

访问码不会保存进浏览器本机记录、工作区或报告，刷新后需重新输入。持有码的人可调用由项目账户付费的模型，因此仅向小组／课堂分享，勿放入公开仓库、截图或报告。课堂网络需能访问 GitHub Pages 和该 Workers 域名；尚未在实体教室网络验证。此为共享码控制的教学演示，未提供个人账户、多客户隔离、精细配额或商业服务保障。

后端使用 DeepSeek 官方 `deepseek-flash`（官方文档核对时对应 **DeepSeek-V4.1-Flash-1017**）。API 名可能随服务商升级调整，不把它当作永久冻结的模型版本。密钥仅存于服务端 Secret，本地私有配置位于网站目录之外；公开前端只包含服务 URL。Cloudflare Workers 与 GitHub Pages 独立运行。

## English: use in class

Open the [same website](https://wwwwzzzzkkkk.github.io/Maritime-project/) → **Help & About** → **Check Connection**. The cloud URL is prefilled. Enter the privately shared **classroom access code**, consent and ask. No Mac or Node installation is needed on the classroom computer. Never enter the DeepSeek API key in the page.

Connection checks only verify backend reachability/configuration. A successful question verifies the model call. The access code is kept in page memory, excluded from saved workspaces/reports and cleared on reload. Share it privately: its holders can incur provider charges. The physical classroom/network has not been tested. This is a shared-code teaching deployment, without individual accounts, tenant isolation, granular quotas or commercial availability guarantees.

The configured API name is `deepseek-flash`, mapped by the checked official documentation to DeepSeek-V4.1-Flash-1017. Provider aliases may evolve. Secrets stay server-side; only the public service URL is shipped to browsers. Cloudflare Workers runs independently of the Mac and GitHub Pages.

## 可选：运行本机后端 / Optional local backend

需要 Node.js 22+、自己的服务商账户及密钥；按服务商实际计费。配置放在**静态网站根目录之外**。/ Use Node.js 22+, your own provider account/key and a private file **outside the static website root**. Provider charges apply.

```sh
mkdir -p "$HOME/.config/mareg"
cp .env.example "$HOME/.config/mareg/ai.env"
# 用编辑器在私有文件中填写 DEEPSEEK_API_KEY；不要在聊天或网页填写。
# Fill DEEPSEEK_API_KEY privately in an editor, never in chat or the webpage.
node --env-file="$HOME/.config/mareg/ai.env" server/explain.mjs
```

默认 `AI_PROVIDER=deepseek`、`DEEPSEEK_MODEL=deepseek-flash`。仅在明确选用原 OpenAI 适配器时改为 `AI_PROVIDER=openai` 并配置对应 key/model；不自动切换供应商。若本机文件填写 `MAREG_ACCESS_CODE`，本机服务也要求课堂码。服务只监听 127.0.0.1，网页服务地址需改为 `http://127.0.0.1:48185`；本地静态页可使用 48184 端口。公网页面访问本机服务可能受 Chrome 本地网络权限限制；课堂优先使用云端。

Default provider/model: DeepSeek / deepseek-flash. OpenAI remains an explicitly selected alternative, never an automatic fallback. A configured MAREG_ACCESS_CODE also protects the local adapter. The Node server binds loopback only; set the webpage URL to localhost:48185 for this option. The public-page→loopback path may require browser local-network permission; use the cloud backend for class.

## 云端维护 / Cloud maintenance

`wrangler.jsonc` 配置原生 ES 模块，无前端构建和打包步骤。Wrangler 从官方 npm 注册表临时运行，不加入项目依赖。首次维护需自行完成 Cloudflare 登录；不应发送 OAuth 回调地址或令牌。/ Wrangler deploys native modules with no build/bundle step and is not added to project dependencies. Complete account login yourself; do not share callback URLs or tokens.

```sh
npx --yes wrangler@4.151.1 login --scopes account:read user:read workers_scripts:write
# 私有 JSON 只含 DEEPSEEK_API_KEY 与 MAREG_ACCESS_CODE（至少 12 字符），不要放进仓库。
# Private JSON contains only these two secrets; the access code needs at least 12 characters.
npx --yes wrangler@4.151.1 deploy --secrets-file /absolute/private/path/worker-secrets.json
```

实际维护文件放在 `~/.config/mareg/`，不在网站根目录。部署不自动改前端 URL；若域名改变，同步 `js/ai-config.mjs` 并按版本流程发布。可在 Cloudflare 控制台更改 Secret 并部署来轮换课堂码；DeepSeek key 撤销／轮换还需在服务商账户处理。切勿把本地私有文件作为附件上传。

Deployment does not automatically update the frontend URL. If the host changes, update ai-config and publish a version. Rotate the classroom Secret and redeploy if shared too widely. Revoke/rotate provider keys through the provider account as well. Git rollback does not revoke cloud secrets or undo Worker deployments; see [rollback](ROLLBACK.md).

## 数据、边界与接口 / Data, limits and contract

- 请求仅发送问题、当前计算摘要、价格／运营假设、最多 12 个规划摘要和打包参考资料，不发送原始 CSV。服务不记录问题和台账；提供商／平台账户的数据政策仍适用，未承诺零保留。/ Only questions, calculated metrics, bounded assumptions/cases and bundled references are sent; raw CSV is excluded. The application does not log questions/ledgers; platform/provider policies still apply, without a zero-retention claim.
- 回答未经人工核验，参考资料有日期，不是实时法规检索、法律意见、专家审批或自动申报。AI 不改变计算金额、规则或采购。EUR 与 GBP 分列。/ Answers are unverified, dated and source-constrained; no live legal retrieval, legal advice, filing or procurement. AI cannot change engine results; EUR/GBP stay separate.
- `GET /api/health`: protocol, configured, provider, model, requiresAccessCode；不返回密钥／访问码。/ No credentials returned.
- `POST /api/explain`: JSON；精确 Origin 白名单；云端必须有 Bearer 课堂码；无效码在供应商调用前返回 401。请求最大 128,000 bytes，问题最多 2,000 字符。/ Exact origin allowlist, mandatory public Bearer code, bounded JSON; invalid access returns 401 before calling the provider.
- DeepSeek: `https://api.deepseek.com/chat/completions`，system/user messages，`thinking:{type:"disabled"}`、`stream:false`、`max_tokens:1400`；只读取最终文本，不返回 reasoning_content。OpenAI 分支保留 Responses 与 store:false；该参数不是零保留证明。/ Only final DeepSeek text is returned. The optional OpenAI branch retains Responses/store:false, without equating it to zero retention.

核对于 / Checked on 2026-10-18:

- [DeepSeek 官方 API 文档 / Official docs](https://api-docs.deepseek.com/zh-cn/)
- [Chat completion](https://api-docs.deepseek.com/api/create-chat-completion/)
- [模型与价格 / Model names and pricing](https://api-docs.deepseek.com/quick_start/pricing/)
- [Cloudflare 配置 / Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Cloudflare Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [实际验收 / Actual verification](verification/v4.5.0/README.md)
