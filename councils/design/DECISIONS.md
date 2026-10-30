# Design Council decision ledger

## DC-0001 — Register portfolio Design Council

- **Date:** 2026-10-29 (America/Chicago).
- **Authority:** Owner request to import the Design Council for an upcoming website overhaul.
- **Decision:** Register five portfolio-specific design perspectives in [the charter](README.md), with owner approval retained for material aesthetic and product choices.
- **Status:** Workflow setup only. No review has been convened; no redesign direction or implementation has been approved.

Future entries should identify the artifact reviewed, evidence, material disagreement, recommendation, owner decision and status, and any superseded entry.

## DC-0002 — Light editorial overhaul and landscape flipbook exploration

- **Date:** 2026-10-29 (America/Chicago).
- **Artifact reviewed:** Published landing and viewer at `https://luis-albos.github.io/engineering-portfolio/`, all 31 source pages in `assets/portfolio/`, and live PDF Flip architecture-portfolio and landscape-deck examples. Similar patterns were checked in Heyzine, FlipHTML5, and Flipsnack documentation/examples.
- **Evidence:** The document uses 3507 × 2481 landscape pages, predominantly white with serif headings, thin rules, framed CAD drawings, photography, and deliberate whitespace. Pages 21–23 and 29–30 use black section treatments. The desktop landing gives simultaneous prominence to a long biography, featured project copy, moving wireframe aircraft, and contour terrain. On a 390 × 844 viewport, the featured project begins below the first screen. The viewer currently uses a dark frame, a permanent chapter sidebar on desktop, and one image at a time. Its 31 WebP pages total about 150 MB, so a flipbook must load selectively.
- **Creative Director:** Recommend a warm light editorial shell drawn from the document: restrained serif display type, dark ink, fine rules, large margins, and one dominant image. Risk: a pure white site could erase the edge of white pages. Smallest test: compare the cover and a dark chapter page against the proposed surround at desktop size.
- **Experience Architect:** Recommend a concise introduction and a single primary portfolio action; move the longer biography and detailed project story below the opening composition. Keep chapters, page links, search, and resume easy to reach. Risk: simplifying the first screen could bury the person's identity. Smallest test: ask a first-time viewer to identify Luis's discipline and open a project within the first viewport on desktop and phone.
- **Motion & Interaction Director:** Recommend one landscape page at a time with a restrained turn gesture, visible next/previous controls, fast direct jumps, and an instant reduced-motion path. Risk: a literal two-page book shrinks already composed landscape sheets and makes technical text illegible. Smallest test: compare a dense drawing page, a full-bleed photo page, and a dark page on desktop and phone, including rapid navigation and reduced motion.
- **Game Feel & Sonic Designer:** Recommend silent page turns by default; any sound would require an explicit optional control and a demonstrated benefit. Risk: sound or repeated flourishes make professional review slower and more conspicuous. Smallest test: observe a quiet five-page browse and whether the turn itself supplies sufficient feedback.
- **Design Systems Engineer:** Recommend a self-hosted progressive viewer using the existing WebP assets and URL/page model; retain static fallback and lazy/adjacent loading. Evaluate a page-turn implementation against single-landscape behavior, mobile fit, keyboard access, zoom, and teardown before selecting a library. Risk: 31 full-resolution assets (about 150 MB) or continuously running animation can hurt startup and responsiveness. Smallest test: load only cover and neighbors, then navigate quickly through page 31, a deep link, and a return to landing on desktop and phone.
- **Cross-review:** The book metaphor is valuable only if page legibility and direct navigation remain strong. Do not reproduce PDF Flip's facing-page architecture example for these already-landscape sheets. Its landscape-deck example and Heyzine's one-page mode are closer references. Keep any WebGL aircraft as a secondary, optional project detail if the owner wants it; the opening composition should let the portfolio work lead.
- **Owner decision:** Light mode is an explicit starting direction. The owner also wants a PDF Flip-style interactive digital flipbook, but has not approved a specific library, exact layout, removal of the aircraft scene/intro, sound, or a final visual system.
- **Status:** Council recommendation recorded for exploration. No OpenSpec change exists yet; no website code, deployment, merge, or release was authorized. Carry approved choices and unresolved decisions into a future proposal after brainstorming is complete. Provisional release impact: likely minor relative to the existing `1.0.0` public baseline, subject to final behavior and compatibility review.

## DC-0003 — One-composition light landing with aircraft and contours

