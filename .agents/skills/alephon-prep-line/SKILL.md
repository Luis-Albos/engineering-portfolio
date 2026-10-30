---
name: alephon-prep-line
description: Explore an Alephon project idea through evidence and relevant council deliberation, then prepare an OpenSpec proposal only after the owner confirms brainstorming is finished. No application implementation.
---

# Alephon Prep Line

Read [shared workflow](../../../../ALEPHON_WORKFLOW.md), [project registry](../../../../PROJECTS.md) when applicable, the current project's `AGENTS.md`, and its existing OpenSpec and council conventions. This skill is independently invocable; do not assume Cook Line follows.

## Explore

Begin with the installed `$openspec-explore` guidance. Accept freeform ideas, sketches, criticisms, and speculative requirements without demanding a structured brief. Inspect current source, architecture, tests, active changes, main specs, decision records, and relevant project-scoped Cortex recall. Establish what exists, what has been approved, what is feasible, and whether the idea changes or duplicates implemented behavior. Do not modify application code.

For a registered project, follow the shared [versioning policy](../../../../VERSIONING.md): inspect its authoritative version sources, last released artifact or tag, and release notes. Run Engineering's `scripts/versioning.py status --project <id> --checkout <active-checkout>`. Record the previous released version or “unreleased,” with evidence, and a provisional major/minor/patch impact class in the proposal and receipt. Do not bump a version during Prep Line.

When useful, search for existing FOSS plugins, Codex skills, MCP servers, libraries, and development tools. Compare promising options on project fit, license, recent maintenance, security, adoption, and integration cost. Prefer a mature, maintainable option when it improves the proposed outcome. Keep research proportional. Present worthwhile candidates and tradeoffs for council consideration; do not install or integrate them during Prep Line.

## Deliberate

Use the smallest relevant consultation: General Council for strategic, market, value, prioritization, or material scope questions; a project's Design Council for UX and creative questions; Engineering Team for architecture, feasibility, security, reliability, performance, and delivery risk. Follow each applicable charter and its authority boundary. For a cross-disciplinary choice, bring the Design Engineer liaison and Engineering Lead together where the project defines them. Do not manufacture dissent or five agent reports.

Challenge the idea against evidence: weaknesses, contradictions, alternatives, important tradeoffs, and whether the feature should exist. Distinguish established decisions, council recommendations, rejected alternatives, and owner decisions still needed. Synthesize a concise recommendation and let the Head Chef accept, reject, revise, or continue brainstorming. Ask focused questions only for material unresolved choices. Continue exploration until the owner explicitly signals completion.

## Propose and hand off

When the idea is sufficiently defined, ask exactly: **“Are you finished brainstorming and ready for me to prepare the OpenSpec proposal?”** If the owner continues, resume exploration with the accumulated decisions. After an affirmative answer, use the installed `$openspec-propose` workflow in the owning project. Choose a concise kebab-case change name. Capture the outcome, user-visible behavior, scope and exclusions, approved design and product decisions, delegated technical approach, dependencies, acceptance journey and criteria, tasks, consequential council reasoning, and relevant rejected alternatives. Identify the smallest meaningful acceptance journey and any project-required expensive gates so Cook Line can plan verification without inventing a new test program. Honor the project's OpenSpec root and store checks.

End with a **Prep Line Receipt** using the shared handoff contract: change name and path, intended outcome, named authorized batch and remaining owner gates, desktop-control boundary, expected artifact, smallest acceptance proof, proposal validation, and Cook Line readiness. Stop after the reviewable proposal unless the owner's current instruction explicitly authorizes the named batch to continue.
