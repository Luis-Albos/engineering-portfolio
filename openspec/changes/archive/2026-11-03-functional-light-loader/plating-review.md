# Plating Line review — functional-light-loader

Identified change: draft PR #3, `codex/functional-light-loader` -> `main` in
`Luis-Albos/engineering-portfolio`. Cook head reviewed:
`109891dfd7b1285487ca6ea3f017ea5389fe3e0e`; released `main` was
`0a1f47af44a725d90557c8e23b3d24ae06eec471` and the public
`version.json` reported build `20261030-01` before integration. The private
intro archive remains commit `0871a9b04d8e725834ea816da70d5d3be364b6ab`.

The approved DC-0010 appearance, 15-second ceiling, scene reuse, and browser
cache agree with the proposal and specs. Two minor runtime gaps were repaired:
background preloading now starts at the 15-second reveal while a model is
pending, with low-priority asset requests and high-priority model transfer;
and resize no longer renders the scene while Portfolio has it paused. Browser
checks observed the timeout background request and a constant render count
through viewer resize, followed by rendering on Home. The checked-in local
Study manifest has two missing PDFs; the pinned Pages generator was run in an
isolated workspace folder and produced 10 classes and 21 current resources.
The local visual test treats only those optional stale-manifest 404s as known
fixture noise. The production build regenerates the manifest before upload.

Focused renewed checks: scene-preload 28.7 s, functional-loader 34.9 s,
landing-scene 25.2 s; model gzip identity, embedded loader sync, build-version
check, and JavaScript syntax passed in about 3.3 s. Existing Cook Line browser
journeys and performance measurements remain applicable to the unchanged
loader design and model bytes. The Study Archive build with pinned Python
dependencies passed in 7.9 s. Actual corporate VPN testing remains unavailable.

OpenSpec delta requirements were merged into `openspec/specs/` and validated:
2 main specs passed; the 14-task change was moved to this dated archive. No
requirements or owner decisions remain open for this change.

Version decision: compatible new functionality from released `1.1.0`, so the
candidate is `1.2.0` (`scripts/versioning.py next`). This merge is integration,
not a release; `VERSION` and release notes remain at `1.1.0`. The Pages
workflow continues building on pushes to `main` but deploys only on a manual
`workflow_dispatch` from `main`. This preserves the published site until the
owner separately authorizes release. No version tag is created.

Premerge GitHub metadata showed no submitted reviews, unresolved review
threads, or status checks, and the public `main` branch protection flag was
false. Re-read PR head and mergeability immediately before integration.
