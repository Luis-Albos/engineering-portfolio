# Luis Albos Engineering Portfolio

A fast, responsive viewer for the 31-page Luis Albos Engineering Portfolio. The public site is plain HTML, CSS, and JavaScript with no backend. A small Python build step generates the private-ish Study Archive index and thumbnails for GitHub Pages.

## Add portfolio pages

1. Export each portfolio page as WebP without changing its aspect ratio.
2. Place the 31 full-size pages in `assets/portfolio/` using one-based, sequential filenames:
   - `page-01.webp`
   - `page-02.webp`
   - …
   - `page-31.webp`
3. Optionally place smaller matching images in `assets/thumbnails/` using the same one-based filenames. If a separate thumbnail is unavailable, the viewer automatically uses its full-size portfolio page.
4. The portfolio is intentionally available only through the WebP viewer and its exported page images.
5. The resume viewer uses the repository's existing `assets/portfolio/Luis_Albos_Resume.pdf` file.

Page filenames, visible labels, chapter ranges, the page-jump field, and URL hashes such as `#page=15` all use the same one-based numbering.

For best performance, export WebP images near the largest size at which they will be displayed (roughly 1800–2400 px on the longest edge) and use a quality setting around 80–88.

## Update pages, chapters, and links

Shared document and external-link paths live in `site-config.js`. Keep these paths relative so the site works from the `/engineering-portfolio/` GitHub Pages project subdirectory. The resume asset has one canonical setting: `resumeAssetUrl`.

Open `script.js` and edit the `portfolioConfig` object at the top to control:

- `totalPages`: the number of portfolio images
- `initialPage`: the default page when there is no URL hash
- `pagePath` and `thumbnailPath`: centralized one-based page filename generation
- `resumePageUrl`: the dedicated resume page sourced from `site-config.js`
- `chapters`: Roman numerals, navigation titles, page ranges, and portfolio details
- `links`: LinkedIn, email, and GitHub destinations

The LinkedIn and email links are configured for Luis Albos. The GitHub URL intentionally remains an obvious placeholder until a profile is supplied.

`resume.html` provides the dedicated responsive resume viewer. Both desktop and mobile Resume navigation open that page rather than linking directly to the PDF.

## Run locally

The portfolio can be opened directly, but the Study Archive manifest must be fetched over HTTP. Use a small local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Adding Study Resources

The normal upload workflow requires no HTML, JavaScript, manifest, or thumbnail edits.

1. Put each PDF inside an immediate course folder using this pattern:

   ```text
   assets/study/<COURSE NAME>/<DOCUMENT>.pdf
   ```

   Example:

   ```text
   assets/study/ESET 462 - Control Systems/Final Formula Sheet.pdf
   ```

2. To add a new class, create one new folder directly inside `assets/study/` and place PDFs in it. The folder name becomes the class name. A spaced hyphen is displayed as an editorial em dash, so `ESET 462 - Control Systems` appears as `ESET 462 — Control Systems`.

3. Commit and push normally:

   ```bash
   git add .
   git commit -m "Add formula sheets"
   git push
   ```

The GitHub Pages workflow then runs `scripts/build_study_archive.py`, detects every PDF, counts its pages, records its file size, creates a first-page WebP thumbnail under `assets/study-thumbnails/`, regenerates `assets/study-manifest.json`, and deploys those generated files with the site.

The workflow stages public files with `python scripts/prepare_site.py --output _site`
and uploads `_site`, keeping Node dependencies, tests, proposals, Git metadata,
and source CAD/video references out of the published artifact. The output must
be a new or empty directory. `_artifact.json` records the build and each public
file's SHA-256 identity. For a local prepared preview, generate the archive,
stage to an empty directory, and serve its parent with that directory named
`engineering-portfolio` to exercise the production subpath.

Every immediate folder is treated as a class, and every PDF directly inside it becomes a resource. Class names come from folder names; document titles come from PDF filenames. Natural sorting keeps names such as Exam 1, Exam 2, and Exam 10 in the expected order.

`.gitkeep` is not required when a folder contains real files. Its only purpose is to preserve an otherwise-empty folder in Git. It is ignored by the generator.

Do not manually edit `assets/study-manifest.json` or anything under `assets/study-thumbnails/`; both are generated outputs.

Optional class metadata can be added as `class.json` inside a class folder:

