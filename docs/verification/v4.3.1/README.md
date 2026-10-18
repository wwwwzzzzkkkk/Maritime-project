# v4.3.1 验收材料 / Verification evidence

Baseline: `light-v4.3.0-baseline-2026-10-18` (`04c4dc5`). Scope: **仅 Chrome / Chrome only**. No performance comparison, cross-browser certification, actual-vessel verification or repeated hashes.

| Item | Before | After |
| --- | ---: | ---: |
| EU ETS CO₂ EUR | €88,000 | €88,000 |
| UK ETS CO₂ GBP | £13,200 | £13,200 |
| FuelEU 2% condition | €237,191.27 | €237,191.27 |
| FuelEU 6% condition | €619,346.72 | €619,346.72 |
| Owner EUR, rounded | €276,413 | €276,413 |
| Charterer EUR, rounded | €48,779 | €48,779 |

## Logs and data

- [Actual npm test output](npm-test.txt): 17 pass / 0 fail, run once, including three new adapter/engine-consistency cases.
- [Protected-file diff](protected-diff.txt): exit 0, empty diff. No hashes.
- [Main browser assertions](browser-results.json) and [output](browser-output.txt).
- [Eight keyboard tag-focus assertions](keyboard-tags.json), a narrow follow-up because the main session's tag loop did not explicitly assert every final focus target; the committed main script now does.
- [Boundary follow-up](boundary-followup.json) and [output](boundary-output.txt): original MJ bounds and near-upper-bound representation, demo defaults and all three reset flags. Added after allowing normal floating-point round-off at very large MJ values; not a repeated full suite.
- [12 active cache references](cache-references.json), all `?v=4.3.1`: index HTML (4), app imports (4), planning UI imports (2), planner (1), adapter (1). Historical test/reference documents retain their original version labels.
- [Before snapshot](snapshot-before.json) / [After snapshot](snapshot-after.json): deep-equal after excluding only `uiVersion` and `generatedAt`; no tonnes field added. [6% condition](snapshot-six-percent.json).
- [User-confirmed snapshot](snapshot-confirmed.json), [demo defaults](snapshot-demo-defaults.json), [reset snapshot](snapshot-reset.json).
- [Before](snapshot-before-presets.json) / [After](snapshot-after-presets.json) the preset sequence: original prices, energy, availability and confirmation preserved.
- [Six screenshots plus advanced mobile](../../previews/v4.3.1/README.md), visually inspected as a six-view contact sheet and larger desktop/mobile crops.

## Checked behavior

Five numeric inputs visible by default; all 14 original named inputs plus the derived tonne display editable when Advanced opens. Original min/max/step retained. Both unit directions, default markers/restores, applied versus draft tags, empty/range/fractional-MJ errors, help focus/Escape, disclosures, exact preset values, confirmation/reset, and a 30-frame slider input sequence passed. No page runtime errors. Page and control widths fit 1440/768/375 in both languages; comparison tables keep their existing local scrolling behavior.

Pro Max loaded with expected £13,200 and Leaflet panes, with no application console/page errors. Its CDN Leaflet requests were replaced with unchanged vendored 1.9.4 bytes for the test; expected intercepted-resource network errors were excluded. CDN reachability was not tested. Fonts/tiles were blocked in the light check as well: this is request interception, not actual offline testing.

Human review remains: presentation-device readability and workflow; real inputs, certified fuel factors, quotes, pool availability and legal conditions. Demo confirmation is not verification. A negative fuel delta is not a full voyage bill or proven physical decarbonisation.
