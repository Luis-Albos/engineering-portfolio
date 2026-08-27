# Luis Albos Engineering Portfolio

A fast, responsive viewer for the 31-page Luis Albos Engineering Portfolio. It is built with plain HTML, CSS, and JavaScript, with no dependencies, backend, or build process, and is ready for GitHub Pages.

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

Opening `index.html` directly works in most browsers. A small local server more closely matches GitHub Pages:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy with GitHub Pages

1. Create a GitHub repository and commit all files in this folder.
2. Push the repository to GitHub.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your default branch (usually `main`) and the root `/` folder, then save.

GitHub will publish the site at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`. All asset paths are relative, so the viewer works from a repository subpath without changes.

## Viewer controls

- Previous/next buttons or left/right arrow keys
- Chapter navigation in the desktop sidebar or mobile drawer
- Direct page entry in the page-number field
- Swipe left/right on touch devices
- Deep links using one-based hashes such as `#page=15`
- Lazy thumbnail loading and adjacent-page preloading
- Fullscreen and chapter/page search
