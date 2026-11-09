# Design

## Context

See [proposal.md](proposal.md) for motivation and scope. The inspected baseline is `main` at `51de8e5ef168a6cba78429e241914dfd038a747f`, documented release 1.2.1, build `20261109-02`. Only `.playwright-mcp/` was untracked before Prep.

`script.js` owns one-based page identity, chapters, search, thumbnails, history, keyboard/touch navigation, a decoded-image cache, and adjacent preloading. Its two image slots currently crossfade. `index.html` and `styles.css` provide a permanent desktop chapter rail and a single-sheet stage. `js/experience.js` owns Home/Portfolio entry and the retained aircraft scene. `js/asset-cache.js` separately fetches compressed assets into versioned Cache Storage; its background queue yields to `portfolio:foreground-load`.

The 31 source sheets are 3507 x 2481 landscape images. Two sheets form an unusually wide spread, so a screen-orientation check alone cannot determine whether Double is useful. The existing `site-theme` requirement also says to preserve responsive geometry; this change supplies a narrow delta permitting the approved viewer geometry while preserving unrelated routes and layouts. The landing and loading specifications otherwise remain applicable unchanged.

## Goals / Non-Goals

**Goals:** Add a replaceable page-turn layer around the current document/navigation model; keep landscape content intact; make manual and automatic layout dependable; match the thin-sheet reference; retain useful reading and detail access.

**Non-Goals:** See the proposal's exclusions. In particular, the architectural character concerns presentation, not changing engineering work into architectural content. The reference's browser URL, sample text, and generated aircraft/CAD imagery are illustrative, not replacement content or production destinations.

## Decisions

### 1. Use the accepted thin-sheet concept as the visual target

The owner accepted [references/thin-landscape-viewer-concept.png](references/thin-landscape-viewer-concept.png), SHA-256 `927e81f9948d91fdc8141ce7c03cb8ed402d903dba41f0e97301e56df11507d7`. It is the second concept, superseding the thick bound-book rendering.

Use the existing warm white and graphite palette, slim header, generous page margins, fine sheet boundaries, nearly flat resting surfaces, a quiet center seam, and a small corner lift during interaction. Do not add a spine, hard cover, page-stack thickness, deep gutter, or heavy resting shadow. Source artwork stays unchanged and fully contained. Keep the existing site identity, destinations, and footer content.

Make the Portfolio stage wider by replacing its permanent chapter rail with a compact Chapters surface plus accessible search/thumbnail tools. Keep the mode selector visible above the stage and navigation, page/range feedback, detail and fullscreen controls reachable below it. The header's phone navigation remains available. Reuse existing drawer/dialog semantics where useful, ensuring tools have one active accessible instance and closing restores focus. Viewer-only CSS and lifecycle hooks must not reframe the approved landing.

**Rejected alternatives:** The first thick-book rendering was rejected by the owner. A slide carousel or simple rigid rotation would not express the requested sheet turn. Cropping, splitting, or reformatting the landscape artwork would change the portfolio itself.

### 2. Keep one canonical selected page and derive the visible spread

Retain a one-based selected page as the navigation source of truth. The page-turn adapter translates to engine indices at its boundary. Renderer callbacks must not independently rewrite page identity or produce duplicate history entries.

Proposed normal booklet convention: page 1 is a centered single cover, followed by stable pairs 2-3, 4-5, through 30-31. No synthetic end page or hard-cover effect is needed. This is a documented implementation convention, not an additional owner instruction. A direct `#page=5` selects page 5 and shows 4-5 in Double; switching to Single shows page 5. Selecting page 31 never requests a nonexistent page 32.

Single previous/next changes by one page. Double previous/next opens the adjacent stable spread, selecting its first real page; the cover participates as the preceding single view. Direct jumps select the requested page and show its containing spread. Display the visible range separately from the selected page field. Resize, mode changes, zoom, and fullscreen do not create page-history entries; actual user page navigation does. Existing `#portfolio-viewer`, page hashes, Home return, and history destinations remain valid.

