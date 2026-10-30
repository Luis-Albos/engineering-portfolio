# Project memory

The owner-approved [Engineering Team charter](../ENGINEERING_TEAM.md) applies from substantive feature brainstorming through delivery. Use its five responsibilities with proportional activation, evidence-based watchpoints, authorized-batch continuation, focused verification, and an artifact-first receipt alongside this project's own requirements.

Use this checkout's `cortex` MCP for durable engineering-portfolio history. Its existing 27 backfilled memories remain in the shared local Cortex database. This project's agent role can read and write only records with domain `engineering-portfolio` and this checkout as origin. Save new decisions with that domain, this absolute Git root as `directory`, and `is_global=false`. Verify recall against the repository and its `README.md`. Do not store credentials or temporary diagnostics.

## Overhaul workflow

Use this project's `openspec/` for proposed website changes. The project-local `$alephon-prep-line`, `$alephon-cook-line`, and `$alephon-plating-line` skills follow the [central Alephon workflow](../ALEPHON_WORKFLOW.md) in that order. Prep explores and proposes, Cook implements an authorized change and prepares a draft PR, and Plating reviews an identified PR for guarded integration. Installing these entry points does not itself approve a redesign, merge, or deployment. Preserve the current static GitHub Pages site until an approved change replaces its behavior.

Route explicit **Design Council** requests to [the portfolio Design Council](councils/design/README.md) and explicit **Engineering Council** requests to [the portfolio Engineering Council](councils/engineering/README.md). They are project-specific response perspectives, not standing agents or automatic approval bodies. An onboarding request does not convene either council. The owner retains material product, aesthetic, integration, and release decisions; do not import another project's council decisions into this portfolio.

Playwright is a local development dependency for the existing browser scripts; Motion is installed for future animation work but is not yet loaded by the published site. Serena is configured in `.serena/project.yml` for JavaScript navigation. Keep Node dependencies out of GitHub Pages output and use the existing project tests and live site journey as evidence for changes.
