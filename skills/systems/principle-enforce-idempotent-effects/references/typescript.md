# TypeScript reference

All four references encode the same capture request as `CAP1`, unsigned 64-bit amount cents, a
length-prefixed UTF-8 currency, and a length-prefixed UTF-8 order ID. Changing that format requires
a new canonical version. Transport JSON is not the canonical identity.

```ts
/** This excerpt builds receiver input; the production receiver owns atomic arbitration. */
import { createHash } from 'node:crypto'

/** CaptureRequest is the meaning protected by one idempotency identity. */
interface CaptureRequest {
  /** Uses positive integer minor units to avoid floating-point money. */ readonly amountCents: bigint
  /** Uses the receiver's validated uppercase currency code. */ readonly currency: string
  /** Binds the effect to one business obligation. */ readonly orderId: string
}

/** ReceiverIdentity scopes a stable key to one receiver namespace. */
interface ReceiverIdentity {
  /** Selects the provider-owned account. */ readonly receiverAccount: string
  /** Prevents test and production identities from colliding. */ readonly environment: string
  /** Prevents one key from naming different receiver operations. */ readonly operation: 'capture'
  /** Remains stable across every equivalent delivery. */ readonly effectKey: string
}

/** encodeField writes one bounded UTF-8 field without separator ambiguity. */
function encodeField(value: string): Buffer {
  /** bytes preserve the exact normalized UTF-8 representation chosen by the receiver. */
  const bytes = Buffer.from(value, 'utf8')
  if (bytes.length > 0xffff) throw new RangeError('canonical field exceeds 65535 bytes')
  /** length prevents adjacent fields from producing the same byte sequence. */
  const length = Buffer.allocUnsafe(2)
  length.writeUInt16BE(bytes.length)
  return Buffer.concat([length, bytes])
}

/** canonicalCaptureBytes creates the versioned byte identity used by every implementation. */
function canonicalCaptureBytes(request: CaptureRequest): Buffer {
  if (request.amountCents <= 0n || request.amountCents > 0xffff_ffff_ffff_ffffn) {
    throw new RangeError('amountCents must fit positive uint64 minor units')
  }
  /** header changes when canonical meaning or field order changes. */
  const header = Buffer.from('CAP1', 'ascii')
  /** amount stores exact minor units in network byte order. */
  const amount = Buffer.allocUnsafe(8)
  amount.writeBigUInt64BE(request.amountCents)
  return Buffer.concat([header, amount, encodeField(request.currency), encodeField(request.orderId)])
}

/** captureDigest detects key reuse with changed canonical meaning. */
function captureDigest(request: CaptureRequest): string {
  return createHash('sha256').update(canonicalCaptureBytes(request)).digest('hex')
}

/** SettlementResult reports the receiver authority's arbitration result. */
type SettlementResult =
  | {
      /** Committed is returned for the winner and equivalent replays. */ readonly kind: 'committed'
      /** Stable ledger entry identity. */ readonly ledgerEntryId: string
      /** Says whether this call created it. */ readonly replay: boolean
    }
  | { /** Conflict rejects one key carrying a changed digest. */ readonly kind: 'conflict' }
  | { /** Pending is valid only when the authority exposes an in-flight owner. */ readonly kind: 'pending' }

/** PaymentLedger owns the unique key, digest check, ledger mutation, and stored response. */
interface PaymentLedger {
  /** Performs arbitration and the receiver-owned effect in one production transaction or equivalent protocol. */
  settleOnce(identity: ReceiverIdentity, request: CaptureRequest, digest: string): Promise<SettlementResult>
}
```

For PostgreSQL, the receiver transaction needs a unique key on receiver account, environment,
operation, and effect key. It compares the stored digest, applies the ledger mutation, and stores the
authoritative response before commit. A concurrent equivalent call returns the stored response; a
changed digest conflicts. `pending` is allowed only if an authoritative in-flight arbitration
mechanism reports it. Neither the interface nor a caller-side lookup enforces any of this. Do not
wrap this local table around an unrelated payment provider call and call that atomic.

Use one shared golden vector: 4,000 cents, `USD`, and `order-123` encode as
`434150310000000000000fa0000355534400096f726465722d313233` and hash to
`d2c10eb12de108dcea8788149a7770b038b513a19f8338af27286a90549a3e78`. Then use the production
database for concurrent first calls, replay, digest conflict, rollback at each transaction fault point, and any
pending protocol. Test a delivery after normal retention. The receiver must retain a tombstone,
reject late reuse under its own clock and stated bounds, or narrow the claim. Mark database and
retention guarantees unverified when those dependencies cannot run.