Keep the controller's latest-request handling: queued clicks, keyboard repeats, reverse direction, direct jumps, and stale image/animation callbacks must converge on the latest requested destination. A long jump goes directly to its destination rather than animating every intervening sheet. Do not block the navigation model behind a long animation queue.

### 3. Derive Auto from usable sheet size; make overrides explicit

Represent requested mode as Auto, Single, or Double, distinct from the effective one/two-page layout. Auto is the initial state. Observe the viewer's usable space after header, tools, controls, and margins; fit each sheet at its original ratio using both width and height. Choose Double only if the fitted sheet meets a documented minimum useful display width. Begin evaluation around 680 CSS pixels per sheet, then tune against actual technical pages and record the final threshold. Add small threshold hysteresis if needed to avoid resize oscillation.

Single and Double explicitly override Auto, including on a small screen. A forced small-screen Double view fits both sheets without horizontal page overflow; its controls stay usable and detail viewing remains available. Resize does not silently reset the override. Keep this preference for the current document session, including Home/Portfolio returns; reload starts in Auto. Durable preference storage is out of scope. Layout changes settle an active turn, recompute fit, and restore the same selected page without visibly turning to another destination.

**Alternative considered:** A generic desktop/phone or portrait/landscape breakpoint ignores short windows, tablets, and two already-landscape sheets. Persisting preferences across browser sessions adds a behavior the owner did not request.

### 4. Isolate the page-turn mechanics behind a small adapter

Keep the site in plain HTML/CSS/JavaScript. Retain the controller in `script.js` or extract only cohesive viewer logic; add a narrow renderer module, such as `js/page-turn-renderer.js`, for mounting ready sheets, navigating/settling, resizing, and pausing/disposal. The controller owns URLs, loading, and controls; the renderer owns the visual turn. CSS remains authoritative for paper styling. Motion is already installed but is not a paper-fold engine; use CSS or the existing package only where a small surrounding transition warrants it.

The provisional starting candidate is a pinned, self-hosted StPageFlip build, evaluated during Cook. Research on 2026-11-09 found:

