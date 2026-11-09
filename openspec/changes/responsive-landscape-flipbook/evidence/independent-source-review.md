# Independent verification: responsive-landscape-flipbook

Source preview: `C:/Users/Letzel/Desktop/Engineering/engineering-portfolio`, served through `scripts/browser-test-server.cjs` under `/engineering-portfolio/`. Reviewed working-tree files on 2026-11-09; these checks precede final packaging and do not establish a deployed revision. No repository files were edited by this reviewer.

Browser: Windows headless Google Chrome 156.0.8078.80, including a fresh mobile context with native CDP touch input. The initial isolated StPageFlip qualification used headless Microsoft Edge.

## Observed checks

- At 1920x1080, Home aircraft became ready; Portfolio opened with Auto Double, centered cover, then stable 2-3 and 4-5 spreads. At 390x844, Auto became Single. Explicit Single/Double/Auto and resize retained selected page 5 and did not increase history length. Forced Double fit both 390px and 320px phone widths without horizontal overflow; essential viewer buttons measured at least 44x44 CSS px.
- Detail zoom doubled a 330px canvas image to 660px; Escape restored focus to Zoom. Search selected 23, thumbnail selected 8, chapter selected 23, and transient tools restored visible focus. Cover 1 and final 30-31 rendered correctly; final Next was disabled. Browser back restored 5 and forward restored 23.
- Real desktop pointer turns completed forward/back and cancelled a short drag. Changing reduced motion during a turn settled the selected spread, and subsequent navigation was immediate. Native phone vertical touch scrolled the document from 0 to 108px without changing page 5.
- Latest actual-source native touch rerun: full Single forward 5->6; short forward stayed6; full back 6->5; short back stayed5. Cancelled gestures did not add history. Short Double drag with right-hand5 selected retained 5 and its history entry.
- While page 23 was delayed, selected 23 remained pending, readable4-5 stayed visible, and foreground priority remained active for the whole22-23 spread. A later31 request prevailed after23 completed. Failed 17 retained 30-31 with an explicit failure status; retry displayed 16-17.
- Auto used Double at 1394px usable width, Single at 1339px, and Single in a 1920x600 short window, preserving selected 5. A complete 31-page browse ended with four retained decoded entries / four sheet nodes. Resting and mid-turn current/neighbor/clone images retained original 3507x2481 dimensions and `object-fit:contain`.
- Idle draw counter remained 1859->1859. Home retained the same aircraft canvas with model requests 1->1 and stopped viewer drawing. Three Home/Portfolio returns retained exactly one window resize handler. Synthetic visibility-change handling stopped drawing and resumed correctly.
- Blocking the renderer module produced a fitted static fallback. Single/Double, Next, and native horizontal touch navigation worked. Rejected fullscreen left normal viewing usable. With `caches.open` denied, two denied calls were observed, the aircraft fetched once through the network path, and its scene became ready. No uncaught page errors occurred in completed runs.

## Renderer qualification and rechecked fixes

StPageFlip 2.0.7 supports the required bounded adapter: external fixed geometry forced Single at 900px and Double at 280px; `showCover` plus soft-density reset yielded1 / 2-3 / ... / 30-31; six HTML shells accepted selective image assignment. Adapter-only cancellation of the stock startup RAF and demand scheduling worked against the unmodified package. Resting/settled/disposed drawing stopped; a Single temporary clone disappeared after settlement. A fresh animation clock and nonnegative frame index were necessary.

Independent testing found that a normal Single forward touch ending inside the left edge cancelled; the horizontal mapping fix was rechecked successfully. A subsequent short Single backward touch incorrectly advanced and added history; the final actual-source cancellation fix was rechecked successfully. The right-hand selected-page cancellation fix and prefetched-image fit metadata were also independently rechecked. No outstanding failure remained in the tested paths.

## Evidence files and durations

Screenshots: `desktop-spread-4-5.png`, `phone-forced-double-4-5.png`, `desktop-cover.png`, `desktop-midturn-cover.png`, `desktop-drag-forward.png`, `phone320-double.png`, and latest `phone-single-midturn.png`.

Detailed data: `report.json`, `edge-report.json`, `fallback-report.json`, beside this report. Temporary executable checks are in the parent temp directory: `portfolio-visitor-review.cjs`, `portfolio-edge-review.cjs`, `portfolio-touch-verify-fix.cjs`, and `portfolio-fallback-review.cjs`.

Measured completed-command durations: isolated unmodified-package qualification 3.39s; latest actual-source touch verification 8.43s; fallback/storage/fullscreen command 5.23s, with its own measured test stage 4.655s. The core journey and long-browse total were not separately timed; no aggregate duration is claimed.

## Evidence limits

Physical background-tab throttling was not observed: headless Chrome continued reporting a background tab as visible. The visibility handler was exercised synthetically. Safari, Firefox, physical mobile hardware, arbitrary memory-pressure eviction, production deployment, and the final packaged artifact were not checked here. Browser decoded/GPU memory was not measured; bounded resources are evidenced by the application's retained-entry count and mounted sheet/image nodes. Packaging smoke remains pending the supplied artifact path.
