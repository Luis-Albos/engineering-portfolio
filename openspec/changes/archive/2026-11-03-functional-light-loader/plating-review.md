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

## Authorized release follow-up — 2026-11-09

GitHub Pages was still configured for legacy branch publishing. Its separate
`pages-build-deployment` workflow published the feature on the first merge even
though the custom workflow's deploy job was gated. The previous `1.1.0` source
tree was restored on `main` at `cd7ff5845b71259c9714e363289d4bcef7a5c5fa`;
the public build returned to `20261030-01`. The owner subsequently authorized
publishing the loader. The release branch reapplies the reviewed PR #3 tree,
advances the source version to `1.2.0`, and updates the Pages workflow to deploy
on `main` pushes after switching the repository's Pages source to GitHub Actions.
That source selection ensures the generated Study Archive is included in the
published artifact. The earlier manual-only conclusion above records the
pre-release intent, not the effective legacy Pages behavior.

Release build marker: `20261109-01`. The renewed functional browser check
passed in 24.0 s, covering loader readiness, retained scene reuse, cache reuse
after a browser restart, PDF ranges, deep links, and reduced motion. Embedded
loader sync, gzip identity, cache-version behavior, and version synchronization
passed. Runtime source and model bytes still match reviewed head
`9da02f82066c01227495cad52f0d37de3e2f1ee9`; prior focused scene and visual
checks remain applicable. Production verification follows deployment.

Premerge GitHub metadata showed no submitted reviews, unresolved review
threads, or status checks, and the public `main` branch protection flag was
false. Re-read PR head and mergeability immediately before integration.
