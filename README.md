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
