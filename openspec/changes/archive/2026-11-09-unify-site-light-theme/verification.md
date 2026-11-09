# Cook Verification and Delivery

## Authority and Source

- Owner invocation of Alephon Cook Line on 2026-11-09 authorizes implementation, focused verification, reviewable commits, push, and a draft PR for `unify-site-light-theme`. Merge and publication remain separate gates.
- Canonical checkout: `C:/Users/Letzel/Desktop/Engineering/engineering-portfolio`.
- Feature branch: `codex/unify-site-light-theme`, based on current `origin/main` at `cc9c87dc6fbd3dc3b32ce4d19d9a365336e18b94`. Its starting tree matches Prep's `715d303113b80a034051d67e13b724cbdcc32453`.
- Preserve pre-existing untracked `.playwright-mcp/`; the proposal files are the approved existing work included in this change.
- Desktop boundary: source/CLI operations and isolated headless Chrome; no existing user browser or native app control.
- Documented prior release: 1.2.0. Provisional impact: patch; final decision belongs to Plating. No product version bump during Cook.

## Baseline

- `TEST_BROWSER=chrome node scripts/test-portfolio.cjs`: PASS, 11.1 seconds, starting release tree before application edits.
- The Prep network limitation was resolved by running the authorized local browser check outside the restricted browser sandbox. No application workaround was needed.

## Implementation Evidence

The runtime build is `20261109-02`; the product version remains 1.2.0. Shared semantic colors now cover Portfolio, Resume, archive access/library/document pages, dialogs, drawers, controls, focus, and status/fallback states. Light metadata is set on all four HTML entry points. The landing layout, original artwork/PDFs, scene, loader, and navigation behavior are preserved.

| Check | Result | Elapsed |
| --- | --- | --- |
| `node scripts/test-experience.cjs` then `TEST_BROWSER=chrome node scripts/test-portfolio.cjs` | PASS, complete stable runtime tree | 54.9 s combined |
| `node scripts/sync-boot.cjs --check`, `node scripts/test-cache-version.cjs`, `node scripts/check-model-gzip.cjs` | PASS, embedded boot/build update logic/model byte identity | 0.3 s combined |
| Isolated static artifact copy and existing `scripts/build_study_archive.py` | PASS, 10 classes and 21 resources; no Node dependencies in output | 4.0 s |
| Built-artifact visitor journey at 1440 × 1000 and 390 × 844, dark system preference and reduced motion | PASS, 21 captured states; navigation, access/request/grant, search/no results/filter/selection, mobile menus/native select, PDF display/fallback/error | 12.1 s |
| Real service-worker cached released dark CSS, stale-HTML navigation, then updated version | PASS, automatically obtained build 20261109-02 and its light CSS without manual cache clearing | 5.2 s |
| Four direct entries with delayed CSS and dark system preference; keyboard focus | PASS, 67–76 sampled frames per entry contained no dark site background; solid 2 px graphite focus outline | 3.2 s |

The acceptance journey opened the white cover and dark page 23, exercised search/thumbnails, followed Resume → Resources → a real study PDF, and inspected mobile menus and document fallbacks. Resume and selected study PDF fetched successfully; the study PDF also returned a valid byte-range response. Unsupported PDF embedding was forced in the isolated browser to observe the existing site-owned fallback. Browser-provided PDF chrome remains browser-controlled.

Rendered visible text samples across the captured states met their contrast thresholds; the lowest observed ratio was 5.36:1. Before/after landing header, introduction, stage, and primary-action bounding rectangles matched exactly. Screenshots were visually inspected for the landing, white/dark artwork, Resume, archive selection, phone menu, and PDF fallback. Runtime input files and original portfolio images/thumbnails/study PDFs were byte-compared between checkout and artifact; they match. No document or source generated-archive edits are included.

The checked-in generated Study Archive manifest predates the current document set and initially pointed at an absent old PDF. The standard generator resolved this in the isolated artifact, as the Pages workflow does. Source-generated files were left intact, avoiding unrelated generated-output changes in the PR.

## Artifact and Review Surface

- Verified runtime revision: `dc75c7a7f0641536a7bf2a91d9197d83404976a4`. Subsequent receipt/task edits change documentation only; the artifact's runtime inputs match that revision.
- **Open:** `http://127.0.0.1:49283/engineering-portfolio/` (retained local built-artifact server).
- Canonical source checkout is recorded above; built static output: `C:/Users/Letzel/AppData/Local/Temp/portfolio-light-theme-bdlikaa9/engineering-portfolio`.
- Artifact: 152 files, 245,109,132 bytes. Identity manifest: `C:/Users/Letzel/AppData/Local/Temp/portfolio-light-theme-bdlikaa9/SHA256SUMS.txt`.
- SHA-256 of the identity manifest: `d6237fe5fa24cd0fd4ae0e79bd28e90a5aeefa2137db7e4844850f3bf636c567`.
- Screenshots and the acceptance report are retained beside the artifact in `C:/Users/Letzel/AppData/Local/Temp/portfolio-light-theme-bdlikaa9/review/`.
- The local artifact was observed in headless Chrome. Installation/native packaging is inapplicable; no public deployment has occurred.
- Scene/GPU stress suites were not rerun because scene inputs/behavior were unchanged. Broader native/package testing is inapplicable.

## Council Decisions and Compatibility

The focused reasoning in `design.md` adopted the existing homepage palette and document-edge treatment. Duplicate per-page palettes, image inversion, a theme library, and replacing the PDF renderer were rejected as unnecessary or harmful. No new council session or material product/design deviation occurred during Cook. The final runtime preserves existing paths, hashes, session access, documents, and static hosting, requiring no migration. Provisional release impact remains patch against documented 1.2.0; final classification/versioning is reserved for Plating.

## Remaining Gates

Implementation and acceptance are complete. Draft PR [#5](https://github.com/Luis-Albos/engineering-portfolio/pull/5) targets `main` from `codex/unify-site-light-theme` and is attached to this chat. The PR body and live PR metadata record its exact final head; runtime evidence covers the verified revision above. Pre-existing `.playwright-mcp/` remains untracked and excluded.

Owner visual acceptance, Plating integration/spec reconciliation, and public release remain outstanding. No merge or deployment was performed. Carry the existing Pages embedded-boot check, compressed-model check, and Study Archive generation into release verification.
