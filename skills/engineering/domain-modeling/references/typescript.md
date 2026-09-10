# TypeScript domain ownership

Use this reference for TypeScript-specific construction and ownership questions.
Follow the project's existing runtime validation and error conventions. This
skill does not require Zod, fp-ts, Effect, or a class hierarchy.

## Construction and behavior

A TypeScript interface does not validate runtime input or prevent a matching
object literal from being created. Use the project's factory, private class
state, or opaque-value convention to distinguish constructed domain values
from input data. A type assertion does not earn a domain state.

Schema validation proves shape, not transition legality. Keep restoration
behind the adapter-facing entry point rather than exporting a parser as an
alternative command API. A declared domain import format remains a legitimate
construction path under its own contract.

Use named methods or value transformations for behavior. An Edit can own
mutable working state while snapshots expose only the intended observations.
Do not mirror its commands on the immutable snapshot to satisfy a functional
style preference.

## Ownership and errors

`readonly` is a compile-time restriction. Object spread and runtime freezing
are shallow; nested arrays, objects, Maps, Sets, and Dates may still mutate.
Use owner-provided observations and copying operations where isolation matters.
Do not reconstruct another domain's representation with object spread.

Use the project's existing typed-error or result convention for expected
refusals. A possible refusal does not require a new Either or modifier wrapper.
Promises and effect wrappers describe execution contracts, not proof of purity.

## Restoration proof

Restore recorded identity and history through validated domain-owned machinery,
without replaying creation. Use public behavior for ordinary fixtures. Test
retained snapshots and rejected operations against independently observed
before-state, not only against an alias of the same object.
