# Cook Verification and Handoff

**Open this:** http://127.0.0.1:8767/engineering-portfolio/ — the prepared static artifact at `C:/Users/Letzel/AppData/Local/Temp/portfolio-flipbook-build-20261109-03-r2/engineering-portfolio`. Canonical checkout: `C:/Users/Letzel/Desktop/Engineering/engineering-portfolio`; branch `codex/responsive-landscape-flipbook`; verified implementation commit `d2efdcf8bcda481f9d9087e93d11542b5425e833`. Installation is inapplicable. Build `20261109-03`; product `VERSION` remains `1.2.1` pending release review.

## Authority and Delivered Behavior

The owner's Alephon Cook invocation authorized this named change's implementation, verification, commits, push and draft PR. It did not authorize merge or publication. [Draft PR #6](https://github.com/Luis-Albos/engineering-portfolio/pull/6) targets `main` from the named branch and is attached to this chat. The final documentation-only head is recorded in the PR body and final local Cook Delivery Card after push; implementation/artifact evidence below covers the unchanged runtime tree.

The accepted thin architectural-portfolio concept is implemented with original landscape pages, Auto/Single/Double, stable cover/spread mapping, preserved exact selected page, restrained reversible turns, compact chapter/search/thumbnail tools, detail zoom and fullscreen. One-based URLs/history, keyboard and native touch navigation, failed-image retry, nonanimated renderer fallback, reduced motion, foreground cache priority, and the reusable landing scene are retained. Details and delegated numerical tuning are recorded in `design.md` and `README.md`.

No material owner decision remains unresolved within the implemented scope. StPageFlip 2.0.7 was qualified with bounded adapter integration, an unchanged self-hosted MIT runtime and no hosted service; the approved alternative of a broader renderer was unnecessary. The historical single-page-only recommendation was superseded by the owner's responsive Double direction while retaining its legibility concern. No full council session or independent product approval was invented.

## Checks and Durations

All times below are observed wall-clock seconds, not performance guarantees.

| Stage / command | Result | Seconds |
| --- | --- | ---: |
| Pre-change `test-portfolio.cjs`, Chrome, release baseline | Pass | 10.50 |
| `test-experience.cjs` | Pass: routes, tools, focus, responsive entry and direct links | 32.60 |
| `test-portfolio.cjs` | Pass: out-of-order loads, cache deduplication, rapid/reverse navigation, history, retry, native touch and decode fallbacks | 9.86 |
| Revised `test-viewer-layout.cjs` | Pass: real sheet fit, nine viewport/height/cutoff cases, manual modes, phone hit targets, cover and final boundaries | 4.64 |
| `test-renderer-slice.cjs` in combined run | Pass: actual sheets, mode/selection, idle, native touch/cancel and module/render/storage/fullscreen recovery | 4.56 |
| `test-functional-loader.cjs` | Pass: loader, scene reuse, browser-restart cache, PDF ranges, direct entry and reduced motion | 21.65 |
| Combined browser stage | Pass, sequential commands above | **73.34** |
| Final focused renderer check after adding computed contrast/focus assertions | Pass; no runtime edit since combined run | 4.96 |
| Archive generation plus corrected static artifact staging | Pass: 10 classes / 21 resources, 147 public files | 4.36 |
| Independent actual-artifact journey | Pass: full hash check, routes, real PDF ranges and visitor journey | **13.45** |

`node scripts/sync-boot.cjs --check`, `node scripts/test-cache-version.cjs`, `node scripts/check-model-gzip.cjs`, JavaScript syntax checks, `git diff --check`, and strict OpenSpec validation passed. Native/installer stage is inapplicable. The original sandbox baseline was unable to reach loopback (`ERR_NETWORK_ACCESS_DENIED`); the actual browser baseline and checks were rerun outside that restriction. This was an environment limit, not a site failure.

Focused checks landed with their implementation. Existing test selectors and stepping were adapted to the approved compact tools and explicit Single mode where one-page navigation was the subject; old fixed-sidebar geometry expectations were replaced with the new sheet-fit contract. No blanket new harness was added.

## Independent Evidence and Resolved Findings

See [independent source review](evidence/independent-source-review.md) and [independent packaged-artifact review](evidence/independent-artifact-review.md), including the [artifact observations](evidence/independent-artifact-review.json). The verifier used fresh headless Chrome 156.0.8078.80 contexts, actual pointer/native CDP touch input, and actual source/packaged pages; the initial engine qualification also used Edge.

The independent journey covered Home -> Auto spread -> selected right-hand page 5 -> Single/Double/Auto and phone resize -> detail/close -> chapter/search/thumbnail tools -> dark/final pages -> Home. Page identity/history, original landscape artwork, keyboard focus, reduced motion, slow/failed spreads and retry, denied storage/fullscreen, and static fallback were observed. All 31 pages were browsed; the final spread retained four decoded entries/four sheet nodes. Viewer drawing stopped at rest and on Home, three re-entries retained one resize handler, and the aircraft canvas/model request count remained unchanged at one.

Independent testing found and rechecked two native Single-touch completion/cancellation issues, right-hand selection during a cancelled drag, and prefetched-neighbor fit metadata. The final native-touch forward/back/short-cancel cases pass without false history entries or cropped temporary images. The first staged artifact omitted `resume.js`; the corrected allowlist and HTML-asset validation were checked against r2 and real Resume initialization. Early Python preview servers ignored Range headers; the final preview uses the project's range-capable server, with no change to artifact runtime bytes.

Representative captures: [desktop spread](evidence/desktop-spread.png), [phone Double override](evidence/phone-double.png), and [phone mid-turn](evidence/phone-midturn.png). The accepted concept remains in `references/`.

## Artifact Identity and Packaging

- Prepared artifact: `C:/Users/Letzel/AppData/Local/Temp/portfolio-flipbook-build-20261109-03-r2/engineering-portfolio`.
- `_artifact.json` SHA-256: **`db884ed7229567a21f617f924c51e6ddda6114f174459df882b96c490c76f809`**. A copy is [evidence/artifact-identity.json](evidence/artifact-identity.json).
- Independent verification recomputed all **147** public-file hashes, found no unlisted files beyond the identity receipt, and found zero missing local HTML assets. Node dependencies, Git, tests, proposals, development scripts, source CAD and video are excluded.
- The final actual-artifact run observed **121** HTTP runtime requests, zero outside the preview origin and zero uncaught page errors. Resume and a real study PDF both returned **206** for bytes 0-31 with valid `%PDF-` signatures. Resources displayed 10 classes and 21 documents.
- `scripts/prepare_site.py` and the Pages workflow stage the same public allowlist. Build-only generated manifest/thumbnails were preserved in the artifact and excluded from source commits; the tracked manifest is a seed regenerated by the existing build step. Original portfolio artwork and PDFs are unchanged.
- Reproduce with archive generation followed by `python scripts/prepare_site.py --output <new-empty-artifact-directory>`. To serve an existing artifact with byte ranges, run `node -e "require('./scripts/browser-test-server.cjs')('<absolute-artifact-root>',8767).then(({base})=>console.log(base))"` from the canonical checkout, using an available port. The output directory must be new/empty; no recursive cleanup is performed.

## Release and Remaining Gates

Previous documented released version: **1.2.1** at `51de8e5ef168a6cba78429e241914dfd038a747f`. Provisional impact: **minor** for added compatible functionality; no data migration. Plating must classify the exact PR head and reconcile/sync/archive the delta specs before any guarded integration. Main specs are intentionally not rewritten during Cook.

Remaining: owner visual acceptance of the real viewer, Plating/integration, and production publication. `main` pushes deploy automatically, so integration must account for separate publication authority. Nothing has merged or deployed in this Cook delivery.

Evidence limits: physical mobile hardware, Safari/Firefox, arbitrary real memory-pressure eviction, and physical background-tab throttling were not observed. Visibility-handler cleanup was exercised synthetically because headless Chrome reported background tabs as visible. These limits do not invalidate the recorded Chrome/Edge and prepared-artifact observations.

The local checkout, prepared artifact, evidence and preview are retained for review. Pre-existing `.playwright-mcp/` is preserved and excluded from commits. The final local Cook Delivery Card beside the artifact and the PR body record the final pushed head without introducing a circular self-referential commit hash into this file.
