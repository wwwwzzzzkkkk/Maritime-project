# v4.7.3 verification

2026-10-22 · Pre-change checkpoint: `codex/pre-v4.7.3-checkpoint` at `0c42af3`.

## Results

- `npm test`: **48 passed, 0 failed**.
- `node --check` passed for `js/form-dialogs.mjs`, `js/decision-ui.mjs`, and `tests/dialog-motion-browser.mjs`.
- Dialog, focus, reduced-motion, intermediate-frame, mobile screenshot and Pro Max browser checks are **pending**. This environment has no installed browser binary. `npx playwright install chromium` failed because the downloaded browser archive was truncated; no product failure is implied.
- No calculation or backend files were changed. Cache version references were bumped to 4.7.3; see [cache versions](cache-versions.txt).

This record captures the checks completed for v4.7.3. GitHub Pages deployment runs from pushes to `main`; check the repository Actions page for the deployment result. Browser-level checks remain pending because this environment could not install Chromium.
