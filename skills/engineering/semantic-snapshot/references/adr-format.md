# ADR format

ADRs form one central project decision log. Keep them under `docs/adr/`, even when semantic files belong to several domain boundaries.

## Decide what to record

Write an ADR when a clearly settled choice affects future work and its reason would not be obvious from the repository alone.

A decision is clearly settled when the user explicitly chooses or accepts it. Completed work may confirm an accepted decision; it cannot establish acceptance. An assistant recommendation, unanswered option, or inferred preference is not a decision.

Record choices such as:

- ownership and boundary decisions;
- constraints that future work must preserve;
- technology or integration choices with a meaningful reason;
- deliberate departures from an expected approach; and
- terminology decisions whose reason matters beyond the current definition.

Skip transient implementation details and choices that the code explains completely. A snapshot is a decision log, not a transcript of everything discussed.

When the conversation contains a likely decision but its choice, reason, scope, or acceptance is unclear, report it to the user instead of writing an ADR.

## Name the file

ADRs use four-digit sequential indexes and lowercase kebab-case slugs:

```text
docs/adr/0001-centralize-project-decisions.md
docs/adr/0002-billing-owns-invoice-numbers.md
```

Scan `docs/adr/` for the highest existing index and increment it. Never renumber existing records. Create the directory only when the first ADR is written.

## Write one decision

Use this default shape:

```markdown
# Centralize project decisions

We will keep all ADRs under `docs/adr/` rather than distributing them across domain packages. A single sequence makes project decisions discoverable while semantic definitions remain beside the code that owns them.
```

The first paragraph should state the context, the decision, and the reason in one to three sentences. One ADR owns one decision.

Add sections only when they preserve information the paragraph cannot carry:

- `## Considered options` when a rejected alternative is likely to be proposed again.
- `## Consequences` when the decision creates a non-obvious obligation or cost.

Do not add empty template sections.

## Supersede instead of rewriting history

When a later decision reverses an ADR:

1. Create a new ADR for the new choice and reason.
2. Add `Supersedes: ADR-NNNN` below the new title.
3. Add `Superseded by: ADR-NNNN` below the old title.
4. Keep the original text intact.

Correct spelling or broken links in place. Do not rewrite the original choice to match the current one.
