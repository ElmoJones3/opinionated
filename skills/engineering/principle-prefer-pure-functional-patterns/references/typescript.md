# Pure calculations in TypeScript

Use ordinary functions and the project's existing expected-error convention.
Neither a possible refusal nor a returned domain fact requires fp-ts, Effect,
a modifier API, or a new generic carrier.

## Values and ownership

`readonly` does not freeze runtime values. Object spread is shallow, and
Date, Map, Set, nested objects, and arrays can still mutate. Use owned copies
or immutable representations where required by the operation's contract.
Delegate copying of another domain's values to that owner.

A loop may mutate a fresh local result without mutating caller input.
An Edit may own mutable candidates while preserving its source and retained
snapshots. Do not turn either case into repeated whole-collection copies.

## Composition and effects

Use established pipe, flow, or result combinators when the task benefits from
composition. Preserve order and expected failure behavior. Do not introduce
currying merely to put an ordinary method through a pipeline.

A Promise, observable, or effect type does not establish purity. Separate the
calculation from subscription, scheduling, cancellation, and resource ownership.
Reducers can be tested independently of those mechanisms. Pending domain
facts use the owner's existing contract; external delivery remains an effect.
