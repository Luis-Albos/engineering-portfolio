# Site Theme Spec Delta

## MODIFIED Requirements

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
