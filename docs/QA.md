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
