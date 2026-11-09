# Design

## Context

See [proposal.md](proposal.md) for motivation and approved planning scope.

`styles.css` defaults to `color-scheme: dark` and dark root tokens, with additional hardcoded colors throughout the shared shell, viewer, dialogs, and Resume. `css/landing.css` overrides the palette only for landing/opening states; its light header rules apply to the homepage shell. Resume does not load that stylesheet. `resources/resources.css` defines another dark palette and hardcoded access, library, and PDF-frame colors. The three secondary HTML entries still declare `theme-color: #111315`; the homepage declares `#fefdfa`.

The main specs cover landing composition and loading behavior, but not a shared theme across routes. The new `site-theme` capability fills that gap without rewriting those existing contracts. Design is needed because the cascade crosses three stylesheets and four HTML entry points.

## Goals / Non-Goals

**Goals:** Establish one semantic palette in the existing CSS cascade, preserve the homepage's appearance, cover first paint and interaction states, and retain document contrast against a light surround.

**Non-Goals:** See the proposal's exclusions. Keep existing selector/layout responsibilities and the self-contained first-paint loader; avoid coupling theme initialization to JavaScript or introducing a separate rendering system.

## Decisions

### 1. Make the shared stylesheet authoritative

Define the light defaults and semantic roles in `styles.css`: canvas, supporting/raised surface, main and muted ink, subtle/strong rule, primary action and its label, focus, and overlay scrim. Reuse existing token names when their semantics fit. Anchor the canvas to `#fefdfa`, main ink to the homepage's `#1c1e21`/`#111316` family, and primary actions to its graphite treatment. Tune supporting neutrals against the specification's contrast targets.

Replace conflicting hardcoded colors in shared controls and the archive with these roles. Remove or alias redundant landing theme overrides without moving its layout rules. Keep scene-specific contour tokens separate so a UI rule change does not alter terrain linework. Preserve the loader's matching literal fallback in its self-contained critical CSS; if boot sources change, regenerate embedded assets through `scripts/sync-boot.cjs`.

**Alternatives considered:** Duplicating the palette per page invites the current drift. Appending a large override layer leaves conflicting dark defaults and misses states. A theme library or framework adds no value for this static CSS change. No new dependency is proposed.

### 2. Retheme surfaces and states together

Apply the same palette roles to the main and archive headers, viewer stages, sidebars, footers, image frames, Resume, search dialog and results, thumbnails, page inputs, mobile menus, archive inputs and filters, cards and selected-document panels, access-request states, and loading/empty/error/PDF fallback content. Preserve dimensions, type hierarchy, DOM order, transition timing, and input semantics. Keep the archive's progress/granted feedback understandable with existing labels, marks, and borders in the neutral palette.

Decorative rules can stay quiet; essential control and focus indicators must meet the stronger contrast target. Use a dark translucent scrim where needed for modal separation without turning the modal or drawer itself into a dark panel.

**Alternative considered:** Changing only root variables would leave many hardcoded dark backgrounds and light labels, including archive and mobile states.

### 3. Treat documents as immutable content

Use a subtle neutral surround, border, and restrained shadow to distinguish white artwork from the warm-white canvas. Review the cover alongside page 23's dark artwork. Keep every WebP/PDF unmodified and unfiltered. The existing embedded PDF objects and direct-open fallbacks remain; browser-provided PDF toolbars can retain their own appearance.

**Alternative considered:** Inverting/filtering documents damages drawings and photographs. Replacing the PDF renderer merely to recolor browser chrome expands the feature and its maintenance burden.

### 4. Set the theme before interaction and use existing cache versioning

Declare a light color scheme in the root CSS and early HTML metadata for `index.html`, `resume.html`, `resources/index.html`, and `resources/viewer.html`. Align each `theme-color` with `#fefdfa`. Do not add a preference script or persist theme state. Follow `STARTUP.md` to advance and synchronize the build marker and asset queries when implementing changed runtime assets; keep `VERSION` unchanged during planning and defer a release version bump to release authority.

**Alternative considered:** Applying light mode after JavaScript starts risks a dark first paint on direct links and unnecessary dependence on stored preferences.

## Focused Design and Engineering Review

This is a small review through relevant responsibilities, not a newly convened council or a set of independent agent approvals.

