# TypeScript reference

Use this reference when choosing or implementing a pure TypeScript pattern.

## Defaults

| Operation owes | Use |
| --- | --- |
| one calculated value | an ordinary function; `fp-ts/function.pipe` for a named pipeline |
| a converted value that may be refused | an ordinary function returning `Either<E, U>` |
| reusable constraints | a rule function plus a fail-fast or accumulating evaluator |
| state folded from accepted inputs | a total pure reducer |
| state or an expected refusal | `Modifier`, `apply`, and `fp-ts/Either` |
| a value plus ordered facts with no refusal | `Change<U, F>` directly |
| state plus ordered facts or a receipt | `EmittingModifier`, `applyEmitting`, `fp-ts/Either`, and a readonly `Change` |
| values over time | RxJS or the chosen stateful shell around a pure reducer |

Readonly types document intent but do not freeze runtime values. Object spread is shallow, arrays have mutating methods, and `Date`, `Map`, and `Set` remain mutable. Return fresh nested values and store immutable representations when aliases would be unsafe.

The emitting contract is WriterT-over-Either in the literature. Implement it as one concrete `Change` inside the already-standard `Either`; do not expose fp-ts's HKT machinery or add another library.

## Keep effects outside

Bad code mutates its argument, reads ambient inputs, persists, and publishes:

```ts
async function scheduleRenewal(change: Renewal): Promise<void> {
  change.startsAt = addDays(new Date(), 7).toISOString()
  change.tags.push('scheduled')
  await repository.save(change)
  events.emit('renewalScheduled', change)
}
```

Read time, configuration, authorization, and stored data at the application boundary. Pass plain values into a pure function. Repositories and emitters run only after the result succeeds.

## State-only modifiers

Use one shared generic contract:

```ts
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export type Modifier<T, DomainError> =
  (value: T) => E.Either<DomainError, T>

export function apply<T, DomainError>(
  initial: T,
  ...modifiers: readonly Modifier<T, DomainError>[]
): E.Either<DomainError, T> {
  return modifiers.reduce<E.Either<DomainError, T>>(
    (state, modify) => pipe(state, E.chain(modify)),
    E.right(initial),
  )
}
```

Use it when success owes only the next value:

```ts
export function withTag(tag: string): Modifier<Renewal, RenewalError> {
  return current =>
    tag.length === 0
      ? E.left({ code: 'missing_tag' })
      : E.right({ ...current, tags: [...current.tags, tag] })
}
```

Use discriminated domain error unions for stable failure identity. Expected business refusals are `Left` values. Programmer defects still throw. Untrusted construction and hydration failures use the model's schema convention, not a transition `Left`.

Keep a total calculation as an ordinary function. Use `apply` when a state change has an expected refusal, including a single modifier, so the call site and later composition keep one contract.

## Emitting modifiers

Use the emitting branch when success also owes domain facts:

```ts
export interface Change<T, Fact> {
  readonly value: T
  readonly facts: readonly Fact[]
}

export type EmittingModifier<T, DomainError, Fact> =
  (value: T) => E.Either<DomainError, Change<T, Fact>>

export function liftModifier<T, DomainError, Fact>(
  modify: Modifier<T, DomainError>,
): EmittingModifier<T, DomainError, Fact> {
  return value =>
    pipe(
      modify(value),
      E.map(next => ({ value: next, facts: [] })),
    )
}

export function applyEmitting<T, DomainError, Fact>(
  initial: T,
  ...modifiers: readonly EmittingModifier<T, DomainError, Fact>[]
): E.Either<DomainError, Change<T, Fact>> {
  let current = initial
  let facts: readonly Fact[] = []

  for (const modify of modifiers) {
    const result = modify(current)
    if (E.isLeft(result)) return result
    current = result.right.value
    facts = [...facts, ...result.right.facts]
  }

  return E.right({ value: current, facts })
}
```

Each modifier returns only its local facts:

```ts
export type RenewalFact =
  | { readonly type: 'renewalScheduled'; readonly startsAt: string }
  | { readonly type: 'renewalTagged'; readonly tag: string }

export function withSchedule(
  now: Date,
  days: number,
): EmittingModifier<Renewal, RenewalError, RenewalFact> {
  return current => {
    if (days < 0) return E.left({ code: 'negative_delay' })
    const startsAt = addDays(now, days).toISOString()
    return E.right({
      value: { ...current, startsAt },
      facts: [{ type: 'renewalScheduled', startsAt }],
    })
  }
}

export function withRecordedTag(
  tag: string,
): EmittingModifier<Renewal, RenewalError, RenewalFact> {
  return current => {
    if (tag.length === 0) return E.left({ code: 'missing_tag' })
    return E.right({
      value: { ...current, tags: [...current.tags, tag] },
      facts: [{ type: 'renewalTagged', tag }],
    })
  }
}
```

