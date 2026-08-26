# TypeScript reference

The transport adapter reports what it observed. A pure decision translates that observation into
durable knowledge without treating elapsed time, a broken connection, or a cancellation request as
proof that the receiver did nothing.

```ts
/** This excerpt keeps transport observations separate from receiver evidence and local inbox state. */

/** Observation records the strongest evidence returned by one payment exchange. */
type Observation =
  | {
      /** Local refusal proves this invocation did not leave. */ readonly kind: 'local_refusal'
      /** Validation reason. */ readonly code: string
    }
  | {
      /** Receiver refusal proves this request cannot later commit. */ readonly kind: 'receiver_refusal'
      /** Stable receiver reason. */ readonly code: string
    }
  | {
      /** Receiver confirmation identifies the committed effect. */ readonly kind: 'confirmed'
      /** Receiver effect identity. */ readonly captureId: string
    }
  | {
      /** Pending means the receiver may still finish. */ readonly kind: 'pending'
      /** Receiver operation identity. */ readonly operationId: string
    }
  | {
      /** Missing reply leaves several network histories possible. */ readonly kind: 'no_reply'
      /** Diagnostic transport cause only. */ readonly cause: 'timeout' | 'connection_lost'
    }
  | { /** A cancellation request says nothing final about the receiver. */ readonly kind: 'cancellation_requested' }
  | {
      /** Receiver cancellation proves commit was prevented by its protocol. */ readonly kind: 'cancelled_before_commit'
      /** Receiver evidence identity. */ readonly cancellationId: string
    }

/** Knowledge is the durable conclusion permitted by an observation. */
type Knowledge =
  | {
      /** Confirmed binds the logical effect to the receiver result. */ readonly kind: 'confirmed'
      /** Receiver effect identity. */ readonly captureId: string
    }
  | {
      /** Refused records stable absence for this invocation. */ readonly kind: 'refused'
      /** Evidence source. */ readonly source: 'local' | 'receiver'
    }
  | {
      /** Pending requires later observation. */ readonly kind: 'pending'
      /** Receiver operation identity. */ readonly operationId: string
    }
  | { /** Unknown preserves the possibility that the effect committed. */ readonly kind: 'unknown' }

/** classify records no stronger claim than the evidence earns. */
function classify(observation: Observation): Knowledge {
  switch (observation.kind) {
    case 'local_refusal': return { kind: 'refused', source: 'local' }
    case 'receiver_refusal':
    case 'cancelled_before_commit': return { kind: 'refused', source: 'receiver' }
    case 'confirmed': return { kind: 'confirmed', captureId: observation.captureId }
    case 'pending': return { kind: 'pending', operationId: observation.operationId }
    case 'no_reply':
    case 'cancellation_requested': return { kind: 'unknown' }
  }
}

/** OrderedDelivery keeps transport identity, source truth, and effect identity distinct. */
interface OrderedDelivery {
  /** Detects exact broker redelivery. */ readonly deliveryId: string
  /** Orders immutable events within one payment stream. */ readonly sourceSequence: bigint
  /** Names the logical payment effect across deliveries. */ readonly effectKey: string
}

/** InboxResult states what one local receipt transaction decided. */
type InboxResult = 'applied' | 'duplicate' | 'sequence_gap'

/** PaymentInbox owns one transaction spanning receipt uniqueness and the resulting local change. */
interface PaymentInbox {
  /** Applies only the next source event, returns duplicates, and refuses gaps. */
  applyOnce(delivery: OrderedDelivery, expectedSequence: bigint): Promise<InboxResult>
}
```

The receiver contract decides which responses count as refusal, confirmation, pending, or
cancellation-before-commit. The TypeScript union only prevents accidental omission of a branch.
Likewise, `PaymentInbox` does not make receipt and state atomic. Its production implementation must
use one transaction and a unique delivery constraint.

Drive `classify` with a scripted schedule for lost request, lost refusal, lost success reply,
pending work, and both cancellation orderings. Drive the inbox through acknowledgement loss after
commit, exact redelivery, and a sequence gap.
Prove receipt-plus-state atomicity against the production database, or mark it unverified.
