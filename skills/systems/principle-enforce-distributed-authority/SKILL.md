---
name: principle-enforce-distributed-authority
description: Prevent stale or competing workers from committing protected changes through atomic claims, conditional writes, and fencing. Mandatory when work can move between workers, leases expire, leadership changes, or failover can leave an earlier actor running.
---

# Enforce authority where state changes

Two workers can both honestly believe they may act. A lease expiry authorizes the coordinator to choose a replacement; it does not stop the earlier worker. The protected resource decides which write is current.

## Claim and fence work

- Select and assign work in one atomic claim. A row lock can protect the short claim transaction but should not remain open during long work.
- Let the lease authority's clock decide expiration. Renew only while owner, state, and generation still match.
- Give every ownership term a monotonically increasing fencing token—a number that increases each time ownership changes—or an equivalent epoch.
- Make each protected write conditionally compare the current state version and ownership generation in the same operation that changes state.
- Treat zero rows changed or a rejected compare-and-swap as lost authority, not a transient write error.

Choose the fencing form deliberately. Exact-current fencing accepts only the generation currently recorded by the ownership authority. A resource-local high-watermark remembers the largest token that resource has seen and rejects older ones, but it may accept a stale token before a newer one reaches that resource. State the weaker scope if that is what the resource supports.

Do not confuse heartbeats, owner IDs, logs, or application-side “still owner” checks with fencing. A stale worker can pause after the check and resume after ownership moves.

Local fencing covers local changes. It cannot prevent an already authorized stale worker from calling an external provider unless that provider validates the authority generation. Use stable idempotent effect identity for irrevocably authorized calls, or give revocation a receiver-enforced protocol and compensation for late effects.

After restore or failover, token allocation must not move backward. Establish a new epoch from state outside the restored snapshot, or prove the next token exceeds every earlier token before claims reopen.

## Coordinate adjacent principles

Use `principle-model-durable-work` for ownership state, `principle-enforce-idempotent-effects` for external calls that fencing cannot reach, and `principle-evolve-and-restore-state` for epoch continuity across restore and failover.

## Prove it

Load `principle-testing-guidelines`, `principle-test-determinism`, `principle-test-boundaries`, `principle-test-proof-state-transitions`, `principle-test-proof-failures`, and `principle-test-execution`. Exercise every authority behavior in scope: simultaneous claims, lease expiry while the old worker pauses, stale completion after takeover, renewal races, and equal-token concurrent writes. Add restore or failover epoch tests only when that recovery path is claimed. Use the real database or coordinator for its locking and isolation claim.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Claims have one winner at the authority.
- Lease expiry permits takeover but never claims the old worker stopped.
- Protected writes reject stale state and ownership in the write itself.
- External effects state the limit of local fencing.
- Restore and failover cannot reuse an older authority generation.
