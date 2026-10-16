# Natural Earth countries / 国家轮廓

- Resolution / 分辨率: **50m**, i.e. 1:50,000,000 (not 50 metres).
- File: `ne_50m_admin_0_countries.geojson`
- Exact bytes / 文件大小: **3,083,490** (~3.08 MB decimal).
- SHA-256: `3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb`
- Source / 来源: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_50m_admin_0_countries.geojson
- Upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- Retrieved / 获取日期: 2026-10-16. File bytes are unmodified.
- Natural Earth contributors: Tom Patterson, Nathaniel Vaughn Kelso and other contributors.
- License / 授权: **public domain / 公有领域**. See [official terms](https://www.naturalearthdata.com/about/terms-of-use/) and [LICENSE.txt](LICENSE.txt).

The former runtime source was 110m (1:110,000,000), 838,726 bytes, SHA-256 `6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f`. It omits Malta. This 50m file contains all EU27 member features. France has `ISO_A2="-99"` and `ADM0_A3="FRA"` in both sources; styling uses `ADM0_A3`.

原先的 110m 文件没有马耳他；本地 50m 文件覆盖 EU27。行政边界及阴影只是地理示意，不是法规覆盖范围或法律管辖判断。本地化使页面不依赖远程国家轮廓请求，不保证网站未缓存时可完全离线首次打开。
