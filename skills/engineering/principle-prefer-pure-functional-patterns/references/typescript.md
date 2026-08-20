# TypeScript reference

Use this reference when creating or reviewing a TypeScript transformation.

Readonly types document intent but do not freeze runtime values. Object spread is shallow, arrays have mutating methods, and `Date` remains mutable. Return fresh nested values and keep ambient time outside the transformation.

## A hidden, stateful operation

This version mutates its argument, reads the clock and module configuration, then performs I/O:

```ts
async function scheduleRenewal(change: Renewal): Promise<void> {
  change.plan = defaultPlan
  change.startsAt = addDays(new Date(), 7).toISOString()
  change.tags.push('scheduled')
  await repository.save(change)
}
```

Tests must replace the clock, configuration, and repository. A spread such as `{ ...change }` would still share `tags`.

## Compose fallible value transformations

Use functions and readonly values. This example uses exceptions because the sequence is synchronous and fail-fast. Preserve an established result type when the repository already has one.

```ts
import { addDays } from 'date-fns'

export interface Renewal {
  readonly plan: 'basic' | 'pro'
  readonly startsAt?: string
  readonly tags: readonly string[]
}

export type Modifier<T> = (value: T) => T

export function apply<T>(initial: T, ...modifiers: readonly Modifier<T>[]): T {
  return modifiers.reduce((state, modify) => modify(state), initial)
}

export function withPlan(plan: string): Modifier<Renewal> {
  return change => {
    if (plan !== 'basic' && plan !== 'pro') {
      throw new Error(`unknown plan ${JSON.stringify(plan)}`)
    }
    return { ...change, plan }
  }
}

export function startingIn(now: Date, days: number): Modifier<Renewal> {
  return change => {
    if (days < 0) {
      throw new Error('renewal delay must not be negative')
    }
    return { ...change, startsAt: addDays(now, days).toISOString() }
  }
}

export function withTag(tag: string): Modifier<Renewal> {
  return change => {
    if (!tag) {
      throw new Error('tag is required')
    }
    return { ...change, tags: [...change.tags, tag] }
  }
}
```

The caller owns time and persistence:

```ts
const nextChange = apply(
  current,
  withPlan('pro'),
  startingIn(now, 7),
  withTag('scheduled'),
)
await repository.save(nextChange)
```

date-fns functions return new dates, but the supplied `Date` can still be mutated elsewhere. Create the clock value at the boundary, pass it into the transformation, and store an immutable representation when later mutation would be unsafe.

Do not add a `pipe` or result library for a fixed sequence that reads clearly as ordinary calls. Shared signatures and caller-selected composition justify the helper.

## Reuse configured rules

Keep rules independent of field paths and presentation:

```ts
export interface Problem {
  readonly rule: string
  readonly message: string
}

export type Rule<T> = (value: T) => Problem | undefined

export function oneOf<T>(...allowed: readonly T[]): Rule<T> {
  return value =>
    allowed.includes(value)
      ? undefined
      : { rule: 'one_of', message: 'must be an allowed value' }
}
```

A fail-fast guard and an accumulating form validator can evaluate the same rule. The validation principle owns when to choose each policy.

## Keep stream decisions pure

An Observable owns subscription, timing, cancellation, and resource effects. The state transition inside it can remain pure:

```ts
type RenewalEvent =
  | { readonly type: 'scheduled'; readonly startsAt: string }
  | { readonly type: 'tagged'; readonly tag: string }

export function reduceRenewal(state: Renewal, event: RenewalEvent): Renewal {
  switch (event.type) {
    case 'scheduled':
      return { ...state, startsAt: event.startsAt }
    case 'tagged':
      return { ...state, tags: [...state.tags, event.tag] }
  }
}

const state$ = events$.pipe(scan(reduceRenewal, initialRenewal))
```

Test `reduceRenewal` with ordinary values. Test the Observable separately when ordering, cancellation, or time affects correctness. The state-management principle owns whether RxJS is the right state model.

## Test the contract

```ts
import { describe, expect, it, vi } from 'vitest'

describe('renewal transformations', () => {
  it('is deterministic and keeps its input unchanged', () => {
    const now = new Date('2026-08-20T09:00:00.000Z')
    const current: Renewal = {
      plan: 'basic',
      tags: ['customer-requested'],
    }

    const nextChange = apply(
      current,
      withPlan('pro'),
      startingIn(now, 7),
      withTag('scheduled'),
    )

    expect(nextChange).toEqual({
      plan: 'pro',
      startsAt: '2026-08-27T09:00:00.000Z',
      tags: ['customer-requested', 'scheduled'],
    })
    expect(current).toEqual({
      plan: 'basic',
      tags: ['customer-requested'],
    })
  })

  it('stops after a failure', () => {
    const afterFailure = vi.fn((change: Renewal) => change)

    expect(() =>
      apply(
        { plan: 'basic', tags: [] },
        withPlan('enterprise'),
        afterFailure,
      ),
    ).toThrow('unknown plan')
    expect(afterFailure).not.toHaveBeenCalled()
  })
})
```

`Object.freeze` is shallow and does not make `Date`, arrays, maps, or nested objects immutable. Prefer fresh nested values. Add runtime freezing only when the repository already uses it or external callers require enforcement.
