# Go examples

These are illustrative assertion excerpts, not standalone tests or a required
application API. Fixture fields, budgets, reasons, and capacities are local choices.

## Example setup

Receive SDK exports and introduce delayed, duplicate, or incompatible records
through the wire boundary. Preserve terminal evidence and source age. In the
population case, two measured completions include one that misses both quality
and latency; tracing is unsampled, combined misses equal one, and receiver
coverage remains unknown. Unsupported versions produce a named refusal.

## What the language changes

A zero-valued struct cannot distinguish an omitted assessment from an explicit
zero. Use the contract's presence representation, such as pointers or a validated
optional value. Generic JSON decoding into float64 can lose integer timestamps
and sequence precision. Prefer typed fields or deliberate json.Number admission.

Map iteration does not define record order. Select using declared identity and
sequence, with synchronization when multiple receivers update one accepted view.
Check errors.Is or the project's typed refusal rather than accepting any error.
Sample report time after authority lookup, preserving its source-as-of value.

## Assertions at the claimed boundary

```go
if selected.Kind != "completion" || report.Freshness != "stale" {
    t.Fatal("arrival order replaced terminal or source-time evidence")
}
if population.Completed != 2 || population.CombinedMisses != 1 || population.Coverage != "unknown" {
    t.Fatal("sampling or missing coverage changed the population claim")
}
if !errors.Is(receiveErr, ErrUnsupportedVersion) {
    t.Fatalf("expected version refusal, got %v", receiveErr)
}
```

Establish the accepted record through real emission when testing that composition.
After each named refusal, assert the previous accepted evidence is unchanged.
Missing required fields and absent optional assessment have distinct outcomes;
neither can default to healthy. State expected report values independently of
the projection being tested.

If `principle-observe-operations` is also installed, its
[shared contract](../../principle-observe-operations/references/parity.md),
[Go guidance](../../principle-observe-operations/references/go.md),
and [OTel mapping](../../principle-observe-operations/references/opentelemetry.md)
extend this example. This skill's proof does not require those references.
