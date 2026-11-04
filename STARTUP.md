# Alephon startup

The cinematic is embedded in index.html: its controller, CSS, and Alephon SVG do not need additional requests. Edit js/boot.js, css/boot.css, or assets/landing/alephon.svg, then run:

    node scripts/sync-boot.cjs

The Pages workflow checks that the embedded copy is current. Keep index.html's build marker/asset queries and version.json in sync when releasing (current build: 20260924-01).

Each stage in js/boot.js has a duration in milliseconds (8,500 ms total at normal frame rates). Each wait owns a cancellable requestAnimationFrame loop. Frame increments are capped at 32 ms and hidden-tab time is ignored. CSS animations are paused and advanced by the same increments, so password entry, the loader, and the exit fade also avoid catching up after stalls. Skip aborts the pending wait, cancels animations, removes listeners, hides the overlay, and marks alephonIntroSeen. Reduced motion retains the 220 ms brand path.

Home owns one initialization promise in `js/experience.js`. The standalone cinematic never imports, awaits, or checks scene work. Two animation frames let the initial screen paint; while the cinematic is playing, a further 450 ms protects its opening. The scene module and the single CP1_2024.glb fetch then start together. The same downloaded buffer is passed into GLTFLoader; there is no preload tag or second loader request.

After network/import completion, an intro-only 900 ms pause precedes GLB parsing and aircraft discovery. A second intro-only 900 ms pause precedes renderer, terrain, edge geometry, camera and interaction preparation. These are relative preparation stages, not deadlines or changes to cinematic state timing. Terrain heights and aircraft edge loops yield in batches: roughly 5 ms of work followed by an 8 ms timer during the intro, or 10 ms slices with a zero-delay timer after reveal. Individual browser/Three.js operations (GLB parsing, buffer allocation, WebGL creation) are still atomic; the budget is cooperative, not a hard upper bound on every task. `compileAsync` uses parallel shader compilation where the driver supports it, then the first frame is rendered behind the overlay. No continuous animation runs until the intro is complete. Resize may render an additional hidden frame.

If preparation wins the race, the already-rendered canvas is revealed with Home and animation starts. If the intro wins, Home reveals immediately with the existing loading state until the same initialization promise resolves. Skip releases any pending intro-only delay and activates a prepared scene; it never cancels or duplicates the preload. Session return visits bypass all intro-only delays. Deep Portfolio/viewer/about/contact links do not request the Home scene or GLB. Leaving Home aborts pending work and disposes partial resources; reentering creates a fresh scene. Reduced motion remains supported, including preference changes during startup.

The viewport's inline text loading state is visible by default, so the Home layout can paint without waiting for WebGL or an image. SCENE_STARTUP_TIMEOUT in js/experience.js is 6,000 ms; expiry changes the detail to `Still loading...` without aborting a potentially successful late load or retrying. After a successful first render, `is-scene-ready` crossfades the text state and live canvas over 200 ms (css/landing.css). A terminal WebGL/model failure reports `Scene unavailable` while keeping every HTML control usable. Leaving the landing cancels pending scene work and clears its timeout.

Regression commands (Playwright with Chrome must be available):

    node scripts/sync-boot.cjs --check
    node scripts/test-cache-version.cjs
    node scripts/test-scene-preload.cjs
    node scripts/test-boot-reliability.cjs
    node scripts/test-experience.cjs
    node scripts/test-aircraft-interaction.cjs
    node scripts/test-landing-scene.cjs

The reliability suite records every state, injects an 800 ms main-thread stall, uses 6x CPU throttling and Slow 3G latency/bandwidth, delays the page controller, Three.js, GLB and scene initialization, and tests WebGL failure. The experience suite verifies Skip in each actual state (rather than assuming wall-clock timestamps), session/refresh, deep links, Resume/Resources/Portfolio, reduced motion and the /engineering-portfolio/ deployment path. These are local simulations, not a test on a managed corporate VPN device or a production deployment.

The scene-preload suite checks both completion orders, one GLB request and one WebGL context, a rendered hidden frame, no hidden animation loop, visible animation resumption, Skip reuse, return sessions, deep links, 6x CPU throttling, WebGL failure, and cancellation on navigation. The intro reliability suite retains its HTML-only isolation and full state-order checks; dependency delays now intentionally outlast the overlapping intro.

Validation: scene-preload, boot reliability, experience/navigation, landing-scene, terrain-stability, cache-version, embedded boot sync, and JavaScript syntax checks passed. In the final normal-desktop startup run, the GLB request began at 0.56 s and the first hidden frame rendered at 6.62 s, before intro completion. The aircraft-interaction suite still fails its existing momentum-settling assertion; a separate server serving unchanged HEAD files reproduces that failure. Aircraft control code was not changed. These are local Chrome simulations, not measurements from an actual corporate VPN or every GPU/driver.
