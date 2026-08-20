---
name: ui-principle-state-management
description: Choose the owner and model for React state. Mandatory when creating, changing, or reviewing a component that owns interactive behavior, stores or derives state, consumes ongoing events, or coordinates animation.
---

# Choose the state owner, then the model

Do not add component state until its owner is clear. Keep state with the system that already controls its lifecycle.

## Respect existing owners

- Server data belongs to the repository's query library.
- Shareable navigation state belongs to the URL through the repository's router.
- Form values, validation, touched state, and submission state belong to the form library.
- Component state begins only after those owners are ruled out.

Do not mirror owner-managed values into React state. Read [references/owner-libraries.md](references/owner-libraries.md) when server data, URL state, or forms are involved.

## Choose the application-owned model

Evaluate these models in order:

1. Use RxJS when correctness depends on a stream of values over time. Ordering, cancellation, fan-in, throttling, debouncing, SSE, webhook delivery, chained prop changes, and coordinated animation qualify. Read [references/rxjs.md](references/rxjs.md).
2. Use an exported Immer-wrapped reducer for finite event-driven behavior. This is the default for stateful components. Read [references/immer-reducer.md](references/immer-reducer.md).
3. Use a named Immer producer for the small remainder with one local state tree and no meaningful event graph. Read [references/immer-local.md](references/immer-local.md).

Immer is the default. RxJS is the exception for streams. Do not write object-spread React state updates, synchronize several `useState` calls, or hide transitions inside event handlers.

## Keep state finite

- Store the smallest complete state.
- Group values that change together.
- Use one status union instead of contradictory booleans.
- Compute derived values during render or in a selector.
- Do not mirror props unless the prop is explicitly an initial value whose later updates are ignored.
- Keep effects out of reducers and producers. Effects synchronize committed state with an external system.

`ui-component-variants` maps state to visual output. It does not own the behavioral state or its transitions.

## Test the state model directly

Load `principle-testing-guidelines`. Use `principle-test-proof-state-transitions` for reducers and producers, `principle-test-determinism` for timed streams, and `principle-test-boundaries` for UI wiring or external owners.

Every application-owned state model requires direct tests:

- Reducer tests pass current state and an event, then assert the exact next state.
- RxJS tests pass an input sequence and assert the emitted state sequence. Use `TestScheduler.run` for time, cancellation, and subscription behavior.
- Plain Immer tests call the named producer and assert the exact next state.
- Owner-library tests cover application validators, adapters, and transformations. Do not retest the library's internal state machine.

Component click tests may prove that UI wiring dispatches an event. They never replace state-transition tests.

## Finish the work

- The state lives with its rightful owner.
- The model is RxJS, an Immer reducer, or a named Immer producer for a stated reason.
- State cannot represent contradictory conditions.
- Derived values are not stored.
- Effects perform no internal state choreography.
- Direct transition or emission tests pass.
