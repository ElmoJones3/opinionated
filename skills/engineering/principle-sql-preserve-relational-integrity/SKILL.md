---
name: principle-sql-preserve-relational-integrity
description: Model independently stored facts with enforceable SQL identities and relationships when designing or changing tables, constraints, migrations, or row mappings.
---

# Preserve relationships when the schema changes

SQL adapters should remain mechanical as the model grows. Put durable row
identity, references and cross-row integrity in a schema that can enforce them,
not in conventions every future writer must remember.

## Model the persisted facts

Independently addressable rows need stable identity and explicit parent or target
references. Use foreign keys and uniqueness constraints for relationships and
cross-row rules. Do not assign an identity to every programming-language value
or transient graph view merely because some domain children need rows.

Domain validation owns admitted object state and business behavior. Database
constraints protect integrity under concurrent writes. An application-side
check followed by INSERT does not replace a unique constraint or foreign key.

Choose uniqueness scope deliberately, including case normalization, tenant or
parent scope, and any soft-deletion or variant predicate. Partial indexes are
one implementation where the database supports them, not a global soft-delete
policy. Prove both the prohibited collision and the allowed neighboring case.

For JSON storage, load [principle-sql-use-jsonb-deliberately](../principle-sql-use-jsonb-deliberately/SKILL.md).
A JSON-shaped query result does not prescribe JSON-shaped persistence. A nested
Record may represent rows assembled by a join, not one blob to save wholesale.

## Keep mappings and migrations honest

- Map named columns explicitly. Maintain one source of column/value alignment;
  do not hand-maintain independent ordered lists that can drift on a field change.
- Updates and upserts change only fields the operation owns. Preserve recorded
  identity and immutable facts; let database-owned values follow their declared
  defaults or triggers. The project defines the actual audit-column policy.
- Unloaded fields are not SQL NULL or empty replacements. Omit them in an
  explicitly partial write or obtain the data required for replacement.
- A migration includes existing data and constraints, not just the shape of an
  empty database. Define conversion, backfill and rollout compatibility when
  stored rows or concurrent application versions are affected.

Load `principle-testing-guidelines`
for real-database constraint and mapping proofs. Exercise
foreign keys, uniqueness, upsert preservation and each nullable distinction the
contract claims. Do not let a matching reader and writer hide the same omitted
column. Prove the migration direction or reversal promised by the project.