The result carrier is outside `Change`: `Either<Error, [Value, Facts]>`, not `[Either<Error, Value>, Facts]`. A final `Left` therefore exposes neither earlier facts nor tentative state.

The laws are part of the helper's contract:

- `applyEmitting(initial)` returns `initial` and `[]`.
- Modifiers run left to right; later modifiers receive the previous successful value.
- Facts preserve modifier order and within-modifier order. Duplicates remain unless the domain forbids them.
- A no-op normally returns the unchanged value and no facts.
- The first `Left` wins; later modifiers do not run.
- A late `Left` exposes no earlier tentative value or facts.
- This is logical rollback, not compensation. It requires fresh values and no I/O.

Facts are readonly, discriminated domain values, not logs, `EventEmitter` payloads, RxJS notifications, or broker messages.

Use `liftModifier` when an independently valid state-only modifier participates in one emitting pipeline. Do not run two pipelines or duplicate the modifier. If a state change forces a fact, keep both in one emitting modifier rather than lifting the state-only half.

## Existing library roles

- `fp-ts/Either` is the canonical expected-failure carrier.
- `fp-ts/WriterT` describes the algebra but should not leak into domain APIs.
- `TaskEither` belongs to asynchronous application settlement, not pure modifiers.
- Effect can encode the same success value when it already owns the application runtime. Do not add Effect for this pattern, and do not mistake `R = never` for proof of purity. `Ref`, `Queue`, `PubSub`, logging, and `Effect.sync` are effectful.
- RxJS owns streams, subscription, cancellation, and timing. Keep its `scan` reducer pure.
- Lodash `flow` and `fp-ts/function.pipe` are total-composition helpers, not failure carriers.
- date-fns is preferred for date calculations, but its `Date` inputs remain mutable JavaScript objects.

## Rules and reducers

A rule returns a structured problem or `undefined`:

```ts
export type Rule<T> = (value: T) => Problem | undefined
```

Keep field paths and presentation in the evaluator. Accumulate independent problems; fail fast when a later transformation depends on the current one.

An Observable may own the stateful lifecycle while its reducer stays pure:

```ts
export function reduceRenewal(state: Renewal, event: RenewalInput): Renewal {
  switch (event.type) {
    case 'tagged':
      return { ...state, tags: [...state.tags, event.tag] }
    case 'scheduled':
      return { ...state, startsAt: event.startsAt }
  }
}

const renewal$ = inputs$.pipe(scan(reduceRenewal, initialRenewal))
```

Test the reducer directly. Test the Observable only for claims involving ordering, cancellation, timing, or subscription behavior.

## Settle after pure success

```ts
const result = applyEmitting(
  current,
  withSchedule(now, days),
  withRecordedTag('scheduled'),
)
if (E.isLeft(result)) return result

await settlement.settleRenewal(result.right)
```

`settleRenewal` accepts the complete `Change` and writes the state plus mapped outbox records in one real transaction. An `EventEmitter`, RxJS subject, Effect queue, or broker client belongs after settlement. Map domain facts to integration messages outside the domain module. If state and delivery must become durable together, use the real transaction and an outbox. Delivery retries, duplicates, and idempotency remain adapter concerns.

## Prove the contracts

When the shared helpers are created or changed, put their law suite beside the functional module. Do not rely on domain tests to cover generic composition. Direct tests must prove exact values, exact error codes, order, short-circuiting, and non-mutation. For emitting pipelines, also prove:

- exact ordered facts across several modifiers;
- a successful no-fact modifier preserves the accumulator;
- a late failure returns the exact `Left`, exposes no earlier facts, and skips later work;
- original nested arrays, objects, maps, sets, and dates are not mutated; and
- programmer exceptions are not converted into domain `Left` values.

Test settlement separately. A focused boundary test proves `Left` never invokes settlement and `Right` supplies the exact change once. Use an integration test only for a guarantee owned by the real system, such as state and outbox rows committing or rolling back together. Never hand-shape a fixture into an impossible production state to make that proof pass.

## Pattern sources

- [`fp-ts/WriterT`](https://gcanti.github.io/fp-ts/modules/WriterT.ts.html) defines `WriterT` as an outer carrier containing `[value, output]`; [`fp-ts/Either`](https://gcanti.github.io/fp-ts/modules/Either.ts.html) supplies the fail-fast outer carrier.
- [`ReadonlyArray.getMonoid`](https://gcanti.github.io/fp-ts/modules/ReadonlyArray.ts.html#getmonoid) defines ordered fact concatenation and its empty identity.
- [Effect's effect type](https://www.effect.website/docs/getting-started/the-effect-type/) and its [`Ref`](https://www.effect.website/docs/state-management/ref/), [`Queue`](https://www.effect.website/docs/concurrency/queue/), and [`PubSub`](https://www.effect.website/docs/concurrency/pubsub/) facilities show why `R = never` and effectful accumulators are not proof of purity.
- [Transactional outbox guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) defines the atomic durability and idempotent-consumer concerns that begin after pure planning.