- **Date:** 2026-10-29 (America/Chicago).
- **Artifact reviewed:** Generated light editorial landing concept following DC-0002, compared with the published regular-class aircraft and contour scene at `https://luis-albos.github.io/engineering-portfolio/`.
- **Owner revision:** Keep the landing to a single page composition; remove the concept's Selected Work area. Replace its portfolio-cover hero visual with the existing Three.js regular-class aircraft and contour mountain scene in light mode.
- **Creative Director:** The revision gives the landing one memorable focal object while retaining the document's white-space and serif vocabulary. Keep the aircraft as a graphite technical object and the contours much lighter; avoid adding project copy over the scene. Risk: the aircraft wing and contours can crowd the headline. Smallest test: check the headline, CTA, and plane silhouette at the target desktop viewport.
- **Experience Architect:** Keep name, discipline, portfolio action, resume, and navigation visible in the opening composition. Interpret “single page” as one landing section, with responsive reflow rather than forcing all content into a fixed mobile height. Risk: forced fit can make type and controls too small. Smallest test: view a 390 × 844 phone layout with readable type and a visible portfolio action.
- **Motion & Interaction Director:** Preserve the existing restrained aircraft glide as a possibility, but make the contours quiet and avoid a second attention-grabbing reveal. Reduced motion should keep a composed static plane. Risk: moving terrain may compete with reading. Smallest test: observe the first five seconds in default and reduced-motion settings.
- **Game Feel & Sonic Designer:** No sound or extra flourish is warranted for the landing scene. Risk: sensory decoration changes the portfolio's professional tone. Smallest test: assess the silent scene and CTA feedback in a brief first visit.
- **Design Systems Engineer:** Reuse the existing scene geometry and configuration where practical, then retune lighting, line opacity, CSS colors, and contrast for a light surround. The generated image is a visual target, not proof of WebGL feasibility or exact GLB geometry. Risk: simply inverting dark colors can lose depth or leave low-contrast edges. Smallest test: compare the real render with the concept on desktop and phone, including WebGL failure and reduced motion.
- **Status:** The single-composition light landing and aircraft/contour hero are owner directions for future proposal work. Exact copy, scene framing, palette values, intro behavior, and mobile composition remain to be resolved. No website implementation, OpenSpec proposal, merge, or deployment was performed in this council review. This entry updates the landing recommendation in DC-0002; the flipbook recommendation remains under exploration.

## DC-0004 — Retain the current landing's framed spatial structure

- **Date:** 2026-10-29 (America/Chicago).
- **Artifact reviewed:** Owner-supplied screenshot of the current published landing and the two light-mode concept images generated after DC-0003.
- **Owner correction:** Use the current landing as the composition reference. Simplify its top bar; widen the left sidebar substantially while reducing its word count. Keep the right-side stage clearly separated by an outer border and inset frame border, with project text, the regular-class aircraft, and contour mountains all inside that frame. Render the composition in light mode. Keep the landing to one composition without a Selected Work section.
- **Council synthesis:** Preserve the current page's rail/stage relationship rather than turning the hero into an open, borderless editorial canvas. A roughly quarter-width sidebar gives a short introduction and portfolio action more room; the stage retains the technical presentation-board character. Keep the aircraft and contours below the project text's reading hierarchy and avoid recreating a dense overlay.
- **Risks and smallest checks:** Check the desktop divider and both stage borders at the target viewport; verify sidebar copy and CTA remain readable at phone width without squeezing the scene; verify the real light-mode Three.js render retains visible aircraft edges and quiet contours. Generated mockups are visual targets, not implementation evidence.
- **Status:** Owner direction supersedes the borderless composition shown immediately after DC-0003. Exact copy, palette values, mobile layout, and scene tuning remain open for proposal. No application implementation, merge, or deployment was performed.

## DC-0005 — Restore the open editorial landing, frame only the 3D scene

- **Date:** 2026-10-29 (America/Chicago).
- **Artifact reviewed:** Owner-supplied crop of the earlier light editorial concept and subsequent framed-stage mockups.
- **Owner correction:** The last mockup followed the current site's rail/stage layout too closely. Retain the earlier open editorial composition with the large left headline and one Open Portfolio action. Borrow only the clearly framed Three.js aircraft/contour presentation on the right. Remove the secondary Resume link beside Open Portfolio; its placement will be decided later.
- **Council synthesis:** Keep the left typography and negative space separate from the right framed scene. Clip terrain inside the frame and keep the complete aircraft within it. The frame is a visual device around the 3D work, not a return to the current sidebar and featured-project text layout.
- **Risks and smallest checks:** At desktop width, confirm the frame does not cross the headline and the aircraft stays within the border. At phone width, preserve readable hierarchy and a visible Open Portfolio action. Check the real scene in light mode, reduced motion, and WebGL fallback before implementation acceptance.
- **Status:** This owner direction supersedes DC-0004's recommendation to retain the current landing's rail/stage relationship. The top navigation and final Resume placement remain open. The generated image is a design target only; no site code, OpenSpec proposal, merge, or deployment changed.

