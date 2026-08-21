# Semantic file format

Semantic files preserve the project's accepted terms near the code that owns their meaning. They are not specifications, behavior models, or decision logs.

## Choose the owner

A semantic boundary owns a distinct vocabulary. In a hexagonal project, use the package or domain directory as that boundary.

Directory structure alone does not create a semantic boundary. Do not make one semantic file per source file or mirror every folder mechanically.

Use these paths:

| Project shape | Semantic file |
| --- | --- |
| One project-wide domain | `SEMANTICS.md` at the repository root |
| Package or directory domain | `<domain>/SEMANTICS.md` |
| Flat source file that owns a stable concept | `<thing>.SEMANTICS.md` beside `<thing>` |

Examples:

```text
SEMANTICS.md
src/billing/SEMANTICS.md
src/users/SEMANTICS.md
src/customer.SEMANTICS.md
```

Use a flat-file sidecar only when the source file owns a stable concept with its own vocabulary. A collection of unrelated components does not earn a shared semantic file merely because they share a directory.

## Write SEMANTICS.md

Use this shape:

```markdown
# Billing semantics

Owner: `billing`

Terms in this file belong to the billing domain.

## Terms

### Customer

The person or organization that Billing charges for an invoice.

Avoid: Account, buyer

### Invoice

A request issued by Billing for a Customer to pay a stated amount.
```

Apply these rules:

- Use the canonical term as the heading.
- Name the owning package, directory, or flat-file concept once after the title. Owner means semantic ownership, not a team assignment.
- Define each term in one or two sentences.
- State what the term is. Mention a relationship only when it distinguishes the term from a nearby concept.
- List `Avoid` terms when the project has used them or the user explicitly rejects them. Do not preserve an abandoned assistant suggestion. Omit the line when no rejected term exists.
- Keep one entry per concept. Update or move an entry when ownership changes.
- Group terms under additional headings only when one file contains several clear clusters.

Do not include methods, state machines, invariants, workflows, database fields, API shapes, implementation plans, or the reason a choice was made.

## Write SEMANTIC-MAP.md

Create `SEMANTIC-MAP.md` at the repository root when more than one semantic file exists.

Use this shape:

```markdown
# Semantic map

## Boundaries

- [Billing](src/billing/SEMANTICS.md): owns customers, invoices, and collection terms
- [Users](src/users/SEMANTICS.md): owns identities, profiles, and access terms

## Relationships

- Billing refers to a Users identity by `UserId`; it does not own the User definition.
```

Apply these rules:

- Link every project-owned semantic file with a repository-relative path, including a root file or flat sidecar.
- Give each boundary one short ownership statement.
- Record relationships only when they explain ownership or prevent the same term from being defined twice.
- Keep each definition in its owning semantic file. Never copy term entries into the map.
- Add, move, or remove map entries in the same change as the semantic files they index.

When the repository has one semantic file, omit the map wherever that file lives.
