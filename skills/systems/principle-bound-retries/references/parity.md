# Worked-example parity contract

- **Scenario:** payment recovery decides whether another provider invocation is permitted while several retry layers and an absolute deadline exist.
- **Invariant:** an unknown unprotected effect is not retried automatically, and the complete stack cannot exceed its stated worst-case physical-call, time, or cost bound.
- **Identity and state:** one logical effect key, distinct attempts and invocations, classified prior evidence, remaining budgets, capacity, and deadline.
- **Enforcement boundary:** the durable store reserves attempt and budget before the call; the capacity authority admits it; the receiver contract makes repetition safe.
- **Required failures:** terminal refusal, unknown outcome, exhausted budget, expired deadline, concurrent reservation, and nested retry amplification.
- **Required proof:** controlled time and random samples, exact call counting, and real-store concurrent reservation or a stated unverified claim.
- **Language freedom:** Temporal guidance is an optional SDK sidebar where supported; the core example remains framework-neutral.