## DC-0006 — Minimal frame on the original light concept

- **Date:** 2026-10-29 (America/Chicago).
- **Artifact reviewed:** Owner-supplied full image of the original light editorial aircraft concept, after multiple overextended framing revisions.
- **Owner correction:** Preserve that image's composition as closely as possible. Add only a simple box around the existing plane scene. Remove Resume from the landing concept, including the secondary link by Open Portfolio; its future placement is separate.
- **Council synthesis:** The frame is a small graphic adjustment to the accepted open composition, not a new stage layout, aircraft scale, project copy, or sidebar. Any portion of the frame behind editorial text should yield to legibility. Keep Open Portfolio as the sole hero action.
- **Status:** This narrows DC-0005. The mockup remains illustrative; no site code, OpenSpec proposal, merge, or deployment changed.

## DC-0007 — Accept the open light aircraft concept as the current landing reference

- **Date:** 2026-10-29 (America/Chicago).
- **Artifact reviewed:** Owner reattached the original light editorial aircraft concept after the boxed-scene iterations.
- **Owner decision:** “Actually on second thought, this is fine.” Use that shown concept as the current landing visual reference: open light composition, large left typography, unboxed regular-class aircraft over subtle contours, and Resume visible in the top navigation and beside Open Portfolio as pictured.
- **Council reconciliation:** This supersedes the frame and Resume-removal directions in DC-0005 and DC-0006. The earlier single-composition and light-mode goals still stand. Treat generated scene geometry and exact copy as visual guidance to verify against the real model and owner content during proposal/implementation.
- **Status:** Current approved visual reference for continued exploration. No website code, OpenSpec proposal, merge, or deployment changed.

## DC-0008 — Airborne aircraft over fading mountain contours

- **Date:** 2026-10-29 (America/Chicago).
- **Artifact reviewed:** Owner's accepted open light landing concept from DC-0007.
- **Owner revision:** Make the regular-class plane clearly airborne, not resting on the terrain. The contours should depict mountains, with lines fading as they approach the text column and the top, side, and bottom boundaries.
- **Council synthesis:** Preserve the accepted editorial composition, navigation, and actions. Use a clear visual gap beneath the landing gear and layered mountain ridges with atmospheric lightness. Keep the aircraft more contrasted than the terrain. Fade the contour field before it harms text legibility or creates hard edge cutoffs.
- **Risks and smallest checks:** Judge whether the real 3D scene reads as flight at desktop and phone sizes; check that contour opacity falls near text and every outer edge; verify reduced motion holds the same composed airborne frame.
- **Status:** Owner scene direction for a future proposal/implementation. Generated imagery is a visual reference only; no website code, OpenSpec proposal, merge, or deployment changed.

## DC-0009 — Paper-colored aircraft with dark sketch lines

- **Date:** 2026-10-30 (America/Chicago).
- **Artifact reviewed:** The real 1586 × 992 WebGL landing render on the Cook Line branch for `light-airborne-landing`, compared with the accepted DC-0008 concept.
- **Owner revision:** Give the plane a color similar to the warm background and dark outlines so it reads like a moving sketch.
- **Creative Director:** Let the linework, rather than shaded surfaces, make the truss the focal subject. Keep contours lighter so the two technical drawings remain distinct. Risk: a dense small-scale truss can turn into a dark mass on a phone. Smallest check: compare desktop and phone captures in the normal scene.
- **Experience Architect:** Keep the copy and Open Portfolio action visually ahead of the sketch on narrow screens. Risk: outline density could compete with the headline. Smallest check: verify the 390 × 844 reading order and CTA contrast.
- **Motion & Interaction Director:** Retain the restrained existing glide and interactive rotation; the drawing effect should survive movement and freeze cleanly for reduced motion. Smallest check: compare moving and reduced-motion frames.
- **Game Feel & Sonic Designer:** The sketch needs no added sound or flourish. Smallest check: observe the silent scene during a brief landing visit.
- **Design Systems Engineer:** Use an opaque paper-colored unlit mesh fill for hidden-line occlusion, with the existing geometry-derived silhouette and crease shader in dark ink. Risk: transparent or lit fills would show terrain through the aircraft or reintroduce gray shading. Smallest check: inspect a real WebGL screenshot and run scene and fallback checks.
- **Cross-review and adopted result:** The paper fill and dark outlines preserve the actual GLB and its scene lifecycle. The aircraft remains more legible than the mountain contours; the owner-approved composition and behavior stay intact. This supersedes the graphite-fill direction in DC-0003 and DC-0008.
- **Status:** Owner-authorized visual revision implemented in the `light-airborne-landing` draft change. Merge and release remain separate gates.
