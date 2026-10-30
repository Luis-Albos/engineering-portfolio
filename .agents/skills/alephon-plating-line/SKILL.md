---
name: alephon-plating-line
description: Final-review and merge an identified Alephon draft PR after required checks and OpenSpec reconciliation pass. Explicit invocation authorizes that merge, subject to project gates and branch protections.
---

# Alephon Plating Line

Read [shared workflow](../../../../ALEPHON_WORKFLOW.md), the owning project's `AGENTS.md`, and the Cook Line receipt if available. Identify the **specific** PR, repository, target branch, OpenSpec change, and implementation branch from the request and authoritative records. If more than one fits, ask the owner to identify the intended change. Never substitute the newest PR. Explicit invocation authorizes final review and merge of that identified change after all applicable gates pass; it does not authorize a production release or a new product scope.

## Final inspection

Read and record the live PR head before review and again immediately before merge; if it changed, inspect the delta and renew invalidated evidence. Confirm the target repository and branch, approved scope, requirements coverage, decision record, implementation quality, security and regression risks, branch/worktree coverage, and absence of overwritten approved work. Resolve outstanding Design and Engineering findings. Inspect changes since Cook Line's tested revision. Reuse its check and artifact evidence when the tested code and build inputs still match, unless a project rule requires an exact commit match; run final checks where they catch a distinct remaining failure or the project requires them. Inspect the retained worktree and canonical executable or installer when relevant. Do not repeat expensive suites merely to restate valid evidence.

Fix minor in-scope issues on the feature branch, update the PR, and rerun affected checks. Return substantial redevelopment to Cook Line with exact findings. Ask the Head Chef for a newly discovered material product decision or reserved project approval. Never merge with unresolved blockers or claim a check passed without evidence.

## Reconcile and merge

Confirm code and OpenSpec agree. Use the installed `$openspec-sync-specs` and `$openspec-archive-change` workflows when the project's process requires them; check task and artifact completion and validate the resulting specs. Include any resulting file changes in the feature branch and PR before merge. Preserve proposal, decision history, and evidence. Do not silently archive incomplete or contradictory work.

Apply the shared [versioning policy](../../../../VERSIONING.md) before final checks: compare the exact PR head with the last released artifact or tag, choose the highest major/minor/patch impact or an approved first stable promotion, and record the reason. Use Engineering's `scripts/versioning.py next --project <id> --level <level> --checkout <active-checkout>` where configured; `stable` promotes a `0.x` preview to `1.0.0`. If this PR produces the next release, synchronize the version on the feature branch with `set` and the same checkout, update release notes and any displayed version, verify the packaged artifact's version, and renew checks invalidated by the bump. If it does not release an artifact, record the candidate without bumping. Recheck the PR head after any version commit; do not create a tag or publish solely because the PR merged.

When acceptance conditions are satisfied, mark the draft PR ready for review when appropriate, check required reviews, CI, and branch protections, then merge through the repository's configured strategy. Do not bypass protections or force a failing merge. Verify the resulting PR status and target-branch commit contain the expected changes. Clean up a feature branch only when repository policy permits and no unrelated work would be lost.

Begin the **Final Service Receipt** with **OPEN THIS:** exact usable path/link, canonical checkout/worktree, checked commit or revision, hash where meaningful, and installation status (observed, required, or inapplicable); state why if no artifact exists. Then give **RESULT** (merged or exact blocker), **CHANGE** (name and original purpose), **DELIVERED**, **GITHUB** (PR, checked head, target branch, merge commit), **VERIFIED** (reused and new evidence, with covered revisions and stage times), **OPENSPEC** (sync/archive status), and **REMAINING**. Issue the receipt before archiving a worktree or removing a local artifact needed to identify the deliverable; clean up afterward only under repository policy. A merge command's exit status alone is not completion evidence. Do not automatically start another change.
