# Loading Experience

## Purpose

Give visitors a light, truthful entry state while the aircraft becomes ready, then make the portfolio's static assets reusable across visits without making the landing wait for every download.

## Requirements

### Requirement: The entry loader matches the light portfolio and reports real readiness
On a landing visit whose aircraft scene is not yet ready, the site SHALL present the warm-ivory DC-0010 circle and the descriptor “loading luis' portfolio...” as an accessible loading state. The circle SHALL animate subtly when motion is allowed and SHALL be static under reduced motion. The previous black cinematic, fictional verification states, green success state, fixed 8,500 ms timeline, and Skip control SHALL not appear. The loader SHALL not claim a numeric progress percentage that is not derived from actual loading work. Direct portfolio/page deep links SHALL bypass this landing loader.

#### Scenario: First landing visit
- **WHEN** a visitor opens the landing without a ready aircraft scene
- **THEN** the light circle and descriptor appear while the scene loads, without the old cinematic or Skip control

#### Scenario: Reduced motion
- **WHEN** a visitor requests reduced motion and opens the landing
- **THEN** the loader remains readable without continuous circle motion

#### Scenario: Direct viewer link
- **WHEN** a visitor opens a portfolio viewer or page hash directly
- **THEN** the viewer opens without showing the landing loader or starting an aircraft download for that visit

### Requirement: The landing reveal follows aircraft readiness with a 15-second ceiling
The loader SHALL reveal the landing immediately when the aircraft has produced its first valid frame, without waiting for unrelated portfolio assets. If the aircraft is still loading 15 seconds after loader activation, the site SHALL reveal the usable landing and continue loading the aircraft in the scene area. A definitive model, WebGL, or scene startup failure SHALL reveal the usable landing with an unavailable-scene message rather than leave the visitor on the loader.

#### Scenario: Aircraft ready early
- **WHEN** the aircraft renders its first valid frame before 15 seconds have elapsed
- **THEN** the landing is revealed without waiting for the full 15 seconds

#### Scenario: Slow aircraft on a VPN-like connection
- **WHEN** the aircraft is still pending 15 seconds after loader activation
- **THEN** the landing is revealed with usable navigation and a scene-loading status, and the aircraft appears if it later becomes ready

#### Scenario: Aircraft unavailable
- **WHEN** the model request, renderer, or scene preparation fails definitively
- **THEN** the landing is revealed with its readable introduction, working navigation, and unavailable-scene status

### Requirement: Remaining site assets preload for reuse across sessions
After the landing becomes usable, the site SHALL attempt bounded background preloading of the remaining known same-origin portfolio pages, thumbnails, resume, Study Archive manifest, generated thumbnails, and linked study documents. The aircraft model and successfully preloaded assets SHALL be reusable across later browser sessions for the same asset version where browser storage permits. Background preloading SHALL not delay landing interaction or a visitor's requested page, SHALL not make navigation depend on cache availability, and SHALL recover from unavailable, evicted, outdated, or quota-limited storage by fetching needed assets normally. A changed asset version SHALL not serve stale content as the current version.

#### Scenario: First visit background preload
- **WHEN** the landing has become usable and assets remain uncached
- **THEN** the site begins bounded background work while the visitor can use the landing and portfolio

#### Scenario: Later browser session
- **WHEN** a visitor returns in a new browser session with current cached assets
- **THEN** those assets are reused without redownloading their full bodies

#### Scenario: Storage unavailable or evicted
- **WHEN** persistent browser storage is denied, full, cleared, or evicted
- **THEN** the site remains usable and requests needed assets from the network

#### Scenario: Updated asset version
- **WHEN** the deployed version of a cached asset changes
- **THEN** the new version is fetched and displayed instead of the stale cached body
