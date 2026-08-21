# Go reference

Use this reference when choosing or implementing a pure Go pattern.

## Defaults

| Operation owes | Use |
| --- | --- |
| one calculated value | an ordinary function |
| a converted value that may be refused | an ordinary `func(T) (U, error)` |
| reusable constraints | `Rule[T]` plus a fail-fast or accumulating evaluator |
| state folded from accepted inputs | a total pure reducer |
| state or an expected refusal | `x.Modifier[T]` and `x.Apply` |
| a value plus ordered facts with no refusal | `x.Change[U, F]` directly |
| state plus ordered facts or a receipt | `x.EmittingModifier[T, F]` and `x.ApplyEmitting` |
| values over time | a stateful shell around a pure reducer |

Go needs no functional library. Use native `(value, error)` returns. That intentionally erases a generic error parameter in favor of Go's standard error vocabulary; use sentinel or typed domain errors when callers and tests need stable identity.

## Keep effects outside

Bad code mixes ambient inputs, mutation, persistence, and publication:

```go
func ScheduleRenewal(change *Renewal) error {
	change.StartsAt = time.Now().Add(7 * 24 * time.Hour)
	change.Tags = append(change.Tags, "scheduled")
	if err := repository.Save(change); err != nil {
		return err
	}
	events <- RenewalScheduled{StartsAt: change.StartsAt}
	return nil
}
```

A channel send is an effect. If a later step fails, it cannot be recalled. Read time and external state at the application boundary, then pass plain values into a pure transformation.

## State-only modifiers

Put the shared contract in a leaf utility package:

```go
package x

type Modifier[T any] func(T) (T, error)

func Apply[T any](initial T, modifiers ...Modifier[T]) (T, error) {
	state := initial
	for _, modify := range modifiers {
		next, err := modify(state)
		if err != nil {
			var zero T
			return zero, err
		}
		state = next
	}
	return state, nil
}
```

Use it when success owes only the next value:

```go
func WithTag(tag string) x.Modifier[Renewal] {
	return func(current Renewal) (Renewal, error) {
		if tag == "" {
			return Renewal{}, ErrTagRequired
		}
		next := current
		next.Tags = append(slices.Clone(current.Tags), tag)
		return next, nil
	}
}
```

Keep a total calculation as an ordinary function. Use `Apply` when a state change has an expected refusal, including a single modifier, so the call site and later composition keep one contract.

## Emitting modifiers

Use the emitting branch when success also owes domain facts. This is Writer-style accumulation over Go's fail-fast error return, exposed with domain names:

```go
package x

type Change[T, F any] struct {
	Value T
	Facts []F
}

type EmittingModifier[T, F any] func(T) (Change[T, F], error)

func LiftModifier[F, T any](modify Modifier[T]) EmittingModifier[T, F] {
	return func(value T) (Change[T, F], error) {
		next, err := modify(value)
		if err != nil {
			return Change[T, F]{}, err
		}
		return Change[T, F]{Value: next}, nil
	}
}

func ApplyEmitting[T, F any](
	initial T,
	modifiers ...EmittingModifier[T, F],
) (Change[T, F], error) {
	state := initial
	facts := make([]F, 0)

	for _, modify := range modifiers {
		next, err := modify(state)
		if err != nil {
			var zero Change[T, F]
			return zero, err
		}
		state = next.Value
		facts = append(facts, next.Facts...)
	}

	return Change[T, F]{Value: state, Facts: facts}, nil
}
```

Each modifier returns only its local facts. `ApplyEmitting` owns ordered accumulation:

```go
type RenewalFact interface{ renewalFact() }

type RenewalScheduled struct{ StartsAt time.Time }
func (RenewalScheduled) renewalFact() {}

type RenewalTagged struct{ Tag string }
func (RenewalTagged) renewalFact() {}

func WithSchedule(now time.Time, delay time.Duration) x.EmittingModifier[Renewal, RenewalFact] {
	return func(current Renewal) (x.Change[Renewal, RenewalFact], error) {
		if delay < 0 {
			return x.Change[Renewal, RenewalFact]{}, ErrNegativeDelay
		}
		next := current
		next.StartsAt = now.Add(delay)
		return x.Change[Renewal, RenewalFact]{
			Value: next,
			Facts: []RenewalFact{RenewalScheduled{StartsAt: next.StartsAt}},
		}, nil
	}
}

func WithRecordedTag(tag string) x.EmittingModifier[Renewal, RenewalFact] {
	return func(current Renewal) (x.Change[Renewal, RenewalFact], error) {
		if tag == "" {
			return x.Change[Renewal, RenewalFact]{}, ErrTagRequired
		}
		next := current
		next.Tags = append(slices.Clone(current.Tags), tag)
		return x.Change[Renewal, RenewalFact]{
			Value: next,
			Facts: []RenewalFact{RenewalTagged{Tag: tag}},
		}, nil
	}
}
```

