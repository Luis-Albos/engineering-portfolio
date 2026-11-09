# Proposal

## Why

The existing one-image crossfade does not provide the landscape page-flipping experience the owner wants. The accepted concept presents the work as a light architectural portfolio: thin sheets, restrained turns, automatic facing pages when space permits, and single-page viewing on smaller screens.

## What Changes

- Replace the Portfolio viewer's crossfade with interactive, reversible page turns using the existing 31 landscape WebP pages without altering their content or proportions.
- Match the accepted [thin-sheet concept](references/thin-landscape-viewer-concept.png): nearly flat sheets, fine edges, minimal shadows, a subtle center seam, and compact controls around a wider stage. Replace the permanent viewer sidebar with accessible Chapters/tools surfaces; keep the shared site header and landing composition.
- Provide Auto, Single, and Double viewing modes. Auto considers available width and height; manual selection overrides Auto. Preserve the selected page when resizing or switching modes.
- Retain chapters, search, thumbnails, direct page entry, one-based page URLs, browser history, fullscreen, keyboard navigation, and touch access. Provide the concept's zoom/detail control so small technical content can be inspected.
- Keep loading selective, memory bounded, and requested pages ahead of background caching. Preserve usable navigation during slow/failed loads and provide immediate page changes under reduced motion or a renderer failure.

## Capabilities

### New Capabilities

- `portfolio-viewer`: Landscape sheet presentation, responsive/manual viewing modes, page turns, page identity and navigation, detail viewing, loading, accessibility, and renderer lifecycle.

### Modified Capabilities

- `site-theme`: Clarify that the new Portfolio viewer may adopt its approved geometry while shared theme, route compatibility, and geometry elsewhere remain preserved. The current blanket geometry wording must not accidentally prohibit this authorized viewer redesign.

## Impact

- Expected implementation surfaces: `index.html`, `script.js`, viewer rules in `styles.css`/`css/landing.css`, a small renderer adapter, relevant browser checks, `README.md`, and the existing build/cache version mechanism. Landing lifecycle hooks may need narrow integration updates; aircraft behavior remains unchanged.
- Evaluate a pinned, self-hosted StPageFlip adapter in Cook's first working slice. Engine selection remains a delegated technical choice after the specific mode/loading/performance proof in `design.md`; no dependency is installed during Prep.
- Preserve plain static hosting under `/engineering-portfolio/`, original images/PDFs, Resume, Study Archive access, loader, and aircraft scene. No backend, hosted flipbook service, new portfolio PDF, sound, or content redesign.
- Previous documented released version: **1.2.1**, evidenced by `VERSION`, `RELEASE_NOTES.md`, and release commit `51de8e5ef168a6cba78429e241914dfd038a747f`; the version helper agrees. No local release tags exist. A fresh public `VERSION` fetch was unavailable during Prep, so no new live-version observation is claimed.
- Provisional impact: **minor**, adding compatible viewer functionality while preserving saved links and routes. No version bump during Prep.

## Scope and Authority

The owner accepted the second concept and explicitly confirmed brainstorming finished and proposal preparation on 2026-11-09. The named authorized batch is **responsive-landscape-flipbook — Prep planning artifacts and bundled reference only**. Implementation, draft PR, merge, and publication require their subsequent workflow authority. See [receipt.md](receipt.md) for the current handoff state and [design.md](design.md) for decisions, proposed conventions, and the smallest acceptance journey.


## Cook Authorization

The owner's subsequent `$alephon-cook-line` invocation on 2026-11-09 authorizes implementation, verification, scoped commits, push, and a draft PR for this named change. This is the active Cook batch; it does not authorize merge or publication. See `verification.md` and the Cook delivery card for actual evidence and current review state.
