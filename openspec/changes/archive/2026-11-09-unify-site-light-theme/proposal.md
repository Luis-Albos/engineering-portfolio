# Proposal

## Why

The homepage and loader use warm white, while the portfolio viewer, Resume, and Study Archive retain a dark theme. Visitors should encounter the same visual identity throughout the site, including document frames and mobile controls.

## What Changes

- Extend the homepage's warm white (`#fefdfa`), graphite text, and fine gray rules to every site-owned page surface.
- Share semantic color tokens across the landing, portfolio viewer, Resume, and Study Archive instead of maintaining unrelated page palettes.
- Apply the palette to headers, sidebars, footers, controls, search dialogs, thumbnails, mobile drawers, status/fallback states, the archive access sequence, library, and study PDF frame.
- Keep document boundaries visible with subtle neutral surfaces, borders, and restrained shadows.
- Make the default document color scheme light from first paint, including direct links and visits from devices configured for dark mode.

## Capabilities

### New Capabilities

- `site-theme`: A consistent light palette across the site's routes, interactions, and site-owned document surrounds.

### Modified Capabilities

None. Existing `landing-composition` and `loading-experience` requirements continue to apply without changing their behavior.

## Impact

- Primarily `styles.css`, `css/landing.css`, and `resources/resources.css`; the four HTML entry points may need shared theme metadata or synchronized asset queries. Follow `STARTUP.md` for cache/build-marker consistency.
- Preserve plain static hosting at `/engineering-portfolio/`. No new runtime dependency, framework, document renderer, backend, or data migration.
- Document the shared palette in `README.md`; use existing browser checks and one focused visual acceptance journey.
- Previous documented released version: **1.2.0**, supported by `VERSION` and `RELEASE_NOTES.md` (2026-11-09). The version helper reports one synchronized source at 1.2.0; there are no local release tags. Production could not be independently rechecked during Prep because network access failed.
- Provisional release impact: **patch**, a compatible visual consistency correction. Do not bump the version during Prep; final classification and release remain later decisions.

## Scope and Authority

The owner confirmed brainstorming complete and authorized these planning artifacts for `unify-site-light-theme`. Implementation, PR preparation, integration, and deployment are not authorized by that confirmation. The owner retains the final product, aesthetic, integration, and release decisions.

The subsequent Alephon Cook Line invocation on 2026-11-09 authorizes this change's implementation, verification, commits, push, and draft PR preparation. Current delivery evidence and remaining gates are recorded in [verification.md](verification.md). Merge and publication remain separate decisions.

## Exclusions

Keep the existing page geometry, typography hierarchy, landing aircraft/terrain, loader timing, transitions, routes, hashes, viewer interactions, and Study Archive session-access behavior. Do not add a flipbook, a theme switcher, sound, or a navigation redesign. Preserve the original portfolio images, thumbnails, and PDF contents; browser-owned PDF toolbars are outside site CSS control.