The laws are part of the helper's contract:

- `ApplyEmitting(initial)` returns `initial` and no facts.
- Modifiers run left to right; later modifiers receive the previous successful value.
- Facts preserve modifier order and within-modifier order. Duplicates remain unless the domain forbids them.
- A no-op normally returns the unchanged value and no facts.
- The first error wins; later modifiers do not run.
- Failure returns the zero `Change`, so earlier tentative state and facts are unavailable.
- This is logical rollback, not compensation. It works only when modifiers neither mutate shared storage nor perform I/O.

Facts should be an immutable, domain-specific family, not `any` and not broker payloads. Copy slices, maps, pointers, and mutable fact payloads before returning them.

Use `LiftModifier` when an independently valid state-only modifier participates in one emitting pipeline. Put the fact type first so Go can infer the value type from the modifier:

```go
change, err := x.ApplyEmitting(
	current,
	WithSchedule(now, delay),
	x.LiftModifier[RenewalFact](WithTag("reviewed")),
	WithRecordedTag("scheduled"),
)
```

Do not run two pipelines or duplicate the modifier. If a state change forces a fact, keep both in one emitting modifier rather than lifting the state-only half.

## Rules and reducers

Keep reusable constraints independent of field paths and presentation:

```go
type Problem struct {
	Rule    string
	Message string
}

type Rule[T any] func(T) *Problem
```

A fail-fast guard and an accumulating validator may evaluate the same rule. Accumulate independent problems; fail fast when a later transformation depends on the current one succeeding.

A reducer is an ordinary pure function:

```go
func ReduceBalance(balance Money, entry LedgerEntry) Money {
	return balance.Add(entry.Amount)
}
```

The stream, channel, or subscription owns ordering and cancellation. The reducer owns only the state transition.

## Settle after pure success

`ApplyEmitting` returns pending domain facts. It does not make them durable or deliver them.

```go
change, err := x.ApplyEmitting(current, WithSchedule(now, delay), WithRecordedTag("scheduled"))
if err != nil {
	return err
}

return settlement.SettleRenewal(ctx, change)
```

`SettleRenewal` accepts the complete `Change` and writes the state plus mapped outbox records in one real transaction. Use the project's transaction abstraction or `database/sql`. Watermill's Forwarder is a valid adapter choice when the project already uses Watermill, but it is not a domain dependency. Map domain facts to integration messages outside the domain package. Consumers need stable message IDs and idempotency when delivery is at least once.

## Prove the contracts

When the shared helpers are created or changed, put their law suite in the `x` package. Do not rely on domain tests to cover generic composition. Direct tests must prove exact values, exact error identity, order, short-circuiting, and non-mutation. Use noncommuting modifiers or an explicit call trace when order matters.

For emitting pipelines, add proofs that:

- several successful modifiers produce the exact ordered facts;
- a successful no-fact modifier preserves the accumulator;
- a late failure returns a zero `Change`, exposes no earlier facts, and skips later work; and
- nested mutable storage in the original value and facts is not aliased.

Test settlement separately. A focused boundary test proves failure never invokes settlement and success supplies the exact value and facts once. Use an integration test with the real transaction only when claiming that state and outbox rows commit or roll back together. Delivery retries, duplicates, and ordering need their own adapter proofs.

## Pattern sources

- [WriterT](https://hackage.haskell.org/package/transformers/docs/Control-Monad-Trans-Writer-CPS.html) defines the `m (value, output)` algebra and ordered monoidal accumulation used by `Change`.
- [Go transaction guidance](https://go.dev/doc/database/execute-transactions) defines the commit and rollback boundary used for state plus outbox rows.
- [The Go specification](https://go.dev/ref/spec#Send_statements) makes clear that a channel send is communication and may block, so it belongs outside a pure modifier.
- [Watermill Forwarder](https://watermill.io/advanced/forwarder/) is an optional Go outbox relay when Watermill already fits the adapter layer.
