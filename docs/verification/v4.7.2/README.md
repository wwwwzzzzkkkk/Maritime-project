# v4.7.2 实际验收 / Verification

2026-10-22 · Baseline `light-v4.7.1-baseline-2026-10-22` (`b999492`). **仅Chrome / Chrome only.** Dialog animation checks, not performance profiling. No hashes, dependencies, backend deployment or live AI/source requests.

## 实际结果 / Results

- `npm test` ran once: **48 tests,48 pass,0 fail** ([raw output](npm-test.txt)). No calculation/backend changes and no repeated broad suite.
- Final `node tests/dialog-motion-browser.mjs` completed ([raw output](browser-log.txt), [measured states](browser-results.json)). Verified220ms entry and150ms exit, opacity/2D card transform, native display retained through exit, closing inputs inert, focus return, submitted-field reset after fade, interrupted reopen without stale reset, Escape, backdrop and action-generator→editor handoff.
- Mobile375px English form containment and backdrop exit passed. Reduced-motion context opened/closed immediately with no opacity transition. Completed page checks had no runtime errors. Pro Max loaded with no page errors; only its external Leaflet was replaced with the existing local vendor for this smoke.
- Five protected files matched baseline via `git diff --exit-code`: **exit0**, no differences ([record](protected-diff.txt)). Six raw model values matched exactly; rounded figures below.
- [54 light HTML/import cache references](cache-versions.txt) use4.7.2. UI/snapshot/report/package version4.7.2; backend/knowledge4.7.1, engine light-4.2.0. No Worker redeployment or secret change.

## 真实动画帧 / Actual controlled frames

Transitions were paused through the browser Animation API for reproducible intermediate-frame inspection; this is not a performance/CPU/GPU benchmark. The final run measured:

- Entry at20%: opacity0.681869; native modal open; card scale≈0.992 and translateY≈3.18px; duration220ms.
- Exit at20%: opacity0.318131; native open=false, inert=true, display still flex; duration150ms. Submitted reference remained visible until fade completion, then reset.
- Interrupted close/reopen retained its current opacity and draft; the old close completion could not reset the reopened form.

[Desktop entry](desktop-enter-20pct.png) · [Desktop exit](desktop-exit-20pct.png) · [Mobile entry](mobile-enter-20pct.png) · [Mobile backdrop exit](mobile-backdrop-exit-30pct.png). These are deliberately partial-opacity frames, not normal steady-state appearance. Images were inspected locally. Existing glass/shadows/backgrounds and other card effects were not redesigned.

## 保留的未完成检查 / Retained early attempts

1. First frame assertion sampled a running220ms animation too late. A diagnostic confirmed supported native discrete transitions, opacity0 and220ms at entry. The harness was changed to pause on the native open-attribute change, await animation readiness, then sample a controlled frame. [Original log](browser-first-attempt.txt). No product fallback was introduced.
2. An earlier animation run completed its main assertions but was stopped before Pro Max smoke finished. The agent initially misidentified its waiting phase. The eventual error was the task-owned browser being closed during the smoke, not a product failure. [Correction note](browser-interruption-attempt.txt). The next complete run passed; no further broad workflow runs followed.

Scope: headless `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,1440px desktop and375px mobile, reduced-motion emulation. External fonts/tiles blocked. No physical-device gesture check, Safari/Firefox certification, current regulatory review or new real-provider answer test.

## 基准值 / Benchmarks

| Item | v4.7.1 | v4.7.2 |
| --- | ---: | ---: |
| EU ETS CO₂ | €88,000 | €88,000 |
| UK ETS CO₂ | £13,200 | £13,200 |
| FuelEU2% | €237,191.27 | €237,191.27 |
| FuelEU6% condition | €619,346.72 | €619,346.72 |
| Owner85% | €276,413 | €276,413 |
| Charterer15% | €48,779 | €48,779 |

See [project status](../../PROJECT_STATUS.md) for the delivered prototype versus real-data, regulatory/outcome and production work still required. This animation patch does not implement those additional capabilities.
