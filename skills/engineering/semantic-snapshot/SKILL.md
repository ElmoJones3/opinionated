---
name: semantic-snapshot
description: Review the recent conversation for settled terminology and decisions, then update semantic files and missing ADRs. Use only when explicitly requested.
disable-model-invocation: true
user-invocable: true
---

# Capture a semantic snapshot

Retrace the relevant part of the conversation and reconcile what was settled with the repository. Write clear conclusions. Surface uncertain candidates instead of guessing.

This is a recording pass, not another design session. Do not reopen settled work, start a new interview, or turn the conversation into a specification.

## Load the rules

Load `semantic-mapping` before reviewing terminology. Report a missing skill and do not recreate its semantic rules from memory.

Read [references/adr-format.md](references/adr-format.md) before classifying decision points or creating or superseding an ADR.

## Set the scope

- Use the topic, decision, or conversation segment named by the user.
- Otherwise use the coherent segment leading to this invocation, stopping where the subject changes.
- Include relevant repository changes and existing semantic files or ADRs when they confirm what the conversation settled.
- Use a compacted thread summary only for conclusions it marks as explicitly accepted. If the requested segment or its rationale is unavailable, state what is missing instead of reconstructing it from unrelated files.

## Collect the conclusions

Separate the segment into:

- settled terms, definitions, rejected synonyms, and owners;
- clearly settled decisions with their context and reason; and
- unresolved semantic conflicts or possible decisions whose meaning, choice, reason, scope, or acceptance remains unclear.

An assistant recommendation or implementation choice is not settled until the user explicitly chooses or accepts it. Completed work may confirm an accepted decision; it cannot establish acceptance.

## Reconcile the repository

1. Compare the collected terms with the relevant semantic files and map. Apply `semantic-mapping` to add, correct, move, or remove entries.
2. Compare clearly settled decisions with `docs/adr/`. Write missing ADRs and supersede contradicted ADRs. Do not duplicate a decision that is already recorded.
3. Leave unresolved items unwritten. Report each candidate with the exact point that remains unsettled.
4. Inspect the diff for invented language, behavior copied into semantics, duplicated definitions, and ADRs that record recommendations rather than decisions.

Do not edit unrelated documentation, implementation, or tests during a snapshot.

## Report the snapshot

Account for every collected item as already recorded, written now, or reported as unresolved.

Name the semantic files and ADRs created or changed. Then list unresolved semantic conflicts and ADR candidates with the exact point that remains unsettled. Do not pad the report with terms and decisions that were already recorded correctly.

If every item was already recorded and no candidate remains, state that no changes were needed.
