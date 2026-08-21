---
name: principle-test-characterization
description: Record current observable behavior before changing its implementation. Mandatory when refactoring behavior whose contract is missing, disputed, or weakly tested.
---

# Pin what the system does now

Characterization protects a refactor from accidental change. It records current observable behavior without declaring that behavior correct.

- Exercise the public contract or the narrowest stable boundary available.
- Pin representative success, failure, state, ordering, and effects that callers can observe.
- Prefer explicit values over broad snapshots of wrappers, generated markup, logs, or private structure.
- Name known oddities as current behavior so the test is not mistaken for approval.
- Run the test against the current implementation before changing code.

If the user has already adjudicated the desired behavior, or the task is to fix a defect, use `principle-test-tdd`. Do not freeze a known defect merely because it exists.
