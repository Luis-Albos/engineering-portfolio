# Tasks

## 1. Preserve the original cinematic

- [x] 1.1 Copy the current boot DOM, source CSS/JS, and runtime Alephon SVG into a self-contained static demo in the private `Luis-Albos/alephon-load-animation` repository; verify the normal and reduced-motion paths in a browser.
- [x] 1.2 Add archive README instructions and source-revision attribution, push the archive commit, and verify the remote file tree and commit before changing the portfolio intro.

## 2. Build the light readiness loader

- [x] 2.1 Replace the old cinematic markup, styles, and controller with the DC-0010 circle and accessible descriptor; adapt `scripts/sync-boot.cjs --check` and verify first paint, visual match, no Skip, and reduced-motion behavior.
- [x] 2.2 Connect the overlay to scene first-frame readiness, definitive failure, and a single 15-second ceiling; remove old intro-only delays and flags, then verify early success, late success, failure, and timeout with focused browser tests.
- [x] 2.3 Preserve direct viewer/page-hash bypass and the `/engineering-portfolio/` base path; verify those routes do not show the loader or request the aircraft, and update `STARTUP.md` for the new startup contract.

## 3. Reuse the aircraft across Portfolio and Home

- [x] 3.1 Add a scene/control pause and resume path around the existing viewer transition; verify a ready scene stops rendering/input in Portfolio and returns Home without another GLB request, parse, or shader compile.
- [x] 3.2 Release retained resources on page exit and unrecoverable context loss, and preserve recovery/fallback when the model is pending or unavailable; verify the affected scene lifecycle and reduced-motion journeys and update the lifecycle section of `README.md`.

## 4. Persist and preload assets progressively

- [x] 4.1 Add a project-subpath-scoped, versioned cache path for the aircraft and static assets, with a minimal install and network-checked `version.json`; verify a new browser session reuses current model bytes, a new version refreshes them, and denied storage falls back to network.
- [x] 4.2 Build a deterministic background queue for portfolio pages/thumbnails, resume, Study Archive manifest/thumbnails/PDFs with bounded concurrency and foreground priority; verify it starts after reveal, yields to a requested page, and resumes uncached work on a later visit.
- [x] 4.3 Preserve Resume and Study Archive PDF open/download and byte-range behavior under a controlling worker; verify those journeys with and without cache, then document cache scope, quota/eviction behavior, and recovery in `README.md`.

## 5. Check cold-model performance

- [x] 5.1 Measure cold transfer, parse, and first-frame times for the existing GLB under representative VPN-like throttling and record the test profile and results; verify the 15-second reveal remains usable even when model completion is later.
- [x] 5.2 Evaluate a self-hosted delivery-optimized GLB and decoder; adopt it only if end-to-end time improves while the aircraft silhouette, propeller lookup, interaction, reduced-motion pose, and fallback checks pass, otherwise retain the original and record the measured no-go result.

## 6. Integrate and hand off

- [x] 6.1 Run the affected integrated site suites and a real browser journey covering cold load, warm browser restart, Portfolio-to-Home return, deep link, model failure, and PDF access under the static project subpath; record revision, elapsed check times, and any untested corporate-VPN condition.
- [x] 6.2 Reconcile the approved concept/ledger work and both repositories' commit identities, prepare a draft portfolio PR without merging or deploying, and verify that its head includes the archived-intro dependency and all in-scope files.
