# v4.7.0 实际验收 / Verification

2026-10-22 · Baseline `light-v4.6.0-baseline-2026-10-22` (`0c21aa9`). **仅Chrome / Chrome only.** Synthetic records and mocked AI responses. No hash/performance/cross-browser audit, paid model answer or uploaded project-report attachment.

## 结果 / Results

- `npm test`: **43 tests,43 pass,0 fail**, run once ([raw output](npm-test.txt)). Four new tests cover anonymous projections/scope, unknown impacts, boundary validation/sum reconstruction, both adapters' selected-source contract and existing access-code gates.
- Browser verification found the new `[userpolicy]` reference marker still visible in answer text. Added it to the existing safe renderer's supported citation markers and extended its test. Only `node --test tests/ai-answer.test.mjs` was rerun: **3 pass,0 fail** ([output](answer-test-final.txt)); no second broad suite.
- Protected five-file diff against baseline: **exit0, no differences** ([record](protected-diff.txt)). No hashes calculated. Engine remains light-4.2.0.
- [Completed browser assertions](browser-results.json): existing policy→same assistant, no auto-send, renewed consent, keyboard-operated preview, matching anonymous request, selected user-source link, no raw marker, budgets unchanged. Editing only the active vessel does not change a saved-fleet explanation; explicitly updating its snapshot marks the answer stale. Text-only evidence stays null/unknown. Deleting linked records disables sending. Explicit return clears context/question/consent and retains the original single-vessel contract.
- Main page completed with no page errors. Pro Max loaded with no page errors, replacing its external Leaflet with the existing local vendor only for this smoke. No Pro Max certification or audit is claimed.

## 基准 / Benchmarks

Exact raw before/after comparison is recorded in browser-results. Rounded display:

| Item | v4.6.0 | v4.7.0 |
| --- | ---: | ---: |
| EU ETS CO₂ | €88,000 | €88,000 |
| UK ETS CO₂ | £13,200 | £13,200 |
| FuelEU2% | €237,191.27 | €237,191.27 |
| FuelEU6% condition | €619,346.72 | €619,346.72 |
| Owner85% | €276,413 | €276,413 |
| Charterer15% | €48,779 | €48,779 |

## 截图 / Screenshots

One completed Chrome session covered Chinese/English at1440/768/375px with page-width containment assertions. Captures use mock responses, not live provider quality evidence. Switching language preserves the existing user question/answer; it does not translate a previous answer. Floating budget hidden **only during panel capture**; product behavior retained.

| Width | 中文 | English UI |
| --- | --- | --- |
|1440|[图](policy-ai-zh-1440.png)|[Image](policy-ai-en-1440.png)|
|768|[图](policy-ai-zh-768.png)|[Image](policy-ai-en-768.png)|
|375|[图](policy-ai-zh-375.png)|[Image](policy-ai-en-375.png)|

The completed check used `node tests/policy-ai-browser.mjs` against `http://127.0.0.1:48184`, headless `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. External fonts/tiles were blocked; this is not real offline or first-load verification. The existing synthetic v4.6.0 fixture was used with actions removed to allow the source-deletion test; it is not customer data.

## 保留的失败记录 / Retained failures

1. First attempt read `innerText` from the closed preview disclosure, producing empty text and a JSON parse error. Changed the test to inspect `textContent`, then operate the native disclosure with the keyboard. [Log](browser-first-attempt.txt). No product fallback was added.
2. Second attempt exposed the actual unstripped `[userpolicy]` marker. [Log](browser-second-attempt.txt). Fixed the existing renderer, ran its focused tests, and reran the incomplete browser workflow. The completed run passed; no repeated checks after that pass.

## 数据与部署 / Data and deployment

[Cache references](cache-versions.txt) are uniformly4.7.0. Protected historical source contents are unchanged; footer Release URL activates separately after Release creation.

Actual cloud command: `npx --yes wrangler@4.151.1 deploy --secrets-file /Users/zhekuan/.config/mareg/worker-secrets.json`.
[Deployment output](worker-deploy.txt): Worker version `330e6b2a-bc6e-44ff-8210-9a17f712f4c6`. Private values were not printed/committed. [Read-only health](worker-health.json) returned configured=true, deepseek-flash, access-code required, knowledgeVersion4.7.0. This does not claim a real model answer was checked. Provider tests and browser replies are mocks.

Selected free-text policy notes/source and anonymous amounts are transmitted **only after selection and renewed consent**. Dedicated profile/name/customer-reference fields, raw ledgers, author/reviewer names, action history and whole workspaces are excluded. Free text can itself contain sensitive content; the UI tells users to review it. Unknown extra boundary fields are stripped; totals are reconstructed separately by currency. The server does not verify the real-world accuracy of the browser's model inputs or the policy URL.

## 范围 / Limits

The unshipped beginner/demo-entry work was withdrawn at the user's request; it is absent from this release. The same five views and existing glass/motion remain. Main business linkage is improved; no live legal retrieval, authenticated expert approval, execution, filings, customer cloud isolation or actual ESG results are claimed. Original WeChat-temp report path was unavailable this round; report alignment used the preserved project reading text and the already established main workflow, without a new regulatory review. Source dates remain visible and unchanged unless entered by the user.
