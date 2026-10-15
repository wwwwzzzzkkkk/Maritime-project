# Delivery verification · original UI retained

Final scope follows the user's request to retain the existing visual and motion design and avoid excessive checks.

Completed:

- 9 core calculation regression tests passed, covering A3 values, positive balances, baseline identity, pooling limits, repeated deficits and negative client economics.
- One bounded Chrome page smoke check passed: baseline figures, surplus vessel, JSON snapshot, native Escape close, reset while the map was hidden, and desktop/mobile layout.
- No page runtime errors in that smoke check.
- Original `styles/tokens.css` is unchanged. The original `styles/main.css` content is retained with appended responsive layout/modal-sizing rules; original effect definitions and timing values were not replaced.

No further full-site scan or broad compatibility audit was performed after the user's latest instruction. Real-vessel verification, Safari/Firefox and full WCAG certification remain outside this verification scope.

![Preserved original desktop design](previews/original-ui-desktop.png)

![Preserved original mobile design](previews/original-ui-mobile.png)

## Mobile layout follow-up

One focused browser session checked 320/390px Chinese/English tab and context containment, immediate content visibility when switching the five mobile views, continued IMO-control availability, and desktop summary retention. No page runtime errors were observed. No calculation or broad browser suite was rerun for this layout-only change.

![Mobile audit content visible immediately after switching](previews/mobile-audit.png)


## v4.1.0 customer-content delivery · 2026-10-15

One focused Chrome desktop (1440px) / mobile (390px) session passed:

- New bilingual five-tab navigation, demo notice and the unchanged €88,000 / €237,191.27 baseline.
- Input-linked comparison delta, collapsed/open calculation trace and seven official reference links.
- Future scenario selection leaves regional budgets unchanged and shows no venture break-even figures.
- Preset customer FAQs in Chinese/English, native snapshot export containing `uiVersion: 4.1.0` and `etsComplete: false`.
- Mobile navigation/float, page-width containment and the flat quick adjuster; no page runtime errors.

Desktop/mobile screenshots were inspected locally. Source syntax and whitespace checks passed. No new calculation-engine changes, repeated full suites, live-vessel validation or cross-browser certification were performed. Source/reference dates are retained from the prior review, not a new regulatory audit.


## v4.2.0 scoped planning and desktop float · 2026-10-15

Passed the existing nine engine checks and five focused planner/accounting checks. New checks cover independent extra-time/auxiliary-cost calculations, party accounting identities, time/fuel limits, confirmed versus uncertain supply, uneconomic pooling and non-grid fuel caps. No additional repeated broad suites were run.

One Chrome desktop (1440px) / mobile (390px) interaction session passed: original budget values, desktop automatic floating budget and mouse drag/collapse/reset, input drafts and native required-field validity, editable UK price, six option rows, constraint violations, conditional candidate loading, GENCON/NYPE allocation without changing total, bilingual labels, snapshot versions and applied input/search provenance, mobile containment and vessel/reset behavior. No page runtime errors. Screenshots were visually inspected; Google Fonts were blocked in the check to avoid external font-loading delay. This is not a live-data, regulatory, full accessibility or cross-browser audit. Final table ordering prioritizes scoped total and party amounts; component columns remain horizontally scrollable.
