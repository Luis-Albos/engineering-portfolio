# Tasks

## 1. Shared Palette, Portfolio, and Resume

- [x] 1.1 Inventory the implementation checkout, target branch, and approved dirty/untracked work before edits; preserve `.playwright-mcp/` and record the source revision. Run the affected existing viewer/route check as a quick baseline when practical, recording any environment limitation or pre-existing failure separately.
- [x] 1.2 Make `styles.css` the shared light-palette source and replace conflicting landing palette overrides with shared roles, retaining scene-specific colors and critical loader fallbacks. Verify the canvas matches `#fefdfa` and before/after landing captures retain its composition and geometry.
- [x] 1.3 Retheme the shared header/footer, Portfolio sidebar, image frame, search, thumbnails, navigation/page controls, mobile drawer, Resume actions, embedded-document surround, and fallbacks. Verify focused desktop/phone interactions, readable focus/active/disabled states and representative contrast targets, plus visible boundaries around both the white cover and dark page 23; confirm image/PDF assets are unchanged.
- [x] 1.4 Update `README.md` to identify the shared palette and remove the statement that the viewer keeps a separate palette. Verify documentation matches the implemented stylesheet responsibilities and still describes the existing viewer/Resume journeys.

## 2. Study Archive Surfaces and States

- [x] 2.1 Replace the independent archive palette and hardcoded dark colors in `resources/resources.css` with shared light roles. Verify Request Access through granted/library states, class filters, search/no results, card hover/focus/selection, selected-document details, loading/error messages, and the phone drawer remain understandable without relying on color alone.
- [x] 2.2 Retheme the study document header, actions, PDF surround, and fallback messages. Open a real resource through the existing library and verify its unchanged PDF and direct-open link work; inspect the site-owned fallback and check that phone layouts retain their existing geometry without horizontal overflow.

## 3. Initial Rendering and Cached Updates

- [x] 3.1 Align light color-scheme metadata and `theme-color` across all four HTML entry points. Verify direct entry/reload of Resume, Resources, an accessible study document, and a portfolio page hash with a dark system preference; inspect initial rendering and Home/Portfolio transitions for any return to a dark site background.
- [x] 3.2 Synchronize the runtime build marker and asset queries using the existing mechanism and update the marker documented in `STARTUP.md`; do not make a speculative release-version bump. Run `node scripts/sync-boot.cjs --check` and `node scripts/test-cache-version.cjs`, regenerating embedded boot assets first only if their source changed. Verify an earlier cached visit can obtain the current theme without manual cache clearing.

## 4. Integrated Acceptance and Cook Handoff

- [x] 4.1 Run `node scripts/test-experience.cjs` and `node scripts/test-portfolio.cjs` against the completed batch. Complete the design's Home → Portfolio → Resume → Resources → study PDF journey at 1440 × 1000 and 390 × 844, including reduced motion, dark system preference, focus, and representative status/fallback states. Record actual results, checked revision, elapsed times, and screenshots; rerun only checks invalidated by subsequent fixes.
- [ ] 4.2 Reconcile the implemented scope with the specification and prepare the Cook delivery receipt and reviewable draft PR when remote access supports it. Verify the receipt identifies the usable static-site preview, source revision, changed files, document preservation, provisional patch impact against documented 1.2.0, acceptance evidence and limits, and remaining integration/publication gates. Carry the existing Pages build checks and archive generation into the authorized release handoff; do not merge or publish during Cook.
