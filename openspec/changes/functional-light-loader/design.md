# Design

## Context

See `proposal.md` and the two delta specs for scope. The current intro is generated into `index.html` from `css/boot.css`, `js/boot.js`, and `assets/landing/alephon.svg` by `scripts/sync-boot.cjs`. `js/experience.js` starts the 36,105,032-byte GLB fetch alongside the scene import, then `js/landing-scene.js` parses it and prepares the first frame. The intro runs independently for 8,500 ms. `showLanding()` and viewer entry currently call `stopScene()`, which aborts or disposes the scene, renderer, and model; a return starts the full process again. The viewer only keeps decoded page images in an in-memory map and preloads six adjacent pages. The 31 WebP pages total 157,578,529 bytes, and 21 Study Archive PDFs total 34,110,250 bytes. The site has no service worker and uses build-versioned URLs under the static Pages subpath.

The approved visual reference is `councils/design/references/dc-0010-loading-screen-concept.png`. The current `landing-composition` spec requires scene disposal on viewer entry, so this change explicitly revises that contract. The existing `STARTUP.md` records the old cinematic/scene timing and must be reconciled during implementation.

## Goals / Non-Goals

**Goals:**

- Make the first usable landing bounded by a 15-second loader ceiling, with a ready aircraft shown earlier when possible and a legible inline state when it is not.
- Eliminate repeat aircraft network transfer, parse, and shader preparation on an ordinary same-page Portfolio-to-Home return.
- Reuse downloaded asset bodies across browser sessions when browser storage allows, without delaying requested navigation behind background prefetch.
- Preserve the exact old cinematic in a separately usable private repository before replacing it.

**Non-Goals:**

- Guarantee a cold 36 MB model transfer or complete 228 MB background cache within 15 seconds on every VPN. The 15-second rule guarantees access to the HTML landing, not model completion.
- Keep a GPU context alive across browser restarts, promise that browser-managed caches cannot be evicted, or make the entire site offline-only.
- Redesign the 31-page viewer, Study Archive, aircraft geometry, or approved light landing composition.

## Decisions

### 1. Archive the exact cinematic before removing its public code

Create a runnable static demo in the existing private `Luis-Albos/alephon-load-animation` repository using a snapshot of the current boot DOM, source CSS and JS, and runtime Alephon SVG. Include a short README identifying its source revision, controls, reduced-motion behavior, and how to serve it locally. Verify the demo's normal and reduced-motion paths, record the archive commit, and only then remove or replace the intro in this repository. Keep the archive private. This makes the original recoverable without leaving dead cinematic code in the published site. A raw file dump without a runnable page was considered but would not preserve the experience itself.

### 2. Use a real scene-readiness handshake and a single ceiling timer

Keep a tiny inline first-paint loader so CSS or module latency does not expose an unstyled landing. Adapt the existing embedded-boot synchronization/check rather than adding a network request for the loading UI. Replace the old state timeline with one controller that begins scene startup immediately and observes a terminal `ready`/`failed` result. `ready` means the renderer has compiled and produced a valid first frame, not merely that the GLB response arrived. Start one 15-second monotonic timer when the loader activates; whichever occurs first among `ready`, definitive failure, and timeout resolves the overlay exactly once. Timeout reveals the landing and leaves the same scene promise running behind the inline status. A late success fades the aircraft into that landing. The timer does not pause while the tab is hidden, so returning to a backgrounded tab cannot restart the full wait.

The standard ring uses restrained motion; reduced motion is static. Keep its accessible status text concise and avoid a fictional percentage. Remove Skip, prior session-only intro flags, and old verification/green-success markup. A fixed-duration replacement was considered but would repeat the current mismatch between animation time and real readiness.

### 3. Pause a prepared scene across viewer navigation

On Portfolio entry, complete the current dismissal transition, then stop its frame loop and input while retaining the prepared scene, canvas, model, renderer, and geometry in the page session. Add a matching resume path that clears dismissal state, resizes if needed, and renders immediately on Home; do not call the model fetch or loader parse for this return. Keep the deep-link fast path: a direct viewer URL never creates the scene. Release resources on page exit, unrecoverable context loss, or failed preparation; a later visit may rebuild from cached model bytes. Holding only the GLB buffer was considered, but it would still repeat parse, edge generation, and shader compilation and visibly delay Home.

