# v4.7.1 实际验收 / Verification

2026-10-22 · Baseline `light-v4.7.0-baseline-2026-10-22` (`c20b2c2`). **仅Chrome / Chrome only.** No hash/performance audit, new dependency or paid-model answer. No customer files/report were sent to the public source route.

## 实际执行 / Actual checks

- `npm test` ran once: **48 tests,48 pass,0 fail** ([raw output](npm-test.txt)). Five new tests cover HTML/API extraction and dates, redirect/challenge/size boundaries, fixed-source/cache/partial failures, provenance/workspace recovery, and provenance-aware AI with a mocked provider.
- `node tests/official-dialog-browser.mjs` completed in one session ([output](browser-log.txt), [assertions](browser-results.json)). No page runtime errors. Confirmed eight closed secondary dialogs, no duplicate DOM IDs, and all original named input IDs/ranges/steps retained (DOM order intentionally changes). Exercised fleet add/edit, Escape and focus return, mounted draft retention, invalid numeric blocking, valid apply-close, assumption-chip jumps, ledger apply, source import, review, planning-case save and action generation/details. Workspace/report exports retained the selected retrieval record.
- Browser source replies were mocked with **3 successes +1 explicit failure** to test that a failed source remains visible. The real public sources were checked separately, below. No fake/real classroom code was needed to retrieve policy sources.
- Compared six raw engine values directly to baseline source: exact equality. Five protected source files matched baseline via `git diff --exit-code`: **exit0, no differences** ([record](protected-diff.txt)). No hashes calculated.
- Pro Max loading smoke passed with no page errors; external Leaflet was replaced by the existing local vendor for that check only. No deeper audit or cross-browser certification.
- Source/AI/entry modules passed syntax checks. Whitespace check passed. First-party light HTML/import cache parameters are4.7.1 ([54 positions](cache-versions.txt)); server-only imports use normal module filenames and are not browser-cache resource references.

## 实际官方读取 / Real official retrieval

1. Read-only `node --use-system-ca` fetch through the actual extraction functions: **4/4 success**, saved as [metadata](live-official-probe.json). No TLS verification bypass. All four returned nonempty excerpts. Only GOV.UK supplied supported publication/update metadata; other missing dates stayed null.
2. Deployed Worker version **`9837b3a8-a76c-4527-a28c-bba181aabb4d`**, actual command `npx --yes wrangler@4.151.1 deploy --secrets-file /Users/zhekuan/.config/mareg/worker-secrets.json` ([deployment output](worker-deploy.txt)). Private values were not printed/committed.
3. Actual public Worker `GET /api/policies`: **4/4 success**, no AI/customer payload, all initially uncached ([metadata](worker-official-probe.json)). A second GET with the site's Origin header returned **4 cache hits**, unchanged retrieval timestamps and the correct CORS header ([record](worker-cache-cors.json)). No third request/probe loop.
4. Read-only health reported configured DeepSeek, classroom-code gate and knowledge4.7.1 ([health](worker-health.json)). No paid live model answer was requested. The metadata-export script initially had an unquoted-key typo; corrected by rereading the already-downloaded response, without another upstream request. This did not affect the service.

This is actual retrieval of four configured pages, **not** proof that all applicable regulations are current, all amendments were discovered, the excerpts are exhaustive, or the user's legal scope is verified. [Source catalogue/API/reuse terms](../../OFFICIAL_SOURCES.md).

## 基准金额 / Benchmarks

Raw numbers: browser-results. Display rounding:

| Item | v4.7.0 | v4.7.1 |
| --- | ---: | ---: |
| EU ETS CO₂ | €88,000 | €88,000 |
| UK ETS CO₂ | £13,200 | £13,200 |
| FuelEU2% | €237,191.27 | €237,191.27 |
| FuelEU6% condition | €619,346.72 | €619,346.72 |
| Owner85% | €276,413 | €276,413 |
| Charterer15% | €48,779 | €48,779 |

## 截图 / Screenshots

Main policy view and secondary form captured in Chinese/English at1440/768/375px, with page/card containment checks. Screens use mock source text and a labeled test failure; not live-source content screenshots. External fonts/tiles were blocked. The floating budget was hidden only while capturing the main panel; its product behavior is unchanged.

| Width | 中文主页面 | English view | 中文弹窗 | English dialog |
| --- | --- | --- | --- | --- |
|1440|[图](policy-zh-1440.png)|[Image](policy-en-1440.png)|[图](policy-dialog-zh-1440.png)|[Image](policy-dialog-en-1440.png)|
|768|[图](policy-zh-768.png)|[Image](policy-en-768.png)|[图](policy-dialog-zh-768.png)|[Image](policy-dialog-en-768.png)|
|375|[图](policy-zh-375.png)|[Image](policy-en-375.png)|[图](policy-dialog-zh-375.png)|[Image](policy-dialog-en-375.png)|

After visual review, narrowed stretched entry buttons, hid empty hint paragraphs and clarified “Source check / retrieval date.” Only a focused1440/375 policy-dialog visual/focus check was run: `node tests/dialog-visual-final.mjs` ([output](visual-final-log.txt)). No broad workflow or unit suite was repeated. Final representative dialogs: [1440](policy-dialog-zh-1440-final.png), [375](policy-dialog-zh-375-final.png). These supersede the earlier spacing/date-label captures. Screens were inspected locally.

## 保留范围 / Boundaries

- Eight manual entry forms moved; everyday sliders, applied-value tags, comparison results and existing glass/motion stay in the original views. Input confirmations and errors still gate application. Closing preserves a mounted draft, not a saved record.
- Public-page GET uses a fixed catalogue, no arbitrary URLs/customer data/access code/model requests. Success cache can be up to15 minutes old. Excerpts are attributed and limited; original text/reuse terms govern.
- Import opens an unsaved planning draft. No automatic legal status, prices, approvals or budget updates. Unknown publication dates are allowed only with their original retrieval record; manual evidence still requires dates. File-restored provenance is not independent authentication/tamper-proof audit.
- AI explanations remain consented. Retrieved sources are distinguished from manual records; neither establishes legal applicability or guarantees procurement/filing outcomes. All earlier CO₂-only, demo, unverified, separate-currency and non-legal-advice boundaries remain.
