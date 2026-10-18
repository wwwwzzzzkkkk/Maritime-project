# Version history and rollback

The v4.0 light-edition work is isolated on `codex/light-audit-upgrade`. Existing `main` history is not rewritten. Pushes to `main` trigger the repository's GitHub Pages workflow.

## Saved checkpoints

- `light-v3.4-baseline-2026-10-15` → original `176aa851a79b6f713b63b2b9c6e1ac3492f4f415` before this audit's changes.
- `48112a9` → independent calculation engine, teaching data and regression tests.
- `895ebc5` → original UI/motion preservation, layout fixes, calculation integration and snapshots.
- The documentation/verification commit → scope, QA evidence and rollback instructions.
- `light-v4.0-original-ui-2026-10-15` → completed reviewed light version, final preserved-design checkpoint.

Browse these tags and the feature-branch commit history on GitHub. The individual commits preserve the calculation and UI changes separately.

## Reviewing or returning to an older version

Before the feature branch is merged, `main` remains the original live version. Closing the pull request does not change the live site. A preview checkout can be made from either saved tag without overwriting a working checkout.

After a merge, prefer **Revert** on the merged GitHub pull request and review the resulting pull request. This adds a new commit and preserves the history; do not force-push or reset the public default branch.

If later unrelated changes exist, revert only the light-edition changes or restore the intended files from the baseline tag on a new branch, review the diff, and merge that recovery change. Do not restore the whole old repository over newer unrelated work. A merge to `main` will redeploy Pages, so review the recovery branch before merging.

The baseline tag remains a reference even after later versions are added. Keep the tags and commits rather than deleting/replacing them.

## v4.1.0 onward

The live site now follows published semantic versions. `light-v4.0-pre-customer-2026-10-15` pins `b4db904`, including the mobile float and flat quick adjuster immediately before customer-content migration. `v4.1.0` pins the completed customer update. Each GitHub Release has bilingual change notes and links back to the matching version.

For a simple immediately-following rollback of this update, create a new revert commit for the v4.1.0 implementation commit, review it, and push through the authorized workflow. If later changes exist, restore only the intended files from the saved checkpoint. Keep the version/CHANGELOG consistent with the new restoration release; do not delete or move older tags. README and project documents are retained separately from the customer UI, not made private.


## v4.2.0

`light-v4.1.0-pre-planner-2026-10-15` preserves `d8133c8` before the planner/accounting changes. `v4.2.0` identifies the new model and UI. Keep tags/releases, use a new revert or targeted restoration commit, and give a restoration its own version. Do not rewrite published history.


## v4.2.1 / Stage 1 · 2026-10-16

Baseline tag: **`light-v4.2.0-baseline-2026-10-16` → `05cd7de`**. This is the exact pre-stage state, including the constrained planner and desktop float. `v4.2.1` identifies the tested presentation corrections; calculation-engine bytes and outputs remain unchanged. The v4.0 branch/PR notes above are historical context, not the current main-branch state.

Publication order follows the user's request: commit tested code while retaining the existing footer Release URL, push the immutable v4.2.1 tag and create its GitHub Release, then add a separate footer-link activation commit and push main. The tag is not moved. That final commit only activates the existing Release link; it is part of the same v4.2.1 publication, not another feature stage.

回退应新增恢复提交，不移动或删除旧标签，不强推 main。可用基线恢复本阶段文件，并保留后续无关改动。国家轮廓是 public-domain 静态资源；回退时按目标版本一并处理引用与资源。


## v4.3.0 · 2026-10-16

Baseline `light-v4.2.1-baseline-2026-10-16` pins `cdec884`. Pure CSS consolidation is isolated in `86d3f20`, before the independent readability/interaction commit. Release tag v4.3.0 is immutable; activate its footer URL only after its GitHub Release exists, in a separate final commit. Restore with new commits, never rewrite public history. Engine/shared-data/Pro Max bytes remain unchanged. No clean mode or performance-budget feature was introduced.


## v4.3.1 · 2026-10-18

Baseline `light-v4.3.0-baseline-2026-10-18` pins `04c4dc5`, the published v4.3.0 before input simplification. This is a direct v4.3.0 → v4.3.1 update. Keep this baseline and the immutable release tag. To roll back, create a new revert or targeted restoration commit from the baseline; retain later unrelated changes and do not force-push or move historical tags.

按既有顺序先发布已验收的实现提交、v4.3.1 标签和 GitHub Release，再以单独提交激活页脚 Release 链接。五个受保护文件保持不变，转换仅在界面适配层实现。恢复时一并恢复输入适配模块、界面、版本与缓存引用，并给恢复发布记录版本。
