# Site Theme Specification

## Purpose

Present the portfolio as one coherent light website across its landing, portfolio viewer, Resume, and Study Archive, while keeping the original documents readable and unchanged.

## Requirements

### Requirement: All site-owned pages use the landing's light palette

The site SHALL use the homepage's warm white (`#fefdfa`) canvas, graphite text, and fine neutral gray rules across the landing, portfolio viewer, Resume, Study Archive access screen and library, and study document page. Supporting panels and document surrounds SHALL use coordinated light neutral surfaces. Headers, sidebars, footers, and site-owned viewer frames SHALL follow this palette. Dark primary actions with light labels SHALL remain consistent with the homepage's primary action.

#### Scenario: Navigation across the website
- **WHEN** a visitor follows Home, Portfolio, Resume, Resources, and a selected study document at desktop or phone size
- **THEN** each page presents the same light visual identity without reverting its site-owned shell to the former dark theme

### Requirement: Direct entry and initial rendering use light mode

Every page SHALL declare a light color scheme and matching warm-white browser theme color. Direct page entry, portfolio deep links, reloads, and the landing-to-viewer transition SHALL retain a light site background. The theme SHALL remain light when the visitor's operating system requests dark mode and SHALL not depend on an interaction or saved theme preference.

#### Scenario: Direct visit with a dark system preference
- **WHEN** a visitor with a dark system preference opens Resume, the Study Archive, an accessible study document link, or a portfolio page deep link
- **THEN** the site-owned initial background and subsequent content use the light theme, including native form controls that support the declared color scheme

#### Scenario: Entering and leaving the portfolio viewer
- **WHEN** a visitor opens Portfolio from the landing and returns Home
- **THEN** the site-owned surfaces remain light throughout the existing transition

### Requirement: Interactive and status states remain readable

Search dialogs and results, thumbnails, chapter navigation, page controls, mobile drawers, archive filters and selection, access-request states, and loading, empty, error, and document-fallback messages SHALL use the shared light palette. Text SHALL have at least 4.5:1 contrast for ordinary text or 3:1 for large text. Keyboard focus indicators and essential graphical control/state indicators SHALL have at least 3:1 contrast against adjacent surfaces. Active, selected, disabled, granted, and error states SHALL remain distinguishable through text, shape, borders, icons, or existing interaction semantics as appropriate, rather than color alone.

#### Scenario: Portfolio tools and mobile navigation
- **WHEN** a visitor uses search, thumbnails, chapter and page controls, or opens the phone navigation drawer
- **THEN** text, controls, keyboard focus, and active states remain readable on coordinated light surfaces

#### Scenario: Archive access and library states
- **WHEN** a visitor requests access, filters the library, selects a document, encounters no search results, or encounters a loading or error state
- **THEN** the state remains understandable and readable within the shared light palette

### Requirement: Original document colors and visible boundaries are preserved

The theme SHALL preserve the colors of portfolio page images, thumbnails, and PDF contents. White pages SHALL remain visually distinguishable from their surrounds through a subtle frame, surface separation, or shadow. Site-owned document headings, actions, placeholders, and fallback messages SHALL use the light theme. Browser-owned PDF interfaces are outside this requirement.

#### Scenario: White and dark portfolio artwork
- **WHEN** a visitor views the white cover and an existing dark portfolio chapter page
- **THEN** each image retains its original colors and remains visually distinct from the light viewer surround

#### Scenario: Embedded PDF or fallback
- **WHEN** a Resume or study PDF displays, or the browser instead displays its site-provided fallback
- **THEN** the site-owned surrounding controls and fallback content remain light and readable, with the original document and direct-open link preserved

### Requirement: Theme consistency preserves existing visitor journeys

The theme SHALL preserve existing routes, one-based page hashes, browser history, keyboard and touch navigation, reduced-motion behavior, Study Archive session access, and responsive geometry outside the Portfolio viewer. Within Portfolio, the theme SHALL support the geometry and controls defined by `portfolio-viewer`, including fitted single landscape sheets, facing landscape spreads, and compact tools, while retaining the shared light palette and readable original artwork. It SHALL preserve the landing loader and scene lifecycle, relative asset paths, and static hosting under `/engineering-portfolio/`. A deployed theme or viewer update SHALL participate in the site's existing asset-version mechanism so a returning visitor can obtain the current presentation.

#### Scenario: Existing deep link and responsive controls
- **WHEN** a visitor opens a saved portfolio page link, navigates pages, opens Resume and Resources, and uses their phone controls
- **THEN** the existing destinations and interactions continue to work with the shared light colors, the Portfolio viewer uses its specified responsive layout without horizontal overflow, and unrelated route geometry remains unchanged

#### Scenario: Returning after a theme deployment
- **WHEN** a visitor returns with assets cached from an earlier deployment
- **THEN** the existing version-update mechanism makes the current theme and viewer available without requiring a manual cache reset

#### Scenario: Responsive sheet presentation
- **WHEN** the visitor changes Auto, Single, or Double or resizes the Portfolio viewer
- **THEN** the fitted sheets and compact tools follow `portfolio-viewer` while site-owned surfaces remain light, original artwork retains its colors, and the landing and other route layouts are preserved
