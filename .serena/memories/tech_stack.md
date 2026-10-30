# Stack
- Plain HTML, CSS, and JavaScript; no frontend framework or production bundler. Runtime Three.js 0.180.0 is vendored in `assets/vendor/three/`; see `README.md` and `js/landing-scene.js`.
- Python `scripts/build_study_archive.py` generates study manifest and thumbnails during `.github/workflows/pages.yml` deployment.
- `package.json` provides local Playwright browser-test tooling and Motion for future development. Motion is not yet imported by the published site; npm install alone changes no runtime behavior.
- Serena `.serena/project.yml` uses the TypeScript language server for JavaScript. OpenSpec 1.13.2 uses `openspec/config.yaml` and `spec-driven`.