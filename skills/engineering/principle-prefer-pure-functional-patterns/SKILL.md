---
name: principle-prefer-pure-functional-patterns
description: Prefer pure calculations and explicit effects when creating, changing, reviewing, or diagnosing transformations, validators, reducers, pipelines, or state changes. Preserve the domain's command and ownership contracts.
---

# Prefer pure functional patterns

Prefer calculations whose results depend on explicit inputs and which leave
caller-owned state unchanged. Keep external effects visible. This principle
does not choose the domain's public API, require a functional library, or make
every operation a pipeline.

## Separate calculation from ownership

Use ordinary functions and the project's existing error convention for
calculations and validation. A method may be just as clear as a free function.
Compose operations when composition helps the actual caller; fallibility alone
does not require currying, a modifier namespace, or a generic result wrapper.

Domain objects own their commands, invariants, and consequences. An isolated
mutable Edit is a valid authoring mechanism for immutable snapshots. Its
commands may update owned working state while leaving the source and retained
observations unchanged. Do not replace that API with a parallel set of pure
commands. Local mutation of unshared working storage can also implement a pure
calculation without repeatedly copying the whole input.

Use `domain-modeling` when deciding business behavior. Use the repository's
specific domain conventions for construction and transition signatures.

## Make the purity claim precise

- Pass decision-sensitive time, configuration, policy, and external facts as
  inputs. Keep clock reads, identity generation, and I/O in their named owners;
  do not call an effectful constructor pure because it returns a value.
- A copied container can still alias nested storage. Copy what the operation
  owns or use the other owner's public copying contract. Do not reach into
  another model's representation to implement a generic deep copy.
- Accumulate independent validation problems. Stop dependent work when its
  prerequisite fails, preserving the project's expected-error vocabulary.
- Preserve the failure boundary the operation promises. A rejected command must
  not leave half its changes or facts behind. In an Edit, that does not imply
  discarding earlier accepted commands.
- Make no-op behavior explicit in the domain contract. Do not manufacture
  changes or facts for a no-op unless recording the attempt is itself required.

## Keep consequences and delivery distinct

The domain computes required consequences along with the change that causes
them. Use its existing result, ledger, or pending-event contract. Do not invent
`Change`, `EmittingModifier`, or another carrier merely because events exist.

In-memory accumulation is not external delivery. It must respect ownership and
failure isolation, but need not be replaced by a different return type. Sending
to a channel or broker and writing a database are effects that cannot be undone
by discarding a calculation or Edit.

The application or adapter owns durable settlement and delivery. If state and
messages must become durable together, prove that guarantee at the transaction
boundary, using the project's delivery mechanism. An in-memory success or
receipt alone proves neither persistence nor atomicity.

## Apply only the relevant detail

Consult the language reference when language-specific copying, error, or
composition choices matter. Ordinary domain work need not load a catalog of
functional machinery.

- [Go](references/go.md)
- [Python](references/python.md)
- [TypeScript](references/typescript.md)

Use `principle-testing-guidelines` for behavioral proof. Assert actual results,
relevant non-mutation, and the promised failure boundary. Test ordering and
short-circuiting when they affect the operation. Shared helper laws belong with
a helper that is actually used, not in every domain's tests.
