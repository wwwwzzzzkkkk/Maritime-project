# v4.7.3 verification

2026-10-22 · Pre-change checkpoint: `codex/pre-v4.7.3-checkpoint` at `0c42af3`.

## Results

- `npm test`: **48 passed, 0 failed**.
- `node --check` passed for `js/form-dialogs.mjs`, `js/decision-ui.mjs`, and `tests/dialog-motion-browser.mjs`.
- Dialog, focus, reduced-motion, intermediate-frame, mobile screenshot and Pro Max browser checks are **pending**. This environment has no installed browser binary. `npx playwright install chromium` failed because the downloaded browser archive was truncated; no product failure is implied.
- No calculation or backend files were changed. Cache version references were bumped to 4.7.3; see [cache versions](cache-versions.txt).

This record captures the checks completed for v4.7.3. GitHub Pages deployment runs from pushes to `main`; check the repository Actions page for the deployment result. Browser-level checks remain pending because this environment could not install Chromium.

## Publication / 线上发布

- 2026-10-22: `main` repaired at `61ed4f8` after four release-uploaded files were found corrupted. Uploaded blobs now match the checked local Git objects; the complete repository tree was compared with the local release tree with zero differences.
- Both Pages workflows succeeded for `61ed4f8`: [platform deployment](https://github.com/wwwwzzzzkkkk/Maritime-project/actions/runs/39722533508) and [static deployment](https://github.com/wwwwzzzzkkkk/Maritime-project/actions/runs/39722533448).
- 发布上传的四个文件已修复，远端完整文件树与本地检查版本一致，两项 Pages 部署均成功。浏览器动画、焦点、减少动态效果与移动端专项检查仍待完成。
