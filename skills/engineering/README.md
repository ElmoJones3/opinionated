# Engineering skills

These skills assign decisions to their owners. A domain owns construction, business behavior, and consequences. Pure calculations keep inputs and effects explicit. Go operations respect their caller's lifetime. SQL adapters preserve the transaction, relationships, and query results their contracts promise.

Choose the applicable principles for the project. The Go and SQL skills are optional additions; each describes the work that should activate it. Project-specific skills supply local APIs, libraries, and adapter conventions.

## Choose the responsible contract

| Concern | Skill | What it owns |
| --- | --- | --- |
| Domain construction and behavior | [`domain-modeling`](domain-modeling/SKILL.md) | Complete construction, commands, consequences, restoration, partial loading, and isolated Edits for immutable revisions. |
| Calculations and effects | [`principle-prefer-pure-functional-patterns`](principle-prefer-pure-functional-patterns/SKILL.md) | Explicit inputs, ownership, relevant non-mutation, error conventions, and separation of calculation from delivery. |
| Go request lifetimes | [`principle-golang-respect-context`](principle-golang-respect-context/SKILL.md) | Context entry checks, propagation, retained sessions, cancellation errors, and proof that abandoned work stops. |
| SQL atomic operations | [`principle-sql-respect-transaction-ownership`](principle-sql-respect-transaction-ownership/SKILL.md) | Caller-owned transactions, participating reads and writes, isolation claims, rollback, and settlement proof. |
| SQL identities and relationships | [`principle-sql-preserve-relational-integrity`](principle-sql-preserve-relational-integrity/SKILL.md) | Foreign keys, scoped uniqueness, explicit column mappings, partial writes, and existing-data migrations. |
| SQL aggregate reads | [`principle-sql-preserve-query-cardinality`](principle-sql-preserve-query-cardinality/SKILL.md) | Root selection, complete requested children, loaded-state meaning, ordering, pagination, and bounded query work. |
| JSONB persistence | [`principle-sql-use-jsonb-deliberately`](principle-sql-use-jsonb-deliberately/SKILL.md) | Format ownership and versions, compatibility, query support, preservation, and any external query responsibility. |
| Reasoning beside code | [`principle-always-comment-code`](principle-always-comment-code/SKILL.md) | Purpose, assumptions, limitations, lifecycle, and gotchas beside every source file, declaration, and member. Mandatory for code work. |
| Generated HTTP documentation | [`principle-code-first-documentation`](principle-code-first-documentation/SKILL.md) | Generated API contracts and documentation UI that match the server. Mandatory for HTTP boundaries. |
| Project vocabulary | [`semantic-mapping`](semantic-mapping/SKILL.md) | Accepted terms and ownership in `SEMANTICS.md` and `SEMANTIC-MAP.md`. Mandatory when terminology settles. |
| Recording accepted decisions | [`semantic-snapshot`](semantic-snapshot/SKILL.md) | Reconciliation of accepted conversation decisions with semantic files and ADRs. Explicit only. |

## Domain ownership and pure calculations

Start with the complete caller operation. The responsible domain exposes construction inputs, legal commands, observations, and all required consequences. Its private representation remains its own, including when neighboring types share a package. Restoration admits recorded state through a separate validated contract and preserves recorded identity and history.

Construction can be complete or incremental. A bare seed has a different contract from a value ready for use. When both construction paths exist for an independently valid aggregate, they must express equivalent caller-controlled state. Partial loading distinguishes unavailable data from known absence and does not waive validation of supplied values.

Choose methods, value-returning commands, or an isolated Edit according to the domain. For an immutable semantic revision, the Edit owns authoring and preserves retained observations. A refused command preserves previously accepted work. Completion derives the consequences of effective changes; persistence belongs to the application or adapter.

Functional guidance supports that contract. Use ordinary functions and the project's expected-error convention. Local mutation of unshared storage can implement a pure calculation. Copy where ownership requires isolation, and ask another owner for its copying contract instead of rebuilding its private representation. Use pipelines and shared helpers when the task benefits from composition.

Required facts can use an established result, ledger, or pending-event contract. In-memory accumulation and external delivery have separate guarantees. A returned value cannot prove that database state and outbound messages became durable together.

The Go, Python, and TypeScript references cover language-specific construction, copying, errors, and effects. Load the relevant reference when those details affect the work.

## Request and persistence boundaries

A context-bearing Go operation checks its lifetime before validation, copying, I/O, or successful no-ops. It propagates that context and preserves recognizable cancellation through wrappers. A bounded request-scoped Edit can retain context under its contract; subsequent operations check it again. Earlier accepted facts remain subject to their declared observation contract.

The SQL principles compose around different claims. Transaction ownership identifies who commits and which adapters participate. Relational integrity places cross-row guarantees in enforceable constraints. Query cardinality preserves roots and their requested children as filters, joins, and pagination are added. JSONB adds explicit representation and query obligations when a document is the intended storage unit.

For example, finding a customer by one email still returns every requested email for that customer. Independently aggregating emails and roles prevents their join from multiplying both collections. Page customers before attaching children, and define deterministic ordering. If business preferences live in JSONB, define supported versions and meaningful predicates over them, including missing and null behavior.

The broader systems skill [`principle-respect-transaction-boundaries`](../systems/principle-respect-transaction-boundaries/SKILL.md) covers commit ambiguity and effects across resources. The SQL ownership principle supplies the narrower adapter-participation contract. Load each when its claim applies.

## Prove the operation

Use [`principle-testing-guidelines`](../testing/principle-testing-guidelines/SKILL.md) to select proof. An authoring workflow needs observable creation, inspection, correction, acceptance, and discard behavior. A transformation test follows the operation's existing API. SQL claims need the real database's query, constraint, and transaction semantics.

Assert exact results and preserved state. A reader and writer that omit the same column can agree with each other while losing data. A cancellation test that observes only a driver's error may miss work already performed. Shape the proof around the boundary that owns the guarantee.

Semantic files record accepted vocabulary and ownership. ADRs preserve the reasoning behind architectural decisions. Keep those records consistent with the implemented contract.
