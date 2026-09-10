---
name: principle-sql-preserve-query-cardinality
description: Preserve root selection, child completeness, ordering and bounded query work when implementing or reviewing SQL aggregate reads, filters, joins or pagination.
---

# Preserve the result the query promises

Define what one result represents and which components were requested. A query
must preserve that cardinality as children, filters and joins are added.

## Select roots without changing their contents

A predicate used to find roots is separate from loading the requested children
of each selected root. A parent found by one matching child still receives its
complete requested child collection. Use EXISTS or an equivalent root-selection
operation, not a filter on the relation used to hydrate those children.

Independent one-to-many joins multiply rows. Aggregate child collections
independently, for example with correlated subqueries or preaggregated relations.
Do not use DISTINCT to conceal a multiplication bug. A genuine set operation
may need deduplication, but must preserve the declared identity and ordering.

Return known-empty collections without phantom null members. Distinguish data
that was not queried from a queried empty collection. Never label a filtered or
paged subset as complete membership. Preserve meaningful child order explicitly
in SQL aggregation; physical row order is not the contract.

## Bound the work and page the right unit

- Load requested data set-wise. Avoid one child query per returned root or a
  chain of readers that hides N+1 I/O. Follow the project's submission contract;
  this principle does not require one particular query shape everywhere.
- Page roots before attaching their complete requested children. Do not let a
  joined-row limit truncate the last root or reduce the number of unique roots.
- Counts and result queries use the same root-selection predicates. Counts need
  not pay for child hydration. Follow the caller's declared consistency and
  transaction contract rather than claiming two submissions are one snapshot.
- Pagination requires deterministic ordering, including a unique tie-breaker.
  Its owner declares that order; a low-level adapter does not invent business
  sorting. Whitelist structural choices and parameterize data values.
- A new JSON query path must retain type and missing/null semantics. Load
  [principle-sql-use-jsonb-deliberately](../principle-sql-use-jsonb-deliberately/SKILL.md)
  when JSON is the stored representation.

## Prove shape, not just row count

Load `principle-testing-guidelines`
and use a real database for SQL claims. Asymmetric child
counts expose fan-out. A child-based lookup must return the unmatched siblings
too. Include a childless root, more than one root, and a page boundary that
would split joined rows. Assert exact identities, ordering and loaded-state
meaning. Inspect query submissions and the actual access plan at representative
cardinality when claiming bounded I/O or index behavior; tiny fixtures alone do
not prove a production performance claim.
