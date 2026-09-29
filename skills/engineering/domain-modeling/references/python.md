# Python domain ownership

Use this reference for Python-specific construction and ownership questions.
Follow the project's existing validation and error conventions rather than
introducing Pydantic, a result library, or a functional framework for this skill.

## Construction and behavior

Expose factories and named behavior through the package's intended public API.
Keep representation helpers and adapter restoration out of ordinary exports.
Python's underscore convention is not access control; state the architectural
boundary honestly rather than claiming callers cannot bypass it.

If the project uses Pydantic, validated shape is not proof of an earned
transition. A model that accepts a valid locked account record still needs
behavior that decides when an active account becomes locked. Unchecked
construction and copy-with-update helpers must not become that behavior.

Use methods or value transformations according to the domain contract.
An Edit may own mutable working state while exposing independent snapshots.
Do not add curried command factories solely because a method can refuse input.

## Ownership and errors

Frozen dataclasses and frozen models can contain mutable lists, dictionaries,
or nested objects. Use owned collections or immutable representations where
observations must remain stable. A shallow copy of a container does not isolate
its mutable elements. Delegate copying of other domain values to their owners.

Use the project's expected-refusal convention, whether typed exceptions or
result values. Preserve stable failure identity and the previously accepted
state. Do not catch every exception and relabel programmer defects as expected
business refusals.

## Restoration proof

Adapters map stored data into the owner's validated restoration capability.
Restore recorded facts without generating new creation consequences. Follow
`principle-test-fixtures` when using restored state in tests. A valid snapshot
can stage later behavior without proving the earlier creation or transition.
