---
name: principle-test-tdd
description: Prove the requested feature's outcome by observing its example fail before making it work. Mandatory when implementing new behavior or fixing a defect.
---

# Observe the contract fail first

Apply the contract and value boundary in `principle-testing-guidelines` first. Reuse a failing test when it already expresses the required outcome. Choose the relevant `principle-test-proof-*` skill for how to assert that outcome.

1. For a new feature, write or adapt one example of valid input producing the requested outcome through its intended public entry point. For a defect, reproduce the broken required behavior. For work across components, keep their assembled operation as the target.
2. Run it. Confirm it fails because that behavior is absent or wrong. A compile error, unrelated guard, skipped test, or unrelated existing failure is not the red.
3. Implement the behavior through the necessary production components until that example works. Do not write a separate red for every implementation step or internal type. Temporary diagnostics may help resolve an obstacle without creating a permanent suite.
4. Run the focused test while implementing. Broaden runs when integration changes warrant it and run required regression checks before completion. Repeat broad runs only after changes or findings that justify them.
5. Establish owned input rejection and any remaining required behavior under `principle-testing-guidelines`, reusing existing evidence. Refactor while the proofs remain green. When the contract and required regression checks pass, finish; the red-green cycle does not create further requirements.

Load `principle-test-execution` for every red and green command used as evidence.

The user's required behavior remains authoritative. Correct mistaken assertions and revise agent-chosen internal designs without weakening that behavior. Observing red does not ratify an assumption. Production code must not recognize a fixture, test identity, or test-only environment merely to turn green.

For a defect, reproduce the production path with a production-reachable fixture. Do not hand-set a discriminating field merely to obtain green. If the real path cannot reach the state the expected behavior requires, report that design gap and keep the faithful reproduction red.

Before refactoring existing behavior whose contract is not settled, use `principle-test-characterization` instead of guessing the desired red.
