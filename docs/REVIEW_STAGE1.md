# 阶段 1 评审核实 / Stage 1 findings

Baseline: `light-v4.2.0-baseline-2026-10-16` (`05cd7de`). Scope: v4.2.1 presentation and demo safety; engine and commercial/physical assumptions remain unchanged.

| 意见 / Item | 核实与处理 / Finding and treatment |
| --- | --- |
| A: 11-column table | Confirmed: `index.html:405–408`, `styles/main.css:1532` at baseline. Width depends on viewport, so “~760px” is not fixed. Move only table/scope note to a full-width card; recommendation and action stay in the right column. Five core columns by default, all columns optional. |
| B: fixed map height/view | Confirmed at baseline: HTML 201, CSS 816–828, app 290–303 and 253. Use responsive height and combined actual route bounds. Permit sufficiently low zoom for narrow screens. Initial fit, full-route camera and reset use the same bounds. |
| B: France | Read the actual runtime source, not an assumed schema. Both the 110m and 50m files have France `ISO_A2="-99"`, `ADM0_A3="FRA"`. The old `ISO_A2 || ADM0_A3` chooses the truthy `"-99"`. Use ADM0_A3. |
| B: EU list | The code omits members; additionally the 110m file entirely omits Malta. Updating the country-code list alone cannot fix that. The pinned local 50m source includes all EU27. File sizes/SHA-256 and the actual inspection are recorded in vendor/geo and verification evidence. |
| C: arcs | Confirmed in both baseline render (app 782–785) and replay (200–211). They were deliberately preserved as illustrative animation, but do not represent percentage magnitude. Keep the replay timing while replacing both mappings with the approved ±30% scale, 3% non-zero minimum, zero hiding and accent/warn direction. |
| D: external links | Four static GitHub links lacked new-tab attributes. Dynamic source links already had target=_blank but only explicit noreferrer. Normalize both and Leaflet attribution links; keep the calculation trace open by default. |
| E: formatting/i18n | Confirmed baseline app 667, 599–600, 465–466 and header 6. Format the target to four decimals; refresh filter labels on vessel and language changes; remove course wording only in the light view. |
| E: ukEtsPrice | Not globally dead. Baseline light app 1123 only writes during reset, while calculations use planningSettings.ukPrice at 105. Shared data defines it at 16; Pro Max reads it at 79/88/552/727/885 and resets at 1066. Remove only the light app's obsolete write. |

## Shared course references / 共享课程引用

Global search found `Lecture 3/8` in `js/data-and-i18n.js` (v2 vessel name and comments), `Lecture 3` in `js/app-pro-max.js`, and course material in historical HTML/docs/design-system sources. The user was informed before editing. Shared/Pro Max files remain unchanged. The light app overrides the public v2 English display name locally and removes its own port-popup Lecture reference; project archives remain intact.

## Limits and publication

No computation parameters were “corrected” based solely on review opinion. Official sources and numerical assumptions were not re-audited. The only scale parameter approved here is visual: ±30% full ring, 3% minimum non-zero arc. External-network checks use request interception, not real offline or guaranteed uncached first load. The existing footer release URL is activated only after v4.2.1's tag and Release are created, through a separate final link commit without moving the tag.
