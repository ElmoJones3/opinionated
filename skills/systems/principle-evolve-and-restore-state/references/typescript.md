# TypeScript

Keep migration, backfill, restore, and failover as separate procedures. A representation change does not earn a restore guarantee.

## Mixed-version compatibility

```ts
/** LegacyUser is readable while old writers can still exist. */
interface LegacyUser { /** schemaVersion identifies the legacy codec. */ readonly schemaVersion: 1; /** fullName is the old compatibility form. */ readonly fullName: string; }
/** ExpandedUser carries one canonical value plus an atomically derived legacy form. */
interface ExpandedUser { /** schemaVersion selects the expanded codec. */ readonly schemaVersion: 2; /** displayName is canonical after expansion. */ readonly displayName: string; /** fullName keeps old readers alive until contraction. */ readonly fullName: string; }
/** StoredUser lists every representation that can still exist during rollout or rollback. */
type StoredUser = LegacyUser | ExpandedUser;

/** readCanonical accepts supported forms and rejects disagreeing dual-written values. */
function readCanonical(stored: StoredUser): string {
  if (stored.schemaVersion === 1) return stored.fullName;
  if (stored.displayName !== stored.fullName) {
    throw new Error("canonical and compatibility names disagree");
  }
  return stored.displayName;
}
/** writeExpanded derives compatibility data from one canonical value for one atomic write. */
function writeExpanded(displayName: string): ExpandedUser {
  return { schemaVersion: 2, displayName, fullName: displayName };
}
```

Use a maintained schema validator such as Zod only when the repository already uses it. Contract the legacy field only after old writers, readers, queued work, rollback images, and backups that require it have left the compatibility window.

## Resumable backfill

```ts
/** BackfillCheckpoint identifies one operation version and the last committed row. */
interface BackfillCheckpoint { /** workId survives worker replacement. */ readonly workId: string; /** operationVersion prevents incompatible code from resuming. */ readonly operationVersion: "user-name/v2"; /** afterId advances only in the same commit as transformed rows. */ readonly afterId: string | null; }
/** BackfillStore owns the conditional batch transaction and capacity reservation. */
interface BackfillStore { /** commitBatch repeats safely and rejects a stale checkpoint. */ commitBatch(checkpoint: BackfillCheckpoint, limit: number): Promise<BackfillCheckpoint | "stale">; }
```

The transaction selects a bounded ordered batch after `afterId`, writes the repeatable transformation, and advances the checkpoint together. A crash before commit changes neither; a lost commit reply is resolved by reading `workId`.

## Backup and restore

```ts
/** trustedRestoreEvidence brands values created only by the authenticated evidence adapter. */
declare const trustedRestoreEvidence: unique symbol;
/** TrustedRestoreEvidence binds verified restore scope to external history and authority. */
interface TrustedRestoreEvidence { /** trustedRestoreEvidence prevents ordinary callers from fabricating verified evidence. */ readonly [trustedRestoreEvidence]: true; /** snapshotVerified proves data, schema, keys, config, and artifacts in scope. */ readonly snapshotVerified: true; /** reconciliationRange is the canonical external range the trusted source covered. */ readonly reconciliationRange: string; /** externalEpoch binds that evidence to authority outside restored state. */ readonly externalEpoch: bigint; }
/** ReopenRequirements names facts that evidence must match rather than merely contain. */
interface ReopenRequirements {
  /** requiredReconciliationRange is the complete canonical range that recovery demanded. */
  readonly requiredReconciliationRange: string;
  /** highestRestoredEpoch is the greatest authority epoch found anywhere in the restored snapshot. */
  readonly highestRestoredEpoch: bigint;
  /** expectedExternalEpoch is freshly allocated outside restored state. */
  readonly expectedExternalEpoch: bigint;
}
/** RestoreGate keeps effect producers closed until trusted evidence satisfies requirements. */
interface RestoreGate { /** evidence is absent until the trusted adapter verifies source and scope. */ readonly evidence?: TrustedRestoreEvidence; /** producersPaused remains true until the open transition commits. */ readonly producersPaused: boolean; }
/** canReopen requires exact range and epoch matches instead of token presence. */
function canReopen(gate: RestoreGate, required: ReopenRequirements): boolean {
  /** evidence is trusted by construction but still must describe this recovery operation. */
  const evidence = gate.evidence;
  return gate.producersPaused
    && evidence !== undefined
    && evidence.snapshotVerified
    && required.expectedExternalEpoch > required.highestRestoredEpoch
    && evidence.reconciliationRange === required.requiredReconciliationRange
    && evidence.externalEpoch === required.expectedExternalEpoch;
}
```

The adapter that owns the brand authenticates the evidence source and canonicalizes its range before constructing `TrustedRestoreEvidence`. Scan the restored scope for `highestRestoredEpoch`, then ask the independent allocator for `expectedExternalEpoch`; do not derive the expected value from restored state. The comparison proves only that the grant is newer than every epoch the snapshot reveals. Only the independent allocator can prove it is fresh relative to authorities and history outside that snapshot. Pause dispatch before restore. Preserve `unknown` when no complete external record can reveal post-snapshot effects. Measure RPO and RTO for the named disaster during an isolated restore, not from backup listings.

## Failover authority

```ts
/** FailoverGrant combines routing with an epoch that old or restored authorities cannot mint. */
interface FailoverGrant { /** routeGeneration selects the new service destination. */ readonly routeGeneration: bigint; /** disasterEpoch comes from an independent monotonic authority. */ readonly disasterEpoch: bigint; /** owner identifies the only current writer. */ readonly owner: string; }
/** acceptsWrite requires both routing and fencing authority; routing alone is insufficient. */
function acceptsWrite(current: FailoverGrant, presented: FailoverGrant): boolean {
  return presented.owner === current.owner && presented.routeGeneration === current.routeGeneration && presented.disasterEpoch === current.disasterEpoch;
}
```

## Proof

Run every relevant old/new reader-writer pair, reject disagreeing dual-written values, and roll back after new writes. Crash backfill before and after batch commit, replay the batch, and reject a changed operation version. Perform an actual isolated restore with production storage, keys, schema, and artifacts; reject untrusted evidence, a mismatched required range, and expected external epochs equal to or below the highest restored epoch before proving dispatch reopens only for exact trusted evidence. Race old and new failover authorities. Mark restore, RPO, RTO, or fencing claims unverified when their real dependencies are unavailable.