```json
{
  "displayName": "ESET 462 — Control Systems",
  "description": "Feedback control, system modeling, and controller design.",
  "order": 10,
  "semester": "Spring 2026",
  "tags": ["controls", "feedback"]
}
```

`class.json` is completely optional. All fields inside it are optional too. Missing or malformed metadata is ignored without stopping the remaining archive build.

No local build command is required for the GitHub Pages workflow. To preview newly added documents locally before pushing, run:

```bash
python -m pip install -r requirements-study.txt
python scripts/build_study_archive.py
```

The archive lives at `resources/`. Its Request Access sequence stores a session flag in `sessionStorage`, so it is shown once per browser session.

## Deploy with GitHub Pages

1. Commit all files and push the repository to GitHub.
2. As a one-time repository setting, open **Settings → Pages** and choose **GitHub Actions** as the source. Branch-based Pages deployment does not run the Study Archive generator.
3. Merge an approved release to `main`. The Pages workflow generates the Study Archive and deploys the complete static site. A manual run of **Build and deploy GitHub Pages** on `main` can redeploy it if needed.

GitHub will publish the site at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`. All asset paths are relative, so the viewer works from a repository subpath without changes.

## Viewer controls

- Previous/next buttons or left/right arrow keys: one page in Single, the adjacent spread in Double
- Chapters, search, and thumbnails in the compact Chapters dialog; phone site navigation remains in the menu
- Direct page entry in the page-number field
- Drag a sheet edge or swipe horizontally to turn; a partial drag can return to the same sheet; vertical phone scrolling remains available
- Deep links using one-based hashes such as `#page=15`
- Lazy thumbnail loading and adjacent-page preloading
- Auto / Single / Double controls: Auto uses two sheets only when each fitted sheet can be at least 680 CSS pixels wide, accounting for available height as well as width
- Manual mode selection survives resizing and Home/Portfolio returns in the current document; reload starts in Auto
- Page 1 is a centered soft cover; facing spreads are 2–3, 4–5, through 30–31; switching modes preserves the exact selected page
- Zoom opens the selected original sheet in a detail dialog with Fit, plus/minus enlargement up to 8×, scrolling, Escape/Close and focus return
- Fullscreen and chapter/page search; reduced motion uses immediate page changes without animated folding

The viewer retains up to seven nearby decoded images in Single and six in Double
(plus transient in-flight work or the last displayed sheet during a failure).
Its renderer mounts at most three Single sheets or six Double sheets and releases
distant sheet nodes. The existing low-priority cache may still fetch all compressed
assets after the landing is usable; that is separate from decoded image memory.
A requested spread holds foreground priority until both sheets settle. Failed
pages leave readable content visible with an explicit status and Retry. If the
page-turn module fails, fitted sheets and the same navigation/mode controls remain
usable without animated folds.

The pinned MIT `page-flip@2.0.7` engine is self-hosted under
`assets/vendor/page-flip/`, with an unchanged bundle and license. The small
`js/page-turn-renderer.js` adapter controls forced modes, a rolling sheet window,
soft-sheet treatment, input arbitration and request-driven drawing; it stops
idle/hidden drawing and explicitly cleans up resize/input handlers. See that
vendor directory's README for source identity and version-specific integration.
Motion remains installed but is not required by this viewer at runtime.


## Landing / Intro System

The homepage uses one `.portfolio-layout` and one header for the landing and
existing portfolio viewer. Landing content and the scene overlap as an open
editorial composition; the viewer uses a wider stage and compact Chapters/tools dialogs. Both states share
the same navigation lifecycle without a duplicate viewer or frontend framework.

- `js/experience.js`: shell state, entry/return, focus, history, and scene lifecycle.
- `js/boot.js` + `css/boot.css`: the warm-ivory, accessible loading ring and its
  single 15-second reveal ceiling. The original cinematic lives in the private
  `Luis-Albos/alephon-load-animation` archive.
- `js/asset-cache.js` + `service-worker.js`: versioned browser caching and a
  low-priority queue for portfolio and Study Archive assets.
- `js/landing-scene.js` + `css/landing.css`: Three.js CAD visualization and shared shell.
- `js/experience-config.js`: all timeline timestamps, transition durations, camera,
  model transform, feature thresholds, opacity, framing, pixel ratio, and idle settings.

