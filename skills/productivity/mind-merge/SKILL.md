---
name: mind-merge
description: Adjudicate long or branching design conversations by maintaining a local graph of open Questions, accepted Decisions, Evidence, dependencies, provenance, and Phase changes in a durable HTML worksheet. Use only when explicitly requested.
disable-model-invocation: true
user-invocable: true
---

# Adjudicate shared understanding

Act as the Adjudicator. Own the mechanics of exposing Questions, recognizing acceptance, capturing each Phase, deriving the frontier, and posing the next meaningful Question. Do not take ownership of the user's semantics, philosophy, authority, or priorities.

Read [SEMANTICS.md](SEMANTICS.md) and [references/adjudication.md](references/adjudication.md) before creating, recovering, or changing session state. Read [references/state-model.md](references/state-model.md) when interpreting the graph or handling validation failure. Read [references/worksheet.md](references/worksheet.md) when initializing, capturing, validating, rendering, or rebuilding artifacts.

## Establish durable state

Search for an existing `state.json`, `state.yaml`, or Mind Merge worksheet before relying on conversation memory.

- If state exists, validate and render it. Treat it as the authority for settled Decisions and provenance.
- If no state exists, initialize from the current conversation. Backfill only explicit acceptance; record facts as Evidence and uncertainty as Questions.
- Use the repository's design-artifact convention. If it has none, use `docs/mind-merge/<subject-slug>/`.
- Capture time, branch, and Git user explicitly at the boundary. Do not read ambient time, Git, or files inside the pure state operations.

Canonical state is JSON or YAML. The worksheet is a generated projection, not an authority.

## Run the adjudication loop

1. Validate the state and derive Question states, active edge lineage, dependencies, and the frontier.
2. Open any Questions exposed by the latest answer or Evidence.
3. Resolve facts through inspection and derive mechanical consequences from accepted Decisions and repository laws.
4. Posit one frontier Question that genuinely requires user judgment and most reduces what remains.
5. Ask it plainly. Use a counterexample, boundary case, or identity test only when it can change a live distinction.
6. Distinguish exploration from acceptance. Never convert tentative discussion into a Decision.
7. Capture the Phase after an accepted answer or after exploration materially changes the graph.
8. Validate and regenerate the worksheet.
9. Pose the next nominated Question.

Do not ask the user to choose file paths, IDs, timestamps, edge mechanics, renderer internals, or consequences already fixed by accepted laws. Those are Adjudicator work.

## Capture provenance

- Keep Questions, Decisions, and Evidence separate.
- Connect Decisions to Questions only through independently identified Provenance Edges.
- Use only `raises`, `resolves`, `supersedes`, `reopens`, and `retracts` as state-bearing edge types.
- Point every later edge on a Question to its current edge with `supersedesEdgeId`.
- Require a new accepted Decision for every retraction.
- Model Question prerequisites with immutable Question Dependencies; their relationship is `requires`.
- Put subject-specific explanation in open metadata. Metadata never changes derived state.
- Never store Question state, the active graph, or the frontier as mutable fields.

An unresolved disagreement remains Evidence plus an open Question. Closing a bounded pass may leave it visible; closure does not invent acceptance.

## Capture before continuing

Use the supplied commands rather than hand-editing canonical state:

```bash
node <skill-directory>/scripts/init-session.mjs --input init.json --state state.json
node <skill-directory>/scripts/capture-phase.mjs --state state.json --input phase.json
node <skill-directory>/scripts/validate-state.mjs --state state.json
node <skill-directory>/scripts/render-session.mjs --state state.json --renderer mermaid --output mind-merge.html
```

Use the Mermaid renderer for the compact default. Use `--renderer rf` when pan, zoom, minimap navigation, or entity inspection materially helps. Both templates are offline and project the same state. Visual interaction owns layout and viewport only.

The capture command appends all accepted changes or refuses them without altering the state file. Never ask the next Question until the Phase that nominates it is durable.

## Finish the pass

Close when the bounded frontier is exhausted or the user chooses to stop. Preserve unresolved Questions. Do not declare shared understanding complete or produce the subject skill's downstream artifact until the user confirms the merge.
