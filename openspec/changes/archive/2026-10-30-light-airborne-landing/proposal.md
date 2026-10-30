# Proposal

## Why

The current dark, divided landing competes for attention and does not prepare visitors for the portfolio's predominantly white pages. The owner has approved the DC-0008 concept as the landing's visual target: a restrained light editorial composition with the real SAE Aero aircraft visibly flying over fading mountain contours.

## What Changes

- Replace the landing's dark sidebar and framed project stage with the single, open composition in [the 1586 × 992 DC-0008 reference](references/dc-0008-concept.png). Match its header, left text column, action placement, aircraft scale and position, warm background, and quiet terrain. Keep the pictured Portfolio, Resume, and Resources navigation and the secondary Resume link beside Open Portfolio.
- Remove landing-only biography/facts, featured-project copy, scene registration notes, border/frame, and any Selected Work section. Preserve the portfolio viewer, resume, resources, and their links.
- Reuse `reference/CP1_2024.glb` and the existing Three.js pipeline. Retune the real aircraft's camera and, per the owner's Cook-stage DC-0009 revision, give it a paper-colored fill and dark sketch outlines; reshape the procedural terrain into layered mountains below the plane; fade contour lines near the text and all viewport edges without fading the aircraft.
- Preserve responsive reading order, accessible controls, reduced motion, loading and WebGL-unavailable states, deep links, and scene teardown. Keep the existing landing-to-viewer behavior while adapting its visual transition to the new composition.
- Treat the flipbook and broader viewer redesign as separate changes. Public release of this landing remains an owner decision, including how it is paired with the viewer's light-mode work.

## Capabilities

### New Capabilities

- `landing-composition`: The approved light editorial landing, airborne interactive aircraft, mountain contour treatment, and resilient entry to the existing portfolio viewer.

### Modified Capabilities

None. This project has no current main OpenSpec capability specs.

## Impact

- Expected implementation areas: `index.html`, `styles.css`, `css/landing.css`, `js/experience-config.js`, `js/contour-terrain.js`, `js/landing-scene.js`, and only the necessary landing transition hooks in `js/experience.js`; related browser checks and `README.md` will need reconciliation.
- No new runtime dependency, backend, model conversion, or edit to the GLB is planned. Preserve relative URLs and static GitHub Pages delivery under `/engineering-portfolio/`.
- Previous public baseline: `1.0.0` per `VERSION`, the shared versioning policy, and `python scripts/versioning.py status --project engineering-portfolio --checkout engineering-portfolio`. No version tag or release notes exist in this checkout. Provisional impact: **minor**, subject to the implemented behavior and release review; Prep does not change the version.
- Owner-approved visual direction is recorded in `councils/design/DECISIONS.md` as DC-0007 through DC-0009. The reference image remains a planning artifact; the Cook Line branch implements this proposal for review without changing the published site.
