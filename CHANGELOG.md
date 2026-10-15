# Change log

## Quick adjuster motion · 2026-10-15

- Remove pointer tilt and spatial parallax from the overview quick adjuster and its nested controls, retaining glass styling and pointer highlights.

## Mobile live budget window · 2026-10-15

- Show a compact glass budget window when original mobile budget cards leave view, including in other modules.
- Reuse the existing calculated amounts; keep EUR and GBP separate and update with every input change.
- Support touch dragging, keyboard movement, collapse/expand and position reset; hide when original cards return to view.
- Keep desktop layout and existing visual effects intact. Add bilingual quick-start instructions.

## Mobile layout follow-up · 2026-10-15

- Fit all five mobile tabs using short bilingual names while retaining full accessible names and the original sliding pill.
- Keep multi-row vessel/context content inside a padded rounded glass container.
- Show shared budget cards on mobile overview only; keep scenario controls available in the IMO view.
- Position selected module content below the sticky header immediately, retaining the original panel effects.
- Desktop layout, calculations and original materials/effect definitions are unchanged.

## Light update · 2026-10-15

- Retain the original glass UI, colors, fonts, 3D pointer tilt, sliding navigation, transitions, stagger and chart replays, as requested.
- Adjust header wrapping, narrow-screen cards and table scrolling.
- Fix positive-balance penalties, baseline consistency, limited pooling, dynamic audit rows and IMO/regional parameter coupling.
- Label demo data, CO₂-only subtotals, contract examples and unverified capabilities accurately.
- Add official references, market/human-workload/ESG plans and a current-state JSON snapshot.
- Queue hidden-map camera work until visible, retaining the original visible animation.
- Keep the original version under `light-v3.4-baseline-2026-10-15`; use separate commits and a final tag for rollback.

The other edition and its shared data are unchanged. Verification is deliberately limited to necessary math checks and one page smoke check.
