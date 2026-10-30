# Completion evidence
- For site edits, verify the affected behavior with the smallest existing script under `scripts/test-*.cjs`, then run the relevant integrated checks named in `README.md` and `STARTUP.md` when the change warrants them.
- For boot edits, `node scripts/sync-boot.cjs --check` is the Pages workflow gate.
- For consequential user experience changes, observe a real landing/viewer/resume/resources journey at the `/engineering-portfolio/` path, including relevant responsive, reduced-motion, and failure states.
- Confirm the actual published Pages revision after an authorized release; a local source test alone is not deployment evidence.
- Preserve preexisting untracked project files when preparing commits; report unrun gates and exact artifact/revision in the Engineering Team receipt (`../ENGINEERING_TEAM.md`).