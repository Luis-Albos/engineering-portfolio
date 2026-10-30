# Design

## Context

See `proposal.md` and `specs/landing-composition/spec.md` for the outcome and behavior contract. The current site has one shared header and `.portfolio-layout` for the landing and 31-page viewer. `js/experience.js` controls the landing/viewer states, lazy-loads the 36 MB `reference/CP1_2024.glb`, and disposes the scene on entry to the viewer. `js/landing-scene.js` fits and renders that real aircraft with surface and edge materials. `js/contour-terrain.js` builds a periodic CPU heightfield once, then translates shared-geometry tiles; its shader already has contour antialiasing, fog, and world-edge fading. The present dark CSS and rolling terrain are visually different from DC-0008.

The authoritative visual reference is `references/dc-0008-concept.png` (1586 × 992). DC-0007 restored the unboxed composition and both Resume placements; DC-0008 adds the airborne gap, mountain ridges, and fading contours. These owner decisions supersede the earlier framed-scene iterations. The image guides layout and lighting; the GLB determines the aircraft's actual geometry.

## Goals / Non-Goals

**Goals:**

- Make screenshot comparison with the reference the primary desktop visual acceptance method, backed by behavior checks at representative viewports and scene states.
- Reuse the existing model, terrain renderer, lifecycle, and static Pages architecture. Retune rather than replace the 3D pipeline.
- Keep the landing-only CSS and markup change from accidentally rewriting the current viewer or its navigation model.

**Non-Goals:**

- Editing or regenerating the source GLB, introducing a new 3D library, or serving the generated concept as a runtime image.
- Building the flipbook or redesigning the 31-page viewer in this change. The owner decides whether to release this landing together with later light viewer work.
- Reworking the cinematic intro beyond the adjustments required for a clean landing reveal and existing reduced-motion behavior.

## Decisions

### 1. Compose the accepted reference in the existing shared shell

Keep the `.landing-rail`, `.landing-stage`, `.scene-canvas`, and `.open-portfolio` hooks needed by `js/experience.js`, but make the landing layout an overlapping editorial composition instead of a visible rail/stage split. Simplify the shared header and make the landing's warm-light tokens explicit. Remove the landing-only featured-project and registration content. Preserve the viewer sidebar and hash/history behavior. Use responsive CSS reflow rather than scaling the desktop layout as one image.

At the **1586 × 992 CSS-pixel** reference viewport, tune against these image-derived anchors (approximate due to raster antialiasing):

| Element | Reference anchor |
| --- | --- |
| Header | Name begins near x=70, top y=31; rule spans x≈71–1515 at y≈79; Portfolio / Resume / Resources align at the top right. |
| Left column | Kicker begins x≈70, y≈213; two-line serif headline begins x≈70, y≈297; description begins x≈71, y≈464. |
| Actions | Open Portfolio rectangle begins x≈71, y≈647 and is about 286 × 59; secondary Resume sits to its right. |
| Aircraft | Visible truss silhouette occupies roughly x≈520–1490 and y≈335–795, with its gear suspended above the nearer ridges. |
| Terrain | Pale layered peaks rise behind the aircraft near the upper middle/right and below its gear; lines soften before the text and all viewport boundaries. |

Use these as visual anchors, not hard-coded pixel offsets for every screen. Compare actual browser captures side by side with the reference before settling CSS and camera values. Alternative considered: retain the current boxed stage or recreate the concept as a static background. Both contradict the final unboxed, interactive owner direction.

### 2. Retune the real aircraft without changing its geometry

Use `AIRCRAFT_CONFIG` and the current vertex-based camera fit to set aircraft scale, orientation, rightward placement, and breathing room. The owner's Cook-stage revision asks for a moving sketch: use an opaque paper-colored unlit fill to occlude rear edges and terrain, then let dark silhouette and crease lines define the truss. Keep pointer drag, keyboard rotation, propeller behavior, reduced-motion freeze, and current resource cleanup. If the exact generated silhouette cannot be matched with the GLB, preserve the actual model and report the visual difference with screenshots rather than synthesizing geometry.

Alternative considered: edit or swap the GLB. It is unnecessary for the specified composition and risks losing the verified assembly and interaction nodes.

### 3. Reshape the existing heightfield into a mountain range with true clearance

Keep the one-time periodic `heightAt()` construction and shared translated tiles. Adjust its broad envelope and ridged components so background ranges form recognizable peaks while the flight corridor under the aircraft stays lower across terrain travel and aircraft drift. Preserve periodic tile continuity, normal calculation, contour antialiasing, and the low-detail path. Evaluate clearance using the actual scene geometry and rendered views at several idle phases; a world-space gap alone can still appear like wheel contact from the camera angle.

Alternative considered: a separate mountain image or dense mesh asset. It would complicate alignment, responsiveness, and load cost while the existing generator already supports the needed terrain.

### 4. Fade only the contour field in screen space

Extend the terrain fragment shader's current fog and tile-edge fade with a smooth mask derived from normalized screen coordinates. Feed it viewport and text-boundary parameters on resize so terrain fades before the left copy and toward all four outer edges at desktop and mobile widths. Keep the aircraft material and edges outside this mask. Read the light scene palette from the landing host or pass it explicitly, since the current terrain samples root-level dark CSS tokens. Avoid a whole-canvas CSS opacity mask, which would also weaken the aircraft and its interaction cue.

### 5. Preserve loading, motion, and static delivery behavior

Retain lazy scene import, model-fetch abort, deep-link bypass, WebGL failure/context-loss status, and disposal on viewer entry. Keep default motion restrained enough that distant mountains do not compete with reading; reduced motion holds the composed airborne frame. Use existing relative asset URLs under the Pages subpath and add no runtime dependency. Reconcile the terrain description in `README.md`, which currently describes an older shader-driven heightfield rather than the present CPU-built periodic tiles.

## Risks / Trade-offs

- **Actual model silhouette differs from concept art** → Match framing and rendering with the real GLB; document any irreducible shape difference for owner review.
- **Plane appears grounded despite geometric clearance** → Check multiple idle-phase screenshots and the nearest gear-to-terrain gap; adjust foreground terrain, camera, and placement together.
- **Light terrain either disappears or competes with text** → Tune contour-only masks and contrast at the reference viewport, then inspect a phone viewport and WebGL fallback.
- **Shared CSS/DOM changes break the viewer transition** → Preserve state hooks and run the existing landing-to-viewer, return, deep-link, reduced-motion, and disposal journeys.
- **Scene load or frame cost grows** → Reuse the existing GLB and terrain grids; profile real startup and motion if visual tuning increases geometry or shader work.
- **New light landing opens onto the existing dark viewer** → Keep release pairing with the separate viewer-light/flipbook work as an explicit owner gate rather than silently expanding this change.

## Migration Plan

1. Implement the landing change on its own reviewable branch/worktree, preserving the already modified Design Council ledger. Do not change the published Pages site during review.
2. Run focused scene checks and the representative real-browser journey at `/engineering-portfolio/`, compare the screenshot with the reference, then run affected integrated site checks. Prepare a draft PR and report exact revision and evidence.
3. Leave merge and publication to the project's Plating/release gates and owner decision on viewer pairing. Rollback is a normal revert of the landing change; no data or asset migration is required.
