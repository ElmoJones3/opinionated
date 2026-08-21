---
name: semantic-mapping
description: Keep project terms and definitions consistent in SEMANTICS.md and SEMANTIC-MAP.md. Mandatory when terminology changes or domain modeling establishes a concept.
user-invocable: false
---

# Keep project semantics current

Record accepted terminology as part of the work that establishes it. Do not wait for a separate documentation request.

Semantics own what a term means and which domain boundary owns it. They do not own behavior, implementation, or the history behind a decision.

## Read the existing language

Before naming or changing a domain concept:

- Find `SEMANTICS.md`, `SEMANTIC-MAP.md`, and adjacent `*.SEMANTICS.md` files relevant to the work.
- Use their canonical terms. Do not drift to a rejected synonym.
- Flag a conflict when the user gives a different definition or the code uses a name rejected by the semantic file. Leave disagreements about behavior to `domain-modeling`.

If no semantic files exist, continue normally. Create them only when a term or ownership boundary becomes settled.

## Record settled meaning

A term is settled when the user explicitly defines, corrects, accepts, or classifies it, or when completed domain modeling establishes it without an unresolved conflict.

Write the term when it settles. Update an existing entry instead of appending a second definition.

Do not record:

- tentative names, assistant recommendations, or unanswered questions;
- methods, state transitions, business rules, or other behavior owned by domain modeling;
- implementation details, specifications, or general programming terms; or
- decision history or rationale owned by an ADR.

After domain modeling completes, record the terms and ownership boundaries it established. Do not copy the behavior model into the semantic files.

## Place the files by ownership

Read [references/semantics-format.md](references/semantics-format.md) before creating, moving, or changing a semantic file or map. Follow its package, directory, flat-file, and map rules exactly.

Keep definitions beside the code that owns their meaning. Use one root map when more than one semantic file exists.

## Check the result

- Every recorded term is settled and has one canonical definition.
- The owning boundary is explicit.
- Rejected synonyms reflect real terminology the project should stop using.
- Semantic files contain meaning, not behavior or decision history.
- `SEMANTIC-MAP.md` points to every scoped semantic file without copying its entries.