The landing appears when the aircraft's first valid WebGL frame is ready, on a
definitive scene failure, or after 15 seconds. A model still loading at the
deadline continues in the landing viewport. Reduced motion keeps the ring and
aircraft static. Each direct landing navigation checks readiness; there is no
Skip control or session-only intro flag.

`#page=10`, `#page=23`, and other viewer/section hashes bypass the loader and
landing immediately, before paint. They do not import Three.js or fetch the mesh.
Portfolio links from Resume and Resources open the viewer; the homepage brand
returns to the existing landing scene. Back/Forward follow the URL state.

Opening Portfolio starts a **950 ms** in-place transformation: the editorial
introduction fades, terrain and aircraft edges dim, and the actual portfolio
image fades/scales from .97 as viewer controls resolve. The shared header stays
in place. Reduced motion uses a 100 ms state change. The existing viewer handles its own images,
request tokens, preloads, search, and page navigation. Its keyboard handler is
inactive while that viewer is inert on the landing.

### Geometry, references, and runtime assets

`reference/alephon-icon.svg` is the real mark. The early sequence in
`reference/Dan Neuenhaus danneuenhaus Instagram reel.mp4` supplied motion guidance;
the radar portion is intentionally excluded. The video is not embedded or fetched.
The approved DC-0008 concept is stored at
`openspec/changes/archive/2026-10-30-light-airborne-landing/references/dc-0008-concept.png` for visual
review; it is not served as the landing. The current aircraft is the SAE Aero Regular Class
assembly in `reference/CP1_2024.glb`. Older Wyvern landing meshes, conversion tools,
and image fallbacks were removed after the landing migrated to this aircraft.

Three.js **0.180.0** and GLTFLoader are vendored under `assets/vendor/three/` with
their MIT license. `experience.js` dynamically imports the scene only for landing
visits. No CDN or server runtime is used. The GLB geometry receives the established
paper-colored opaque fill and dark feature/silhouette edge treatment without
changing the source model. The fill hides rear lines and terrain through the
aircraft; the linework carries its moving-sketch appearance.

The aircraft glides on a 12.5-second base cycle: approximately 5.2° total yaw,
2.5° total pitch, 4° total bank, with 0.09-unit vertical, 0.14-unit lateral, and
0.12-unit longitudinal drift amplitudes. Motion pauses cleanly when offscreen or
in a hidden tab rather than jumping ahead on return. Reduced motion freezes both
terrain and aircraft. Rendering is capped at the configured 60 fps and 1.5 device pixel ratio.
Coarse-pointer/low-core devices use a smaller terrain grid and DPR 1; sustained
slow frame delivery also lowers DPR to 1. Entry fades terrain and edge layers,
then pauses rendering and scene input while the portfolio is open. Returning Home
resumes the same canvas, parsed model, and GPU resources. Page exit and
unrecoverable context loss dispose geometry/materials, observers, renderer,
context, and animation frame. Pending mesh loads are aborted on viewer entry;
returning Home retries them through the versioned model cache.
WebGL loss, unsupported WebGL, or failed Three.js/model loading preserves the
lightweight viewport status and all accessible HTML controls.

The preferred aircraft transfer is `reference/CP1_2024.glb.gz` (13.96 MB).
The browser's `DecompressionStream('gzip')` expands it to the exact original
36.11 MB GLB bytes before GLTFLoader parses them. Browsers without that API, or
with a missing/corrupt compressed response, fetch the original GLB instead.
`node scripts/check-model-gzip.cjs` verifies byte identity. The compressed
response is the model entry persisted in the browser cache, reducing both cold
transfer and cache storage without changing node names or geometry.

To tune the view, edit `AIRCRAFT_CONFIG` in `js/experience-config.js`. Camera position
sets the viewing direction; FOV controls perspective; the vertex-based fit preserves
breathing room on resize. Framing offsets, model rotation/position/scale, edge
opacities, and idle amplitudes are separate. The supplied GLB has no analytical CAD
surfaces; only geometry actually present is rendered.

Deployment needs no Node/Python CAD processing and the existing Pages workflow is
unchanged. All runtime URLs are relative or resolved relative to their ES module,
including under `/engineering-portfolio/`.

