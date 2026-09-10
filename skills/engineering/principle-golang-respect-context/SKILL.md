---
name: principle-golang-respect-context
description: Respect request lifetimes when implementing or reviewing Go operations that accept, propagate, or retain a context. Covers cancellation before work and through dependent calls, including context-bearing wrappers.
---

# Respect the caller's context

Cancellation is table stakes. An AbortController needs a request path that
propagates and observes cancellation. Abandoned work should not keep spending
CPU, connection-pool capacity or database IOPS. Passing a context argument alone
does not provide that guarantee.

## Check before work

An operation accepting a context checks usability before validation, parsing,
query construction, registry resolution, expensive copying, effects, or a
successful no-op. Use the project's shared guard. The live-request path should
be constant-time and allocation-free, not another walk of domain or IAM state.

Reject nil and typed-nil contexts safely. A non-nil wrapper can still contain a
nil base; check the base before invoking promoted methods. Do not dereference a
possibly nil wrapper to obtain logging fields before checking it. Minimal,
nil-safe logger setup may precede the guard.

Return recognizable cancellation and deadline errors. Preserve `errors.Is`
classification and any supplied cancellation cause through wrappers. Do not
turn an aborted request into field-validation text or report success because
there was nothing to write. Cancellation is not a permission decision.

## Carry the lifetime through the operation

- Pass the caller's context to dependent operations and context-aware I/O.
  An entry check does not replace propagation or interrupt an entire CPU loop.
- Check again at meaningful work boundaries in long-running operations. Waits,
  retries and goroutines must observe cancellation and have a termination path.
- Release derived cancellation functions and timers in the owner that creates
  them. Do not silently replace the request with Background, TODO or a detached
  context to finish work the caller abandoned.
- Independently owned jobs and deliberate cleanup may have another lifetime.
  Make that handoff explicit; request cancellation is not a blanket order to
  destroy durable work. Usable and cancelable are separate requirements.
- A bounded, request-scoped Edit may retain its context by contract. Each later
  operation rechecks it. Persist facts, not context; restoration receives the
  new request's context. Do not store a request context on a long-lived service.

Cancellation stops further work. It does not erase earlier accepted commands,
undo committed effects, or transfer transaction ownership. Preserve the promised
failure boundary and allow context-free observation of previously accepted facts.
Context-free means the contract is independent of the request lifetime, not
merely that a method lacks a context argument. An Edit can use its retained
context for live inspection. Identify which records or retained snapshots
remain observable after that request ends.

Do not add context to bare seeds, value constructors or ordinary getters merely
to apply this skill. Context construction and projection helpers carry a lifetime;
they need not reject a canceled parent as though they were executing its work.

## Prove the checkpoint

Load `principle-testing-guidelines`
for execution, determinism and exact refusal. Prove an
aborted request wins over a competing failure or an observable work hook, not
just that some error occurred. Drivers may reject cancellation themselves, so
zero I/O alone may fail to prove your entry guard exists. Cover no-op ordering
and cancellation after a retained session was opened when those paths exist.
Assert preserved state and no new effects; use controlled cancellation or virtual
time, not sleeps. Verify the shared guard's live-path allocation claim once.

These tests prove their tested boundary. They do not by themselves prove browser
AbortController-to-database propagation through an untested HTTP stack.
