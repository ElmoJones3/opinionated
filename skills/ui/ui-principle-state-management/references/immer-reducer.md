# Exported Immer reducers

Use an Immer-wrapped reducer for component behavior expressed as events and transitions. Export the reducer. React and the tests must call the same function.

## Contents

- [Define finite state and events](#define-finite-state-and-events)
- [React dispatches events](#react-dispatches-events)
- [Test the transition table](#test-the-transition-table)

## Define finite state and events

Use a status union instead of independent booleans. Name events for what happened or what was requested.

```ts
import { type Immutable, produce } from 'immer'

type PanelState = Immutable<{
  status: 'closed' | 'opening' | 'open' | 'closing'
}>

type PanelEvent =
  | { type: 'openRequested' }
  | { type: 'closeRequested' }
  | { type: 'animationFinished' }

export const initialPanelState: PanelState = {
  status: 'closed',
}

export const reducePanel = produce<PanelState, [PanelEvent]>((draft, event) => {
  switch (event.type) {
    case 'openRequested':
      if (draft.status === 'closed') draft.status = 'opening'
      break
    case 'closeRequested':
      if (draft.status === 'open') draft.status = 'closing'
      break
    case 'animationFinished':
      if (draft.status === 'opening') draft.status = 'open'
      if (draft.status === 'closing') draft.status = 'closed'
      break
    default: {
      const unhandled: never = event
      return unhandled
    }
  }
})
```

The producer returns a normal `(state, event) => nextState` reducer. Immer owns immutable copying. The recipe mutates only its draft.

## React dispatches events

```tsx
function Panel() {
  const [state, dispatch] = React.useReducer(reducePanel, initialPanelState)

  return (
    <motion.aside
      animate={state.status}
      onAnimationComplete={() => dispatch({ type: 'animationFinished' })}
    >
      <button onClick={() => dispatch({ type: 'closeRequested' })}>Close</button>
    </motion.aside>
  )
}
```

Event handlers dispatch. They do not calculate the next state. Reducers do not fetch, schedule timers, call browser APIs, or start animations.

## Test the transition table

```ts
import { describe, expect, it } from 'vitest'

describe('reducePanel', () => {
  it('starts opening when requested', () => {
    expect(reducePanel(initialPanelState, { type: 'openRequested' })).toEqual({
      status: 'opening',
    })
  })

  it('finishes the opening animation', () => {
    const opening = reducePanel(initialPanelState, { type: 'openRequested' })

    expect(reducePanel(opening, { type: 'animationFinished' })).toEqual({
      status: 'open',
    })
  })

  it('ignores close requests while already closed', () => {
    const closed = initialPanelState

    expect(reducePanel(closed, { type: 'closeRequested' })).toBe(closed)
  })
})
```

Cover every allowed transition and every important rejected transition. Assert exact state. Test reference identity for deliberate no-op events.

A component test may assert that a button dispatches `closeRequested`. It does not replace the reducer tests.

## Official references

- [Immer with React and reducers](https://immerjs.github.io/immer/example-setstate/)
- [Immer curried producers](https://immerjs.github.io/immer/curried-produce/)
- [Immer TypeScript guidance](https://immerjs.github.io/immer/typescript/)
- [React reducer guidance](https://react.dev/learn/extracting-state-logic-into-a-reducer)
