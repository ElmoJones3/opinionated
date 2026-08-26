# TypeScript reference

Catalog display accepts a stated version lag. Payment recovery requires an authority observation
that covers accepted, queued, pending, and completed requests for the effect identity. A recent
observation timestamp does not prove either condition.

```ts
/** This excerpt checks read evidence; the data service still owns its consistency guarantees. */

/** ReadRequirement states the contract for one key-scoped decision. */
interface ReadRequirement {
  /** Names the catalog item or payment effect whose versions are comparable. */ readonly keyScope: string
  /** Names the authority that defines this version space. */ readonly requiredAuthority: string
  /** Separates bounded display reads from effect-authorizing reads. */ readonly strength: 'bounded_stale' | 'authority_complete'
  /** Rejects versions from before failover or restore. */ readonly expectedEpoch: bigint
  /** Supplies read-your-writes or other minimum progress. */ readonly minimumVersion: bigint
  /** Limits replica lag in versions and exists only for bounded-stale reads. */ readonly maxVersionLag?: bigint
  /** Ends permission to wait at this epoch millisecond. */ readonly deadlineMs: number
  /** Defines behavior when the required source is unavailable or too weak. */ readonly fallback: 'refuse' | 'defer'
}

/** ReadObservation reports what the selected data path can actually prove. */
interface ReadObservation<T> {
  /** Carries the domain value without upgrading its evidence. */ readonly value: T
  /** Repeats the exact object described by this evidence. */ readonly keyScope: string
  /** Names the authority that issued versions and watermark. */ readonly authority: string
  /** Names the primary, replica, cache, or projection used. */ readonly source: string
  /** Says whether this source is the decision's write authority. */ readonly authoritative: boolean
  /** Changes when restore or failover can move ordinary versions backward. */ readonly epoch: bigint
  /** Is comparable only within the same key scope and epoch. */ readonly version: bigint
  /** Is an authority-issued comparable point known to this adapter. */ readonly authorityWatermark: bigint
  /** Records when the read completed but does not establish data freshness. */ readonly observedAtMs: number
  /** Says the lookup covers every accepted, queued, pending, and completed operation in retention. */ readonly complete: boolean
}

/** ReadDecision makes weak evidence and fallback visible to the caller. */
type ReadDecision<T> =
  | {
      /** Use returns a value that met the requested contract. */ readonly kind: 'use'
      /** Preserves its source evidence. */ readonly observation: ReadObservation<T>
    }
  | {
      /** Refuse prevents a safety decision on weak evidence. */ readonly kind: 'refuse'
      /** Names the failed contract. */ readonly reason: string
    }
  | {
      /** Defer records that the decision needs a later read. */ readonly kind: 'defer'
      /** Names the failed contract. */ readonly reason: string
    }

/** unavailable applies the declared fallback without silently weakening the read. */
function unavailable<T>(requirement: ReadRequirement, reason: string): ReadDecision<T> {
  return requirement.fallback === 'refuse' ? { kind: 'refuse', reason } : { kind: 'defer', reason }
}

/** decideRead accepts only evidence that satisfies the requested epoch, progress, and strength. */
function decideRead<T>(requirement: ReadRequirement, observation: ReadObservation<T> | undefined, nowMs: number): ReadDecision<T> {
  if (nowMs >= requirement.deadlineMs) return unavailable(requirement, 'deadline_expired')
  if (observation === undefined) return unavailable(requirement, 'authority_unavailable')
  if (observation.keyScope !== requirement.keyScope) return unavailable(requirement, 'key_scope_mismatch')
  if (observation.authority !== requirement.requiredAuthority) return unavailable(requirement, 'authority_mismatch')
  if (observation.epoch !== requirement.expectedEpoch) return unavailable(requirement, 'epoch_changed')
  if (observation.version < requirement.minimumVersion) return unavailable(requirement, 'read_your_writes_not_met')
  if (requirement.strength === 'authority_complete') {
    return observation.authoritative && observation.complete
      ? { kind: 'use', observation }
      : unavailable(requirement, 'authority_or_completeness_missing')
  }
  if (requirement.maxVersionLag === undefined || observation.authorityWatermark < observation.version) {
    return unavailable(requirement, 'invalid_watermark')
  }
  return observation.authorityWatermark - observation.version <= requirement.maxVersionLag
    ? { kind: 'use', observation }
    : unavailable(requirement, 'staleness_bound_exceeded')
}

/** sequenceDecision keeps per-payment source order separate from arrival order. */
function sequenceDecision(lastApplied: bigint, incoming: bigint): 'apply' | 'duplicate' | 'gap' {
  if (incoming <= lastApplied) return 'duplicate'
  return incoming === lastApplied + 1n ? 'apply' : 'gap'
}
```

Use a catalog requirement with `bounded_stale` and an explicit maximum version lag. Use
`authority_complete` for payment retry authorization and include the complete receiver identity in
`keyScope`. The data adapter must obtain a comparable authority watermark and accurate completeness
claim from the actual service. Interfaces cannot create read-your-writes or linearizability.

Direct tests cover key and authority mismatch, a recent but lagging read, missing authority, unmet
session version, sequence gap, and failover epoch change. Run read-after-write, partition fallback,
and failover tests against the production data system. A test double counts only if it reproduces
that system's replication lag, partition fallback, session progress, and failover behavior;
otherwise mark those dependency-owned guarantees unverified.
