# Portfolio startup

The landing uses the warm-ivory ring and status text embedded in `index.html`.
Edit `js/boot.js` and `css/boot.css`, then run `node scripts/sync-boot.cjs`.
The Pages workflow runs `node scripts/sync-boot.cjs --check`. Keep the build
marker and asset queries in `index.html`, `resume.html`, and
`resources/index.html`, and `resources/viewer.html` aligned with `version.json` (current build:
`20261109-02`). The early `version.json` check uses `cache: "no-store"` and
the service worker leaves that request on the network.

For a direct landing visit, the ring paints before `js/experience.js` imports
the Three.js scene and fetches the aircraft model. The overlay disappears on
the first valid scene frame, a definitive scene failure, or 15 seconds after
the loader starts, whichever comes first. A late model may still finish in the
landing viewport. The deadline does not cancel it or trigger another fetch.
Reduced motion keeps the ring still. There is no Skip control or session-only
intro flag. Deep Portfolio/page hashes bypass the overlay and aircraft load.
The preferred transfer is a 13.96 MB gzip of the original GLB; browsers that
cannot decompress it request the original model. Run
`node scripts/check-model-gzip.cjs` when either model file changes.

The scene is retained but paused while the portfolio viewer is open. Returning
Home resumes the same canvas, controls, and GPU resources. Page exit or an
unrecoverable WebGL context loss disposes them. A pending scene is aborted when
the visitor leaves Home for the viewer and can be retried on return.

After the landing becomes usable, including at the 15-second ceiling,
`js/asset-cache.js` registers a small, project-subpath-scoped service worker and
starts a single-file background queue. It caches the 31 portfolio pages and
thumbnails, Resume PDF, and the current Study Archive manifest's thumbnails
and PDFs. A requested portfolio page interrupts that queue. Cache Storage is
best effort: a later visit resumes missing files, and denied or full storage
falls back to direct network loading. Versioned cache keys avoid using old
model and static bytes after a deployment.

Useful checks:

```text
node scripts/sync-boot.cjs --check
node scripts/test-cache-version.cjs
node scripts/check-model-gzip.cjs
node scripts/test-functional-loader.cjs
node scripts/test-portfolio.cjs
node scripts/test-landing-scene.cjs
```

Local Chrome throttling approximates a constrained connection. It is not a
measurement on an actual corporate VPN or every GPU/driver combination.
