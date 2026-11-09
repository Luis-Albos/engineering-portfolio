# Release notes

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
