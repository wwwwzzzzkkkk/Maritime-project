# v4.4.0 验收材料 / Verification evidence

Baseline: `light-v4.3.1-baseline-2026-10-18` (`c1de121`). Browser scope: **仅 Chrome / Chrome only**. No hashes or performance work. AI scope explicitly follows the user's choice: safe connection + local backend, disconnected until configured.

| Benchmark | Before | After |
| --- | ---: | ---: |
| EU ETS CO₂ EUR | €88,000 | €88,000 |
| UK ETS CO₂ GBP | £13,200 | £13,200 |
| FuelEU 2% | €237,191.27 | €237,191.27 |
| FuelEU 6% condition | €619,346.72 | €619,346.72 |
| Owner EUR, rounded | €276,413 | €276,413 |
| Charterer EUR, rounded | €48,779 | €48,779 |

## Logs and assertions

- [npm test actual output](npm-test.txt): 26 pass / 0 fail, once. Includes ledger/scoping, CSV boundaries, workspace validation/recomputation, report escaping, conditional costs and server-side AI contracts.
- [Report/domain follow-up](report-domain-followup.txt): 6 pass, after adding the six-option report and readable default-vessel name.
- [Existing pool range follow-up](pool-state-followup.txt): 1 pass, confirming a legitimate 1000 tCB request can be validated/restored and capped by the actual deficit.
- [AI UTF-8 transport follow-up](ai-transport-followup.txt): 3 pass after decoding complete buffered request bytes; includes Chinese question preservation. Mock provider only.
- [Protected diff](protected-diff.txt): exit 0. The engine, shared data and all three Pro Max files are unchanged.
- [Baseline values](baseline-values.json) and [default snapshot](snapshot-default.json): same fields/values as v4.3.1 except UI version and generated time.
- [Browser results](browser-results.json) / [output](browser-output.txt): explicit local save/reload/restore; invalid workspace rejection; report; CSV previews and derived accounting; readonly derived inputs; unsupported scope/missing-factor rejection; saved policy conditions; AI consent, disconnected state and citation contract; six layouts; keyboard; Pro Max.
- [Initial startup timeout](browser-navigation-attempt1.txt) / [failure detail](browser-navigation-failure.json): no functional checks completed. Navigation wait was adjusted; do not treat this as a product failure or passing run.
- [Narrow final follow-up](followup-results.json) / [output](followup-output.txt): clear previews after draft edits without changing budgets, quoted CSV editor restoration, six-option report and final six screenshots. No full-suite rerun.
- [Active browser resource version positions](cache-references.json): all `?v=4.4.0`. Node-only backend/test imports do not use browser cache parameters.

## Artifacts

- [Demo workspace](workspace-demo.json), [policy workspace](workspace-policy.json), [unified ledger workspace](workspace-ledger.json), [ledger snapshot](snapshot-ledger.json).
- [Standalone readable report](report-zh.html); print/save-PDF entry is provided but actual print pagination was not tested.
- [Final screenshots](../../previews/v4.4.0/README.md).

The coherent sample ledger produces scoped energy 14,432,000 MJ and coverage-weighted distance 3300 nm, EU CO₂ 1096.128 t → €87,690.24, UK CO₂ 219.2256 t → £13,153.536 before display rounding. It is deliberately different from the unchanged independent A3 benchmark. Screening/filling is non-mutating; applying it is explicit. Annual completeness and factors are unverified. Time/distance retain accounting-scope approximations, not verified arrival timing.

AI checks: real loopback health confirmed not configured; the provider call was mocked in unit tests and the browser answer/citations were mocked at ai.example.test. No real model call, API-account entitlement, provider accuracy or hosted AI deployment was verified. Raw CSV/legs were excluded from the sent browser payload. No production claims follow from these checks.

Pro Max: expected £13,200 and Leaflet panes loaded, no application console/page errors. Its CDN requests were replaced by unchanged vendored Leaflet 1.9.4, external network failures excluded. CDN availability not checked. Main page had no pageerror. External-resource interception is not actual offline verification.
