# Light edition: preserve the original design

The final user instruction is to preserve the original UI and motion effects, allowing layout adjustments. Changes to the visual or motion design require asking first.

The baseline `styles/tokens.css` is unchanged. The original 1,400 lines of `styles/main.css` remain intact; a final section adjusts wrapping, widths and mobile stacking. Original glass materials, colors, fonts, optical SVG filter, pointer tilt, sliding pill, staggered transitions, chart replays and their timings remain.

The original five views and card layouts are retained. Content changes correct model scope and evidence. Existing card/table styles are reused for added course evidence.

The hidden-map reset fix queues camera work until the original overview is visible, without changing the visible `flyTo` animation. The snapshot uses native dialog behavior while retaining the original full-screen backdrop and glass modal card styling.

Verification is limited to the core calculation regressions and one bounded desktop/mobile page smoke check, as requested.

Mobile follow-up: five short labels retain the original sliding pill; the multi-row context uses the existing large corner radius rather than a full capsule. Shared KPIs stay on the overview and the selected module is positioned below the sticky header. These are mobile layout changes, not a change to materials or panel/chart animations.

## v4.1.0 customer information layout

Navigation now follows budgets, option comparison, calculation evidence, future scenarios and help. Existing glass cards and effects are reused. Formula/source disclosures and onboarding use native HTML and existing tokens. The quick adjuster remains flat, as explicitly requested; other card effects and the mobile budget window remain. The future selector lives inside its view. Course and venture plans move into public repository documents.


## v4.2.0 operating-input layout

Use the same glass cards, typography and materials for the added input disclosure, six-family comparison and conditional candidate. Original motion definitions are retained. Keep the new form flat for editing, matching the existing flat quick adjuster. The budget utility is now available on desktop and mobile with the same materials and direct drag. Dense comparison columns scroll within their container; mobile input fields stack.

## v4.2.1 explicitly approved presentation corrections

The user's stage-1 approval supersedes the historical fixed-height/illustrative-ring notes: map height is now responsive and camera bounds follow route coordinates; change rings use the disclosed ±30% scale with a 3% minimum non-zero arc, accent decreases and warn increases. The comparison occupies its own full-width glass card with five core columns and optional detail. These are the specifically approved changes; original glass tokens, remaining pointer tilt and replay timing are retained. Shared and Pro Max files are unchanged.


## v4.3.0 approved scope

Default glass, ambient glows and optical refraction remain. Text-only tokens deepen small copy while decorative accent remains unchanged. Body 15px, minimum CSS labels 12px and KPI figures 30px are intentional readability changes. CSS consolidation precedes those changes in an independent commit with pixel-identical three-width captures. Only pointer-inside table/reference reading regions settle flat; titles and display cards retain the original strengths. Clean mode, automatic high-contrast mode and GPU/performance evaluation were cancelled. Unsupported-blur fallback is a small opaque-background @supports block, not a user-selectable style.
