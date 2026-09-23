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

No local build command is required for the normal push-to-deploy workflow. To preview newly added documents locally before pushing, run:

```bash
python -m pip install -r requirements-study.txt
python scripts/build_study_archive.py
```

The archive lives at `resources/`. Its Request Access sequence stores a session flag in `sessionStorage`, so it is shown once per browser session.

## Deploy with GitHub Pages

1. Commit all files and push the repository to GitHub.
2. As a one-time repository setting, open **Settings → Pages** and choose **GitHub Actions** as the source. Branch-based Pages deployment does not run the Study Archive generator.
3. Push to the `main` branch. `.github/workflows/pages.yml` generates the Study Archive and deploys the complete static site.

GitHub will publish the site at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`. All asset paths are relative, so the viewer works from a repository subpath without changes.

## Viewer controls

- Previous/next buttons or left/right arrow keys
- Chapter navigation in the desktop sidebar or mobile drawer
- Direct page entry in the page-number field
- Swipe left/right on touch devices
- Deep links using one-based hashes such as `#page=15`
- Lazy thumbnail loading and adjacent-page preloading
- Fullscreen and chapter/page search


## Landing / Intro System

The homepage uses one real `.portfolio-layout` grid and one header for both the
landing environment and the existing portfolio viewer. The two content states
share `--sidebar-width` and `--header-height`. There is no duplicate viewer or
frontend framework. About and Contact remain below the shell.

- `js/experience.js`: shell state, entry/return, focus, history, and scene lifecycle.
- `js/boot.js` + `css/boot.css`: the cancellable Alephon cinematic. One animation-frame
  clock selects explicit states; no nested timer chain. The dot logo is a small
  CSS dot field masked by the real Alephon SVG; the resolved logo uses the same SVG.
  Console text, fictional verification blocks, square loader, and green check are
  HTML/CSS/SVG. This is a presentation, not authentication.
- `js/landing-scene.js` + `css/landing.css`: Three.js CAD visualization and shared shell.
- `js/experience-config.js`: all timeline timestamps, transition durations, camera,
  model transform, feature thresholds, opacity, framing, pixel ratio, and idle settings.

The full timeline is **8,500 ms**, including 400 ms initial black, initialization,
250 ms reset to black, brand/loading, automatic token population, green expansion,
and a 650 ms check state followed by the 750 ms landing reveal. Skip cancels the
clock and animations and reveals the landing; it never enters the portfolio.
`sessionStorage.alephonIntroSeen` is set on completion or Skip. Returning during the
same session reveals the landing in 450 ms. Reduced motion shows the solid logo
for 220 ms and keeps the aircraft static. The superseded `portfolioIntroSeen` key
is removed when the new intro finishes.

`#page=10`, `#page=23`, and other viewer/section hashes bypass the cinematic and
landing immediately, before paint. They do not import Three.js or fetch the mesh.
Portfolio links from Resume and Resources open the viewer; the homepage brand
returns to the landing without replaying boot. Back/Forward follow the URL state.

Opening Portfolio starts a **950 ms** in-place transformation: the landing rail
fades upward 8 px; secondary, major, then silhouette edges dim over 500 ms; the
grid/reference frame dims; the actual portfolio image fades/scales from .97; and
viewer controls resolve last. The header and grid boundary stay fixed. Reduced
motion uses a 100 ms state change. The existing viewer handles its own images,
request tokens, preloads, search, and page navigation. Its keyboard handler is
inactive while that viewer is inert on the landing.

### Geometry, references, and runtime assets

`reference/alephon-icon.svg` is the real mark. The early sequence in
`reference/Dan Neuenhaus danneuenhaus Instagram reel.mp4` supplied motion guidance;
the radar portion is intentionally excluded. The video is not embedded or fetched.
The revised landing screenshot supplied the composition. The reference directory
contained no STL; with user confirmation, the source remains **`cad/Wyvern.STL`**,
the byte-identical copy of `E:/Wyvern.STL` from the earlier implementation.

Build the optimized runtime mesh with Python's standard library:

```bash
python scripts/build-wyvern.py
```

`assets/landing/x02s.mesh` is **109,392 bytes**, versus 460,984 bytes for the STL.
The WVR1 binary contains 4,506 exact shared vertices and 27,654 16-bit indices;
all 9,218 original triangles remain. Its adjacent JSON records provenance/hash.
The converter rotates the source's negative-Z dorsal direction into Three.js Y-up
and normalizes length to 10 units. No invented details or mesh decimation.
The browser loads the optimized mesh, not the STL. This is a compact custom indexed
mesh, not GLB, avoiding an extra general-purpose model-loader dependency.

Three.js **0.180.0** is vendored under `assets/vendor/three/` with its MIT license.
`experience.js` dynamically imports the scene only for landing visits. No CDN or
server runtime is used. A matte Standard material (roughness 0.96, metalness 0) uses crease-aware averaged corner normals: curvature is smooth,
while form breaks over 38° retain hard normals. Shared-edge adjacency builds distinct
28° major and 14° secondary feature layers (without duplicating major edges in the
secondary layer). A view-dependent silhouette shader keeps edges whose neighboring
face normals straddle the view direction. Low-angle STL triangles are suppressed.
No source vertices or triangles are changed.

