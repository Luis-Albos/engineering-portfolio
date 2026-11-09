# Proposal

## Why

The 8.5-second black Alephon cinematic conflicts with the approved warm-light landing and runs on a fixed timeline rather than actual readiness. The 36.1 MB aircraft currently fetches and rebuilds again on a Portfolio-to-Home return, which is especially noticeable on constrained corporate VPN connections.

## What Changes

- Preserve the original cinematic as a runnable source snapshot in the owner's empty private `Luis-Albos/alephon-load-animation` repository before removing it from this site. Record its origin and contents there; do not publish that repository or change this site's public release as part of the archive step.
- Replace the black intro and Skip flow with the DC-0010 warm-ivory circle concept and a truthful loading status. Reveal the landing as soon as the aircraft's first valid frame is ready, or 15 seconds after the loader starts while the aircraft continues loading in the landing scene area. Reveal the usable landing promptly on a definitive scene failure.
- Keep the aircraft scene paused and reusable while the visitor is in the portfolio viewer, so returning Home does not fetch, parse, or compile the model again during that page session. Preserve deep-link bypass, failure recovery, reduced motion, and cleanup when the page is left or the WebGL context is lost.
- Start bounded background preloading of the remaining same-origin portfolio and Study Archive assets after the landing is usable. Use versioned, browser-managed persistent caching across browser sessions where available, with quota, cache-update, and no-cache fallbacks. Do not gate the landing on completion of that background work.
- Measure cold and warm starts under representative VPN-like throttling and evaluate delivery-size reduction for the aircraft without degrading its approved sketch appearance, node-dependent controls, or static GitHub Pages deployment.

## Capabilities

### New Capabilities

- `loading-experience`: The light readiness-based loader, 15-second reveal ceiling, accessible status, background asset preloading, and cross-session cache behavior.

### Modified Capabilities

- `landing-composition`: Replace the required scene disposal on viewer entry with a paused reusable scene for same-page navigation while retaining direct-link bypass and usable fallback behavior.

## Impact

The change spans `index.html`, `css/boot.css`, `js/boot.js`, `scripts/sync-boot.cjs`, `js/experience.js`, the Three.js scene lifecycle, viewer/asset loading, and the relevant browser tests. The archived animation is a separate private GitHub repository deliverable. The site remains static under `/engineering-portfolio/`; no server, authentication, or runtime package dependency is proposed. Existing uncommitted Design Council concept files must be preserved. The current source declares `1.1.0`; the likely release impact is **minor**, provisional until the actual delivery is reviewed against the released site.
