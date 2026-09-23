# Alephon startup

The cinematic is embedded in index.html: its controller, CSS, and Alephon SVG do not need additional requests. Edit js/boot.js, css/boot.css, or assets/landing/alephon.svg, then run:

    node scripts/sync-boot.cjs

The Pages workflow checks that the embedded copy is current. Keep index.html's build marker/asset queries and version.json in sync when releasing (current build: 20260923-05).

Each stage in js/boot.js has a duration in milliseconds (8,500 ms total at normal frame rates). Each wait owns a cancellable requestAnimationFrame loop. Frame increments are capped at 32 ms and hidden-tab time is ignored. CSS animations are paused and advanced by the same increments, so password entry, the loader, and the exit fade also avoid catching up after stalls. Skip aborts the pending wait, cancels animations, removes listeners, hides the overlay, and marks alephonIntroSeen. Reduced motion retains the 220 ms brand path.

No landing modules or models start during the cinematic. After completion or Skip, js/experience.js allows the static landing to paint, then imports the landing scene; the scene fetches CP1_2024.glb and performs parsing, terrain construction and GPU work. This deliberately favors reliable playback over overlapping the heavy download with the cinematic. Return visits start this process immediately; deep links do not start it. Imports are still build-versioned.

The viewport's inline text loading state is visible by default, so the Home layout can paint without waiting for WebGL or an image. SCENE_STARTUP_TIMEOUT in js/experience.js is 6,000 ms; expiry changes the detail to `Still loading...` without aborting a potentially successful late load or retrying. After a successful first render, `is-scene-ready` crossfades the text state and live canvas over 200 ms (css/landing.css). A terminal WebGL/model failure reports `Scene unavailable` while keeping every HTML control usable. Leaving the landing cancels pending scene work and clears its timeout.

Regression commands (Playwright with Chrome must be available):

    node scripts/sync-boot.cjs --check
    node scripts/test-cache-version.cjs
    node scripts/test-boot-reliability.cjs
    node scripts/test-experience.cjs
    node scripts/test-aircraft-interaction.cjs
    node scripts/test-landing-scene.cjs

The reliability suite records every state, injects an 800 ms main-thread stall, uses 6x CPU throttling and Slow 3G latency/bandwidth, delays the page controller, Three.js, GLB and scene initialization, and tests WebGL failure. The experience suite verifies Skip in each actual state (rather than assuming wall-clock timestamps), session/refresh, deep links, Resume/Resources/Portfolio, reduced motion and the /engineering-portfolio/ deployment path. These are local simulations, not a test on a managed corporate VPN device or a production deployment.

Validation results: the reliability scenarios, full experience suite, landing scene suite, cache checks, embedded-asset check, and JavaScript syntax checks passed. The aircraft interaction suite reaches its momentum-settling assertion and fails there; a read-only browser run serving the unchanged HEAD files reproduces the same failure. Aircraft control implementation was not changed.

Changed files:
- index.html: embedded boot assets, nonblocking shell styles, inline scene loading state, build marker.
- js/boot.js: standalone cancellable per-state controller and shared animation clock.
- js/experience.js: post-intro startup, paint yield, timeout, completion event integration.
- js/experience-config.js: removes the obsolete absolute intro timeline.
- js/landing-scene.js: reveal the canvas only after the first render succeeds; clean up first-render failures.
- css/landing.css: loading-state and live-scene opacity crossfade.
- version.json, resume.html, resources/index.html: synchronized release/cache version.
- scripts/sync-boot.cjs and .github/workflows/pages.yml: generate and check embedded assets.
- scripts/test-boot-reliability.cjs, scripts/test-experience.cjs, scripts/test-cache-version.cjs: reliability, real-state Skip, and cross-page version regression checks.
- STARTUP.md: timing, workflow and validation notes.
