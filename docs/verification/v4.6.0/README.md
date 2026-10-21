# v4.6.0 验收 / Verification

2026-10-21 · Baseline `light-v4.5.2-baseline-2026-10-21` (`4b6e937`). **仅Chrome / Chrome only.** Synthetic classroom records only; no user/customer report uploaded. No hashes, performance audit, paid model call or cross-browser certification.

## 实际结果 / Actual results

- `npm test`: **39 tests,39 pass,0 fail** ([完整真实输出](npm-test.txt)). First run had38 pass/1 failure because an aggregation assertion compared floating tails strictly; calculations were unchanged, assertion changed to1e-6 tolerance and its focused rerun passed. Initial log retained in [npm-test-first-attempt.txt](npm-test-first-attempt.txt).
- After final external-file snapshot validation and mobile value-grouping correction, only `node --test tests/decision-desk.test.mjs` was rerun: **6 pass,0 fail** ([output](decision-test-final.txt)). No further full suite was run. Cases include5/20 vessel aggregation, scope/unknown impacts, source revisions, review/implementation gates, legacy compatibility, escaping and frozen report sources.
- Protected-file `git diff --exit-code` against baseline: **exit0, no differences** ([record](protected-diff.txt)). No hashes calculated.
- [Browser results](browser-results.json): five independent vessels; profile edit and explicit single snapshot update; manual policy with6%/EUA100 comparison; second-person review; action gates and implementation evidence; source revision marks stale. Local save/export and report checks passed in the workflow session. File restoration/layout checks resumed separately with the [synthetic fixture](demo-workspace.json); this is not a captured customer or production workspace.
- [Final mobile correction](mobile-final-results.json): a multi-child name/reference cell originally split into separate flex items. Added one value wrapper per cell; focused375px Chinese/English panel checks and captures verify grouping and page containment. Other layouts/motion were not redesigned.
- Old workspace compatibility is covered by domain tests. Native form disclosure was operated with keyboard Enter; no full accessibility audit is claimed.
- Main page had no `pageerror` in completed checks. Pro Max loaded without page errors; its external Leaflet was replaced with the existing local vendor for this smoke only. External fonts/tiles were blocked in these checks; not real offline certification or a first-load guarantee.

## 基准金额对照 / Before and after

Engine results were compared directly to baseline source, with exact equality; raw values are in [browser-results.json](browser-results.json). Display-rounded figures:

| 项目 / Item | v4.5.2 | v4.6.0 |
| --- | ---: | ---: |
| EU ETS CO₂ | €88,000 | €88,000 |
| UK ETS CO₂ | £13,200 | £13,200 |
| FuelEU2% condition | €237,191.27 | €237,191.27 |
| FuelEU6% condition | €619,346.72 | €619,346.72 |
| Owner85% | €276,413 | €276,413 |
| Charterer15% | €48,779 | €48,779 |

## 截图 / Screenshots

The three new panels were captured in Chinese/English at1440/768/375px (18 captures, filenames listed in browser-results).375px final captures supersede the earlier mobile captures after the cell-grouping fix. The original18 include the unchanged floating budget, which may lie partly outside a panel crop; the final6 hide that overlay **only during capture**, not in product code.

| 面板 / Panel | 中文1440 | English1440 | 中文768 | English768 | 中文375 final | English375 final |
| --- | --- | --- | --- | --- | --- | --- |
| 船队 / Fleet | [图](fleetDesk-zh-1440.png) | [Image](fleetDesk-en-1440.png) | [图](fleetDesk-zh-768.png) | [Image](fleetDesk-en-768.png) | [图](fleetDesk-zh-375-final.png) | [Image](fleetDesk-en-375-final.png) |
| 政策 / Evidence | [图](policyEvidenceDesk-zh-1440.png) | [Image](policyEvidenceDesk-en-1440.png) | [图](policyEvidenceDesk-zh-768.png) | [Image](policyEvidenceDesk-en-768.png) | [图](policyEvidenceDesk-zh-375-final.png) | [Image](policyEvidenceDesk-en-375-final.png) |
| 行动 / Actions | [图](actionDesk-zh-1440.png) | [Image](actionDesk-en-1440.png) | [图](actionDesk-zh-768.png) | [Image](actionDesk-en-768.png) | [图](actionDesk-zh-375-final.png) | [Image](actionDesk-en-375-final.png) |

## 异常与范围 / Failed attempts and limits

- First browser attempt reached policy input, then the test tried to fill a field inside a closed numeric-conditions disclosure. Updated the harness to open its ancestor details; product did not need a fix. [Log](browser-first-attempt.txt).
- Two readiness attempts timed out, one explicitly recording local `app.js` connection reset. Replaced the task's Python preview server with a larger request backlog, then loaded successfully. [Second](browser-second-attempt.txt), [third](browser-third-attempt.txt). This was a local preview issue; no production network retry/fallback was added.
- Workflow next passed through local save, JSON export and HTML export, but checked the asynchronous file-read status too soon. [Original result](browser-workflow-results.json). Corrected the wait, then finished file recovery/keyboard/layout/Pro Max checks with the synthetic fixture via `node tests/decision-browser-finish.mjs`; no need to repeat the completed workflow. [Completion log](browser-finish-log.txt).
- Final mobile-only correction was checked via `node tests/decision-mobile-final.mjs`, without another broad workflow run.
- Browser checks use headless `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` and local URL `http://127.0.0.1:48184`. They do not establish real-vessel correctness, actual annual completeness, customer security, authenticated reviews, actual procurement or legal compliance.

## 缓存与云端 / Cache and cloud

[41 HTML/import references](cache-versions.txt) use4.6.0. Protected historical Pro Max/data source contents are unchanged. UI/snapshot/report/package/cache/knowledge4.6.0; engine remains light-4.2.0.

Actual deployment: `npx --yes wrangler@4.151.1 deploy --secrets-file /Users/zhekuan/.config/mareg/worker-secrets.json`. Private file contents were not printed or committed. [Deployment output](worker-deploy.txt) reports Worker version `6e1b7d51-adee-4f26-8431-a5b5f0995070`. [Read-only health](worker-health.json) returned configured=true, DeepSeek Flash, access code required, knowledgeVersion4.6.0. No paid live answer was requested; API contract tests use mocked providers.

## 需团队核对 / Team follow-up

Use actual authorized vessel data to check annual coverage, policy source/status/scope, pooling/fuel supply and material spending. Review names and implementation evidence are self-entered, not authenticated external approval. Browser records require explicit local save/export and do not synchronize across devices. These remaining production boundaries are intentionally visible in UI and reports.
