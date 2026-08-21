# Session model

The canonical record is append-only domain state. HTML, Mermaid syntax, React Flow nodes, current Question state, and the frontier are projections. They are never a second authority.

## Record

`schemaVersion` is `1`. A session contains:

- `context`: trigger, subject matter, start time, Git branch, and Git user;
- `initialQuestionIds`: the Questions present when the pass opened;
- `questions`, `decisions`, and `evidence`;
- `provenanceEdges`: independently identified assertions from Decisions to Questions;
- `questionDependencies`: immutable prerequisite relationships between Questions;
- `phases`: immutable captures of what entered the graph at each conversational boundary; and
- `headPhaseId`: the Phase from which work is currently continuing.

The structural schema is [state.schema.json](state.schema.json). The executable invariants live in `scripts/lib/session.mjs`; JSON Schema alone cannot prove references, acyclicity, edge lineage, ledger integrity, or frontier membership.

## Closed vocabulary

| Provenance Edge type | Derived state after the edge | Meaning |
| --- | --- | --- |
| `raises` | `open` | The Decision makes the Question relevant. |
| `resolves` | `resolved` | The Decision supplies the accepted answer. |
| `supersedes` | `superseded` | The Decision retires the Question or its prior framing. Open a new Question when a replacement framing still requires judgment. |
| `reopens` | `open` | The Decision makes a previously settled Question live again. |
| `retracts` | state immediately before the retracted edge | The Decision withdraws the active assertion without erasing it. |

`requires` is the single Question Dependency relationship: the prerequisite Question must leave `open` state before the dependent Question enters the frontier. It is not a Provenance Edge type.

Subject-specific labels may appear in `metadata`. They do not alter state.

## Edge lineage

A Question has at most one active Provenance Edge. The first edge for a Question has `supersedesEdgeId: null`. Every later edge for that Question points to its current active edge, regardless of the later edge's type. That linked list makes the last accepted assertion current while preserving every earlier assertion.

`reopens` and `retracts` always identify the edge they change. A retraction also requires a newly accepted Decision, so withdrawal remains attributable to a person and Phase.

## Derived Question state

Start each Question at `open`. Follow its active edge:

- `raises` or `reopens` yields `open`;
- `resolves` yields `resolved`;
- `supersedes` yields `superseded`; and
- `retracts` yields the state that existed immediately before the edge named by `supersedesEdgeId`.

Do not add `status`, `resolved`, or similar fields to a Question. The projection is deterministic and must be recomputed.

## Frontier

The frontier contains every `open` Question whose prerequisite Questions are not `open`. An active Phase must nominate one frontier Question as `nextQuestionId`. A closed Phase uses `nextQuestionId: null`; unresolved Questions remain visible.

Question Dependencies and Phase parent links must be acyclic.

## Phase capture

A Phase records the IDs introduced by one conversational boundary in `added`. The ordered arrays must exactly match the entities that name that Phase. A Phase may contain:

- an accepted Decision and its Provenance Edges;
- new Evidence without a Decision;
- new Questions or Question Dependencies; or
- any valid combination of those changes.

Exploration is therefore recordable without pretending it was acceptance. The capture operation appends everything or returns structured problems and exposes no tentative state.

