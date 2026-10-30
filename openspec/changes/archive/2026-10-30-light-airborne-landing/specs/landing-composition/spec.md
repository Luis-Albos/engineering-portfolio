# Spec Delta

## Purpose

Present Luis Albos's engineering portfolio through the approved light editorial landing, using an airborne aircraft and fading mountain contours to lead visitors into the existing portfolio.

## ADDED Requirements

### Requirement: The landing matches the approved editorial composition
The landing SHALL use the DC-0008 reference at `../../references/dc-0008-concept.png` as its desktop visual target. At the reference viewport of 1586 × 992 CSS pixels, it SHALL present a warm ivory open canvas, the slim ruled header and pictured navigation, a left-aligned engineering-portfolio kicker, the two-line “Aerospace Systems & Mechatronics” headline, the pictured short description, an Open Portfolio action with a secondary Resume link, and the unboxed aircraft scene in the center-right. The major text and aircraft regions SHALL retain the reference's position, scale, hierarchy, and contrast, allowing for browser font rendering and the actual aircraft model's geometry. It SHALL have no landing sidebar, scene frame, featured-project copy, registration annotations, or Selected Work section.

#### Scenario: Reference-size visual review
- **WHEN** a visitor opens the landing at 1586 × 992 CSS pixels
- **THEN** the name and navigation occupy the top ruled strip, the editorial copy and actions occupy the left portion, and the aircraft occupies the center-right at the same approximate anchors as the reference, with no extra boxed or textual content competing with them

### Requirement: The aircraft reads as flying over mountains
The landing SHALL render the existing SAE Aero Regular Class aircraft with its landing gear visibly separated from the nearest terrain across its idle motion. The aircraft SHALL have a paper-colored opaque fill and dark technical outlines so it reads as a moving sketch. The contour field SHALL read as layered mountain ridges, remain lighter than the aircraft outlines, and fade smoothly before the text column and toward the top, bottom, left, and right viewport boundaries. The aircraft SHALL remain crisp while the contours fade.

#### Scenario: Airborne default scene
- **WHEN** the 3D scene is available and the visitor observes the landing through an idle cycle
- **THEN** no wheel appears to touch a mountain ridge, the aircraft remains the dominant outlined technical subject, and mountain contours do not obstruct the copy or terminate abruptly at a viewport edge

#### Scenario: Reduced-motion scene
- **WHEN** the visitor requests reduced motion
- **THEN** the landing holds a static composition with the same visible flight gap and contour fade, without terrain travel or aircraft drift

### Requirement: The landing remains usable across devices and scene availability
The landing SHALL retain readable content, a usable Open Portfolio action, and access to Resume and Resources on desktop and narrow screens. It SHALL preserve the interactive aircraft's existing pointer and keyboard affordances when available. Scene loading, unavailable WebGL, failed model loading, or context loss SHALL leave the text and navigation usable and communicate the scene state without replacing the page with a generated concept image.

#### Scenario: Narrow viewport
- **WHEN** a visitor opens the landing at a 390 × 844 viewport
- **THEN** the headline and copy remain readable, Open Portfolio is reachable in the landing's reading order, the aircraft scene reflows without horizontal overflow, and no content is forced into illegibly small type to keep a fixed desktop height

#### Scenario: Scene unavailable
- **WHEN** WebGL or the aircraft model cannot load
- **THEN** the visitor can still read the introduction and use Open Portfolio, Resume, and Resources, and the scene region reports its unavailable state

### Requirement: Portfolio navigation and scene lifecycle continue to work
The landing SHALL preserve the existing hash and history behavior for entering the 31-page viewer and returning home. Entering the viewer SHALL dismiss and release the landing scene. Direct viewer/page deep links SHALL bypass the landing scene and its aircraft download. The site SHALL continue to run from the static `/engineering-portfolio/` base path.

#### Scenario: Open and return
- **WHEN** a visitor activates Open Portfolio and later returns to the landing
- **THEN** the existing viewer opens at the expected URL, the prior scene is disposed, and a usable landing scene or its fallback is restored on return

#### Scenario: Direct page link
- **WHEN** a visitor opens a direct portfolio page hash
- **THEN** the viewer opens without fetching the aircraft model or initializing the landing renderer
