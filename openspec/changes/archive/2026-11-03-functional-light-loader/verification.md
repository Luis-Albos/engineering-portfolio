# Cook Line verification

Tested working tree: `codex/functional-light-loader` after the loader, gzip,
cache, viewer-deferral, documentation, and test changes. The local static server
used `/engineering-portfolio/` and Chrome headless. The canonical artifact is
the static site at build marker `20261103-01`, with the 13,959,440-byte
`reference/CP1_2024.glb.gz`. The original cinematic archive is private commit
`0871a9b04d8e725834ea816da70d5d3be364b6ab` in
`Luis-Albos/alephon-load-animation`; its five remote files were compared with
the verified local demo before removing the staging copy.

| Check | Result | Elapsed |
| --- | --- | ---: |
| `openspec validate functional-light-loader --strict` | pass | 2.5 s with adjacent static checks |
| `node scripts/sync-boot.cjs --check` | pass | under 1 s |
| `node scripts/test-cache-version.cjs` | pass, includes Study viewer | under 1 s |
| `node scripts/check-model-gzip.cjs` | pass, decoded SHA-256 matches original | under 1 s |
| `node scripts/test-boot-reliability.cjs` | pass | 1.2 s |
| `node scripts/test-scene-preload.cjs` | pass | 22.9 s |
| `node scripts/test-functional-loader.cjs` | pass | 28.6 s |
| `node scripts/test-experience.cjs` | pass | 43.7 s |
| `node scripts/test-portfolio.cjs` | pass | 11.8 s |
| `node scripts/test-landing-scene.cjs` | pass | 20.8 s |
| `node scripts/test-aircraft-interaction.cjs` | pass | 13.3 s |
| Background priority with stalled page-01 fetch and foreground viewer image | pass, foreground image loaded while background was held | 8.2 s |
| `node scripts/test-terrain-stability.cjs` | not run: `sharp` is absent from this checkout's installed dependencies | 0.4 s to dependency failure |

The functional journey covers cold readiness, 15-second timeout, late model,
model failure, compressed-transfer fallback, storage denial, browser restart,
version change, evicted page recovery, same-canvas Portfolio-to-Home reuse,
Resume/Study Archive PDF open and byte ranges with and without a controlling
worker, direct page hash, and reduced motion. WebGL context-loss recovery and
aircraft drag/keyboard/propeller behavior were separately exercised. The
project-specific Cortex MCP was not exposed in this session; repository and
README evidence were used directly. An actual managed corporate VPN and the
production Pages CDN were not tested. Paired local throttle timings are in
`performance.md`.

Portfolio implementation commit: `7b9bcda26def54b925d867e9fe6a7afad5b9f52b`,
based on published `main` commit
`0a1f47af44a725d90557c8e23b3d24ae06eec471`. Draft PR:
`https://github.com/Luis-Albos/engineering-portfolio/pull/3`. The PR's remote
file list includes all 37 intended files, including DC-0010, the private
archive commit reference, gzip artifact, cache code, tests, and OpenSpec.
No merge or Pages deployment was performed.
