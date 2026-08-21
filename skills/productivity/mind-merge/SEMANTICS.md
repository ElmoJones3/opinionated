# Mind Merge semantics

Owner: `skills/productivity/mind-merge`

These terms describe conversational provenance. They do not model the subject being discussed.

## Terms

### Mind Merge

A bounded, graph-backed workflow for reaching and preserving shared understanding. It records the minimum state needed to continue a design conversation with provenance.

Avoid: ontology, mind map, interview

### Adjudicator

The agent role that classifies uncertainty, derives the frontier, identifies acceptance, captures each Phase, and poses the next meaningful Question. The Adjudicator owns process mechanics, not user-owned judgment.

Avoid: interrogator, decision maker

### Question

An independently identified unknown considered by the workflow. A Question begins `open`; its current state is derived from its active Provenance Edge.

Avoid: Answered Question

### Decision

An independently identified commitment accepted by the user. Exploration and Evidence are not Decisions.

Avoid: answer, suggestion, finding

### Evidence

An independently identified factual observation that informs a Decision or changes the live Questions. Evidence does not itself represent acceptance.

Avoid: Decision, proof

### Provenance Edge

An immutable, independently identified assertion from a Decision to a Question. Its closed type records how the Decision changes the Question. A later edge preserves and points to the active edge it supersedes.

Avoid: graph edge, link

### Question Dependency

An immutable, independently identified prerequisite relationship between two Questions. A dependent Question enters the frontier only after its prerequisites leave `open` state.

Avoid: Provenance Edge

### Phase

An immutable capture of the entities added at one conversational boundary, its parent Phase, and the next nominated Question. A Phase may record exploration without a Decision.

Avoid: transcript turn, project phase

### Phase capture

The atomic operation that validates and appends one Phase and all entities introduced with it. A refused capture exposes no tentative state.

Avoid: autosave, transcript snapshot

### Active Provenance Edge

The last valid edge in a Question's supersession lineage. At most one edge is active for a Question.

### Question state

The derived result of applying the active Provenance Edge: `open`, `resolved`, or `superseded`. Question state is never stored on the Question.

### Frontier

The set of `open` Questions whose prerequisite Questions are not `open`. An active Phase nominates one frontier Question as next.

Avoid: backlog, all open Questions

### Worksheet

A self-contained HTML projection of canonical session state. Mermaid and React Flow worksheets may own presentation state, never conversational state.

Avoid: source of truth, graph editor

## Closed relationship vocabulary

### `raises`

A Provenance Edge type that makes a Question relevant and leaves it `open`.

### `resolves`

A Provenance Edge type that records an accepted answer and derives `resolved`.

### `supersedes`

A Provenance Edge type that retires a Question or its prior framing and derives `superseded`.

### `reopens`

A Provenance Edge type that returns a settled Question to `open`.

### `retracts`

A Provenance Edge type that withdraws the active assertion and restores the state immediately before that assertion. A new accepted Decision must own the retraction.

### `requires`

The Question Dependency relationship from prerequisite Question to dependent Question. It is not a Provenance Edge type.

