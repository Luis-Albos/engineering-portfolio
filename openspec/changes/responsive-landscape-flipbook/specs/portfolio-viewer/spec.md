# Portfolio Viewer Spec Delta

## Purpose

Present Luis Albos's existing landscape engineering portfolio through a lightweight, responsive sheet-flipping viewer that preserves document content, direct navigation, readability, and visitor control.

## ADDED Requirements

### Requirement: Landscape sheets match the accepted thin portfolio presentation

The viewer SHALL use the accepted `references/thin-landscape-viewer-concept.png` in this change as its presentation target: warm-white surround, graphite controls, nearly flat resting sheets, fine visible boundaries, restrained shadows, and a subtle seam in two-page viewing. Every sheet SHALL retain the full source landscape aspect ratio and original artwork colors without cropping or splitting it into portrait halves. The viewer SHALL avoid visible bound-book thickness, stacked page edges, a hard-cover effect, a bulky spine, and a deep gutter. The permanent viewer sidebar SHALL be replaced by compact, accessible Chapters/tools surfaces, with the sheet stage and mode controls dominant. Generated reference artwork, browser chrome, and sample URLs SHALL NOT replace actual portfolio content or site destinations.

#### Scenario: Desktop visual review
- **WHEN** a visitor views a technical spread at 1920 x 1080
- **THEN** two complete landscape sheets use the accepted light, thin presentation with compact surrounding controls and no permanent chapter sidebar or heavy physical-book effect

#### Scenario: White and dark artwork
- **WHEN** the visitor opens the white cover, a photograph, and an existing dark chapter page
- **THEN** each original image remains fully contained, correctly colored, and distinguishable from the light surround

### Requirement: Automatic and manual viewing modes preserve the selected page

The viewer SHALL expose Auto, Single, and Double controls with an understandable selected state and an indication of the effective layout. Auto SHALL be the initial mode and SHALL choose two-page viewing only when the usable viewer width and height permit the documented minimum useful sheet size; otherwise it SHALL show one page. Single and Double SHALL override Auto at any screen size, and resize SHALL retain the explicit choice until Auto is selected. Manual mode selection SHALL remain active during Home/Portfolio returns in the current document session; a reload SHALL start in Auto. A mode or size change SHALL preserve the selected document page, settle an in-progress turn, and avoid creating a page-history entry. Controls SHALL remain reachable and the document layout SHALL fit without horizontal page overflow, including forced Double on a small screen.

#### Scenario: Auto adapts to available space
- **WHEN** a visitor views an interior page in Auto at 1920 x 1080 and then resizes to 390 x 844
- **THEN** the viewer changes from two complete landscape pages to one complete landscape page containing the same selected page, with usable controls

#### Scenario: Manual choice overrides automatic layout
- **WHEN** a visitor selects Single in a wide window or Double in a narrow window, then resizes it
- **THEN** the chosen mode remains active, its sheets fit the available stage, and returning to Auto restores size-based selection

#### Scenario: Right-hand sheet stays selected
- **WHEN** page 5 is selected in the 4-5 spread and the visitor switches to Single, returns to Double, or resizes across the Auto boundary
- **THEN** page 5 remains selected and visible, with no new history entry caused by the layout change

### Requirement: Page identity and navigation remain predictable

The viewer SHALL preserve the existing 31 pages, one-based page hashes, page-jump input, chapters, chapter/page search, thumbnails, browser back/forward, and Home/Portfolio destinations. Double SHALL use a centered single cover at page 1 followed by stable spreads 2-3 through 30-31, without synthetic page content. Single previous/next SHALL step by one page; Double previous/next SHALL open the adjacent cover/spread. A direct jump SHALL select the exact requested page and show its containing spread in Double. The visible range SHALL be distinguishable from the selected page. Actual user page navigation SHALL retain meaningful history, while layout/detail/fullscreen changes SHALL NOT add page-history entries. Navigation SHALL stop at real document boundaries and never request page 0 or 32.

#### Scenario: Cover and final spread
- **WHEN** the visitor browses from the cover in Double and later opens the final spread
- **THEN** page 1 appears alone, the next spread contains 2-3, and the final spread contains 30-31 with further forward navigation disabled

#### Scenario: Saved links and browser history
- **WHEN** a visitor opens `#page=5` or `#page=23`, selects a chapter or thumbnail, and uses browser back and forward
- **THEN** the requested real page stays selected and visible in the current mode and the recorded destinations are restored without duplicate renderer-generated history entries

### Requirement: Turns follow user input and remain interruptible

With ordinary motion enabled, the viewer SHALL provide restrained forward/backward sheet turns through visible navigation controls, keyboard arrows outside editable/modal controls, and pointer/touch page-turn gestures. The sheet SHALL return to a flat, readable resting state after completing or cancelling a gesture. A vertical phone scroll or a detail-view gesture SHALL NOT inadvertently turn a page. Rapid navigation, a direction change, or a direct jump SHALL converge on the latest requested destination without a long queue of obsolete turns, a permanently stuck fold, or an empty transition frame. Direct jumps SHALL NOT require watching every intervening page turn.

#### Scenario: Drag completes or cancels
- **WHEN** the visitor drags a sheet edge and either completes the turn or releases it early enough to cancel
- **THEN** the viewer settles at the corresponding valid destination or original page with the sheet flat and navigation available