The aircraft glides on a 12.5-second base cycle: approximately 5.2° total yaw,
2.5° total pitch, 4° total bank, with 0.09-unit vertical, 0.14-unit lateral, and
0.12-unit longitudinal drift amplitudes. Motion pauses cleanly when offscreen or
in a hidden tab rather than jumping ahead on return. Reduced motion freezes both
terrain and aircraft. Rendering remains capped at 24 fps and 1.5 device pixel ratio.
Coarse-pointer/low-core devices use a smaller terrain grid and DPR 1; sustained
slow frame delivery also lowers DPR to 1. Entry fades terrain and edge layers,
then disposes geometry/materials, observers, renderer, context, and animation frame.
Pending mesh loads are aborted; returning home uses cached modules/assets.
WebGL loss, unsupported WebGL, or failed Three.js/model loading preserves the
static fallback and all accessible HTML controls.

To tune the view, edit `WYVERN_CONFIG` in `js/experience-config.js`. Camera position
sets the viewing direction; FOV controls perspective; the vertex-based fit preserves
breathing room on resize. Framing offsets, model rotation/position/scale, edge
opacities, and idle amplitudes are separate. The new nose-left three-quarter camera
replaces the old top-biased SVG camera. The supplied mesh has no analytical CAD
surfaces or semantic component labels; only geometry actually present is rendered.

After changing the model or camera, regenerate the static fallback using local
Chrome and the development-only Playwright package:

```bash
npm install --no-save --package-lock=false playwright
node scripts/render-wyvern-fallback.cjs
```

This writes `assets/landing/wyvern-fallback.webp`, rendered by the same scene with
motion disabled. Commit the mesh, metadata, fallback, and copied Alephon SVG.
Deployment needs no Node/Python CAD processing and the existing Pages workflow is
unchanged. All runtime URLs are relative or resolved relative to their ES module,
including under `/engineering-portfolio/`.

### Contour terrain refinement

`js/contour-terrain.js` creates a perspective heightfield beneath the aircraft.
A domain-warped macro noise field, ridged middle octave, and two small roughness
octaves produce broken rolling forms rather than uniform dunes. The vertex shader
displaces the grid; the fragment shader evaluates the same continuous height field
for smooth contours between mesh vertices. Derivative antialiasing suppresses
subpixel shimmer. Every fifth level is slightly emphasized; distance/edge fog keeps
the far field subdued. This replaces the targeting circle, crosshair axes, dot-grid
background, and decorative triangular mountain SVG.

Only a travel uniform changes each frame. Sampling coordinates scroll through a
continuous deterministic field; the grid does not wrap a repeating tile. Perspective
makes nearby contours move faster than distant ones. The terrain stays below the
jet's motion envelope and dims with the existing 950 ms portfolio morph.

Tune `TERRAIN_CONFIG` in `js/experience-config.js`: `roughness`, `heightScale`,
`frequency`, `warp`, `forwardSpeed`, `direction`, `contourDensity`, `contourOpacity`,
`lineWidth`, and fog distances. `segments`/`lowSegments` control vertex cost.
`WYVERN_CONFIG.surface`, `.edges`, and `.idle` control smoothness, highlights,
feature filtering, edge opacity, drift, yaw/pitch/bank, and cycle length.
The committed fallback is regenerated by the same renderer and includes the terrain.
No additional runtime dependency, backend, image texture, or runtime CAD conversion
was introduced. For initial visual tuning, adjust contour opacity and forward speed
first; leave the shared-shell and camera settings alone unless reframing is desired.

### Verification

```bash
node scripts/test-experience.cjs
node scripts/test-portfolio.cjs
node scripts/test-landing-scene.cjs
```

The tests run local Chrome (viewer suite defaults to Edge; set `TEST_BROWSER=chrome`
to use Chrome), serve the production project base path, and check the full intro,
every Skip stage, session/refresh, deep links, shell geometry, search, thumbnails,
fullscreen, mobile/tablet, reduced motion, WebGL/library/model failure, GPU disposal,
history, and delayed-image arrow/key spam. The scene-specific suite also checks motion
progression, reduced-motion pixel stability, overlay removal, low-power DPR, and
terrain/renderer disposal. Screenshots go to the OS temp directory.

The original optional thumbnail directory was empty. Small WebP thumbnails are now
included to avoid 31 failed image requests when opening the thumbnail panel.
Regenerate them after replacing portfolio pages with
`python scripts/build_portfolio_thumbnails.py`; this uses Pillow from the existing
`requirements-study.txt` development dependencies.

### Personal landing refinement

The shared homepage header carries the formal Luis Albos identity and engineering descriptor.
A concise personal heading and single-paragraph biography live in the landing rail above the
archive action. The same hierarchy stacks ahead of the aircraft on mobile without duplicating
identity copy.
The project label is factual; decorative slogans and category lists have been removed.

The landing and viewer use `--viewer-bg`, with `--muted` contour ink. `LANDING_PALETTE`
selects those CSS tokens for the terrain shader. `WYVERN_CONFIG.surface` controls base
color, roughness, metalness and normal crease; `.lighting` controls key and hemisphere
fill intensity. Existing `.idle` amplitudes and period retain the gliding motion.
`TERRAIN_CONFIG` controls roughness, contour density/opacity, speed and direction.
The source nose points along +X, so terrain features travel along -X (aft), rather than
merely reversing a screen-space animation. Continuous sampling preserves the endless flow.
The same shell, fade, dismissal and viewer materialization sequence remains in use.
