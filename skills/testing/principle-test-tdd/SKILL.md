---
name: principle-test-tdd
description: Prove new behavior by observing the intended test fail before making it pass. Mandatory when implementing new behavior or fixing a defect.
---

# Observe the contract fail first

Choose the relevant `principle-test-proof-*` skill before writing the test. The proof strategy defines what the assertion must pin.

1. Write the smallest test that expresses the missing behavior through its public owner.
2. Run it. Confirm it fails because that behavior is absent or wrong. A compile error, unrelated guard, skipped test, or existing failure is not the red.
3. Implement the smallest general behavior that satisfies the contract.
4. Run the focused test, then the relevant suite.
5. Refactor only while the proof remains green.

Load `principle-test-execution` for every red and green command used as evidence.

Once the intended red is observed, change the expected behavior only when the user changes the contract. Production code must not recognize a fixture, test identity, or test-only environment merely to turn green.

For a defect, reproduce the production path with a production-reachable fixture. Do not hand-set a discriminating field merely to obtain green. If the real path cannot reach the state the expected behavior requires, report that design gap and keep the faithful reproduction red.

Before refactoring existing behavior whose contract is not settled, use `principle-test-characterization` instead of guessing the desired red.
