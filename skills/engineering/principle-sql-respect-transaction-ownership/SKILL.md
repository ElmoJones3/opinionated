---
name: principle-sql-respect-transaction-ownership
description: Preserve the caller's atomic operation when implementing or reviewing SQL transaction composition, participating readers and writers, or rollback behavior.
---

# Keep transaction ownership explicit

One owner defines the atomic operation and opens, commits or rolls it back.
Participating adapters execute against its transaction; they do not commit an
intermediate success or silently open another transaction when one is missing.
Apply the project's transaction-required and standalone-read conventions.

Keep business decisions and multi-adapter sequencing in their application or
service owner. A low-level writer maps and executes its assigned writes. Its
success means that execution succeeded, not that the caller committed the work.

## Preserve participation

- Reads inside the unit of work use its transaction when they must observe its
  uncommitted writes. Do not accidentally fall back to a pool connection.
- A read outside a transaction follows the caller's declared consistency needs;
  do not invent transactions inside readers or claim every read needs one.
- Isolation determines the snapshot and concurrency guarantees. Two statements
  in one transaction do not automatically share a stable snapshot under every
  isolation level. State the guarantee actually provided.
- An error or cancellation remains visible to the transaction owner. Do not
  swallow it, convert it to an empty success, or commit partial work as recovery.
- Separate databases or external indexes do not share a local SQL transaction.
  An explicit delivery/recovery contract owns those effects; two successful
  calls are not proof of atomic dual writing.

Use [the Go context principle](../principle-golang-respect-context/SKILL.md)
for Go lifetime handling. It does not replace the
transaction owner's rollback and resource-release responsibilities.

## Prove the atomic operation

Load `principle-testing-guidelines`
and use a real database when claiming transaction behavior.
Show participating reads see uncommitted writes, a later failure leaves no
partial committed result, and success persists all intended changes. A writer
test's successful Exec is not an atomicity test. Prove missing-transaction
refusal separately when the adapter contract requires a caller-owned one.
