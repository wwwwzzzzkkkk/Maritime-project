# Light edition: preserve the original design

The final user instruction is to preserve the original UI and motion effects, allowing layout adjustments. Changes to the visual or motion design require asking first.

The baseline `styles/tokens.css` is unchanged. The original 1,400 lines of `styles/main.css` remain intact; a final section adjusts wrapping, widths and mobile stacking. Original glass materials, colors, fonts, optical SVG filter, pointer tilt, sliding pill, staggered transitions, chart replays and their timings remain.

The original five views and card layouts are retained. Content changes correct model scope and evidence. Existing card/table styles are reused for added course evidence.

The hidden-map reset fix queues camera work until the original overview is visible, without changing the visible `flyTo` animation. The snapshot uses native dialog behavior while retaining the original full-screen backdrop and glass modal card styling.

Verification is limited to the core calculation regressions and one bounded desktop/mobile page smoke check, as requested.

Mobile follow-up: five short labels retain the original sliding pill; the multi-row context uses the existing large corner radius rather than a full capsule. Shared KPIs stay on the overview and the selected module is positioned below the sticky header. These are mobile layout changes, not a change to materials or panel/chart animations.
