---
name: principle-always-comment-code
description: Preserve the reason code exists beside every source file, named declaration, and member. Mandatory when creating, changing, reviewing, or diagnosing code in any language.
---

# Always comment code

Code is read more often than it is written. Treat comments as a message to the
next engineer from the mindset that produced the code. They are part of the
implementation, not cleanup and not a box to check.

Apply this rule even when the change is one obvious function in one file. Every
source file, named declaration, and named member requires documentation. This
includes public and private modules, packages, constants, variables, aliases,
types, enums and their values, classes, structs, interfaces, fields, properties,
constructors, functions, methods, accessors, and named callbacks. Document
parameters and returned values where their contract or assumptions are not fully
expressed by the language.

## Preserve the author's reasoning

Write at least one useful line for every required item. Add more when one line
cannot preserve the contract. Explain:

- why the item exists and why it belongs here;
- assumptions the implementation relies on;
- limitations, failure behavior, and potential gotchas;
- ownership, lifecycle, ordering, units, defaults, or concurrency requirements;
  and
- consequences that would surprise a caller or future editor.

For an algorithm, record the input invariants, edge semantics, mutation and
ordering guarantees, and any complexity cost that affects how callers may use it.
Explain the invariant or design choice that makes a non-obvious step correct. Do
not narrate initialization, iteration, assignment, or branching that the code
already states.

A comment that translates the identifier, type, or next statement into English
does not count. Neither does an empty generated documentation block. Names and
types say what the code is. Comments preserve why this version of the code is
here and what must remain true around it.

Do not invent rationale to satisfy coverage. Derive it from the request, existing
code, tests, accepted decisions, and observable behavior. When the reason is
unknown, document only the concrete contract the code enforces and resolve any
unknown that would materially change the implementation.

Make every TODO explicit. State the unfinished work, why it remains, and the
condition that permits or requires completion. Include an existing issue or
owner when one is known. Never invent one.

## Keep comments in the change

Read the surrounding package, file, declaration, and member comments before
editing code. Update them in the same change whenever behavior, assumptions,
limitations, ownership, lifecycle, or gotchas change. Remove claims the code no
longer earns. A code change with stale comments is incomplete.

When creating a file or touching undocumented code, add the missing coverage in
the requested scope. Do not skip documentation because the feature is small,
private, temporary, familiar, or easy to infer.

## Use the language's documentation system

Read the matching reference before changing code:

- [Go](references/go.md)
- [JavaScript and TypeScript](references/javascript-typescript.md)
- [Python](references/python.md)

For another language, use its native documentation comments and the project's
existing documentation convention. Install and configure a documentation linter
when the ecosystem supports one. Use the project's package manager and existing
lint configuration. Do not replace unrelated tooling.

Required documentation tooling is part of the code change. A missing package
manifest, development-dependency group, or lint configuration is not an
exception. Create the smallest conventional project configuration needed to
record and run the formatter and linter without replacing an established project
choice.

Linters prove presence and syntax. They cannot prove that a comment records the
author's actual reasoning, so the final review remains mandatory.

## Audit the result

Before finishing:

1. Inspect every changed source file from top to bottom.
2. Account for the file and every named declaration and member, including private
   and locally scoped declarations.
3. Reject comments that merely restate code or leave assumptions implicit.
4. For algorithms, compare the documentation with malformed inputs, boundary
   behavior, ordering, mutation, and complexity. Record every assumption the
   implementation does not validate.
5. Confirm every TODO is explicit and every existing comment remains true.
6. Run the configured formatter, documentation linter, and language checks.

Do not report the work complete because the linter passed. Report both the tool
result and the changed-file comment audit.
