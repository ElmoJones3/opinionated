# Go domain ownership

Use this reference for Go-specific construction and ownership questions.

For operations that accept or retain a context, load
[principle-golang-respect-context](../../principle-golang-respect-context/SKILL.md).
This includes construction and restoration, not only I/O. It does not add a
context argument to ordinary values, bare seeds or observations.

## Construction and ports

Keep representation fields unexported. Go permits a zero struct value even
with private fields, so distinguish an invalid zero or bare seed from a fully
constructed value. Make that distinction observable through the public
contract rather than trusting callers to remember a comment.

When a package owns a behavioral port, factories return that interface and the
implementation asserts conformance. Interfaces do not make values immutable;
method capabilities and ownership do. Shared immutable value types can remain
concrete. Keep implementation imports out of the contract package.

A complete construction factory takes the project's inputs and returns its
complete result. Methods may return `(Value, error)`, update an isolated
receiver, or expose an Edit according to the domain contract. None of these
requires returning a function.

## Ownership and refusal

A struct assignment copies slice headers, maps, interfaces, and pointers, not
their referenced storage. Value receivers alone do not establish isolation.
Copy owned mutable storage before a change can affect another observation.
Use another owner's public copy or observation contract instead of reaching
into its fields. Sharing immutable values is safe.

Check a proposed transition before installing it in the receiver. If validation
or consequence construction can fail, preserve the last accepted state and
pending facts. An earlier successful Edit command remains accepted when a later
command is refused, unless the operation explicitly promises whole-session
rollback.

Use ordinary Go errors with stable domain identity for expected refusals. A
nil concrete pointer stored in an interface is not a nil interface. Return
literal nil for failed port construction and use the project's interface
validation helper at input boundaries.

## Restoration and observations

Go has no friend packages. An exported restoration function for an adapter
therefore needs an explicit architectural boundary in addition to validation.
Restore recorded identity and lifecycle without replaying creation. Do not use
that path to stage normal behavior tests.

A port handle can alias one Edit or pending-event collector. Document which
methods observe, transfer work, or consume the session. Returning a port is not
proof that a retained observation survives subsequent commands unchanged.
