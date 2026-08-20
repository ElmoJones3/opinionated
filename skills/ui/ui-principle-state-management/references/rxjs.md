# RxJS state streams

Use RxJS when state is the result of ongoing events and correctness depends on time, ordering, cancellation, or several producers. SSE, webhook delivery, live device events, debounced input, chained prop changes, and coordinated animation belong here.

Do not use RxJS for a finite local transition model that an Immer reducer expresses plainly.

## Contents

- [Export the stream](#export-the-stream)
- [Test emissions, time, and subscriptions](#test-emissions-time-and-subscriptions)
- [Official references](#official-references)

## Export the stream

Keep the observable pipeline outside React. Accept observable inputs and return observable state.

```ts
import { scan, startWith, type Observable } from 'rxjs'

type FeedEvent =
  | { type: 'connected' }
  | { type: 'itemReceived'; item: string }
  | { type: 'disconnected' }

type FeedState = {
  connection: 'connecting' | 'connected' | 'disconnected'
  items: readonly string[]
}

export const initialFeedState: FeedState = {
  connection: 'connecting',
  items: [],
}

export function createFeedState(events$: Observable<FeedEvent>): Observable<FeedState> {
  return events$.pipe(
    scan((state: FeedState, event): FeedState => {
      switch (event.type) {
        case 'connected':
          return { ...state, connection: 'connected' }
        case 'itemReceived':
          return { ...state, items: [...state.items, event.item] }
        case 'disconnected':
          return { ...state, connection: 'disconnected' }
      }
    }, initialFeedState),
    startWith(initialFeedState),
  )
}
```

React is an adapter. With React-RxJS, expose the underlying observable beside the hook:

```ts
import { bind } from '@react-rxjs/core'
import { createSignal } from '@react-rxjs/utils'

export const [feedEvent$, emitFeedEvent] = createSignal<FeedEvent>()
export const [useFeedState, feedState$] = bind(
  createFeedState(feedEvent$),
  initialFeedState,
)
```

Use `observable-hooks` when the repository already uses it or when a stream is scoped to component props and events. Extract the pipeline function anyway. The hook connects inputs and subscriptions; the pipeline remains independently testable.

If neither binding exists, prefer React-RxJS for module-level or shared streams:

```bash
pnpm add rxjs @react-rxjs/core @react-rxjs/utils
```

Prefer `observable-hooks` for a stream created and destroyed with one component:

```bash
pnpm add rxjs observable-hooks
```

## Test emissions, time, and subscriptions

Use `TestScheduler.run`. Feed the stream hot or cold inputs and assert its exact output sequence.

```ts
import { TestScheduler } from 'rxjs/testing'
import { describe, expect, it } from 'vitest'

describe('createFeedState', () => {
  it('reduces feed events into emitted state', () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected)
    })

    scheduler.run(({ expectObservable, hot }) => {
      const connected: FeedEvent = { type: 'connected' }
      const item: FeedEvent = { type: 'itemReceived', item: 'alpha' }
      const disconnected: FeedEvent = { type: 'disconnected' }

      const events$ = hot('-a-b-c-|', {
        a: connected,
        b: item,
        c: disconnected,
      })

      expectObservable(createFeedState(events$)).toBe('sa-b-c-|', {
        s: initialFeedState,
        a: { connection: 'connected', items: [] },
        b: { connection: 'connected', items: ['alpha'] },
        c: { connection: 'disconnected', items: ['alpha'] },
      })
    })
  })
})
```

For `switchMap`, retries, SSE reconnects, and waterfall cancellation, assert subscription diagrams as well as emissions. For animation-frame pipelines, use the `animate` helper inside `TestScheduler.run`.

Do not render a component and wait on fake timers to prove stream behavior. A thin React test may cover subscription wiring after the observable tests pass.

## Official references

- [RxJS marble testing](https://rxjs.dev/guide/testing/marble-testing)
- [RxJS TestScheduler](https://rxjs.dev/api/testing/TestScheduler)
- [React-RxJS core concepts](https://react-rxjs.org/docs/core-concepts)
- [React-RxJS getting started](https://react-rxjs.org/docs/getting-started)
- [Observable Hooks core API](https://observable-hooks.js.org/api/)
