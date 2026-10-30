# Code and asset conventions
- Keep production runtime URLs relative for the `/engineering-portfolio/` GitHub Pages subpath; see `README.md` and `site-config.js`.
- Viewer page labels, hashes, and `assets/portfolio/page-01.webp` through `page-31.webp` are one-based; see `script.js` and `README.md`.
- Do not hand-edit `assets/study-manifest.json` or `assets/study-thumbnails/`; the Python generator owns them.
- `index.html` embeds boot source; after changing `js/boot.js`, `css/boot.css` or the Alephon SVG, run `scripts/sync-boot.cjs` and its check. Keep build marker, queries, and `version.json` aligned for releases; see `STARTUP.md`.
- Separate observed behavior, council proposals, and owner approvals; local council charters and OpenSpec hold change records, Cortex holds durable decisions.