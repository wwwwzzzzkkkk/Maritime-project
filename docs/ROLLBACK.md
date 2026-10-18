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


## v4.4.0 · 2026-10-18

`light-v4.3.1-baseline-2026-10-18` pins `c1de121` before workspace/ledger/planning/local-AI changes. Keep the immutable baseline and v4.4.0 Release tag. Revert with a new commit or restore affected files from that baseline, retaining unrelated later work; never force-push or move published tags. New modules, server template, docs and their cache references must be restored together.

本机保存记录属于浏览器数据，不随 Git 回退删除。回退前导出工作区及只读快照；旧版本不支持新工作区恢复时保留文件，不能把计算结果当作授权文件。不要将本机密钥文件加入恢复提交。先创建标签与 Release，再用单独提交激活页脚链接。


## v4.4.1 · 2026-10-18

`light-v4.4.0-baseline-2026-10-18` pins `1dca475` before the requested local motion removal. Restore with a new commit, never rewrite history or move published tags. Create the release before the separate footer-link activation commit. This patch changes no calculations or protected files.


## v4.5.0 · 2026-10-19

`light-v4.4.1-baseline-2026-10-18` pins `5878e4c` before the DeepSeek/cloud integration. Keep the baseline and v4.5.0 tags immutable. Restore affected UI, shared handler, cloud entry/config and cache references using a new commit, preserving unrelated later changes. Create the Release before the separate footer activation commit.

**云端独立回退 / Separate cloud rollback:** GitHub Pages 回退不会改变 Cloudflare Worker，也不会撤销任何密钥。需要恢复服务时，从相应 Git 版本取回 Worker 和其依赖，以现有私有 Secrets 重新部署；不要将 key 放入恢复提交。v4.4.1 及之前没有该 Worker，因此回退网页后云端服务仍存在，需按需要在 Cloudflare 停用／删除或轮换课堂码。DeepSeek key 撤销在供应商账户进行。/ A Pages rollback neither reverts the Worker nor revokes credentials. Redeploy the intended Worker sources using private secrets, or disable the new cloud service separately. Provider keys must be revoked/rotated at the provider too.

当前部署 URL: `https://mareg-ai.mareg-light-edition.workers.dev`; initial Worker version ID `abe9b821-fb76-45e2-8bfa-aec2082f5944`. Latest deployed version ID: `89fd9bea-aa3a-4d9b-97d1-ea9b736344ef`. Shared classroom codes, local private env files and OAuth tokens must never enter Git, screenshots or public QA evidence. Do not rewrite public main history.
