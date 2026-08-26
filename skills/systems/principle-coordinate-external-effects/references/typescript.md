# TypeScript

Keep provider evidence separate from business policy. The outbox transaction owns local intent; the provider owns capture state; reconciliation connects them by complete identity.

```ts
/** Coordinates recovery for a payment whose provider reply was lost. */

/** PaymentIdentity prevents a lookup from crossing provider accounts or environments. */
interface PaymentIdentity {
  /** provider names the adapter and reconciliation contract. */
  readonly provider: "acme-pay";
  /** accountId binds the effect to the receiver account. */
  readonly accountId: string;
  /** environment prevents test and production identities from colliding. */
  readonly environment: "test" | "production";
  /** operation prevents capture evidence from authorizing another provider operation. */
  readonly operation: "capture";
  /** effectId is the stable idempotency key for this capture. */
  readonly effectId: string;
  /** requestDigest binds evidence to the exact requested amount and currency. */
  readonly requestDigest: string;
}

/** EffectState retains uncertainty and terminal automatic outcomes explicitly. */
type EffectState = "requested" | "pending" | "confirmed" | "refused" | "unknown" | "needs_attention";
/** DeliveryIntent is the durable local obligation created with the state that requires payment. */
interface DeliveryIntent {
  /** intentId identifies the local business obligation. */ readonly intentId: string;
  /** deliveryId identifies broker or dispatcher progress independently of the provider effect. */ readonly deliveryId: string;
  /** identity preserves the receiver effect key and complete lookup scope. */ readonly identity: PaymentIdentity;
  /** state records what local delivery and receiver evidence currently prove. */ readonly state: EffectState;
}

/** ProviderEvidence states only what the authoritative provider lookup proves. */
type ProviderEvidence =
  | {
      /** kind proves the provider accepted the identified effect. */ readonly kind: "confirmed";
      /** providerEffectId identifies the receiver-owned effect. */ readonly providerEffectId: string;
    }
  | {
      /** kind proves the provider refused the identified request. */ readonly kind: "refused";
      /** reason is provider evidence that policy may inspect. */ readonly reason: string;
    }
  | { /** kind says the provider still owns unfinished work. */ readonly kind: "pending" }
  | {
      /** kind preserves uncertainty when lookup cannot settle the result. */ readonly kind: "unknown";
      /** reason explains why authoritative evidence is unavailable. */ readonly reason: string;
    };

/** Observation keeps provider evidence bound to its complete receiver identity. */
interface Observation {
  /** identity repeats the exact lookup scope established by the receiver. */ readonly identity: PaymentIdentity;
  /** evidence carries the normalized provider result for that identity. */ readonly evidence: ProviderEvidence;
}

/** Provider exposes idempotent delivery and an identity-complete authoritative lookup. */
interface Provider {
  /** capture may commit remotely before its reply is lost. */
  capture(identity: PaymentIdentity, body: Uint8Array): Promise<Observation>;
  /** observe includes accepted, queued, pending, and completed work for the stated retention window. */
  observe(identity: PaymentIdentity): Promise<Observation>;
}

/** RecoveryAction tells the durable coordinator what evidence permits next. */
type RecoveryAction = "confirm" | "refuse" | "reconcile_later" | "needs_attention";

/** sameIdentity compares every receiver field before evidence may authorize local state. */
function sameIdentity(expected: PaymentIdentity, observed: PaymentIdentity): boolean {
  return expected.provider === observed.provider &&
    expected.accountId === observed.accountId &&
    expected.environment === observed.environment &&
    expected.operation === observed.operation &&
    expected.effectId === observed.effectId &&
    expected.requestDigest === observed.requestDigest;
}

/** chooseRecovery advances local state only from identity-matched receiver evidence. */
function chooseRecovery(expected: PaymentIdentity, observation: Observation): RecoveryAction {
  if (!sameIdentity(expected, observation.identity)) return "needs_attention";
  switch (observation.evidence.kind) {
    case "confirmed": return "confirm";
    case "refused": return "refuse";
    case "pending": return "reconcile_later";
    case "unknown": return "needs_attention";
  }
}

/** RefundIntent identifies compensation as new work rather than erased capture history. */
interface RefundIntent {
  /** compensationId is unique and never reuses the capture effectId. */
  readonly compensationId: string;
  /** originalEffectId links the refund to immutable capture history. */
  readonly originalEffectId: string;
  /** reason records why policy requested the new effect. */
  readonly reason: string;
}
```

On reply loss, store `unknown`, then call `observe(identity)`. The adapter returns the receiver-established identity with its evidence; `chooseRecovery` sends mismatches to `needs_attention`. A recent lookup is not enough: the adapter contract must document authority, identity fields, included states, and retention. A lagging replica or incomplete lookup preserves `unknown`. Create `RefundIntent` in a later local transaction only after trusted policy requests compensation.

## Proof

Script crashes after local intent commit, send, provider commit, provider reply, and local confirmation. Use the production database to prove state plus outbox atomicity. Prove duplicate sends reuse `effectId`, reconciliation rejects mismatched scope or digest, and restored local state cannot overwrite a newer provider result. If provider lookup scope or fault injection is unavailable, mark that guarantee unverified.