### 4. Make persistent asset caching progressive and version-safe

Use same-origin browser Cache Storage with a project-subpath-scoped service worker for versioned static assets requested by the viewer and other pages. Install only a minimal shell; do not make service-worker activation wait for the large model, all 31 pages, or PDFs. After the landing is usable, a page-driven preloader walks a deterministic asset list derived from site configuration and the generated Study Archive manifest. Keep concurrency low, yield to requested page/model transfers, record completed URLs in the versioned cache, and resume missing work on later visits. Include the GLB in cross-session caching even though its first transfer precedes background prefetch. Use build/version keys and delete obsolete caches only after current content is usable. Keep `version.json` network-checked so a stale shell cannot masquerade as a new deployment.

Treat cache writes as best effort: handle denied storage, quota errors, eviction, and failed requests without disabling navigation. Preserve normal PDF and byte-range behavior; use a tested cached-response path where possible and otherwise allow normal network handling. A giant install-time `cache.addAll` was considered but one slow or failed 228 MB batch could block activation and compete with the first usable view. `localStorage` is too small and synchronous for these assets.

### 5. Reduce cold-model cost only when verified

Measure request, parse, and first-frame times separately under a representative throttled network and CPU. Evaluate a delivery-optimized GLB and self-hosted decoder only if the result materially improves first-frame time. Preserve the actual aircraft appearance, propeller node lookup, controls, reduced-motion pose, and WebGL fallback; compare real browser captures and run the existing aircraft validation. Keep the original GLB as a fallback until an optimized file passes those checks. Do not add a CDN. Compression without validation was rejected because glTF optimizers can change node names or geometry and break the approved sketch or controls.

Implementation result: use a deterministic gzip of the existing GLB rather
than a geometry optimizer. `DecompressionStream('gzip')` restores byte-identical
GLB data before GLTFLoader runs; the original URL remains the fallback when the
API or compressed response is unavailable. `scripts/check-model-gzip.cjs`
compares SHA-256 of the decoded artifact with the original. The paired local
throttled measurements and limitations are in `performance.md`. This retains
the approved silhouette and propeller node while reducing cold model transfer.

## Risks / Trade-offs

- **A 36 MB cold transfer still exceeds 15 seconds on some VPNs** → Reveal the usable landing at the ceiling; measure actual first-frame time and adopt a smaller validated model only if it helps end to end.
- **Retained WebGL state raises memory use while the viewer is open** → Stop rendering and input, measure memory/context behavior, and release on page exit or context loss; use cached bytes to recover if retention fails.
- **Large background prefetch competes with a requested portfolio page** → Start after reveal, bound concurrency, and yield or pause it during foreground work.
- **Browser cache eviction, storage denial, and release updates are outside site control** → Make caching best effort, version keys, test cold/warm/evicted cases, and always retain network fallback.
- **PDF range requests or a service worker can break document viewing** → Exercise Resume and Study Archive open/download paths with and without a controlling worker, including byte-range requests.
- **Inline loader and source files drift** → Adapt `scripts/sync-boot.cjs --check` and the Pages gate to the new minimal embedded assets; remove old cinematic-only tests or replace them with readiness cases.

## Migration Plan

1. Preserve the current cinematic in the private archive repository and verify its commit and runnable demo before changing the portfolio intro.
2. Implement the light loader, scene pause/resume, and progressive cache on a review branch. Preserve existing dirty concept/ledger files and update `STARTUP.md` and `README.md` to match the new behavior.
3. Run focused readiness, 15-second timeout, failure, deep-link, round-trip no-refetch, reduced-motion, cross-session cache/version, PDF, and storage-denial checks. Run the project's required integrated browser suites and observe the static `/engineering-portfolio/` journey under network throttling; record the revision and measured stage durations.
4. Prepare a draft PR for owner review. Keep the published Pages site unchanged until its separate integration/release gate. Rollback is a revert to the previous intro and scene lifecycle; the private archive remains intact.
