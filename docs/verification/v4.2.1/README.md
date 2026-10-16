# Stage 1 verification / 阶段 1 验证

Baseline: `light-v4.2.0-baseline-2026-10-16` (`05cd7de`). Date: 2026-10-16.

| 指标 / Metric | v4.2.0 | v4.2.1 |
| --- | ---: | ---: |
| EU ETS CO₂ | €88,000 | €88,000 |
| UK ETS CO₂ | £13,200 | £13,200 |
| FuelEU 2% | €237,191.27 | €237,191.27 |
| FuelEU 6% | €619,346.72 | €619,346.72 |
| 船东 / Owner 85% | €276,413 | €276,413 |
| 租家 / Charterer 15% | €48,779 | €48,779 |

Engine SHA-256 before/after: `f4a61de5383a8aab8fbac26e8ac56428d00a6d6a5d2664b940d3051cb787363c` (identical).

- [真实 npm test 输出 / Actual output](npm-test.txt): 14 passed, 0 failed.
- [完成的浏览器检查 / Completed browser output](browser-test.txt) · [断言结果 / Assertion results](browser-results.json).
- [第一次固定列断言失败记录 / Initial sticky-column measurement failure](browser-attempt-1.txt). The successful run moves the pointer out and waits for existing hover motion to settle; no product motion was changed for this assertion.
- [实际 GeoJSON 检查 / Inspected source data](geo-inspection.json).
- Raw baselines: [before](baseline-before.json), [after](baseline-after.json). [Planner baseline](planner-before.json) was deeply compared with the unchanged current planner result.
- [1440 / 768 / 375 前后截图 / Screenshots](../../previews/v4.2.1/README.md).

通过请求拦截模拟，不是真实离线，也不保证未缓存时首次打开。The external requests were intercepted, not truly offline. Pro Max's Leaflet CDN requests were fulfilled with unchanged vendored 1.9.4 files, so CDN availability was not tested.