#### Scenario: Rapid reverse navigation
- **WHEN** the visitor repeatedly advances, reverses direction, and jumps to a distant page while images or a turn remain pending
- **THEN** the latest requested destination wins and late callbacks do not restore an obsolete page or URL

#### Scenario: Phone scrolling
- **WHEN** the visitor scrolls vertically over the fitted sheet or interacts with enlarged content
- **THEN** scrolling/detail interaction works without accidental page navigation

### Requirement: Reading tools and accessibility remain available

The viewer SHALL provide accessible Chapters, search, thumbnails, page entry, previous/next, mode, detail/zoom, and fullscreen controls. The detail control SHALL allow the selected sheet's small technical content to be enlarged and inspected, then closed with the page/mode retained. Fullscreen rejection or unavailability SHALL leave the normal viewer usable. Tools SHALL be keyboard reachable, expose selected/disabled states, retain visible focus, and restore focus when a transient tool closes. The original sheet SHALL have an appropriate page/chapter alternative description, and renderer duplicates SHALL NOT create duplicate focus targets or repeated announcements. Essential phone control hit areas SHALL be at least 44 CSS pixels in each dimension. Existing site-theme contrast requirements SHALL continue to apply.

When reduced motion is requested, the viewer SHALL settle any active turn and use immediate page changes without folding, corner previews, or autoplay. Changing the motion preference while the viewer is open SHALL apply this behavior without losing the selected page.

#### Scenario: Inspect and return from a detail view
- **WHEN** a visitor opens the selected technical page's detail control, enlarges/scrolls its content, and closes using Escape or Close
- **THEN** the same selected page and mode are restored and focus returns to the invoking control

#### Scenario: Keyboard and reduced motion
- **WHEN** a keyboard visitor enables reduced motion and uses mode controls, page navigation, and Chapters/search
- **THEN** the controls remain usable with visible focus, page changes are immediate, and one concise page state is announced without cloned-control duplication

#### Scenario: Fullscreen is unavailable
- **WHEN** the browser declines or does not support the fullscreen request
- **THEN** the fitted viewer and its reading/navigation controls remain usable

### Requirement: Loading and failures preserve a usable reading surface

The viewer SHALL prioritize the requested visible sheet/spread, deduplicate pending requests, and load a bounded nearby set instead of eagerly decoding all 31 full-resolution sheets. Distant decoded sheets/render resources SHALL be released so retained work does not grow with every page visited. Existing versioned background asset caching SHALL remain available and SHALL yield to the whole foreground request, including both sheets of a requested spread. Storage failure SHALL NOT prevent normal network viewing.

During a slow load the viewer SHALL retain readable content and communicate the pending destination. A failed sheet SHALL be identified with usable retry and navigation controls; retained old content SHALL NOT be represented as the successfully loaded requested page. Stale requests SHALL NOT overwrite a later destination. If the turn renderer cannot initialize or fails, the viewer SHALL offer usable nonanimated landscape presentation with the same page navigation and mode controls.

#### Scenario: A spread loads slowly or fails partly
- **WHEN** one needed sheet loads and the other is delayed or fails
- **THEN** foreground priority remains active until the request settles or is superseded, readable content remains available, and the failed requested sheet can be retried without mislabeling retained content

#### Scenario: Long browse and unavailable storage
- **WHEN** the visitor browses through all 31 pages while persistent storage is unavailable
- **THEN** normal network viewing continues and only a bounded nearby decoded/rendered working set remains retained

#### Scenario: Turn renderer unavailable
- **WHEN** page-turn initialization or rendering fails
- **THEN** the visitor can continue reading and navigating fitted landscape sheets without animated turns rather than encounter a blank or locked viewer

### Requirement: Viewer lifecycle preserves the rest of the static site

The viewer SHALL stop unnecessary drawing while resting or hidden and SHALL stop input/render work when leaving Portfolio. Re-entry SHALL NOT accumulate renderer instances or input handlers. Home/Portfolio navigation SHALL preserve the landing's paused/reusable aircraft scene and loader contract; direct viewer/page links SHALL continue to bypass aircraft initialization. Resume, Resources, Study Archive access and original PDF contents SHALL remain usable and unchanged. All runtime assets SHALL use the existing static subpath and build-version mechanism. Node dependencies/development tooling SHALL NOT be included in the published Pages artifact.

#### Scenario: Enter Portfolio and return Home
- **WHEN** a visitor enters Portfolio after the aircraft is ready, browses, and returns Home
- **THEN** viewer work stops, the same aircraft scene resumes without another model transfer, and re-entering Portfolio creates no duplicate viewer/input activity

#### Scenario: Rest, hidden tab, and direct entry
- **WHEN** the viewer is at rest, the tab is hidden, or a fresh visit opens directly at a page hash
- **THEN** unnecessary viewer drawing is stopped and direct entry neither shows the landing loader nor starts the aircraft scene

#### Scenario: Static artifact update
- **WHEN** the implemented viewer is built and later deployed under `/engineering-portfolio/` through the authorized release workflow
- **THEN** relative assets and a synchronized build marker deliver the current viewer to returning visitors, the prepared artifact excludes Node tooling, and Resume/Resources continue to work
