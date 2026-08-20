---
name: principle-test-support
description: Extract reusable test builders, assertions, fakes, and harness setup without hiding the contract. Mandatory when test support repeats or is shared across packages.
---

# Share proof machinery, not test meaning

Extract test support when the same contract-aware setup or assertion is being reimplemented, or when one harness must stay consistent across packages.

Good support owns:

- production-faithful builders and seeders;
- structured assertions for domain errors or emitted events;
- recording fakes for observable handoffs; and
- real dependency harness setup, cleanup, and clock control.

Keep the test's relevant inputs, action, and expected behavior visible at the call site. A helper must not silently create impossible state, swallow an assertion, select a weaker boundary, or make every case pass through the same early failure.

Use the language's testing abstraction so cleanup and failure locations remain correct. Keep support beside the owning package or in a clearly named test-support package. Do not make production code depend on it.