- **Design:** Adopt the existing homepage palette rather than inventing another aesthetic. The historical DC-0002 warning about losing white page edges still applies; DC-0007 through DC-0010 establish the light landing and loader reference. Earlier flipbook exploration remains separate.
- **Engineering Lead:** Keep one change, shared colors, and the named planning-only authority. No unresolved product choice blocks proposal completion.
- **Verification:** Prove consistency through actual route changes, direct entry, focus, mobile menus, and both white/dark artwork; source color replacement alone is insufficient.
- **Integration:** Preserve the current branch and pre-existing `.playwright-mcp/` files. Cook should inventory target-branch state before preparing a draft PR and include only this change.
- **Release and runtime:** Preserve static subpath URLs and use the existing build-version mechanism so returning visitors receive the new CSS. Publication remains an owner decision.
- **Productivity:** Reuse supported browser scripts and targeted screenshots; no new theme framework or broad test harness.

The owner accepted this direction for proposal capture after brainstorming. Technical details above are recommendations for the future authorized implementation; no new council ledger entry or implementation approval is implied.

## Risks / Trade-offs

- **White page edges disappear** → Compare the cover and dark chapter on the actual light surround; retain a subtle document boundary.
- **Pale labels or hidden states survive the cascade** → Audit explicit color/background rules in all three stylesheets and inspect hover, focus, selection, disabled, modal, mobile, access, and fallback states.
- **Changing shared tokens alters the landing or loader** → Keep scene-specific colors and the critical loader fallback stable; verify Home → Portfolio → Home and embedded boot consistency.
- **A returning visitor sees stale dark CSS** → Synchronize the existing build markers and exercise the existing update path.
- **Embedded PDF chrome differs by browser** → Scope visual acceptance to site-owned surrounds and verify usable direct-open links.

## Acceptance and Verification Plan

Use the existing local server and production `/engineering-portfolio/` base path. At 1440 × 1000 and 390 × 844, follow Home → Portfolio → Resume → Resources → Request Access → select a study document → Open PDF → return to the site. On Portfolio, inspect the cover and page 23, search, thumbnails, active chapters, focus, and phone menu. On Resources, inspect the access sequence, filters, card selection, no-results state, and a readable PDF fallback. Check both a normal visit and reduced motion with a dark system color preference; directly load a portfolio hash and each secondary entry point. Confirm original documents, navigation, and page geometry remain intact and capture representative screenshots.

Run `node scripts/sync-boot.cjs --check`, `node scripts/test-cache-version.cjs`, `node scripts/test-experience.cjs`, and `node scripts/test-portfolio.cjs` once the implementation is stable. Use a focused pre-change baseline of the affected existing viewer/route suite when practical. Inspect contrast for representative ordinary/large text, focus, and selected controls against the spec targets. Check a returning cache/update visit through the existing version mechanism. Extend an existing check only if a distinct uncovered failure warrants it; do not add a generic test program.

At release, retain the Pages workflow's embedded-boot check, compressed-model integrity check, Study Archive generation, and static artifact build. Broader scene/GPU suites are warranted only if implementation changes their inputs or invalidates prior evidence. Record actual commands, checked revision, screenshots, and durations in the Cook receipt; no runtime pass is claimed here.

## Migration Plan

No content, data, or session migration. After implementation is separately authorized, deliver a reviewable static-site change and draft PR. After integration and publication are authorized, release with synchronized build markers through the existing Pages workflow. Rollback restores the prior runtime files with a fresh build marker so cached clients can obtain them; never rewrite a release tag.

## Prep Handoff State

| Field | State |
| --- | --- |
| Project | `engineering-portfolio`, `C:/Users/Letzel/Desktop/Engineering/engineering-portfolio` |
| Change / authorized batch | `unify-site-light-theme` — Prep artifacts only |
| Decision owner | Letzel |
| Checkout / checked source | Existing checkout; branch `codex/functional-light-loader-release`; HEAD `715d303113b80a034051d67e13b724cbdcc32453` |
| Preserved work | Pre-existing untracked `.playwright-mcp/`; no application edits during Prep |
| PR / target head | No PR for this change; current remote target head not established during Prep |
| Desktop-control boundary | Source/CLI inspection and attempted isolated headless preview; no control of an existing user browser or native desktop app |
| Expected artifact | Four planning artifacts plus CLI metadata now; later, a verified static site and Cook draft PR after authorization |
| Release baseline / impact | Documented released 1.2.0; provisional patch; no version bump |
| Planning validation | `openspec validate unify-site-light-theme --strict` passed on 2026-11-09; all four planning artifacts complete; files remain uncommitted |
| Evidence limits | Live preview failed DNS resolution; local headless Chrome denied loopback network access. No visual/runtime acceptance was completed; these are environment limitations, not a reported application defect. |
| Focused / integrated / native durations | Runtime suites not run / integrated build not run / native package inapplicable |
| Remaining owner gates | Authorization to Cook, final visual acceptance, integration, and publication under their respective workflow boundaries |
| Next action | Review the proposal; a subsequent Cook request can authorize implementation of this named change |
