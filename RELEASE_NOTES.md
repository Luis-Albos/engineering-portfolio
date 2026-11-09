# Release notes

## 1.3.0 — 2026-11-09

- Added thin, landscape page turns with Auto, Single, and Double viewing modes; resizing and mode changes preserve the selected page.
- Replaced the permanent viewer rail with compact Chapters/search/thumbnails, and added detail zoom while retaining fullscreen, saved page links, history, keyboard and touch navigation.
- Kept page loading and decoded image memory bounded, with foreground priority, retry, static fallback, reduced motion, and reusable landing aircraft behavior.
- Removed the white gap at turn completion by drawing rebuilt sheets before the browser paints; verified with captured compositor frames.
- Self-hosted the pinned MIT page-turn runtime and staged only public static files for Pages, validating referenced assets and excluding development dependencies.

Original portfolio artwork, PDFs, Resume, and Study Archive access are preserved. This is a compatible feature release with no data migration. The [archived OpenSpec change](openspec/changes/archive/2026-11-09-responsive-landscape-flipbook/proposal.md) preserves the approved design and verification evidence.

## 1.2.1 — 2026-11-09

- Unified Portfolio, Resume, and Study Archive with the homepage's warm-white canvas, graphite text, and fine neutral rules.
- Applied the shared palette to controls, search, thumbnails, mobile menus, archive access and selection states, and site-owned PDF frames and fallbacks.
- Declared light mode on every entry point and updated versioned assets so returning visitors receive the current theme.

Original portfolio artwork and PDF contents retain their colors. Existing layouts, navigation, page links, loader, aircraft scene, and archive session access are preserved. Browser-provided PDF toolbars follow the browser's own appearance. No dependency or data migration is required.

## 1.2.0 — 2026-11-09

- Replaced the cinematic intro with a light, accessible loading ring that reveals the landing when the aircraft renders, fails, or reaches the 15-second ceiling.
- Kept the aircraft scene alive while the portfolio viewer is open, so returning Home resumes the same model and canvas.
- Added a smaller gzip aircraft transfer and versioned browser caching for the aircraft, portfolio pages, thumbnails, Resume, and Study Archive resources. Background downloads yield to foreground viewing.

The original intro is preserved in [alephon-load-animation](https://github.com/Luis-Albos/alephon-load-animation). The site remains static under `/engineering-portfolio/`; browser cache storage is best effort and requires no migration.

## 1.1.0 — 2026-10-30

- Replaced the dark, divided landing with the approved light editorial composition.
- Raised the interactive SAE Aero aircraft over fading mountain contours and rendered it as a paper-colored moving sketch with dark technical outlines.
- Preserved the existing 31-page viewer, Resume and Resources routes, deep links, reduced-motion behavior, and WebGL fallback.

The site remains static under `/engineering-portfolio/`. No data migration or new runtime dependency is required. The viewer's light-mode and flipbook redesign remain separate future work.

The source change is recorded in [the archived OpenSpec proposal](openspec/changes/archive/2026-10-30-light-airborne-landing/proposal.md).
