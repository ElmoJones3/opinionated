---
name: principle-testing-guidelines
description: Prove the user's requested outcomes without inventing testing obligations or redefining value. Mandatory when adding, changing, reviewing, or diagnosing production behavior or automated tests.
---

# Prove the feature does the thing

Value comes from the user's requested outcome and the established contract. The agent chooses how to implement and prove them; it has no authority to invent additional requirements or redefine value to justify its work. An endpoint that does not work with 90 passing tests has not delivered the feature.

A passing assertion is evidence about a required outcome. Passing tests, coverage, sensitivity, symmetry, and internal completeness have no independent claim on the user's time or money. These skills encode how to obtain sound evidence. They do not authorize expanding what needs proving.

## Follow the feature's story

1. **Given valid input, the feature does the thing.** For a new feature, begin with one example whose assertion establishes the promised outcome through the intended public entry point. Make that work before expanding the test suite. A reducer yields its intended state, an algorithm returns its intended answer, an endpoint completes its operation, or a query returns the required result within its required performance bounds.
2. **The feature rejects invalid input it owns.** Establish the required rejections at that boundary. Reuse existing validation evidence; do not repeat a dependency's validation suite at every caller or invent new validation rules.
3. **Prove any remaining required behavior.** Additional cases must establish distinct outcomes or constraints of the requested or established contract that existing evidence does not establish. State changes, failure handling, concurrency, and distributed guarantees belong here when the feature actually has those requirements. Their presence in a skill or an implementation does not create a requirement.

The first proof is about the feature's observable result. For a task confined to one function, that function is the complete path. When the task joins components, exercise their assembled operation; manually supplying a result that a missing component should produce does not establish that operation. For a defect, start with the broken required behavior. Preserve affected existing contracts through their regression coverage.

Once these outcomes and constraints are demonstrated and the relevant regression checks pass, stop adding tests and deliver. A working example does not excuse omitting another required outcome. A completed contract does not invite a search for more things to assert.

## Keep the contract in charge

- Derive required outcomes from the user's request, established callers, and existing contracts. An agent-written test, imagined defect, or proposed architecture cannot create a requirement. Calling something a "material gap" does not establish its value.
- Reuse existing evidence. Add an assertion only when a required outcome remains unproved. An unchanged component's existing tests continue to establish its guarantees while the change preserves their assumptions. Connecting a caller does not restart proof of every dependency.
- A new function, type, branch, state, or abstraction creates no testing obligation. Do not divide the implementation into pieces and assign each its own test quota.
- One example can establish several required facts. Do not repeat it for each layer or specialist skill. Temporary diagnostics used to finish the feature need not become permanent tests.
- Keep required outcomes intact when revising implementation choices or mistaken tests. Within the authorized change, remove assertions tied only to discarded designs or already sufficient evidence, preserving their required contract checks.
- Do not create inventories, certification exercises, or justification documents to administer these rules.

Mandatory testing skills govern how to prove the required outcomes. They do not independently authorize more cases. Apply this contract and value boundary even when a leaf skill is invoked directly.

## Route the work

Load each strategy whose trigger applies to a required proof. Strategies use the `principle-test-*` prefix; `principle-test-proof-*` skills specify how to assert a kind of behavior. Apply their guidance to the outcome being proved; do not turn their lists into a new set of requirements.

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

## Investigate doubtful evidence

A test used as evidence must distinguish the required outcome from its absence. An observed TDD red supplies sensitivity evidence. Do not turn the absence of a recorded red into a routine mutation exercise or a certification requirement.

Use a minimal reversible mutation only to resolve concrete doubt about evidence for a required outcome or to perform a requested sensitivity audit. When edits are authorized, break the claimed behavior, run the focused test, confirm the named assertion fails, restore the change, and rerun green. In read-only work, do not mutate code. Sensitivity establishes whether the assertion detects that behavior; it cannot establish the behavior's value.

## Load the applied principle

When available, also load the skill that owns the production design:

- `domain-modeling` for business objects, rules, invariants, and transitions;
- `principle-prefer-pure-functional-patterns` for explicit transformations;
- `ui-principle-state-management` for React state and streams; and
- `sops-sync` for secret-file synchronization.

Report whether the requested operation works through its real path, whether its required constraints and affected existing contracts hold, and what verification ran. If an outcome remains missing, name it directly. Test counts and passing component suites cannot stand in for delivery.
