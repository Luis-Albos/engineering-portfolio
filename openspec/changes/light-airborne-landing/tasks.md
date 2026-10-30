# Tasks

## 1. Landing composition

- [x] 1.1 Capture the current local landing at 1586 × 992 and 390 × 844 as a baseline, and verify the captures show the existing rail/stage layout before changing it.
- [x] 1.2 Replace landing-only markup and scoped shell styles with the DC-0008 header, kicker, headline, description, Open Portfolio, secondary Resume, and unboxed scene; verify a 1586 × 992 browser capture places the major text/action regions at the design.md anchors and contains no featured-project, frame, or registration content.
- [x] 1.3 Reflow the same composition at narrow widths and update the layout/content assertions in `scripts/test-landing-scene.cjs`; verify the 390 × 844 landing keeps readable text and the CTA in reading order, has no horizontal overflow, and the focused checks pass.
- [x] 1.4 Reconcile the landing markup, palette, responsive behavior, and reference-image role in `README.md`; verify the documented selectors and visitor behavior match the implemented page.

## 2. Aircraft rendering and placement

- [x] 2.1 Retune the existing GLB camera fit, position, paper-colored fill, and dark technical edges for the reference's center-right aircraft and the owner's moving-sketch revision; verify a real WebGL screenshot at 1586 × 992 matches its approximate silhouette bounds without changing `reference/CP1_2024.glb`.
- [x] 2.2 Preserve drag/keyboard interaction, reduced-motion stillness, and the revised landing-to-viewer visual handoff; verify those behaviors in the focused scene browser check and confirm the renderer is disposed after entry.

## 3. Mountain terrain and fade

- [x] 3.1 Reshape the periodic terrain generator into layered mountain ridges with a lower flight corridor; verify periodic tile travel remains seamless and the real scene shows visible gear-to-terrain clearance at several idle phases, including the reduced-motion frame.
- [x] 3.2 Add responsive terrain-only fading near the text column and all viewport edges, plus a light scene palette; verify desktop and phone captures show no contour interference with copy, abrupt edge cutoffs, or faded aircraft edges.
- [x] 3.3 Update `scripts/test-landing-scene.cjs` for airborne composition, contour/fallback behavior, and existing low-power and reduced-motion paths; run that focused check and record its elapsed time and any remaining visual uncertainty.
- [x] 3.4 Correct the terrain construction and tuning description in `README.md`; verify the documentation describes the implemented CPU-built periodic heightfield, shader fade, and actual configuration knobs.

## 4. Integrated handoff

- [x] 4.1 Run `node scripts/test-experience.cjs` and `node scripts/test-portfolio.cjs` against the implementation, then verify the real `/engineering-portfolio/` journey: landing → Open Portfolio → page navigation → return, plus a direct page hash with no aircraft fetch; record check durations and the revision tested.
- [x] 4.2 Compare the final real-render desktop screenshot side by side with `references/dc-0008-concept.png` and inspect the phone, reduced-motion, and WebGL-unavailable states; record any irreducible GLB-versus-concept difference and the owner's remaining release-pairing decision.
- [ ] 4.3 Inventory the branch and existing dirty Design Council ledger, prepare reviewable commit(s) and a draft PR for this landing change without merging or deploying; verify the PR head includes the OpenSpec reference and all approved work and that its receipt identifies the exact reviewed revision.
