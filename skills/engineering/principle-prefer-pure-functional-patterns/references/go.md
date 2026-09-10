# Pure calculations in Go

Use ordinary functions and `(value, error)` where refusal is part of the
contract. A domain method can use the same convention. Go does not require
currying or generic result types to make a calculation testable.

## Copy only what ownership requires

Slices, maps, pointers, and interface values can retain aliases after a struct
copy. An in-place sort of an input slice is observable mutation. Copy the
owner's storage before changing it, or request the other owner's public copy.

A loop that builds a new local result is compatible with pure calculation.
It need not allocate a new whole result per iteration. An isolated Edit may
similarly mutate owned candidate state without mutating its source snapshot.

## Composition when it is the task

Use the project's existing composition helper when callers actually compose
transformations. Preserve its ordering, error, and ownership contract. A loop
over successful values does not roll back mutations already made through
shared pointers or I/O. Returning a zero value on error cannot undo those
effects.

Domain Commands need not become modifiers to gain those guarantees. Keep
pending facts in the existing domain contract and test the complete refusal
boundary there.

## Effects

Clock reads and random identity generation are effects even without I/O.
Keep decision-sensitive values explicit, while retaining established ownership
of construction and audit mechanics. Channel sends, database writes, and
broker delivery belong to effect-owning code. Transactions remain with the
effect owner. Context-bearing calculations and domain operations still follow
[principle-golang-respect-context](../../principle-golang-respect-context/SKILL.md);
returning a value does not exempt an operation from its request lifetime.
