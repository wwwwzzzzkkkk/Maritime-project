# 官方资料获取 / Official-source retrieval

v4.7.1 · 2026-10-22

进入“未来情景”时，从现有后端自动读取下列四个固定来源。它们是配置的参考页面，**不是全部新法规的实时监控**。成功结果最多缓存15分钟；显示实际获取时间、原站提供的发布日期／更新时间和短节选。没有日期就显示未知，不把页面中的会议日或今天误当成发布日期。部分失败单独提示，可打开原页核对。

Future Scenarios retrieves these configured official pages through the existing backend. This is **not comprehensive live legal/news monitoring**. Successes can be cached for15 minutes. Retrieval time and supplied source dates are separate; missing dates stay unknown. Partial failures are visible. Neither retrieval nor source import establishes legal applicability, adoption, certification or expert approval.

| Source | Official page | Retrieval / reuse |
| --- | --- | --- |
| European Commission · EU ETS | [Shipping sector](https://climate.ec.europa.eu/areas-action/transport-decarbonisation/reducing-emissions-shipping-sector_en) | Official HTML; [EC legal notice](https://commission.europa.eu/legal-notice_en) |
| European Commission · FuelEU | [FuelEU Maritime](https://transport.ec.europa.eu/transport-modes/maritime/decarbonising-maritime-transport-fueleu-maritime_en) | Official HTML; [EC legal notice](https://commission.europa.eu/legal-notice_en) |
| GOV.UK · UK ETS | [Maritime compliance guidance](https://www.gov.uk/guidance/uk-emissions-trading-scheme-for-maritime-how-to-comply) | [Official Content API](https://www.gov.uk/api/content/guidance/uk-emissions-trading-scheme-for-maritime-how-to-comply); [API documentation](https://content-api.publishing.service.gov.uk/); [OGL v3](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) |
| IMO | [ISWG-GHG22,1–4 September2026](https://www.imo.org/en/mediacentre/meetingsummaries/pages/iswg-ghg-22.aspx) | Specific official meeting page, not the whole IMO feed; [IMO disclaimer/copyright](https://www.imo.org/en/About/Pages/Disclaimer.aspx) |

官方原页及其使用条款优先。应用仅展示带出处的短节选，不复制完整法规或替代官方文本；第三方图片等例外内容不抓取。英国接口无需密钥，公开文档说明限流；本功能仅作固定页面请求并缓存，未爬取整个网站。本轮没有新增第三方代码、文件库或依赖。

Original pages and their applicable reuse terms govern. Only attributed short text excerpts are displayed; no images/full legal corpus are copied, and the original remains authoritative. GOV.UK provides a public content interface; its documented limits apply. Requests are for fixed pages with caching, not a site crawl. No third-party code/library/dependency was added.

## 成本与数据边界 / Cost and data boundaries

- `GET /api/policies`不发送客户数据或课堂码，不调用付费AI；只读取固定目录，不接受用户传入URL，重定向限于对应官方站点。
- 官方资料用于比较时，打开待保存草稿：planning、无数值参数、无复核。用户明确选择适用船舶和条件后才保存；不自动改变既有政策记录、引擎或预算。
- 保存的获取记录包含URL、标题、实际获取时间、可用原站日期及节选。它是本机工作区数据，导入后不构成独立鉴真或防篡改审计。
- AI解释仍需主动同意；其来源可以显示保存的获取记录，但不能把获取等同于法律核验，也不能凭节选虚构成本参数、实施日期或保证可执行。

The public GET transmits no customer data/code and makes no paid-model request. It accepts no arbitrary URLs; redirects stay on the corresponding configured official origin. Selecting a source opens an unsaved planning draft with no numeric conditions or approval; explicit scope/condition saving remains necessary. Saved provenance is editable local evidence, not independently authenticated on import. Consented AI explanations may describe it, but cannot equate retrieval with legal verification or infer unprovided financial conditions.
