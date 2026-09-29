---
name: principle-test-characterization
description: Record current observable behavior before changing its implementation. Mandatory when refactoring behavior whose contract is missing, disputed, or weakly tested.
---

# Pin what the system does now

Apply the contract and value boundary in `principle-testing-guidelines`. Reuse existing regression coverage and characterize caller behavior the refactor must preserve where existing evidence does not establish it. Recording current behavior does not declare it correct or authorize additional requirements.

- Exercise the public contract or the narrowest stable boundary available.
- Pin affected success, failure, state, ordering, or effects where a change would violate the preserved contract. Do not inventory every behavior in the package before refactoring.
- Prefer explicit values over broad snapshots of wrappers, generated markup, logs, or private structure.
- Name known oddities as current behavior so the test is not mistaken for approval.
- Run the test against the current implementation before changing code.

If the user has already adjudicated the desired behavior, or the task is to fix a defect, use `principle-test-tdd`. Do not freeze a known defect merely because it exists.
