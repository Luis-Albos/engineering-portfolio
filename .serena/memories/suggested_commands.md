# Commands (Windows PowerShell, project root)
- Local HTTP preview: `python -m http.server 8000`; browse `http://localhost:8000` (Study Archive fetch needs HTTP).
- Install local JS dependencies: `npm ci`.
- Focused viewer suite: `npm run test:portfolio`; landing/intro suite: `npm run test:experience`. Browser scripts use installed Edge or Chrome; see `README.md` and `STARTUP.md`.
- Check embedded boot copy: `node scripts/sync-boot.cjs --check`. Update after editing boot sources: `node scripts/sync-boot.cjs`.
- OpenSpec: `openspec list --json`; validate a named change with `openspec validate <change> --strict`.
- To preview changed study PDFs locally: `python -m pip install -r requirements-study.txt`, then `python scripts/build_study_archive.py`.