The service worker is scoped to this project subpath and stores versioned static
assets as they are requested. After the landing becomes usable, a single-file
background queue caches the 31 portfolio pages and thumbnails, Resume PDF,
Study Archive manifest, thumbnails, and PDFs. A requested portfolio page pauses
the queue; a later visit resumes missing assets. Cache Storage persists between
browser sessions when the browser permits it, but browser quota or eviction can
remove entries. A denied cache falls back to network requests. The new build
marker changes cache keys, and `version.json` remains network-checked. PDF byte
ranges bypass the worker so browser PDF viewers can request partial content.

### Contour terrain refinement

`js/contour-terrain.js` builds its heightfield once on the CPU. Periodic noise,
overlapping rear/middle/foreground summits, and a low flight corridor form the
mountain ranges. Shared geometry tiles translate rigidly aft (+X for this model's
-X nose) and wrap at identical edge heights. The vertex shader passes fixed
elevation to the fragment shader, which draws antialiased contour levels. Every
fifth level is emphasized slightly. Distance and world-edge fog, plus a responsive
screen-space mask, fade only the terrain near the text and all viewport edges.
The real aircraft stays crisp over the warm light canvas.

Tune `TERRAIN_CONFIG` in `js/experience-config.js`: `heightScale`, `valleyScale`,
`roughness`, `cycles`, `warp`, `forwardSpeed`, `direction`, `contourDensity`,
`contourOpacity`, `lineWidth`, and fog distances. `segments`/`lowSegments` control
vertex cost. `LANDING_PALETTE` reads the scene's `--landing-bg` and
`--landing-contour` CSS tokens. The shared palette in `styles.css` supplies the
warm-white canvas, graphite text, neutral surfaces, rules, actions, and focus
colors for the landing, Portfolio, Resume, and Study Archive. `css/landing.css`
keeps the landing layout and scene-specific contour treatment;
`resources/resources.css` uses the same shared colors for archive controls and
document surrounds. Original portfolio artwork and PDF contents retain their
colors; browser-provided PDF toolbars follow the browser's own appearance.
`AIRCRAFT_CONFIG.surface`, `.edges`, and `.idle` control the paper fill,
feature filtering, edge opacity, drift, yaw/pitch/bank, and cycle length.
No additional runtime dependency, backend, image texture, or runtime CAD conversion
was introduced. For initial visual tuning, adjust contour opacity and forward speed
first; leave the shared-shell and camera settings alone unless reframing is desired.

### Verification

```bash
node scripts/sync-boot.cjs --check
node scripts/check-model-gzip.cjs
node scripts/test-cache-version.cjs
node scripts/test-boot-reliability.cjs
node scripts/test-scene-preload.cjs
node scripts/test-functional-loader.cjs
node scripts/test-experience.cjs
node scripts/test-portfolio.cjs
node scripts/test-viewer-layout.cjs
node scripts/test-renderer-slice.cjs
node scripts/test-landing-scene.cjs
node scripts/test-aircraft-interaction.cjs
```

The tests run local Chrome (viewer suite defaults to Edge; set `TEST_BROWSER=chrome`
to use Chrome), serve the production project base path, and check readiness,
the 15-second reveal, failure and fallback paths, browser-restart cache reuse,
background asset recovery, PDF byte ranges, scene reuse, viewer navigation,
responsive layout, reduced motion, and aircraft controls. The scene-specific
suite checks motion progression and reduced-motion pixel stability. Screenshots
go to the OS temp directory. The measured cold-transfer profile and results
are recorded in `openspec/changes/archive/2026-11-03-functional-light-loader/performance.md`.

The original optional thumbnail directory was empty. Small WebP thumbnails are now
included to avoid 31 failed image requests when opening the thumbnail panel.
Regenerate them after replacing portfolio pages with
`python scripts/build_portfolio_thumbnails.py`; this uses Pillow from the existing
`requirements-study.txt` development dependencies.

### Light editorial landing

At the 1586 × 992 reference viewport, the warm ivory landing matches DC-0008's
slim ruled header, large left headline and short description, Open Portfolio and
secondary Resume, and unboxed aircraft on the center-right. The landing-specific
`.landing-rail` DOM hook remains for scene lifecycle, but no visible sidebar or
featured-project annotation appears. On narrow screens, the copy and action stay
ahead of the scene in reading order. The aircraft is the real
`reference/CP1_2024.glb`, raised over the mountain field with a paper-colored fill
and dark sketch lines.
The viewer, Resume, and Resources share the landing's light palette while
retaining their existing layouts and behavior. Flipbook planning remains separate.
