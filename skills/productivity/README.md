# Productivity skills

These skills help an agent preserve useful working state across conversations. They structure collaboration without turning ordinary discussion into project management ceremony.

## The skills

| Skill | Trigger | What it owns |
| --- | --- | --- |
| [`mind-merge`](mind-merge/SKILL.md) | Explicit only | Maintains questions, accepted decisions, dependencies, provenance, phases, and a durable worksheet until the user confirms shared understanding. |

## Mind merge design record

`mind-merge` is a subject-agnostic conversation workflow adapted from Matt Pocock's [`grilling`](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling) skill. Grilling supplies the useful pressure: one consequential question at a time, boundary cases, and resistance to premature synthesis. Mind Merge adds the part long conversations need: explicit adjudication, durable state, immutable provenance, Phase capture, mid-context recovery, and a worksheet that remains useful after the transcript stops fitting in context.

Ontology design was the first intended use. It remains a future consumer of this workflow, not part of the workflow's model or completion rules.

### Settled principles

- Model the conversation's Questions, Decisions, and dependencies as a graph, not a tree.
- Ask one genuine user-owned question at a time. Resolve factual research and mechanical engineering consequences without turning them into approval questions.
- Recompute the open questions after every accepted answer.
- Investigate facts independently; reserve philosophical and semantic choices for the user.
- Keep evidence separate from decisions.
- Record accepted conclusions as they settle, while leaving unresolved questions visible.
- Use a bounded pass through the graph instead of pretending every conceivable branch must be exhausted.
- Do not declare shared understanding complete or produce the downstream subject artifact until the user confirms it.
- Apply pressure through counterexamples, boundary cases, and identity tests. Do not perform interrogation for its own sake.
- Use a durable HTML worksheet so a session can recover its decision state without treating the conversation transcript as the source of truth.
- Model Questions and Decisions as separate entities. Typed edges between them carry the provenance of how a Decision affects a Question, including relationships such as `resolves` and `supersedes`.
- Treat each Provenance Edge as an immutable historical assertion created during one Phase. A later interpretation preserves the original edge and records a replacement or invalidation as another assertion.
- Give every Provenance Edge a stable identity independent of its endpoints and relationship type. Repeated assertions between the same Question and Decision remain distinguishable.
- Make a replacement Provenance Edge point directly to the edge it supersedes. Edge lineage determines which assertion is current; Phase history only groups when the assertions occurred.
- Require every retraction to be an accepted Decision. That Decision creates a new Provenance Edge which references the withdrawn edge, keeping the retraction attributable to a Decision, Phase, and user.
- Derive a Question's current state from its active Provenance Edges. Do not persist or mirror mutable Question status in the session record or worksheet UI.
- Use a closed vocabulary for state-bearing Provenance Edge types. Subject-specific labels remain open metadata and cannot change derived state.
- Keep the model to the minimum structured state needed to continue the conversation with provenance. It is not a raw mind-mapping model or a general-purpose graph editor.
- Represent prerequisites between Questions as immutable Question Dependencies. Use them only to derive which Questions belong to the current frontier.

### Inherited repository laws

- Apply [Prefer pure functional patterns](../engineering/principle-prefer-pure-functional-patterns/SKILL.md) to state transitions and projections. Given the same accepted record, every derived graph, Question state, and Phase view must be identical.
- Apply [Choose the state owner, then the model](../ui/ui-principle-state-management/SKILL.md) to the worksheet. The session record owns conversation state; React Flow or Mermaid owns only presentation state such as layout and viewport.

### Relationship to subject skills

The workflow owns conversational continuity, Question Dependencies, accepted Decisions, provenance, Phases, and the current frontier.

A subject skill owns the questions worth asking, the tests used to challenge answers, its completion criteria, and its downstream artifact. A future ontology-design skill can use `mind-merge` without adding ontology-specific concepts to this workflow.

### Derived implementation consequences

- Keep the canonical session state in a compact JSON record and generate the HTML worksheet from it.
- Bundle the worksheet template with the skill. A hosted gist may remain its upstream source, but session recovery must not require network access.
- Store immutable Phase records and append-only assertions. Derive the Phase tree, current frontier, Question states, and active graph from them.
- Render the same record through Mermaid for simple documents and React Flow for interactive or structurally heavy sessions. Neither renderer may own conversation state.

### Worksheet

1. Context: trigger, subject matter, date and time, Git branch, and Git user.
2. Initial open Questions.
3. Decision graph.
4. Decision records and their Provenance Edges to Questions.
5. Phase history showing which Questions appeared, changed, dissipated, or were resolved after each answer.

The implemented templates are [`mind-merge.mermaid.html`](mind-merge/assets/mind-merge.mermaid.html) and [`mind-merge.rf.html`](mind-merge/assets/mind-merge.rf.html). Both are self-contained, accept the same JSON or YAML state, and keep renderer interaction outside the domain record.

### Unresolved disagreement

Preserve the competing facts or arguments as Evidence and leave the disagreement as an open Question. A bounded pass may close without resolving it. Closure changes the Phase, not the history: it does not manufacture a Decision or hide the Question.