| Option | Fit and cost | Evidence and decision |
| --- | --- | --- |
| StPageFlip 2.0.7 | Image/HTML sheets, soft turns, adjustable shadows and sizing; MIT and no runtime dependencies. Existing integration is simpler than owning all fold math. | [Upstream documentation](https://github.com/Nodlik/StPageFlip), [manifest/license declaration](https://raw.githubusercontent.com/Nodlik/StPageFlip/master/package.json). About 906 repository stars were visible; adoption does not establish quality. |
| A narrow project-owned renderer | Full control of the accepted flat appearance, loading window, modes and scheduling; greater gesture/fold and browser-verification cost. | Contingency if bounded adapter/vendor changes cannot satisfy the same acceptance contract. No broad renderer framework is proposed. |

StPageFlip's [visible commit history](https://github.com/Nodlik/StPageFlip/commits/master/) ends at the 2.0.7 commit on 2021-04-18. Treat maintenance as stale, not actively maintained. Its [render loop](https://raw.githubusercontent.com/Nodlik/StPageFlip/master/src/Render/Render.ts) schedules continuous frames, and its automatic orientation is not the complete Auto/Single/Double contract. Do not assume its defaults meet this proposal.

The first working slice must prove forced modes in either container size, selected-page preservation, selective image assignment, interruptible gestures, reduced motion, and idle/hidden cleanup. Use HTML page shells or another controlled assignment path to avoid an eager `loadFromImages` call for all full-size assets. Record any bounded scheduling/mode fixes against the pinned source. Choose the renderer only after that proof; a broad rewrite, paid/hosted service, or material visual compromise requires scope reconciliation. No candidate was installed or executed in Prep.

Self-host only the necessary runtime bundle and its license notice, pin its identity, and inspect its dependency/supply-chain findings during Cook. No external runtime host, analytics, or arbitrary HTML injection is required. A no-runtime-dependency manifest is not a security audit. Keep `node_modules` and development tooling out of Pages output.

### 5. Let real input drive a restrained turn

Support corner/edge pointer dragging and horizontal touch gestures, plus visible previous/next controls and arrow keys outside editable or modal controls. A released drag completes or returns cleanly according to progress and direction. Vertical page scrolling remains possible on a phone. Zoom interactions must not accidentally navigate pages. Avoid turning the whole sheet into an indiscriminate click target.

Start click-driven turns around 350-450 ms with a quiet finish; actual duration and corner/shadow tuning are delegated visual implementation details within the accepted reference. The fold reveals real neighboring content in the correct order. At rest, sheets return flat and fully legible. No sound, autoplay, repeated idle flourish, or continuous hover animation.

Respect reduced motion on initial entry and when the preference changes: settle any active turn, disable corner-fold previews, and change pages immediately. Keep actual buttons, selected-state semantics, keyboard focus, image alternatives, and concise page/loading announcements outside any decorative/cloned renderer layers. Hidden sheet clones must not duplicate focus targets or live-region announcements. Target at least 44 CSS pixels for primary phone control hit areas while retaining the shared theme's contrast requirements.

The concept's detail button opens the selected sheet in an accessible fitted/zoomable detail surface using the same source image; provide scrolling or panning at enlarged scale, reset/close, Escape, and focus return. Fullscreen remains an enhancement with usable ordinary layout if the browser declines it. The source images are not re-exported as a new downloadable PDF.

### 6. Preserve foreground priority and bound decoded memory

Reuse deduplicated image requests/decode promises and versioned same-origin URLs. Decode the visible sheet/spread before committing the visual result, then maintain a bounded nearby window; aim initially for the current spread and its immediate neighbors. Evict distant decoded references and renderer textures/nodes after long browsing rather than retaining all 31 large decoded images. Token checks still discard obsolete results.

Keep `portfolio:foreground-load` active until the requested visible set succeeds, fails, or is superseded. In a spread it must not end when only the first image completes. Preserve the existing bounded background Cache Storage queue, which may eventually cache all assets after the landing is usable; that compressed-byte work is distinct from eager foreground decoding and does not justify mounting every sheet. Storage denial continues to use the network.

Keep the last readable content visible while a new destination loads. If a needed sheet fails, identify the requested page, distinguish the retained displayed content, allow retry, and leave navigation usable. Engine initialization/render failure falls back to immediate nonanimated landscape sheets with the same page/mode model, not an unusable blank stage.

Pause and release active viewer work on Home/route exit; recreate only necessary rendering resources when re-entering. Hidden tabs and resting sheets must not run an unnecessary drawing loop. Preserve the separate paused/reusable landing aircraft contract; replacing one renderer must not create another aircraft download, scene, or input handler.

## Focused Design and Engineering Review

This is a focused review through project responsibilities, not a newly convened full council or independent agent sign-off.

- **Established owner decisions:** Landscape flipping, responsive one/two-page viewing, manual override, the second thin architectural-portfolio concept, and this planning capture.
- **Historical recommendation:** DC-0002 preferred single sheets because two landscape pages could become too small. The owner's explicit responsive Double direction supersedes that restriction; the legibility concern remains addressed by fit rules and detail access. Its selective-loading and navigation cautions still apply.
- **Design liaison:** Keep sheet content dominant and flat at rest; test real dense, photographic, white, and dark pages. Do not import another project's visual/council decisions.
- **Engineering Lead:** One named planning batch; renderer choice and numerical tuning are delegated within its behavior contract. Product scope, integration and release stay with the owner.
- **Verification:** Prove a real mode-switch/browse/return journey, plus out-of-order loads and interrupted turns; a generated mockup proves no runtime behavior.
- **Integration:** Preserve pre-existing `.playwright-mcp/`; no branch, commit, PR, or application edit is made by Prep. Cook inventories the current tree and carries the accepted reference into its review.
- **Release/runtime:** Preserve the Pages subpath, synchronized build markers and loader/aircraft contracts. Existing `main` pushes deploy automatically, so merge/publication authority must be reconciled before later integration.
- **Productivity:** Adapt existing browser checks to intentional layout changes; do not preserve obsolete sidebar geometry assertions or introduce a broad new harness.

## Risks / Trade-offs

- **Two landscape pages shrink dense text** -> Choose Auto from usable sheet size and keep Single plus detail access available; inspect page 4 and a dark technical page.
- **An older renderer fights forced modes or idle scheduling** -> Qualify the exact candidate with the first working slice and isolate bounded fixes behind its adapter.
- **Turn callbacks and delayed images disagree with the URL** -> One selected page, request/transition tokens, stable spread mapping, and explicit tests for interruption/history.
- **Duplicate gesture handlers or scroll capture make phones awkward** -> One input owner, direction discrimination, and real touch/scroll/detail checks.
- **Full-resolution decoded images exhaust memory beside the retained aircraft** -> Bound the working set, release distant nodes/resources, and inspect a complete browse plus Home returns.
- **New geometry breaks old tests or landing transitions** -> Change only viewer layout expectations, retain route/focus/scene invariants, and update the site-theme delta explicitly.

## Acceptance and Verification Plan

The smallest meaningful proof, after Cook authorization, is: open Home, enter Portfolio, browse a technical spread at 1920 x 1080 in Auto, switch to Single on a selected right-hand sheet, resize to 390 x 844, force Double, return to Auto, use detail/close, jump to page 23 and the final spread, then return Home. The selected page survives each mode/size transition, controls stay usable, artwork stays landscape, and the aircraft resumes without another model request. Capture settled desktop/phone states and one mid-turn state against the bundled reference.

Add boundary-size checks just above/below the recorded Auto cutoff, a short desktop window, and 320-pixel phone width. Exercise cover and 30-31, direct `#page=5`/`#page=23`, browser back/forward, chapter/search/thumbnail selection, rapid direction changes, a cancelled drag, out-of-order/failed loads and retry, denied storage, and reduced motion. Inspect a complete browse for bounded retained sheets/resources and idle/hidden rendering activity. These are failure-oriented extensions to the existing scripts, not a requirement for a separate test per scenario.

Use `scripts/browser-test-server.cjs` and the production subpath. A focused pre-change `scripts/test-portfolio.cjs` baseline is useful; run the relevant existing `test-experience.cjs`, `test-portfolio.cjs`, and revised `test-viewer-layout.cjs` once the batch is stable. That layout script currently asserts the old fixed rail/stage and control locations; replace those assertions with accepted viewer geometry while retaining landing and usability protections. Run `sync-boot.cjs --check` and `test-cache-version.cjs` for the changed shell/asset inputs. Run `test-functional-loader.cjs` only if scene lifecycle/cache integration changes invalidate that evidence. Reuse other scene evidence unless those inputs change.

At the artifact boundary, preserve the existing Pages checks (`sync-boot.cjs --check`, `check-model-gzip.cjs`), Study Archive generation, and static-site packaging; inspect the actual prepared output for excluded Node dependencies and resolve any packaging issue before claiming delivery. Follow `STARTUP.md` to synchronize changed runtime build markers and asset URLs. Record commands, durations, revision, visual/runtime observations, known limits, and provisional minor impact in Cook's receipt. Prep runs only planning validation; no browser/build pass is claimed here.

## Migration Plan

No source-document, stored user-data, or URL migration. Keep the selected viewing mode in memory only. Cook delivers a verified static preview and draft PR after separate authorization; retain the present live site during that work. Plating and publication remain subsequent owner gates. The final release class/version is determined from the delivered change; do not bump 1.2.1 during Prep. Rollback restores the prior viewer with a fresh build marker so cached clients can obtain the restored assets without rewriting release history.
