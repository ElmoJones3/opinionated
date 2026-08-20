# Go reference

Use this reference when creating or reviewing a Go transformation.

Go makes value-returning functions cheap to describe, but a copied struct may still share slices, maps, or pointers with its input. Purity is an observable contract. Copy referenced storage before changing it.

## A hidden, stateful operation

This version mixes calculation, ambient time, mutation, and persistence. Tests must control global state and inspect a repository just to prove the date calculation.

```go
func ScheduleRenewal(change *Renewal) error {
	change.Plan = defaultPlan
	change.StartsAt = time.Now().Add(7 * 24 * time.Hour)
	change.Tags = append(change.Tags, "scheduled")
	return repository.Save(change)
}
```

## Compose fallible value transformations

Use a modifier pipeline when callers select or reuse an ordered set of transformations. Keep every modifier pure and make failure stop the remaining work.

```go
package renewals

import (
	"fmt"
	"slices"
	"time"
)

type Renewal struct {
	Plan     string
	StartsAt time.Time
	Tags     []string
}

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

func WithPlan(plan string) Modifier[Renewal] {
	return func(change Renewal) (Renewal, error) {
		if plan != "basic" && plan != "pro" {
			return Renewal{}, fmt.Errorf("unknown plan %q", plan)
		}
		change.Plan = plan
		return change, nil
	}
}

func StartingIn(now time.Time, delay time.Duration) Modifier[Renewal] {
	return func(change Renewal) (Renewal, error) {
		if delay < 0 {
			return Renewal{}, fmt.Errorf("renewal delay must not be negative")
		}
		change.StartsAt = now.Add(delay)
		return change, nil
	}
}

func WithTag(tag string) Modifier[Renewal] {
	return func(change Renewal) (Renewal, error) {
		if tag == "" {
			return Renewal{}, fmt.Errorf("tag is required")
		}
		change.Tags = append(slices.Clone(change.Tags), tag)
		return change, nil
	}
}
```

The caller owns the clock and persistence:

```go
next, err := Apply(
	current,
	WithPlan("pro"),
	StartingIn(now, 7*24*time.Hour),
	WithTag("scheduled"),
)
if err != nil {
	return err
}
return repository.Save(ctx, next)
```

`Apply` returns Go's zero value after a failed modifier. That is this helper's contract, not a rule for every language or repository. If the repository already returns the last valid value or a result type, preserve that contract.

Use ordinary calls when the sequence is fixed and already readable. A pipeline earns its name when transformations share a signature and callers compose them.

## Reuse configured rules

A rule factory captures policy and returns a pure check. Keep the returned problem independent of field names, logging, or transport formatting so different evaluators can reuse it.

```go
type Problem struct {
	Rule    string
	Message string
}

type Rule[T any] func(T) *Problem

func OneOf[T comparable](allowed ...T) Rule[T] {
	return func(value T) *Problem {
		if slices.Contains(allowed, value) {
			return nil
		}
		return &Problem{Rule: "one_of", Message: "must be an allowed value"}
	}
}
```

One evaluator may stop at the first problem while another collects every problem. The rule stays the same. The validation principle owns when each evaluation policy applies.

## Test the contract

Test exact output, short-circuit failure, and referenced storage:

```go
func TestRenewalPipelineIsDeterministicAndDoesNotMutateInput(t *testing.T) {
	now := time.Date(2026, time.August, 20, 9, 0, 0, 0, time.UTC)
	current := Renewal{Plan: "basic", Tags: []string{"customer-requested"}}

	next, err := Apply(
		current,
		WithPlan("pro"),
		StartingIn(now, 7*24*time.Hour),
		WithTag("scheduled"),
	)
	if err != nil {
		t.Fatal(err)
	}

	if next.Plan != "pro" || !next.StartsAt.Equal(now.Add(7*24*time.Hour)) {
		t.Fatalf("unexpected renewal: %+v", next)
	}
	if !slices.Equal(next.Tags, []string{"customer-requested", "scheduled"}) {
		t.Fatalf("unexpected tags: %v", next.Tags)
	}
	if !slices.Equal(current.Tags, []string{"customer-requested"}) {
		t.Fatalf("input was mutated: %v", current.Tags)
	}
}

func TestApplyStopsAfterFailure(t *testing.T) {
	called := false
	afterFailure := func(change Renewal) (Renewal, error) {
		called = true
		return change, nil
	}

	_, err := Apply(Renewal{}, WithPlan("enterprise"), afterFailure)
	if err == nil {
		t.Fatal("expected invalid plan to fail")
	}
	if called {
		t.Fatal("modifier after failure was called")
	}
}
```

Local mutation of a fresh value is fine. Mutation becomes a problem when callers, shared aliases, globals, or external systems can observe it.
