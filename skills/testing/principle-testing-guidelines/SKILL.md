---
name: principle-testing-guidelines
description: Choose and apply the required testing strategy. Mandatory when adding, changing, reviewing, or diagnosing production behavior or automated tests.
---

# Choose the proof the claim requires

A test must prove a specific behavioral claim. It earns its place only when breaking or removing that behavior makes the test fail for the reason it names.

Testing strategies use the `principle-test-*` prefix. Skills under `principle-test-proof-*` define the evidence required for a specific kind of behavior. Load every strategy whose trigger applies.

## Route the work

- New behavior or a defect: `principle-test-tdd`.
- Refactoring behavior without a reliable, settled contract: `principle-test-characterization`.
- Test data, builders, seeds, factories, or hydrated objects: `principle-test-fixtures`.
- Test level or dependency choice: `principle-test-boundaries`.
- Time, randomness, scheduling, retries, cancellation, or concurrency: `principle-test-determinism`.
- Every test command cited as evidence, plus skips, filters, caches, environment gates, dependency gates, or split runners: `principle-test-execution`.
- Repeated builders, assertions, fakes, or harness setup: `principle-test-support`.
- Validators, modifiers, pure calculations, or pipeline mechanics: `principle-test-proof-transformations`.
- Rejections, errors, refused transitions, rollback, or preserved state: `principle-test-proof-failures`.
- Stored model data feeding a downstream calculation, projection, traversal, score, series, or aggregate: `principle-test-proof-derived-results`.
- State plus an input, command, or event: `principle-test-proof-state-transitions`.

Never reshape a fixture into a state production cannot produce merely to make a test pass. If an honest fixture leaves the test red, the red is the finding.

## Prove sensitivity

An observed TDD red proves the new test can detect its claimed defect. Otherwise, when implementation edits are authorized, make one minimal reversible change that breaks the claimed behavior, run the focused test, confirm the named assertion fails, restore the change, then rerun green. In read-only work, do not mutate code; report sensitivity as unverified unless prior evidence proves it.

## Load the applied principle

When available, also load the skill that owns the production design:

- `domain-modeling` for business objects, rules, invariants, and transitions;
- `principle-prefer-pure-functional-patterns` for explicit transformations;
- `ui-principle-state-management` for React state and streams; and
- `sops-sync` for secret-file synchronization.

Finish only when sensitivity is proven or explicitly unverified, normal fixtures are production-reachable, the boundary is faithful, and execution is observed.
