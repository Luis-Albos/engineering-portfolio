# Spec Delta

## MODIFIED Requirements

### Requirement: Portfolio navigation and scene lifecycle continue to work
The landing SHALL preserve the existing hash and history behavior for entering the 31-page viewer and returning home. Entering the viewer SHALL dismiss and pause an already prepared landing scene without continuing its animation or interaction; returning Home within the same page session SHALL resume that scene without fetching, parsing, or compiling the aircraft again. The scene SHALL release its renderer and resources when the page is left, when the WebGL context is lost, or when reuse is no longer possible; the usable landing fallback SHALL remain available. Direct viewer/page deep links SHALL bypass the landing scene and its aircraft download. The site SHALL continue to run from the static `/engineering-portfolio/` base path.

#### Scenario: Open and return
- **WHEN** a visitor opens Portfolio after the aircraft is ready and then returns Home within the same page session
- **THEN** the viewer opens at the expected URL, the scene remains inactive while the viewer is shown, and Home restores the aircraft without another model request or preparation sequence

#### Scenario: Page exit or context loss
- **WHEN** the page is left or the WebGL context is lost
- **THEN** scene work stops and its resources are released, while later landing access can recover through a fresh scene or its unavailable fallback

#### Scenario: Direct page link
- **WHEN** a visitor opens a direct portfolio page hash
- **THEN** the viewer opens without fetching the aircraft model or initializing the landing renderer
