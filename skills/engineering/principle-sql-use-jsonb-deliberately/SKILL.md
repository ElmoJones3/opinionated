---
name: principle-sql-use-jsonb-deliberately
description: Establish a versioned, queryable storage contract when introducing or changing meaningful JSONB payloads, their readers, migrations or external query projections.
---

# Choose JSONB deliberately

JSONB requires a decision about the stored format, its versioning and how callers
query it. Serialization alone does not complete the persistence contract.
Relational storage remains the default for independently identified, related or
constrained facts. Use JSONB when the document is the intended storage unit.

## Own and version the representation

Every meaningful payload has a named format owner and explicit stored-format
version, including pass-through data such as EditorState. Identify which format
produced a stored value; do not guess from whichever fields happen to exist.
An existing unambiguous format identifier may supply this fact. Its location in
the record or payload belongs to the owning contract, not a mandatory envelope.

The version describes persisted representation and interpretation, not necessarily
the containing domain object's business version or its executable's release.
Keep a released version's meaning stable. A format change states which existing
values and deployed readers/writers remain compatible and how older data will
be handled. An optional new field is not automatically compatible with a reader
that rejects unknown fields. Unversioned historical rows need an explicit
baseline or migration, not silent guesses.

Readers admit supported versions or refuse explicitly. Pure conversion may occur
through the format owner's restoration contract; data rewrites and backfills
remain explicit migration work, never hidden read side effects. Writers must
not accidentally downgrade or erase facts from a version they do not understand.

Formal JSON Schema is optional. If used, its dialect declaration is distinct
from the application's payload version. Do not introduce a schema registry,
parallel business property bag or second validation authority just to use JSONB.

## Queryability is part of the choice

When Postgres is the primary store for the information, provide meaningful
reader QueryOptions or the project's equivalent for that information. Do not
substitute full-row retrieval and application-side filtering. An index alone
is not a query API, and row-ID lookup alone is not query support for business
fields hidden inside the payload.

Define the supported predicates, value types and relevant ordering. Stable
fields can have named options; extensible attributes can use a validated
path/operator/value contract instead of one hard-coded method for every key.
Preserve missing, JSON null and ordinary zero values according to that contract.
Treat paths and values as data or validated structure, not interpolated SQL.

Choose indexes for those actual predicates and prove their usefulness with a
representative plan when making a performance claim. Querying JSON is not itself
a modeling failure. Independently updated or relationally constrained facts
still belong in columns or child tables, not a growing set of blob workarounds.

Pass-through must be demonstrated by the owning contract, not inferred from
today's callers. Do not invent business predicates inside an opaque editor
format, but do not call a business attribute bag opaque to omit query support.
Pass-through does not waive format identification, compatibility or preservation.

If an explicit design assigns queries to an external search or graph store,
name that owner and its implemented query contract. State authority, update/delete
propagation, version compatibility, consistency expectations and recovery or
rebuild behavior. A planned integration or two successful writes is not proof.
It does not waive Postgres query support for data that remains its responsibility.

## Prove the stored contract

Load `principle-testing-guidelines`
for versioned fixtures, round trips, named refusals,
migration behavior and actual query results. Verify supported old data still
reads without silent loss and unsupported versions cannot be overwritten.
Exercise QueryOptions against real Postgres, including meaningful matches and
nonmatches. For externally served queries, prove that query path and its declared
delivery semantics. A pass-through proof preserves the admitted payload without
claiming byte-for-byte JSON text fidelity from JSONB.

Database constraints may still protect envelope or shape facts. Missing
constraint tests are not evidence that a JSONB design is sound. JSONB does not
excuse domain validation or establish atomic dual writing.
