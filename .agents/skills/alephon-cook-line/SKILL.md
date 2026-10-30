---
name: alephon-cook-line
description: Implement an approved Alephon OpenSpec change, consult specialists selectively, verify the real behavior and artifact, and prepare a draft GitHub PR or local delivery receipt. Never merge.
---

# Alephon Cook Line

Read [shared workflow](../../../../ALEPHON_WORKFLOW.md), the owning project's `AGENTS.md`, the selected OpenSpec proposal, specs, design, tasks, decisions, and any Prep Line receipt. This skill is independently invocable; identify the change from the user's request, conversation, or active changes and ask only when ambiguous. Do not infer that a proposal alone authorizes unrelated implementation or supersedes a reserved project gate.

## Read and implement

Inspect source and dependencies, Git status, branch, worktrees, staged, dirty and untracked files. Identify approved existing work and preserve it. Resolve the named authorized batch and boundaries, dependency order, desktop-control boundary, representative acceptance journey, expected artifact, and remaining owner decisions. Choose or create a feature branch according to project practice without overwriting another checkout.

Use the installed `$openspec-apply-change` workflow and implement the recorded tasks in coherent increments. The main Codex agent owns the implementation. Keep consequential technical decisions and deviations traceable in the project's existing records; update OpenSpec artifacts when learning changes their truth. Continue through authorized tasks without phase-change permission requests. Repair in-scope defects and rerun affected checks.

Consult the Engineering Team when a consequential architectural, backend, security, migration, integration, or runtime decision needs competing approaches or independent evidence. Consult an applicable Design Council for materially changed frontend experience. For work crossing both, obtain UX acceptance criteria and engineering feasibility together, using the project's liaison where defined. Follow project council protocols and authority; adopt recommendations only inside the approved scope and delegated authority. Escalate a genuine new product decision. At scope change, first working slice, failed check, integration readiness, and release readiness, perform the charter's proportional watchpoint review. Do not call specialists when established conventions settle the decision.

## Verify and prepare review

Check implementation against the active OpenSpec contract. Before editing, run a quick existing check for the affected behavior when practical and note baseline failures. During implementation, use focused checks for the changed invariants; keep expensive evidence generation scoped. When the authorized batch is stable, run the project's required integrated gates and build the canonical artifact at the boundary its instructions require. After a fix, rerun affected checks; repeat a broad gate only when its result is invalidated or required. For consequential changes, obtain independent Verification Engineer evidence for a representative real user journey; use Playwright or a suitable native tool when that is the actual boundary. Verify the canonical executable, installer, site, or other artifact and its identity. Record the tested revision and elapsed times for focused, integrated, and native/package stages; mark skipped stages “not run.” Report unavailable evidence honestly.

Carry the Prep Line's prior-release evidence and provisional version impact into the PR, updating the compatibility and migration assessment as implementation changes. Leave the final version decision to Plating Line's review of the exact PR head under the shared [versioning policy](../../../../VERSIONING.md).

Reconcile approved work across files, branches, and worktrees. Make logical commits that include the intended change and exclude unrelated edits. Where a remote is configured and the project allows it, push to the correct repository and open or update a **draft PR** against its designated main branch without re-asking for a covered authorized step. Record its exact head commit. Include the OpenSpec identifier, behavior summary, significant council decisions, checks, artifact identity, and remaining gates. Attach the PR to the Codex task when available. For a plain folder or unavailable GitHub remote, give an equivalent local receipt without inventing a link. Do not merge or automatically invoke Plating Line.

Begin the **Cook Line Delivery Card** with **OPEN THIS:** exact usable path/link, canonical checkout/worktree, tested commit or revision, hash where meaningful, and installation status (observed, required, or inapplicable); state why if no artifact exists. Then give **CHANGE** (name and OpenSpec ID), **ORIGINAL REQUEST**, **IMPLEMENTED**, **FILES**, **COUNCIL DECISIONS** (source, alternatives, adopted result), **VERIFICATION** (actual checks, revision, stage times, and uncertainty), **GITHUB** (branch, commits, exact draft PR head or local state), and **REMAINING**. Keep the worktree and local artifact available for Plating Line when needed. Preserve the shared handoff fields so Plating Line can independently reconstruct the change.
