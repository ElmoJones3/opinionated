---
name: principle-test-determinism
description: Control time, randomness, scheduling, retries, cancellation, and concurrency in tests. Mandatory when those inputs can change the result or timing of a test.
---

# Control the changing input

Make the source of variation explicit and advance it under test control.

- Pass the relevant instant into pure behavior. For expiry or idle checks, set the stored timestamp to a known past value.
- Use virtual schedulers or a harness clock for delays, retries, debouncing, cancellation, and TTL behavior.
- Seed randomness only when the generated sequence is the contract. Otherwise assert required shape, range, uniqueness, or non-emptiness.
- For concurrency, assert ordering rules, atomic state, cancellation, and race safety. Do not assert wall-clock speed.
- Do not use sleep to wait for correctness. Polling is acceptable only at a real asynchronous boundary with a bounded deadline and a condition tied to the claim.

When an external dependency owns time or scheduling semantics, also load `principle-test-boundaries`. For RxJS virtual-time examples, read the `ui-principle-state-management` RxJS reference when available.
