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

The homepage uses one `.portfolio-layout` and one header for the landing and
existing portfolio viewer. Landing content and the scene overlap as an open
editorial composition; the viewer retains its own sidebar. Both states share
the same navigation lifecycle without a duplicate viewer or frontend framework.

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
`openspec/changes/light-airborne-landing/references/dc-0008-concept.png` for visual
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
then disposes geometry/materials, observers, renderer, context, and animation frame.
Pending mesh loads are aborted; returning home uses cached modules/assets.
WebGL loss, unsupported WebGL, or failed Three.js/model loading preserves the
lightweight viewport status and all accessible HTML controls.

To tune the view, edit `AIRCRAFT_CONFIG` in `js/experience-config.js`. Camera position
sets the viewing direction; FOV controls perspective; the vertex-based fit preserves
breathing room on resize. Framing offsets, model rotation/position/scale, edge
opacities, and idle amplitudes are separate. The supplied GLB has no analytical CAD
surfaces; only geometry actually present is rendered.

Deployment needs no Node/Python CAD processing and the existing Pages workflow is
unchanged. All runtime URLs are relative or resolved relative to their ES module,
including under `/engineering-portfolio/`.

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
`--landing-contour` CSS tokens; the viewer keeps its separate palette.
`AIRCRAFT_CONFIG.surface`, `.edges`, and `.idle` control the paper fill,
feature filtering, edge opacity, drift, yaw/pitch/bank, and cycle length.
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

### Light editorial landing

At the 1586 × 992 reference viewport, the warm ivory landing matches DC-0008's
slim ruled header, large left headline and short description, Open Portfolio and
secondary Resume, and unboxed aircraft on the center-right. The landing-specific
`.landing-rail` DOM hook remains for scene lifecycle, but no visible sidebar or
featured-project annotation appears. On narrow screens, the copy and action stay
ahead of the scene in reading order. The aircraft is the real
`reference/CP1_2024.glb`, raised over the mountain field with a paper-colored fill
and dark sketch lines.
The existing viewer, flipbook planning, resume, and resources are separate work.
