# Adjudication procedure

Mind Merge makes the agent the adjudicator of conversational state, not the owner of the user's judgment.

## Classify before asking

Sort each live uncertainty into one of three kinds:

1. **Fact** — inspect the repository, documentation, or other evidence. Record the result as Evidence when it changes the graph.
2. **Mechanical consequence** — derive it from accepted Decisions and repository laws. Explain or record it; do not ask the user to approve arithmetic.
3. **User-owned judgment** — semantics, philosophy, authority, acceptable tradeoffs, or intent that cannot be derived. This is eligible to become the next Question.

Ask one user-owned Question at a time. Posit the Question that most reduces the remaining frontier, not the one that is easiest to ask.

## Recognize acceptance

Create a Decision only when the user accepts a commitment. Explicit agreement, a direct choice, or a statement that something is already repository law is acceptance. Brainstorming, curiosity, counterexamples, tentative language, and silence are not.

Write the Decision as the accepted proposition, not as a transcript summary. Keep the user's rationale when it affects interpretation. Connect the Decision to every Question it changes with separately identified Provenance Edges.

If an answer is ambiguous, do not manufacture a Decision. Record any new Evidence or Questions in an exploration Phase, then ask the smallest Question that resolves the ambiguity.

## Capture the phase

After an accepted answer—or exploration that materially changes the graph:

1. derive the current projection;
2. identify the accepted Decision, Evidence, new Questions, dependencies, and replacement edge lineage;
3. choose the next frontier Question, or close the pass with `nextQuestionId: null`;
4. create a Phase command with explicit IDs, timestamps, and user identity;
5. run `capture-phase.mjs` against the canonical state file;
6. run `validate-state.mjs`;
7. regenerate the worksheet; and
8. ask the nominated Question.

Never ask the next Question before the Phase naming it is durable.

## Apply pressure with purpose

Use counterexamples, boundary cases, contradiction checks, and identity tests only when they can change a live Question or expose a missing one. Stop pressing once the relevant distinction is settled. This is adjudication, not ritual opposition.

## Preserve unresolved disagreement

Record the competing facts or arguments as Evidence and keep the disagreement as an open Question. The user may close a bounded pass without resolving it. Closing changes the Phase status; it does not invent a Decision or hide the open Question.

## Recover in mid-to-late context

Look for an existing `state.json`, `state.yaml`, rendered worksheet, or repository-design-artifact convention before using the transcript.

When valid state exists:

- treat it as the authority for settled Decisions and provenance;
- use the transcript only for changes after the head Phase;
- validate and render it before posing another Question; and
- do not silently replace recorded state with remembered context.

When no state exists, bootstrap from the current conversation without replaying the entire interview:

- record only commitments the user explicitly accepted;
- put factual findings in Evidence;
- make uncertain recollections open Questions, not Decisions;
- mark recovery details in open `metadata`, which cannot affect derived state; and
- render the reconstructed worksheet before continuing.

Ask for correction only when uncertainty changes the next meaningful Question. File paths, IDs, timestamps, graph layout, and other mechanics remain the agent's work.

