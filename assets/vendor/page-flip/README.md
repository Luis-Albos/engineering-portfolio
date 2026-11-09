# StPageFlip runtime

`page-flip-2.0.7.js` is the unmodified ESM runtime from `page-flip@2.0.7`, pinned in the development manifest and lockfile. Upstream: https://github.com/Nodlik/StPageFlip . MIT license is included in `LICENSE`.

SHA-256: `b718faafca6856bff51629baedeff601e2cc59482e951105bdbd6e46978cca38`.

Only this runtime and its license are needed by the static site. `node_modules` is not published. No runtime dependencies or remote service are used. `npm install --ignore-scripts` reported zero vulnerabilities on 2026-11-09; this is not a comprehensive security audit. Upstream maintenance is old (latest visible commit 2021-04-18).

`js/page-turn-renderer.js` contains the version-specific integration: fixed fitted geometry forces modes; a small nearby HTML window keeps decoding bounded; all sheets are reset to soft; synchronous initialization captures and cancels the stock infinite RAF loop. An instance-level demand scheduler refreshes animation time, guards negative frame indices, and draws only for active turns or explicit changes. Cleanup explicitly removes UI handlers before destruction. The upstream runtime bytes are unchanged.

When upgrading, requalify forced modes, cover/spread mapping, cancelled gestures, selected-page restoration, scheduling, temporary-copy cleanup, and destroy/re-entry. Do not replace the pinned file with an unreviewed CDN or latest bundle.
