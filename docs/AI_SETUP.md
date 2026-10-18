# 本地 AI 服务 / Local AI service

v4.4.0 · **公开网页默认未连接 / Public page disconnected by default**

## 中文

本轮完成网页接口和可运行的本机后端，没有部署公网 AI 服务，也没有真实模型调用验收。自动检查使用明确的模拟响应；不要把它理解为已生成真实 AI 建议。

需要 Node.js 22+（含原生 fetch 和环境文件支持）、自己的 API 账户、密钥以及可用的 Responses API 模型。实际调用由提供商计费。密钥只进入本机服务的环境，不填进网页、聊天或 GitHub。

在仓库目录：

```sh
# 模板无密钥。将实际配置放在网站根目录之外，防止静态服务器提供该文件。
mkdir -p "$HOME/.config/mareg"
cp .env.example "$HOME/.config/mareg/ai.env"
# 用本机编辑器填写该私有文件中的 OPENAI_API_KEY 和 OPENAI_MODEL。
node --env-file="$HOME/.config/mareg/ai.env" server/explain.mjs
```

只运行 `npm run serve:ai` 也可以启动服务，但需预先在环境配置密钥和模型；未配置时 health 显示 configured:false，不会调用模型。

本地网页可另开终端运行：

```sh
python3 -m http.server 48184 --bind 127.0.0.1
```

浏览器打开本地网页，进入“帮助与说明”，服务地址填写 `http://127.0.0.1:48185`，检查连接后勾选发送同意并提问。从 GitHub Pages 访问本机服务时，Chrome 可能要求本地网络访问许可；本轮只验证本地网页的连接，未验证公网网页到真实模型的调用。

服务固定监听 127.0.0.1，只允许指定 Origin，要求 JSON 和有界请求；不会记录问题或原始台账。客户端只发送计算摘要、规划情景摘要和问题，后端附带固定来源。请求使用 `store:false`，并不等于提供商承诺零保留，仍适用账户和提供商数据政策。

回答未经人工核验；来源不足或过期时应说明。数字由现有计算引擎产生，AI 不修改规则或执行采购。暂无公网用户鉴权、多客户隔离、实时法规检索或专家审批；若未来公开后端，需要单独设计受控部署，不能把本机服务直接当作商业 API。

## English

This release implements the UI contract and a runnable local backend, not a hosted AI service. No genuine model call was accepted in verification; tests used explicit mock responses.

Use Node.js 22+, your own API key and an account-accessible Responses API model. Provider charges apply. Copy `.env.example` to a private location **outside the static website root**, fill `OPENAI_API_KEY` and `OPENAI_MODEL`, and run the command above. Do not put keys in the page, chat or GitHub. `npm run serve:ai` uses an already-configured environment; otherwise health reports disabled without a provider request.

Serve the static site on 127.0.0.1:48184 and enter 127.0.0.1:48185 in Help & About. Connect, consent and ask. Chrome may request local-network permission from the hosted website; only local-page connectivity was tested.

The server binds loopback, checks allowed browser origins and JSON/request bounds, and does not log questions or ledgers. Only calculated/case summaries and questions are sent; references are bundled server-side. `store:false` does not establish zero provider retention. Provider/account data policies still apply.

The backend is not a public authenticated multi-tenant service. No live legal retrieval, expert approval or procurement action is supplied. Review citations and dates; figures remain from the deterministic engine.

## 接口与文档 / Contract and references

- `GET /api/health`: `{protocol:"mareg-explain-v1",configured,model}`; no key returned.
- `POST /api/explain`: consented question, language, calculated metrics, price/operating assumptions and at most 12 planning summaries. Returns answer, dated whitelisted reference links and `reviewRequired:true`.
- The backend sends a server-side request to `https://api.openai.com/v1/responses`, with model/instructions/input, `store:false` and a bounded output. Model text is aggregated from output message text items.
- [OpenAI official text-generation / Responses guidance](https://developers.openai.com/api/docs/guides/text), read on 2026-10-18. Model availability and account permissions were not tested.
