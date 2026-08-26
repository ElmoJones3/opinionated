# Distributed systems glossary

Distributed systems fail in ways that a single process cannot. A worker can crash while another
service completes its request. A network reply can disappear after the remote system commits a
change. Two healthy workers can both believe they own the same job.

This glossary gives those problems names. The names are useful only when they make a design easier
to explain and test. If a design claims a property such as idempotency or exactly-once effect, ask
for the invariant, the failure behavior, and the mechanism that enforces it. A library name is not
an answer.

The levels build on each other. Start at level 1 if the vocabulary is new. Later levels assume the
distinctions made earlier. Use the index when you already know the term you need.

Code samples appear where a small piece of executable logic can clarify the term. The samples use
TypeScript, Go, Python, and C++. Each one demonstrates one invariant or decision rule. It
deliberately omits storage setup, networking, and application structure that would distract from
that rule.

## Five ideas to carry through the glossary

1. Business work outlives the worker currently doing it.
2. A failed call can leave the remote outcome unknown.
3. A retry creates another attempt and may repeat an effect.
4. One transaction protects only the resources inside its boundary.
5. Every guarantee needs a named enforcement point.

## Learning path

- Level 1 separates durable business work from temporary processes.
- Level 2 explains how the system validates and identifies exact data.
- Level 3 establishes who may act when workers compete or ownership moves.
- Level 4 covers replicas, communication failures, retries, and uncertain outcomes.
- Level 5 handles changes that cross a transaction boundary.
- Level 6 separates deterministic execution, probabilistic behavior, and uncontrolled variation.
- Level 7 turns exact checks and uncertain measurements into explicit decisions.
- Level 8 limits what less-trusted input, code, and identities may do.
- Level 9 connects trusted decisions to delivery, approval, and operator action.
- Level 10 describes evidence that the earlier guarantees work under failure.
- Level 11 keeps a busy or degraded system observable and within capacity.
- Level 12 covers mixed-version deployment, restoration, and disaster recovery.

## Index

<details>
<summary>Open the alphabetical index</summary>

### A

- [Abort signal](#abort-signal)
- [Accidental complexity](#accidental-complexity)
- [Acknowledgement](#acknowledgement)
- [Activation](#activation)
- [Adapter](#adapter)
- [Admission control](#admission-control)
- [Alert](#alert)
- [Ambiguous outcome](#ambiguous-outcome)
- [Approval](#approval)
- [Approval invalidation](#approval-invalidation)
- [Artifact](#artifact)
- [At-least-once execution](#at-least-once-execution)
- [At-most-once execution](#at-most-once-execution)
- [Atomicity](#atomicity)
- [Attempt](#attempt)
- [Attestation](#attestation)
- [Audit log](#audit-log)
- [Auditability](#auditability)
- [Authentication](#authentication)
- [Authorization](#authorization)

### B

- [Backoff](#backoff)
- [Backpressure](#backpressure)
- [Backup](#backup)
- [Backward compatibility](#backward-compatibility)
- [Baseline](#baseline)
- [Blocked state](#blocked-state)
- [Bounded remediation](#bounded-remediation)
- [Build-versus-buy boundary](#build-versus-buy-boundary)
- [Bulkhead](#bulkhead)

### C

- [Cache key](#cache-key)
- [Calibration](#calibration)
- [Cancellation](#cancellation)
- [Canonicalization](#canonicalization)
- [CAP theorem](#cap-theorem)
- [Capability](#capability)
- [Checkpoint](#checkpoint)
- [Circuit breaker](#circuit-breaker)
- [Clock skew](#clock-skew)
- [Compare-and-swap](#compare-and-swap)
- [Compensation](#compensation)
- [Concurrency budget](#concurrency-budget)
- [Confidence interval](#confidence-interval)
- [Consistency model](#consistency-model)
- [Content-addressed storage](#content-addressed-storage)
- [Correlation identifier](#correlation-identifier)
- [Cost budget](#cost-budget)
- [Cross-field invariant](#cross-field-invariant)

### D

- [Data minimization](#data-minimization)
- [Database constraint](#database-constraint)
- [Dead-letter queue](#dead-letter-queue)
- [Deadline](#deadline)
- [Deduplication](#deduplication)
- [Delivery](#delivery)
- [Dependency pinning](#dependency-pinning)
- [Derived decision](#derived-decision)
- [Desired state](#desired-state)
- [Deterministic operation](#deterministic-operation)
- [Deterministic scheduler](#deterministic-scheduler)
- [Deterministic validator](#deterministic-validator)
- [Development set](#development-set)
- [Digest](#digest)
- [Disaster recovery](#disaster-recovery)
- [Durable state](#durable-state)

### E

- [Effective input](#effective-input)
- [Effectively-once processing](#effectively-once-processing)
- [Environment scrubbing](#environment-scrubbing)
- [Essential complexity](#essential-complexity)
- [Evaluation case](#evaluation-case)
- [Evaluation corpus](#evaluation-corpus)
- [Evaluation leakage](#evaluation-leakage)
- [Evaluator drift](#evaluator-drift)
- [Eventual consistency](#eventual-consistency)
- [Exactly-once effect](#exactly-once-effect)
- [Expand-and-contract migration](#expand-and-contract-migration)
- [External side effect](#external-side-effect)

### F

- [Failover](#failover)
- [Failure detector](#failure-detector)
- [Failure window](#failure-window)
- [False acceptance](#false-acceptance)
- [False rejection](#false-rejection)
- [Fault injection](#fault-injection)
- [Fencing token](#fencing-token)
- [Finding](#finding)
- [Forward compatibility](#forward-compatibility)

### H

- [Hard gate](#hard-gate)
- [Heartbeat](#heartbeat)
- [Holdout set](#holdout-set)
- [Human gate](#human-gate)

### I

- [Idempotency key](#idempotency-key)
- [Idempotent operation](#idempotent-operation)
- [Immutable artifact](#immutable-artifact)
- [Inbox pattern](#inbox-pattern)
- [Injection](#injection)
- [Inter-rater agreement](#inter-rater-agreement)
- [Invariant](#invariant)
- [Invocation](#invocation)
- [Isolation](#isolation)

### J

- [Jitter](#jitter)

### L

- [Leader](#leader)
- [Lease](#lease)
- [Lease expiration](#lease-expiration)
- [Lease owner](#lease-owner)
- [Least privilege](#least-privilege)
- [Lineage](#lineage)
- [Linearizability](#linearizability)
- [Load shedding](#load-shedding)
- [Local optimization](#local-optimization)
- [Log](#log)

### M

- [Manual intervention](#manual-intervention)
- [Measurement](#measurement)
- [Metric](#metric)
- [Model checking](#model-checking)

### N

- [Network partition](#network-partition)
- [Non-retryable failure](#non-retryable-failure)

### O

- [Observability](#observability)
- [Observed state](#observed-state)
- [Operation version](#operation-version)
- [Optimistic concurrency control](#optimistic-concurrency-control)
- [Outbox pattern](#outbox-pattern)

### P

- [Paired evaluation](#paired-evaluation)
- [Parser-based checking](#parser-based-checking)
- [Partial failure](#partial-failure)
- [Poison work item](#poison-work-item)
- [Policy as code](#policy-as-code)
- [Probabilistic evaluator](#probabilistic-evaluator)
- [Process](#process)
- [Process-local state](#process-local-state)
- [Production-path parity](#production-path-parity)
- [Progress signal](#progress-signal)
- [Promotion](#promotion)
- [Provenance](#provenance)

### Q

- [Queue](#queue)
- [Quorum](#quorum)

### R

- [Random seed](#random-seed)
- [Rate limit](#rate-limit)
- [Read-after-write verification](#read-after-write-verification)
- [Read-your-writes consistency](#read-your-writes-consistency)
- [Redacted request record](#redacted-request-record)
- [Reconciliation](#reconciliation)
- [Recorded outcome](#recorded-outcome)
- [Recovery point objective](#recovery-point-objective)
- [Recovery time objective](#recovery-time-objective)
- [Redrive](#redrive)
- [Regression](#regression)
- [Regression budget](#regression-budget)
- [Repeated trial](#repeated-trial)
- [Replayability](#replayability)
- [Replication](#replication)
- [Reproducibility](#reproducibility)
- [Request artifact](#request-artifact)
- [Resource limit](#resource-limit)
- [Restore](#restore)
- [Resume](#resume)
- [Retention policy](#retention-policy)
- [Retry](#retry)
- [Retry budget](#retry-budget)
- [Retryable failure](#retryable-failure)
- [Rolling deployment](#rolling-deployment)
- [Row lock](#row-lock)
- [Run](#run)
- [Runtime validation](#runtime-validation)

### S

- [Saga](#saga)
- [Sandbox](#sandbox)
- [Schema migration](#schema-migration)
- [Secret leakage](#secret-leakage)
- [Self-reported decision](#self-reported-decision)
- [Semantic validity](#semantic-validity)
- [Serializability](#serializability)
- [Serialization](#serialization)
- [Server-side request forgery](#server-side-request-forgery)
- [Service-level indicator](#service-level-indicator)
- [Service-level objective](#service-level-objective)
- [Side-effect sink](#side-effect-sink)
- [Signature](#signature)
- [SKIP LOCKED](#skip-locked)
- [Snapshot](#snapshot)
- [Soft gate](#soft-gate)
- [Split brain](#split-brain)
- [Stable external key](#stable-external-key)
- [Stale worker](#stale-worker)
- [State machine](#state-machine)
- [Step](#step)
- [Stochastic operation](#stochastic-operation)
- [Stored cross-site scripting](#stored-cross-site-scripting)
- [Substring checking](#substring-checking)
- [Syntactic validity](#syntactic-validity)

### T

- [Tenant isolation](#tenant-isolation)
- [Terminal state](#terminal-state)
- [Test oracle](#test-oracle)
- [Threat model](#threat-model)
- [Threshold](#threshold)
- [Time-of-check to time-of-use race](#time-of-check-to-time-of-use-race)
- [Timeout](#timeout)
- [Trace](#trace)
- [Transaction](#transaction)
- [Transaction boundary](#transaction-boundary)
- [Transition](#transition)
- [Trust boundary](#trust-boundary)
- [Two-phase commit](#two-phase-commit)
- [Type checking](#type-checking)

### U

- [Uncontrolled nondeterminism](#uncontrolled-nondeterminism)
- [Unknown outcome](#unknown-outcome)
- [Untrusted input](#untrusted-input)
- [Upsert](#upsert)

### V

- [Version-bound approval](#version-bound-approval)

### W

- [Work claim](#work-claim)
- [Worker](#worker)

</details>

## Level 1: Work and state

This level separates the business work you care about from the processes that happen to execute
it. That distinction makes crash recovery possible.

### Process

**Definition**

A running instance of a program with its own memory and operating-system resources.

**Description**

A process is temporary. It can exit, crash, pause, or move to another machine after a deployment.
Anything known only by that process disappears with it. A resilient design does not confuse the
lifetime of a process with the lifetime of the work.

**Reach for when**

Reach for process-level analysis when you need to identify which state and resources a crash can
erase or isolate.

### Worker

**Definition**

A process, thread, or service instance that executes assigned work.

**Description**

Workers are replaceable executors. They may have identities for logging and temporary ownership,
but the work must not depend on one worker surviving. A worker can execute one item at a time or
many items concurrently.

**Reach for when**

Use a worker when work should continue even if the process that accepted the original request is
gone.

### Process-local state

**Definition**

State stored only in one process's memory.

**Description**

Process-local state is fast and useful for active computation, caches, and open connections. It is
not a recovery record. After a crash, another process cannot know a counter, current step, or
partial result unless the system stored that information somewhere durable.

**Reach for when**

Use process-local state for information that is safe to lose or that durable state can reconstruct.

### Durable state

**Definition**

State committed to storage so another process can recover it after failure.

**Description**

Durable does not mean immortal. The storage system still has limits set by copies stored elsewhere,
backups, and its recovery guarantees. The useful question is concrete: after the worker dies, what
committed record tells its replacement what happened and what remains?

**Reach for when**

Use durable state for ownership, completed progress, accepted outputs, and any decision that must
survive a restart.

### State machine

**Definition**

A set of named states and the transitions allowed between them.

**Description**

A state machine turns lifecycle assumptions into rules. A job may move from `queued` to `running`
and then to `succeeded`, but never from `succeeded` back to `running`. The database or service that
owns the state should reject illegal transitions. A diagram in documentation cannot do that job by
itself.

**Reach for when**

Use a state machine when the current state and an input determine what may happen next.

#### Code samples

##### TypeScript

```ts
/** Order states remain a closed set so callers cannot manufacture unsupported lifecycle stages. */
type OrderState = 'draft' | 'submitted' | 'cancelled'

/** Commands describe the only lifecycle changes the domain permits callers to request. */
type OrderCommand = 'submit' | 'cancel'

/** Transition results preserve the original state when a command is illegal. */
type TransitionResult =
  | {
      /** Signals that the command earned its transition. */ readonly ok: true
      /** The state earned by the accepted command. */ readonly state: OrderState
    }
  | {
      /** Signals a refused command without throwing. */ readonly ok: false
      /** Stable reason suitable for domain handling. */ readonly error: 'illegal_transition'
    }

/** Applies one command without mutating or bypassing the order lifecycle. */
function transition(state: OrderState, command: OrderCommand): TransitionResult {
  if (state === 'draft' && command === 'submit') return { ok: true, state: 'submitted' }
  if (state !== 'cancelled' && command === 'cancel') return { ok: true, state: 'cancelled' }
  return { ok: false, error: 'illegal_transition' }
}
```

##### Go

```go
// OrderState names states that can only be earned through TransitionOrder.
type OrderState string

const (
	// Pending permits the fulfillment transition.
	Pending OrderState = "pending"
	// Fulfilled records that fulfillment has already completed.
	Fulfilled OrderState = "fulfilled"
)

// ErrIllegalTransition identifies a command that is invalid for the current state.
var ErrIllegalTransition = errors.New("illegal order transition")

// TransitionOrder returns a new state without changing the supplied state on refusal.
func TransitionOrder(current, requested OrderState) (OrderState, error) {
	if current != Pending || requested != Fulfilled {
		return current, ErrIllegalTransition
	}
	return Fulfilled, nil
}
```

##### Python

```python
from dataclasses import dataclass, replace
from enum import Enum


class OrderState(Enum):
    """Names only states earned through an order transition."""

    PENDING = "pending"  # Payment may be accepted only from this state.
    PAID = "paid"  # Fulfillment may begin only after payment succeeds.
    CANCELLED = "cancelled"  # Cancellation is terminal in this example.


@dataclass(frozen=True)
class Order:
    """Keeps order state immutable so a rejected transition preserves its input."""

    state: OrderState  # The current state controls which commands are legal.


def mark_paid(order: Order) -> Order:
    """Return a paid copy, rejecting payment from every non-pending state."""
    if order.state is not OrderState.PENDING:
        raise ValueError(f"cannot pay an order in {order.state.value}")
    return replace(order, state=OrderState.PAID)
```

##### C++

```cpp
/** Closes the lifecycle to states that can be earned through transition(). */
enum class OrderState {
  draft,     ///< The only state from which submission is legal.
  submitted, ///< A submitted order may still be cancelled.
  cancelled, ///< Cancellation is terminal in this example.
};

/** Limits callers to commands owned by the order lifecycle. */
enum class OrderCommand {
  submit, ///< Requests the draft-to-submitted transition.
  cancel, ///< Requests cancellation of a non-terminal order.
};

/** Gives callers one stable identity for every refused lifecycle edge. */
struct IllegalTransition {};

/** Earns a new state without mutating or exposing partial state on refusal. */
std::variant<OrderState, IllegalTransition> transition(OrderState state, OrderCommand command) {
  if (state == OrderState::draft && command == OrderCommand::submit) return OrderState::submitted;
  if (state != OrderState::cancelled && command == OrderCommand::cancel) return OrderState::cancelled;
  return IllegalTransition{};
}
```

### Transition

**Definition**

One allowed change from a state machine's current state to its next state.

**Description**

A transition is more than assigning a status string. It has a source state, a destination state, an
actor allowed to request it, and preconditions.

Any related effects should commit with the transition. Under concurrency, the update must also prove
that the source state has not changed since it was read.

**Reach for when**

Reach for explicit transitions when lifecycle changes need authorization, validation, or atomic
effects.

### Invariant

**Definition**

A condition that must remain true while the system runs, including during concurrency, retries,
and crashes.

**Description**

"Only the current owner may finalize a job" is an invariant. State the rule first, then identify
the database constraint, conditional write, lock, or protocol that preserves it. Application code
that merely intends to follow the rule does not enforce it against other writers.

**Reach for when**

Use an invariant to turn a correctness claim into something the implementation and tests can prove.

### Run

**Definition**

One business-level execution request with its own identity and outcome.

**Description**

A run is the durable record of the requested work. It outlives any worker assigned to it. Starting
a data import, calculating a bill, and provisioning an account can each create a run.

**Reach for when**

Use a run when users or operators need to track, cancel, retry, inspect, or audit one execution as a
whole.

### Step

**Definition**

One logical stage within a run.

**Description**

A step describes business progress, not how many times code executed. `validate_input`,
`reserve_inventory`, and `send_receipt` are steps. Give each step a stable identity and version so
recovery can decide whether an earlier result remains usable.

**Reach for when**

Use steps when a run has durable checkpoints, distinct retry rules, or effects that must be tracked
separately.

### Attempt

**Definition**

One physical execution of a step.

**Description**

A step can have several attempts. If the first attempt times out and the second succeeds, the
system still completed one logical step. Keep attempts separate so operators can see every error,
duration, cost, and uncertain outcome instead of overwriting history with the last result.

**Reach for when**

Use attempts as soon as a step can retry, time out, or move between workers.

### Invocation

**Definition**

One call made by an attempt to a local executor or external dependency.

**Description**

An attempt may make several invocations. It might read an account, reserve funds, and write a
receipt. Recording each important invocation exposes which operation failed and which external
effects may already have happened.

**Reach for when**

Use invocation records when one attempt crosses multiple failure boundaries or when individual
calls need audit, timing, or cost data.

### Artifact

**Definition**

A stored input or output produced or consumed by work.

**Description**

Artifacts include request bodies, imported files, normalized records, reports, and provider
responses. Storing an artifact separately from status lets the system verify that a claimed output
exists and identify the exact bytes used by later steps.

**Reach for when**

Use an artifact when an input or result must survive, be inspected, or be referred to by identity.

### Terminal state

**Definition**

A state from which normal automatic execution does not continue.

**Description**

`succeeded`, `cancelled`, and `failed_permanently` are common terminal states. A terminal state may
still allow an explicit operator action such as reopening or replacing a run. That action should be
a separate, audited transition rather than an undocumented status edit.

**Reach for when**

Use terminal states to make completion and the end of automatic retries unambiguous.

### Work hierarchy

The first distinctions fit together like this:

```text
Run
└── Step
    ├── Attempt 1
    │   └── Invocation(s)
    └── Attempt 2
        └── Invocation(s)
```

An artifact may be attached to any level, but its lineage should say which attempt and invocation
produced it.

## Level 2: Data validity and identity

Once the units of work are clear, the system needs reliable ways to reject invalid data and identify
the exact data it used.

### Type checking

**Definition**

Static analysis that checks relationships between values in source code before the program runs.

**Description**

Type checking catches many programmer mistakes. It cannot prove that bytes from a request, queue,
file, or database match the declared type. Data crossing a runtime boundary still needs runtime
validation.

**Reach for when**

Use type checking to make invalid combinations harder to express while writing and compiling code.

### Runtime validation

**Definition**

Checking actual data while the program runs.

**Description**

Runtime validation protects boundaries where the compiler cannot know what arrived. It can reject a
missing identifier or malformed timestamp. Validate before the program turns untrusted bytes into
trusted domain values.

**Reach for when**

Use runtime validation at network, storage, file, message, and user-input boundaries.

### Database constraint

**Definition**

A data rule that the database enforces for every writer.

**Description**

Examples include `NOT NULL`, `CHECK`, foreign keys, exclusion constraints, and unique indexes. A
runtime validator improves error messages but does not replace a database constraint when several
processes or tools can write the same data.

**Reach for when**

Use a database constraint when invalid durable state must be rejected regardless of which code path
writes it.

### Syntactic validity

**Definition**

Whether data has the required shape and representation.

**Description**

A timestamp may have valid ISO 8601 syntax and a percentage may be a number between zero and one.
Those checks say nothing about whether the timestamp describes the right event or the percentage is
true.

**Reach for when**

Use syntactic validation before interpreting data or applying business rules to it.

### Semantic validity

**Definition**

Whether data means something true and acceptable in its business context.

**Description**

A schema can prove that `available_balance` is a number. It cannot prove that the number matches the
ledger. Semantic validation often needs authoritative records, business rules, or human judgment.

**Reach for when**

Use semantic validation after shape checks when correctness depends on meaning, history, or policy.

### Cross-field invariant

**Definition**

An invariant that relates two or more fields.

**Description**

An order cannot be `shipped` without a shipment identifier. An interval's end cannot precede its
start. Validate the relationship as one rule so callers cannot update the fields independently into
an impossible combination.

**Reach for when**

Use a cross-field invariant whenever validating each field alone can still produce invalid state.

### Serialization

**Definition**

Converting a value into bytes for storage or transmission.

**Description**

Hashes, signatures, and network protocols operate on bytes, not abstract objects. Character
encoding, property order, number formatting, whitespace, and newline style can all change the bytes
without changing what a person thinks the value means.

**Reach for when**

Use explicit serialization rules whenever byte-for-byte identity matters.

### Canonicalization

**Definition**

Choosing one byte representation for values the system considers equivalent.

**Description**

Canonicalization removes irrelevant variation before hashing or signing. The rules must specify
encoding, field order, number representation, omitted values, and other choices that affect bytes.
Calling a format "JSON" is not precise enough because valid JSON objects can serialize several
ways.

**Reach for when**

Use canonicalization when equivalent values must produce the same digest, signature, cache key, or
idempotency key.

#### Code samples

##### TypeScript

```ts
/** SignedInput contains the fields whose logical value, rather than insertion order, owns identity. */
interface SignedInput {
  /** Identifies the actor exactly as supplied. */
  readonly actorId: string
  /** Holds unordered permissions that must hash identically in any input order. */
  readonly permissions: readonly string[]
}

/** Produces stable UTF-8 input while leaving the caller's permission array untouched. */
function canonicalBytes(value: SignedInput): Uint8Array {
  return new TextEncoder().encode(JSON.stringify({
    actorId: value.actorId,
    permissions: [...value.permissions].sort(),
  }))
}

/** Hashes only canonical bytes so equivalent inputs share a digest across callers. */
async function digest(value: SignedInput): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', canonicalBytes(value))
}
```

##### Go

```go
// CanonicalRequest contains the stable fields covered by a request digest.
type CanonicalRequest struct {
	// Method is normalized to uppercase so casing cannot change identity.
	Method string `json:"method"`
	// Path is hashed exactly as routed, including its leading slash.
	Path string `json:"path"`
}

// RequestDigest hashes a deterministic JSON representation of the normalized value.
func RequestDigest(method, path string) ([32]byte, error) {
	canonical := CanonicalRequest{Method: strings.ToUpper(method), Path: path}
	encoded, err := json.Marshal(canonical)
	if err != nil {
		return [32]byte{}, err
	}
	return sha256.Sum256(encoded), nil
}
```

##### Python

```python
import hashlib
import json
from collections.abc import Mapping


def canonical_digest(value: Mapping[str, str]) -> str:
    """Hash UTF-8 JSON with stable key order and no insignificant whitespace."""
    # These options define the byte-level identity shared by all participants.
    canonical = json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()
```

##### C++

```cpp
/** Separates logical identity from the input order of unordered permissions. */
struct SignedInput {
  std::string actor_id;                ///< Preserves the actor identifier byte-for-byte.
  std::vector<std::string> permissions; ///< Treats permission order as semantically irrelevant.
};

/** Produces an unambiguous length-prefixed byte sequence without mutating the input. */
std::vector<std::byte> canonical_bytes(const SignedInput& input) {
  /** Orders the copied permissions so equivalent sets receive identical encodings. */
  auto permissions = input.permissions;
  std::ranges::sort(permissions);
  /** Owns the canonical bytes; each field is prefixed with a fixed-width network-order length. */
  std::vector<std::byte> result;
  /** Appends one string using the canonical length-prefix contract. */
  const auto append = [&result](std::string_view value) {
    const auto size = static_cast<std::uint32_t>(value.size());
    for (int shift : {24, 16, 8, 0}) result.push_back(std::byte((size >> shift) & 0xff));
    for (unsigned char byte : value) result.push_back(std::byte(byte));
  };
  append(input.actor_id);
  for (const auto& permission : permissions) append(permission);
  return result;
}
```

### Digest

**Definition**

A fixed-size value calculated from bytes by a hash function.

**Description**

A cryptographic digest such as SHA-256 gives content a compact identity. A verifier can detect
corruption by recomputing the digest and comparing it with a trusted expected value. Detecting
malicious substitution also requires the expected digest to arrive through a trusted or
authenticated channel. A digest does not preserve the content or prove who created it.

**Reach for when**

Use a digest to identify and later verify exact bytes.

### Content-addressed storage

**Definition**

Storage that places content under a key derived from its digest.

**Description**

Equal bytes map to the same address. The design assumes different bytes will not collide under the
chosen hash, but it must still reject an integrity failure if they do. Reads should recompute the
digest and compare it with the requested address. The storage design also needs access control,
retention, and backup.

**Reach for when**

Use content-addressed storage for immutable artifacts, deduplicated blobs, build outputs, and input
snapshots.

### Immutable artifact

**Definition**

An artifact whose bytes cannot be changed in place.

**Description**

Corrections create a new artifact with a new identity. Enforce immutability through storage
permissions and write APIs, not convention. Deletion under a retention policy is different from
mutation and should have its own rules.

**Reach for when**

Use immutable artifacts when later work, approvals, audits, or recovery must refer to an exact
version.

### Snapshot

**Definition**

A preserved copy of data as it existed at a stated point in time.

**Description**

A digest says what the old bytes hashed to. A snapshot keeps the old bytes. A durable run cannot
resume from a digest alone if the mutable source has changed or disappeared.

**Reach for when**

Use a snapshot when later recovery or audit must reconstruct the inputs that were actually seen.

### Lineage

**Definition**

The machine-readable relationships between inputs, transformations, and outputs.

**Description**

Lineage answers questions such as which input snapshot and operation version produced an output.
It should use stable identifiers rather than descriptions intended only for people.

**Reach for when**

Use lineage when outputs need to be traced, invalidated, recomputed, or audited.

### Provenance

**Definition**

The broader record of an artifact's origin and processing history.

**Description**

Provenance includes lineage plus actors, timestamps, software versions, configuration, approvals,
and relevant execution records. It explains not only which data flowed where, but who or what
authorized and performed the work.

**Reach for when**

Use provenance when trust, compliance, incident response, or reproducibility depends on how an
artifact came to exist.

## Level 3: Coordination and ownership

After work and data have durable identities, workers need rules for deciding who may act.

### Queue

**Definition**

A collection of pending work that workers can claim.

**Description**

A resilient queue stores enough state to survive worker loss. It also defines ordering, visibility,
redelivery, retention, and what happens to work that never succeeds. A database table can be a
queue, but the team then owns those behaviors.

**Reach for when**

Use a queue when accepting work and executing it need different timing, capacity, or failure
handling.

### Work claim

**Definition**

The atomic act of assigning an available work item to a worker.

**Description**

Selection and assignment must behave as one operation. If two workers can both observe an item as
available before either records ownership, they can both execute it. A claim usually creates a
lease or another bounded ownership record.

**Reach for when**

Use a work claim when several workers compete for the same pending items.

#### Code samples

##### TypeScript

```ts
/** WorkItem exposes only the identity and payload transferred to a successful claimant. */
interface WorkItem {
  /** Identifies the queue record across retries. */
  readonly id: string
  /** Carries immutable work input owned by the claimant. */
  readonly payload: string
}

/** WorkQueue owns the transaction or conditional write that prevents two winners. */
interface WorkQueue {
  /** Returns one item claimed for this worker, or undefined when no claim can be won. */
  claimNext(workerId: string, leaseDurationMs: number): Promise<WorkItem | undefined>
}

/** Lets storage calculate expiration with its own clock while atomically assigning ownership. */
async function claimWork(
  queue: WorkQueue,
  workerId: string,
  leaseDurationMs: number,
): Promise<WorkItem | undefined> {
  return queue.claimNext(workerId, leaseDurationMs)
}
```

##### Go

```go
// WorkItem is returned only after storage has made this worker its owner.
type WorkItem struct {
	// ID is the stable identity used for later completion.
	ID string
}

// WorkStore owns the transaction and row-lock semantics of a claim.
type WorkStore interface {
	// ClaimNext atomically selects one queued row and marks it claimed, or returns sql.ErrNoRows.
	ClaimNext(context.Context, string) (WorkItem, error)
}

// ClaimWork keeps worker orchestration independent of the storage locking mechanism.
func ClaimWork(ctx context.Context, store WorkStore, workerID string) (WorkItem, error) {
	return store.ClaimNext(ctx, workerID)
}
```

##### Python

```python
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class WorkItem:
    """Identifies work whose ownership was granted by storage."""

    item_id: str  # Workers use this stable identity for later completion.


class WorkQueue(Protocol):
    """Owns the transaction that prevents two workers claiming one item."""

    def claim_next(self, worker_id: str) -> WorkItem | None:
        """Atomically claim one pending item, or return None when none is available."""
        ...


def take_work(queue: WorkQueue, worker_id: str) -> WorkItem | None:
    """Delegate the concurrency decision to the authoritative storage boundary."""
    return queue.claim_next(worker_id)
```

##### C++

```cpp
/** Is returned only after storage grants ownership to one worker. */
struct WorkItem {
  std::string id;      ///< Identifies the queue record across retries.
  std::string payload; ///< Transfers immutable processing input to the winner.
};

/** Owns the transaction or conditional write that selects exactly one claimant. */
class WorkQueue {
public:
  /** Enables cleanup through an interface pointer without constraining storage lifetime. */
  virtual ~WorkQueue() = default;
  /** Atomically claims one item and calculates expiry with the storage authority's clock. */
  virtual std::optional<WorkItem> claim_next(
      std::string_view worker_id,
      std::chrono::milliseconds lease_duration) = 0;
};

/** Keeps selection and ownership assignment inside the authoritative atomic boundary. */
std::optional<WorkItem> claim_work(
    WorkQueue& queue,
    std::string_view worker_id,
    std::chrono::milliseconds lease_duration) {
  return queue.claim_next(worker_id, lease_duration);
}
```

### Row lock

**Definition**

A database lock on one or more rows held until the current transaction ends.

**Description**

A row lock can stop competing claim transactions from selecting the same work. It does not protect
the work after the transaction commits. Long-running work should not keep a transaction open merely
to hold its row lock.

**Reach for when**

Use row locks for short, transactional coordination around shared database records.

### `SKIP LOCKED`

**Definition**

A SQL locking option that skips rows another transaction has already locked.

**Description**

`SKIP LOCKED` lets competing workers claim different rows instead of waiting behind one another.
It reduces contention during the claim transaction. It does not create a lease, recover abandoned
work, or reject a stale worker after the transaction ends.

**Reach for when**

Use `SKIP LOCKED` when workers claim independent rows from a database-backed queue.

### Lease

**Definition**

Permission to act as owner of a resource until a recorded expiration time.

**Description**

A lease lets another worker recover work after the owner stops renewing it. The system must define
which clock decides expiration and how renewal works.

Expiration does not stop the old worker. Every protected write still needs a current ownership check
or fencing token.

**Reach for when**

Use a lease when ownership must recover automatically after a worker becomes unreachable.

### Lease owner

**Definition**

The worker identity currently named by a lease.

**Description**

An owner identifier helps with routing and diagnosis. Reusing the same worker identity after a
restart can make an old process indistinguishable from a new one, so the identifier alone is not a
safe fencing mechanism.

**Reach for when**

Use a lease owner to identify who should renew and release a lease, together with an ownership
generation.

### Lease expiration

**Definition**

The time after which the coordinator may assign the resource to another owner.

**Description**

Expiration is a decision by the system that records the lease, not proof that the earlier worker
stopped. Choose the lease duration from realistic pause and network-delay behavior. A duration
copied from a tutorial can cause needless duplicate work or painfully slow recovery.

**Reach for when**

Use lease expiration to put a recoverable bound on temporary ownership.

### Heartbeat

**Definition**

A periodic signal that a worker is still able to contact the coordinator.

**Description**

A heartbeat proves recent communication. It does not by itself prove useful progress, continued
ownership, or that an external operation stopped after heartbeats ceased. Lease renewal should
check the current owner and fencing token before extending expiration.

**Reach for when**

Use heartbeats to renew leases and report liveness during work that lasts longer than one claim
transaction.

### Progress signal

**Definition**

A recorded indication that useful work advanced.

**Description**

Progress and liveness are different. A worker may heartbeat forever while stuck on the same item.
A progress signal might record bytes copied, a completed checkpoint, or the last sequence number
applied. Its meaning must be specific enough to detect a stall.

**Reach for when**

Use progress signals when operators or automated recovery need to distinguish slow work from stuck
work.

### Fencing token

**Definition**

A monotonically increasing ownership generation that protected writes must present.

**Description**

When ownership moves from token 17 to token 18, a stale worker holding token 17 may still run but
cannot commit. The protected resource must atomically reject a generation older than the highest one
it has accepted, or route writes through a linearizable authority that performs the equivalent
check. A token stored only for logging does not fence anything.

**Reach for when**

Use a fencing token with recoverable ownership whenever an old worker could resume after a new
worker takes over.

#### Code samples

##### TypeScript

```ts
/** Completion identifies the exact lease generation whose output may become authoritative. */
interface Completion {
  /** Identifies the claimed work. */
  readonly workId: string
  /** Monotonically increasing token remains exact beyond JavaScript's number range. */
  readonly fencingToken: bigint
  /** Carries the immutable result to commit. */
  readonly result: string
}

/** WorkStore owns the compare-and-set against current status and fencing token. */
interface WorkStore {
  /** Commits only while the item is running under the supplied token; false means authority was lost. */
  finalizeIfCurrent(completion: Completion): Promise<boolean>
}

/** Finalizes through one conditional storage operation so checking authority cannot race the write. */
async function finalize(store: WorkStore, completion: Completion): Promise<'completed' | 'stale'> {
  return (await store.finalizeIfCurrent(completion)) ? 'completed' : 'stale'
}
```

##### Go

```go
// Completion identifies the exact lease generation authorized to finalize work.
type Completion struct {
	// WorkID selects the authoritative work record.
	WorkID string
	// Token must equal the record's current fencing token.
	Token uint64
	// Result is committed only while the token remains authoritative.
	Result []byte
}

// CompletionStore owns the conditional write that excludes stale workers.
type CompletionStore interface {
	// CompleteIfCurrent changes state only when the work remains running under token.
	CompleteIfCurrent(context.Context, Completion) (bool, error)
}

// Finalize rejects lost authority even when a stale worker finishes successfully.
func Finalize(ctx context.Context, store CompletionStore, completion Completion) error {
	updated, err := store.CompleteIfCurrent(ctx, completion)
	if err != nil {
		return err
	}
	if !updated {
		return errors.New("stale fencing token")
	}
	return nil
}
```

##### Python

```python
from typing import Protocol


class FencedStore(Protocol):
    """Makes token comparison and finalization one atomic storage operation."""

    def finalize_if_current(self, item_id: str, token: int, result: bytes) -> bool:
        """Commit only when item ownership still has exactly the supplied token."""
        ...


def finalize_work(
    store: FencedStore,
    item_id: str,
    token: int,
    result: bytes,
) -> None:
    """Reject a stale worker without allowing its result to overwrite newer work."""
    if not store.finalize_if_current(item_id, token, result):
        raise PermissionError("work claim is no longer authoritative")
```

##### C++

```cpp
/** Binds output to the exact lease generation that produced it. */
struct Completion {
  std::string work_id;        ///< Selects the authoritative work record.
  std::uint64_t fencing_token; ///< Rejects owners from superseded leases.
  std::string result;          ///< Carries the immutable output to commit.
};

/** Owns the atomic token comparison and result write. */
class WorkStore {
public:
  /** Enables cleanup through the storage abstraction. */
  virtual ~WorkStore() = default;
  /** Commits only for the current running token; false guarantees no write occurred. */
  virtual bool finalize_if_current(const Completion& completion) = 0;
};

/** Reports whether one conditional write accepted or fenced the completion. */
enum class FinalizeResult {
  completed, ///< Storage committed the result under current authority.
  stale,     ///< Authority was lost and storage remained unchanged.
};

/** Prevents authority checking from racing finalization. */
FinalizeResult finalize(WorkStore& store, const Completion& completion) {
  return store.finalize_if_current(completion) ? FinalizeResult::completed : FinalizeResult::stale;
}
```

### Stale worker

**Definition**

A worker that continues running after it has lost authority to act.

**Description**

Long pauses, network partitions, delayed messages, and stop-the-world runtime events can create
stale workers. The system cannot rely on the worker noticing quickly. The authoritative write path
must reject stale ownership.

**Reach for when**

Reach for stale-worker analysis when ownership can expire or move while the old process may still be
running.

### Compare-and-swap

**Definition**

An update that succeeds only if the current value still matches an expected old value.

**Description**

Compare-and-swap turns "update if nothing changed" into one atomic operation. Database updates often
express it with a `WHERE` clause containing the expected version. If no row changes, the caller lost
the race and must not pretend the write succeeded.

**Reach for when**

Use compare-and-swap to protect state transitions and writes based on previously read state.

### Optimistic concurrency control

**Definition**

A strategy that detects conflicting writes using versions instead of holding a lock while work is
prepared.

**Description**

The reader records a version, calculates a change, and submits the old version with the update. A
different current version means another writer won. The caller can reload, merge, retry, or report
the conflict according to the business rule.

**Reach for when**

Use optimistic concurrency when conflicts are uncommon or work cannot safely hold a lock for its
whole duration.

### Checkpoint

**Definition**

A durable record of completed progress that recovery may reuse.

**Description**

A checkpoint should identify the completed step, its immutable outputs, and the versions of code,
configuration, and inputs that made them valid. Partial files or a status written before the output
commits are not safe checkpoints.

**Reach for when**

Use checkpoints to avoid repeating expensive or externally visible work after failure.

### Resume

**Definition**

Continuing work from valid durable checkpoints instead of restarting blindly.

**Description**

Resume logic must decide whether each checkpoint remains compatible with the current operation and
inputs. Reusing stale output can be worse than repeating work. Starting over can also duplicate an
external effect, so the choice belongs in the step contract.

**Reach for when**

Use resume when runs contain durable steps and recovery should continue from the last proven point.

## Level 4: Failure and retry

Coordination cannot prevent every failure. This level names what the caller knows, what may have
happened elsewhere, and when another attempt is safe.

If several machines hold copies of the same data, the system must decide which copies may accept
writes, how many must agree, and what happens when they cannot communicate. The next terms name
those choices before the glossary turns to retries.

### Network partition

**Definition**

A communication failure that prevents some parts of a system from exchanging messages while they
may continue running.

**Description**

Each side can look healthy to itself. A timeout cannot prove whether the other side crashed, the
network dropped the request, or the reply is merely late. Designs need a rule for which side may
keep accepting writes and how conflicting state is handled after communication returns.

**Reach for when**

Use network-partition analysis whenever correctness depends on coordination across machines or
failure zones.

### Failure detector

**Definition**

A mechanism that uses missed communication to suspect that another component is unavailable.

**Description**

In an ordinary asynchronous network, a detector cannot always distinguish a crashed process from a
slow process or delayed network. Timeouts produce suspicion, not proof. Leases and fencing make that
uncertainty safe by transferring authority and rejecting the older owner.

**Reach for when**

Use a failure detector to trigger recovery while designing the ownership rules for false suspicion.

### Clock skew

**Definition**

The difference between clocks that are meant to represent the same time.

**Description**

Machine clocks can disagree or jump after synchronization. Lease expiration should use the clock of
the system that owns the lease record where possible. Durations inside one process should use a
monotonic clock, which is intended to move forward steadily while measuring elapsed time. A wall
clock can jump during time correction.

**Reach for when**

Use clock-skew analysis for leases, deadlines, timestamps, ordering, and cross-machine measurements.

### Replication

**Definition**

Keeping copies of data or service state in more than one place.

**Description**

Replication can improve availability, read capacity, and disaster recovery. It also creates rules
for which copy accepts writes, when a write counts as committed, and what readers may observe while
copies disagree.

**Reach for when**

Use replication when one storage location or service instance cannot meet availability, durability,
or capacity needs by itself.

### Leader

**Definition**

The member currently authorized to coordinate a group or accept a class of writes.

**Description**

Leadership is temporary authority, not a permanent machine identity. The system needs a way to elect
a new leader and to stop an older leader from committing after it loses authority. That second rule
is the same fencing problem seen with workers.

**Reach for when**

Use a leader when one ordered decision point is simpler or safer than allowing every replica to
accept conflicting changes.

### Quorum

**Definition**

A required number of members that must agree or respond before an operation proceeds.

**Description**

Quorums are chosen so important groups overlap. For example, a majority of five members is three,
and any two majorities share at least one member. Counting responses is useful only when the
protocol also tracks the leadership generation or election number and can identify the current
response.

**Reach for when**

Use a quorum in a protocol that needs decisions to survive member loss without allowing disjoint
groups to decide independently.

### Split brain

**Definition**

A failure where separate parts of a system each believe they hold exclusive authority.

**Description**

Split brain can create conflicting writes and duplicated external effects. Majority agreement,
leases backed by fencing, or a single authoritative coordinator can prevent both sides from
committing. Detecting the conflict after the fact may require reconciliation.

**Reach for when**

Use split-brain analysis when leadership or ownership can continue on both sides of a partition.

### Consistency model

**Definition**

The contract that says which values reads may return after concurrent or recent writes.

**Description**

"Consistent" is incomplete without a model. The contract may promise one global order, eventual
convergence, read-your-writes behavior, or something else. State the guarantee per operation and
data path, including replicas and caches.

**Reach for when**

Use a consistency model when callers need to know how fresh or ordered observed state will be.

### Linearizability

**Definition**

A consistency model where each completed operation appears to take effect at one instant between
its start and finish.

**Description**

Linearizability lets callers reason as if operations happened one at a time in real-time order. If
one write finishes before another begins, every observer must place the first write earlier. This
guarantee is useful for ownership, unique allocation, and compare-and-swap. It usually requires
coordination and may reject or delay operations when the system cannot reach the authority that
orders them.

**Reach for when**

Use linearizable operations when acting on stale or differently ordered state would break an
invariant.

### Eventual consistency

**Definition**

A consistency model where replicas may temporarily disagree but converge after updates and failures
stop.

**Description**

Eventual consistency does not say how long convergence takes or what conflicts look like. The design
still needs merge rules, version information, and user-visible behavior for stale reads.

**Reach for when**

Use eventual consistency when temporary disagreement is acceptable and availability or local access
matters more than immediate agreement.

### Read-your-writes consistency

**Definition**

A guarantee that a caller can read its own completed writes even if other readers may still see an
older value.

**Description**

This session-level guarantee often matches what an interactive workflow needs without requiring
every read to be globally current. It requires routing, version tokens, or waiting for a replica to
catch up.

**Reach for when**

Use read-your-writes consistency when subsequent reads in a defined session or client scope must
include that client's completed writes.

### CAP theorem

**Definition**

A result showing that during a network partition, a replicated system cannot guarantee both
linearizability and availability as CAP defines it.

**Description**

For CAP, availability means every request received by a nonfailed node eventually gets a response,
though the response may not contain the latest value. The forced choice appears while required
members cannot communicate and can differ by operation. A system may reject writes it cannot safely
coordinate while continuing to serve stale reads. CAP does not say that every system chooses two
permanent settings from three labels.

**Reach for when**

Use CAP to ask which operations stop and which consistency guarantees weaken during a real network
partition.

### Partial failure

**Definition**

A failure where some parts of a distributed operation succeed while others fail or become
unreachable.

**Description**

One service may commit while its caller times out. A worker may fail while the database and remote
dependency stay healthy. Distributed systems need explicit behavior for these mixed outcomes
because there is no single process crash that rolls everything back.

**Reach for when**

Use partial failure as the default assumption whenever work crosses a process, machine, or storage
boundary.

### Failure window

**Definition**

An interval between operations where a crash can leave state inconsistent or the outcome unknown.

**Description**

The common window is "external effect completed, local record not committed." Draw the ordered
operations and place a crash between every pair. Each position should have a recovery rule.

**Reach for when**

Reach for failure-window analysis when one operation changes two systems, or when a crash between
two writes could leave only one recorded.

### Ambiguous outcome

**Definition**

An outcome the caller cannot classify as success or failure.

**Description**

If a connection closes after the request leaves, the remote system may have committed the change.
Retrying can duplicate the effect. Giving up can leave completed work unrecorded. Resolve the
ambiguity with an idempotency key, a status lookup, or reconciliation.

**Reach for when**

Use this term when the absence of a successful response does not prove that the operation failed.

### At-most-once execution

**Definition**

Execution that occurs zero or one time.

**Description**

At-most-once avoids duplicate attempts by refusing to retry uncertain work. It can lose work if the
process marks an operation complete before performing it and then crashes. This tradeoff is safe
only when omission is preferable to duplication.

**Reach for when**

Use at-most-once execution when duplicate execution is unacceptable and losing an occasional
operation is an explicit business choice.

### At-least-once execution

**Definition**

Execution that may repeat and, under its stated operating assumptions, keeps retrying eligible work
until at least one successful execution is recorded.

**Description**

At-least-once execution avoids silently losing eligible unfinished work. It makes duplicates normal,
not exceptional. Every effect within the retry boundary needs idempotency, deduplication, or an
explicit duplicate-handling rule.

Dead-lettering, expiry, cancellation, or exhausted retry budgets can stop work before success. Once
policy allows that outcome, describe the policy as bounded retry rather than an unconditional
at-least-once guarantee.

**Reach for when**

Use at-least-once execution when completing the work matters more than avoiding repeated attempts.

### Exactly-once effect

**Definition**

A business effect that becomes visible exactly once despite retries and failures.

**Description**

Exactly-once effect describes the result, not the number of function or network-call executions.
Systems usually achieve it by combining at-least-once execution with a stable operation identity.
The authoritative receiver must atomically bind that identity to the effect or stored outcome. If it
cannot, recovery depends on reconciliation or compensation instead of a strict exactly-once effect.

**Reach for when**

Use this term for a specific observable effect, such as one charge or one inventory reservation,
and name the receiver that prevents duplicates.

### Effectively-once processing

**Definition**

At-least-once execution whose duplicate attempts leave the same business state as one attempt.

**Description**

Retries still happen, so logs, cost, and latency may differ. Idempotent writes or receiver-side
deduplication make the final business state appear once. Do not shorten this claim to "exactly once"
without saying which effect and enforcement point you mean.

**Reach for when**

Use effectively-once processing when retries are expected and the receiver can collapse duplicate
effects.

### Idempotent operation

**Definition**

An operation that produces the same business state when repeated with the same identity and input.

**Description**

Idempotency is a receiver contract. The contract must define the key's scope and lifetime, whether a
repeated key must carry identical input, and what response duplicates receive. "We probably will not
send it twice" is not idempotency.

**Reach for when**

Use an idempotent operation at retryable boundaries where duplicate effects would be wrong.

### Idempotency key

**Definition**

A stable operation identity that the receiver stores and enforces across repeated requests.

**Description**

The key should describe the logical effect, not one physical attempt. The receiver needs an atomic
unique constraint or equivalent mechanism. It should reject reuse with conflicting input rather
than silently applying a different request under the old identity.

**Reach for when**

Use an idempotency key when callers may retry a state-changing request after a timeout or crash.

#### Code samples

##### TypeScript

```ts
/** ReservationCommand gives one logical inventory effect a stable identity and input digest. */
interface ReservationCommand {
  /** Remains stable across every attempt of this reservation. */ readonly idempotencyKey: string
  /** Detects reuse of the key with different request data. */ readonly requestDigest: string
  /** Identifies the inventory record changed by the effect. */ readonly sku: string
  /** Must be positive and validated before settlement. */ readonly quantity: number
}

/** ReservationResult is the durable response returned for every matching retry. */
interface ReservationResult {
  /** Identifies the single reservation created for the command. */ readonly reservationId: string
}

/** InventoryStore atomically binds the key and digest to one local reservation record. */
interface InventoryStore {
  /** Returns the stored result on a matching retry and rejects a conflicting digest. */
  reserveOnce(command: ReservationCommand): Promise<ReservationResult>
}

/** Delegates concurrent duplicate handling to the authoritative transaction boundary. */
function reserveInventory(
  store: InventoryStore,
  command: ReservationCommand,
): Promise<ReservationResult> {
  return store.reserveOnce(command)
}
```

##### Go

```go
// ReservationCommand gives one local inventory effect a stable identity and input digest.
type ReservationCommand struct {
	// IdempotencyKey remains stable across every attempt of this reservation.
	IdempotencyKey string
	// RequestDigest detects reuse of the key with different command data.
	RequestDigest [32]byte
	// SKU identifies the inventory record changed by the effect.
	SKU string
	// Quantity must be positive and validated before settlement.
	Quantity int
}

// ReservationResult is the durable response returned for every matching retry.
type ReservationResult struct {
	// ReservationID identifies the single reservation created for the command.
	ReservationID string
}

// InventoryStore atomically binds the key and digest to one local reservation record.
type InventoryStore interface {
	// ReserveOnce returns a stored result on a match and rejects a conflicting digest.
	ReserveOnce(context.Context, ReservationCommand) (ReservationResult, error)
}

// ReserveInventory delegates concurrent duplicate handling to the transaction boundary.
func ReserveInventory(
	ctx context.Context,
	store InventoryStore,
	command ReservationCommand,
) (ReservationResult, error) {
	return store.ReserveOnce(ctx, command)
}
```

##### Python

```python
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class ReservationCommand:
    """Gives one local inventory effect a stable identity and input digest."""

    idempotency_key: str  # Remains stable across every attempt of this reservation.
    request_digest: bytes  # Detects reuse of the key with different command data.
    sku: str  # Identifies the inventory record changed by the effect.
    quantity: int  # Must be positive and validated before settlement.


@dataclass(frozen=True)
class ReservationResult:
    """Is the durable response returned for every matching retry."""

    reservation_id: str  # Identifies the single reservation created for the command.


class InventoryStore(Protocol):
    """Atomically binds the key and digest to one local reservation record."""

    def reserve_once(self, command: ReservationCommand) -> ReservationResult:
        """Return a stored result on a match and reject a conflicting digest."""
        ...


def reserve_inventory(
    store: InventoryStore,
    command: ReservationCommand,
) -> ReservationResult:
    """Delegate concurrent duplicate handling to the transaction boundary."""
    return store.reserve_once(command)
```

##### C++

```cpp
/** Gives one local inventory effect a stable identity and input digest. */
struct ReservationCommand {
  std::string idempotency_key;               ///< Remains stable across every attempt.
  std::array<std::byte, 32> request_digest;  ///< Detects conflicting key reuse.
  std::string sku;                           ///< Identifies the inventory record changed.
  unsigned quantity;                         ///< Must be positive and validated before settlement.
};

/** Is the durable response returned for every matching retry. */
struct ReservationResult {
  std::string reservation_id; ///< Identifies the one reservation created for the command.
};

/** Atomically binds the key and digest to one local reservation record. */
class InventoryStore {
public:
  /** Enables cleanup through an implementation-independent boundary. */
  virtual ~InventoryStore() = default;
  /** Returns a stored result on a match and rejects a conflicting digest. */
  virtual ReservationResult reserve_once(const ReservationCommand& command) = 0;
};

/** Delegates concurrent duplicate handling to the authoritative transaction boundary. */
ReservationResult reserve_inventory(
    InventoryStore& store,
    const ReservationCommand& command) {
  return store.reserve_once(command);
}
```

### Deduplication

**Definition**

Detecting that the system has already processed the same logical operation.

**Description**

Deduplication requires a stable identity and an authoritative record. Time-based memory caches can
reduce duplicates but lose their guarantee after eviction or restart. Decide how long identities
remain protected and what happens after that period.

**Reach for when**

Use deduplication when inputs can arrive more than once but only one logical effect should remain.

### Cache key

**Definition**

A key used to reuse a result calculated for equivalent inputs.

**Description**

A cache key answers a performance question: "Can this result be reused?" An idempotency key answers
a safety question: "Did this logical operation already happen?" A stochastic operation can make
cross-run caching choose one earlier sample as policy, but the cache does not make the operation
deterministic.

**Reach for when**

Use a cache key to avoid repeated calculation when reuse is acceptable. Do not use one as a silent
substitute for an idempotency contract.

### Retry

**Definition**

A new attempt after an earlier attempt did not complete with a usable recorded result.

**Description**

Retries consume capacity and may repeat effects. Before retrying, classify whether another attempt
can help and whether the earlier effect is known not to have happened. Put a limit on attempts,
elapsed time, or both.

**Reach for when**

Use a retry for failures likely to clear, after making repeated or ambiguous effects safe.

### Retryable failure

**Definition**

A failure for which another attempt may succeed without changing the request or system policy.

**Description**

Examples include a rate limit, a short dependency outage, and a lost connection before any request
bytes were sent. Retryability depends on operation semantics. The same timeout may be safe for a
read and ambiguous for a create.

**Reach for when**

Use this classification to decide which failures enter retry scheduling.

### Non-retryable failure

**Definition**

A failure that another identical attempt cannot fix.

**Description**

Invalid input, missing permission, violated policy, and unsupported configuration are common
examples. Repeating them wastes capacity and can hide a problem that needs correction or operator
action.

**Reach for when**

Use this classification to stop automatic retries and record what must change before work resumes.

### Unknown outcome

**Definition**

A result whose external effect cannot be determined from the caller's current evidence.

**Description**

Unknown outcome is separate from retryability. The underlying cause may be temporary while an
immediate retry remains unsafe. Query by operation identity or reconcile external state before
choosing the next action.

**Reach for when**

Reach for unknown-outcome handling when a local call failed after it may have reached a remote
system, so another attempt could repeat an effect.

### Retry budget

**Definition**

A limit on how much repeated work the system will perform for one operation or dependency.

**Description**

A budget may limit attempt count, elapsed time, cost, or a shared rate of retries. It prevents one
bad item or failing dependency from consuming all capacity. Exhaustion should produce an explicit
state instead of silently abandoning work.

**Reach for when**

Use a retry budget wherever automatic retries could continue indefinitely or amplify an outage.

### Backoff

**Definition**

A delay that grows between retry attempts.

**Description**

Backoff gives a failing dependency time to recover and lowers repeated load. Cap the delay so work
does not disappear for an unreasonable period, and keep it inside the operation's deadline.

**Reach for when**

Use backoff for failures that may clear with time.

### Jitter

**Definition**

Random variation added to retry timing.

**Description**

Without jitter, many clients that fail together retry together and create another traffic spike.
The exact algorithm matters less than preventing synchronized retries while respecting deadlines.

**Reach for when**

Use jitter whenever multiple workers or clients can back off after the same shared failure.

#### Code samples

##### TypeScript

```ts
/** RandomFraction supplies a reproducible value in the half-open interval [0, 1). */
type RandomFraction = () => number

/** Calculates full-jitter delay without reading ambient randomness or exceeding the cap. */
function retryDelayMs(attempt: number, baseMs: number, capMs: number, random: RandomFraction): number {
  return Math.floor(random() * Math.min(capMs, baseMs * 2 ** attempt))
}
```

##### Go

```go
// Jitter supplies a deterministic-in-tests multiplier in the inclusive range [0, 1].
type Jitter func() float64

// Backoff returns a capped exponential delay scaled by an explicit jitter source.
func Backoff(base, cap time.Duration, attempt uint, jitter Jitter) time.Duration {
	delay := base
	for step := uint(0); step < attempt && delay < cap; step++ {
		if delay > cap/2 {
			delay = cap
			break
		}
		delay *= 2
	}
	if delay > cap {
		delay = cap
	}
	return time.Duration(float64(delay) * jitter())
}
```

##### Python

```python
from collections.abc import Callable


def retry_delay(
    attempt: int,
    base_seconds: float,
    cap_seconds: float,
    uniform: Callable[[float, float], float],
) -> float:
    """Return full-jitter backoff; callers inject randomness for repeatable tests."""
    if attempt < 0 or base_seconds < 0 or cap_seconds < 0:
        raise ValueError("attempt and delay bounds must be non-negative")
    # Capping before sampling prevents jitter from exceeding the policy limit.
    upper_bound = min(cap_seconds, base_seconds * (2**attempt))
    return uniform(0.0, upper_bound)
```

##### C++

```cpp
/** Supplies the sole random input as a fraction in the half-open interval [0, 1). */
using RandomFraction = std::function<double()>;

/** Calculates full-jitter exponential backoff without overflow or ambient randomness. */
std::chrono::milliseconds retry_delay(
    unsigned attempt,
    std::chrono::milliseconds base,
    std::chrono::milliseconds cap,
    const RandomFraction& random_fraction) {
  /** Holds the capped exponential bound before random sampling. */
  auto upper = base;
  for (unsigned step = 0; step < attempt && upper < cap; ++step) {
    upper = upper > cap / 2 ? cap : upper * 2;
  }
  upper = std::min(upper, cap);
  return std::chrono::milliseconds(static_cast<std::int64_t>(upper.count() * random_fraction()));
}
```

### Poison work item

**Definition**

An item that repeatedly fails because of its input, state, or required processing path.

**Description**

A poison item can cycle forever through redelivery and consume worker capacity. Count its attempts
durably and move it to an inspectable state when its retry policy ends.

**Reach for when**

Use this term when one item fails repeatedly while other work succeeds.

### Dead-letter queue

**Definition**

A separate holding area for messages or work items that normal processing stopped retrying.

**Description**

A dead-letter queue preserves failed input and failure context for inspection. It needs ownership,
retention, alerting, and a safe redrive procedure. Moving an item there is not the same as resolving
it.

**Reach for when**

Use a dead-letter queue when a delivery system needs to isolate repeatedly failing items without
blocking healthy traffic.

### Blocked state

**Definition**

A business state showing that automatic work stopped until a stated condition changes.

**Description**

A blocked run remains part of the normal domain record, unlike a message moved to a transport's
dead-letter queue. Record the reason, required correction, and authorized action that can resume it.

**Reach for when**

Use a blocked state when operators or users need to correct durable work before execution can
continue.

### Deadline

**Definition**

The absolute time by which an operation should stop producing new work or effects.

**Description**

A deadline covers the whole remaining operation, including retries and backoff. Propagate it across
service calls so each layer does not start a fresh full timeout. Passing a deadline does not undo an
effect that already committed.

**Reach for when**

Use a deadline when work has an end-to-end time limit.

### Timeout

**Definition**

The maximum time a caller waits for one activity before treating the wait as failed.

**Description**

A timeout limits waiting. It does not prove the remote operation stopped or failed. The caller must
classify the resulting outcome according to how far the request may have progressed.

**Reach for when**

Use a timeout to bound one wait within a larger deadline.

### Cancellation

**Definition**

A durable or communicated request that the system stop future work.

**Description**

Cancellation races with completion. Define which result wins if both happen together, where workers
check the request, and which already committed effects remain. Cancellation is often cooperative,
not instantaneous.

**Reach for when**

Use cancellation when a caller or operator must be able to stop a run that has not reached a
terminal effect.

### Abort signal

**Definition**

A local mechanism that asks running code to stop waiting or computing.

**Description**

An abort signal can close a socket or interrupt cooperative code in the current process. It does not
prove a remote service stopped processing the request. Pair it with durable cancellation and
idempotent recovery when the work crosses a process boundary.

**Reach for when**

Use an abort signal to propagate cancellation through local call stacks and supported client
libraries.

## Level 5: Transactions and external effects

Retries become harder when one operation changes more than one system. This level explains what a
transaction can protect and how to handle effects outside it.

### Transaction

**Definition**

A group of changes that one storage system commits or rolls back as a unit.

**Description**

A transaction gives code one commit decision for the resources it covers. It can store an output
artifact and mark its step complete together. It cannot automatically include a separate database,
message broker, email server, payment service, or arbitrary HTTP endpoint.

**Reach for when**

Use a transaction when related durable changes must not become visible separately.

### Atomicity

**Definition**

The guarantee that all changes inside one transaction commit or none do.

**Description**

Atomicity prevents states such as a completed step with no recorded output when both changes share a
transaction. It says nothing about operation ordering between transactions or about effects beyond
the transaction boundary.

**Reach for when**

Use atomicity when partial visibility of related changes would violate an invariant.

### Isolation

**Definition**

The rules governing what concurrent transactions may observe and how their writes interact.

**Description**

Isolation is not one universal behavior. Database isolation levels allow or prevent different
anomalies.

A transaction that reads a value and later writes from that assumption may still need a row lock,
compare-and-swap, uniqueness constraint, or serializable isolation.

**Reach for when**

Use explicit isolation reasoning whenever concurrent transactions read and change related state.

### Serializability

**Definition**

A transaction guarantee where committed results are equivalent to running the transactions one at a
time in some order.

**Description**

Serializability prevents transaction interleavings from producing a result that no serial order
could produce. It does not necessarily preserve real-time order. Linearizability applies that
real-time requirement to individual operations, so the two terms answer different questions.

**Reach for when**

Use serializable transactions when concurrent transactions must preserve invariants across several
reads and writes and narrower constraints cannot express the rule.

### Transaction boundary

**Definition**

The exact set of resources controlled by one atomic commit.

**Description**

Draw the boundary around the participating storage engine and transaction. Every operation outside
that line creates a failure window. A function call inside a database transaction is not itself part
of the transaction if it changes another system.

**Reach for when**

Use a transaction boundary to expose which changes can commit together and which need another
protocol.

### External side effect

**Definition**

A state change outside the transaction controlled by the current component.

**Description**

Examples include charging a card, publishing a message, sending an email, writing to object storage,
and updating another service. External side effects can succeed even when the caller crashes before
recording them.

**Reach for when**

Use this term when an operation changes a dependency that cannot share the local commit.

### Stable external key

**Definition**

A deterministic identity used for one logical effect in another system.

**Description**

The key remains the same across attempts and worker changes. The receiving system must enforce it.
An attempt identifier is usually the wrong key because every retry would look like new work.

**Reach for when**

Use a stable external key for create-or-return, create-or-update, and status lookup across retries.

### Outbox pattern

**Definition**

A pattern that commits an intent to perform an external effect in the same transaction as local
state, then delivers that intent asynchronously.

**Description**

The local transaction writes both the business change and an outbox record. A dispatcher later
sends the record and retries failures. Delivery remains at least once, so the receiver still needs
idempotency or deduplication. The outbox needs its own claim, retry, ordering, and poison-item rules.

**Reach for when**

Use an outbox when a local commit must reliably cause a message or remote change without pretending
both systems share one transaction.

#### Code samples

##### TypeScript

```ts
/** OrderChange keeps the durable state and required integration intent inseparable. */
interface OrderChange {
  /** Identifies the aggregate being changed. */
  readonly orderId: string
  /** Records the newly earned business state. */
  readonly status: 'paid'
  /** Carries the message identity used by downstream deduplication. */
  readonly messageId: string
}

/** OrderSettlement owns one database transaction spanning state and outbox rows. */
interface OrderSettlement {
  /** Commits both records or neither; publication occurs later from the durable outbox. */
  settle(change: OrderChange): Promise<void>
}

/** Persists the complete planned change through the atomic settlement boundary. */
async function commitPaid(settlement: OrderSettlement, change: OrderChange): Promise<void> {
  await settlement.settle(change)
}
```

##### Go

```go
// AccountChange carries state and its forced outbound intent as one settlement unit.
type AccountChange struct {
	// Balance is the complete next account balance.
	Balance int64
	// Event is the immutable payload to enqueue with the state write.
	Event []byte
}

// Settlement owns one real transaction spanning account and outbox records.
type Settlement interface {
	// SettleAccount commits both fields or leaves neither durable.
	SettleAccount(context.Context, string, AccountChange) error
}

// CommitAccount prevents callers from accidentally persisting only half the change.
func CommitAccount(ctx context.Context, settlement Settlement, accountID string, change AccountChange) error {
	return settlement.SettleAccount(ctx, accountID, change)
}
```

##### Python

```python
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class AccountChange:
    """Carries the state and message that must become durable together."""

    account_id: str  # Selects the aggregate updated by the transaction.
    balance_cents: int  # Stores money in integer minor units.
    event_payload: bytes  # Contains the immutable outbound intent.


class Settlement(Protocol):
    """Owns one transaction spanning aggregate and outbox writes."""

    def commit_with_outbox(self, change: AccountChange) -> None:
        """Commit both records or roll both back; delivery occurs later."""
        ...


def settle(change: AccountChange, settlement: Settlement) -> None:
    """Pass the complete planned change to the atomic durability boundary."""
    settlement.commit_with_outbox(change)
```

##### C++

```cpp
/** Keeps an earned state and its forced integration intent inseparable. */
struct AccountChange {
  std::string account_id;    ///< Selects the aggregate updated by settlement.
  std::int64_t balance_cents; ///< Stores money exactly in integer minor units.
  std::string event_payload;  ///< Carries the immutable outbound intent.
};

/** Owns one real transaction spanning aggregate and outbox records. */
class Settlement {
public:
  /** Enables cleanup through an implementation-independent transaction boundary. */
  virtual ~Settlement() = default;
  /** Atomically commits both records; an exception may leave the commit outcome unknown to caller. */
  virtual void commit_with_outbox(const AccountChange& change) = 0;
};

/** Prevents callers from accidentally persisting only half of the planned change. */
void settle(Settlement& settlement, const AccountChange& change) {
  settlement.commit_with_outbox(change);
}
```

### Inbox pattern

**Definition**

A pattern where a receiver records message identities so repeated delivery does not repeat the
business effect.

**Description**

The receiver stores the message identity and applies the business change in one transaction. A
unique constraint resolves concurrent duplicate deliveries. The inbox record needs a retention
period at least as long as duplicate delivery remains possible.

**Reach for when**

Use an inbox when a consumer receives messages at least once and must enforce one logical result.

### Upsert

**Definition**

An operation that inserts a record when absent and otherwise updates or returns the existing record.

**Description**

An upsert can help make delivery idempotent when a stable key identifies the target. It is not
automatically safe. Repeating an upsert with different values may overwrite newer state, and an
update hook may repeat another side effect.

**Reach for when**

Use an upsert when one stable identity should name one durable record and repeated input has defined
merge behavior.

### Two-phase commit

**Definition**

A protocol where all participating resources prepare a transaction before one coordinator tells
them to commit or abort.

**Description**

Two-phase commit can coordinate atomic changes across systems that implement the protocol. It adds
blocking and recovery concerns, and most ordinary HTTP services do not participate. Mentioning it
does not make arbitrary APIs transactional.

**Reach for when**

Use two-phase commit only when every required resource supports it and its availability tradeoffs
fit the system.

### Saga

**Definition**

A sequence of committed local transactions with explicit actions that respond to later failure.

**Description**

A saga accepts that earlier steps already committed. If a later step fails, the system may retry,
pause, or run compensating actions. The saga must store its current state and make each forward and
compensating action safe to repeat.

**Reach for when**

Use a saga for a long-running business process that spans transaction boundaries and has meaningful
recovery actions.

### Compensation

**Definition**

A new business action that reduces or reverses the meaning of an earlier committed action.

**Description**

Compensation is not rollback. Refunding a payment does not erase the original charge, and cancelling
a shipment may fail after the parcel leaves. Compensating actions need their own identities, failure
handling, and audit history.

**Reach for when**

Use compensation when an earlier committed effect cannot be erased but the business can counteract
it.

### Reconciliation

**Definition**

A process that compares authoritative states and repairs or reports differences.

**Description**

Reconciliation resolves failures the original request path could not. It can find an external effect
that succeeded without a local record, a missing delivery, or mismatched values. Define which side
is authoritative for each field and make repairs idempotent.

**Reach for when**

Use reconciliation when systems can drift because they cannot commit atomically or outcomes can be
ambiguous.

#### Code samples

##### TypeScript

```ts
/** RecordState is the comparable projection shared by desired and observed systems. */
interface RecordState {
  /** Correlates the same logical record across systems. */
  readonly id: string
  /** Carries the value whose drift requires repair. */
  readonly value: string
}

/** Repair makes every detected difference explicit before any side effect occurs. */
type Repair =
  | {
      /** Selects creation for a missing observation. */ readonly kind: 'create'
      /** Supplies the desired record. */ readonly expected: RecordState
    }
  | {
      /** Selects correction for a mismatched observation. */ readonly kind: 'update'
      /** Supplies the desired record. */ readonly expected: RecordState
    }

/** Computes repairs deterministically and never mutates either input collection. */
function reconcile(expected: readonly RecordState[], observed: readonly RecordState[]): readonly Repair[] {
  return expected.flatMap(wanted => {
    /** The matching observation, if present, is used only for comparison. */
    const actual = observed.find(candidate => candidate.id === wanted.id)
    if (!actual) return [{ kind: 'create', expected: wanted }]
    return actual.value === wanted.value ? [] : [{ kind: 'update', expected: wanted }]
  })
}
```

##### Go

```go
// Record is the comparable projection used by reconciliation.
type Record struct {
	// ID is the stable key shared by expected and observed collections.
	ID string
	// Value is the complete reconciled content for this example.
	Value string
}

// Repair describes an explicit idempotent upsert needed to restore agreement.
type Repair struct {
	// Expected is the value the target should contain after repair.
	Expected Record
}

// Reconcile returns ordered repairs without mutating either input map.
func Reconcile(expected, observed map[string]Record) []Repair {
	ids := make([]string, 0, len(expected))
	for id := range expected {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	repairs := make([]Repair, 0)
	for _, id := range ids {
		want := expected[id]
		if got, ok := observed[id]; !ok || got != want {
			repairs = append(repairs, Repair{Expected: want})
		}
	}
	return repairs
}
```

##### Python

```python
from dataclasses import dataclass
from enum import Enum


class RepairKind(Enum):
    """Limits reconciliation output to actions understood by the repair worker."""

    CREATE = "create"  # The observed system is missing an expected record.
    UPDATE = "update"  # The observed record disagrees with the expected value.
    DELETE = "delete"  # The observed system contains an unexpected record.


@dataclass(frozen=True)
class Repair:
    """Describes a repair without performing external I/O during comparison."""

    kind: RepairKind  # Determines how the repair worker changes the target.
    key: str  # Identifies the record to repair.
    value: str | None  # CREATE and UPDATE require the expected value.


def reconcile(expected: dict[str, str], observed: dict[str, str]) -> tuple[Repair, ...]:
    """Return deterministic repairs without mutating either input snapshot."""
    repairs: list[Repair] = []  # Sorting below makes action order replay-stable.
    for key in sorted(expected.keys() | observed.keys()):
        if key not in observed:
            repairs.append(Repair(RepairKind.CREATE, key, expected[key]))
        elif key not in expected:
            repairs.append(Repair(RepairKind.DELETE, key, None))
        elif expected[key] != observed[key]:
            repairs.append(Repair(RepairKind.UPDATE, key, expected[key]))
    return tuple(repairs)
```

##### C++

```cpp
/** Is the comparable projection shared by desired and observed systems. */
struct RecordState {
  std::string id;    ///< Correlates the same logical record across systems.
  std::string value; ///< Contains the complete reconciled value for this example.
};

/** Limits repair output to idempotent actions understood by the repair worker. */
enum class RepairKind {
  create, ///< Inserts an expected record missing from the observation.
  update, ///< Replaces an observed value that disagrees with authority.
  erase,  ///< Removes an observed record absent from authority.
};

/** Describes a difference without performing I/O during comparison. */
struct Repair {
  RepairKind kind;                 ///< Selects the idempotent target operation.
  std::string id;                  ///< Identifies the record to repair.
  std::optional<std::string> value; ///< Supplies authority's value for create and update.
};

/** Returns repairs in key order without mutating either authoritative snapshot. */
std::vector<Repair> reconcile(
    const std::map<std::string, std::string>& expected,
    const std::map<std::string, std::string>& observed) {
  /** Accumulates explicit repair plans in deterministic traversal order. */
  std::vector<Repair> repairs;
  for (const auto& [id, value] : expected) {
    const auto found = observed.find(id);
    if (found == observed.end()) repairs.push_back({RepairKind::create, id, value});
    else if (found->second != value) repairs.push_back({RepairKind::update, id, value});
  }
  for (const auto& [id, value] : observed) {
    if (!expected.contains(id)) repairs.push_back({RepairKind::erase, id, std::nullopt});
  }
  return repairs;
}
```

### Read-after-write verification

**Definition**

Reading a value after a write to verify the state that the target system stored.

**Description**

Servers may normalize input, run hooks, assign defaults, or accept a write before replicas can serve
it. Verification should read from a source with suitable consistency and compare the fields that
matter to the invariant. A successful status code alone may not prove the intended state exists.

**Reach for when**

Use read-after-write verification when the receiver can transform writes or when the exact stored
result drives later approval or work.

## Level 6: Determinism, stochastic behavior, and replay

Recovery often means either reusing a stored result or executing an operation again. This level
explains when repeated execution can reproduce the same result and when it cannot.

### Effective input

**Definition**

Every value and environmental fact that can affect an operation's result.

**Description**

Function arguments are only the obvious inputs. Time, random choices, locale, environment variables,
dependency versions, remote state, file contents, and execution order may also matter. A determinism
claim is only as good as its inventory of effective inputs for the execution being discussed.

**Reach for when**

Use effective-input analysis before claiming that an operation can be reproduced or safely cached.

### Deterministic operation

**Definition**

An operation whose result is fixed once its effective inputs and implementation are fixed.

**Description**

Parsing a fixed byte sequence with a pinned parser can be deterministic. The claim must include error
behavior and ordering, not only the happy-path value. A stochastic algorithm can also execute
deterministically for a recorded random sequence, generator, version, execution order, and
environment. In that case its overall contract still describes a distribution, while one fully
specified execution has a fixed result.

**Reach for when**

Use deterministic operations for validation, identity calculation, state transitions, and replay
where exact repeatability matters.

#### Code samples

##### TypeScript

```ts
/** PriceInput contains every fact that can influence the repeatable total. */
interface PriceInput {
  /** Monetary subtotal in integer cents avoids floating-point currency drift. */
  readonly subtotalCents: number
  /** Discount in integer basis points is supplied by the caller's chosen policy version. */
  readonly discountBasisPoints: number
}

/** Calculates the same integer-cent total for identical explicit inputs. */
function discountedTotalCents(input: PriceInput): number {
  return input.subtotalCents - Math.floor(input.subtotalCents * input.discountBasisPoints / 10_000)
}
```

##### Go

```go
// PriceInputs contains every fact that can influence the quoted total.
type PriceInputs struct {
	// UnitCents is the non-negative price of one item.
	UnitCents int64
	// Quantity is the non-negative number of items.
	Quantity int64
	// DiscountBPS is the discount in basis points, from zero through 10,000.
	DiscountBPS int64
}

// PriceCents deterministically rounds down fractional cents after applying the discount.
func PriceCents(input PriceInputs) int64 {
	gross := input.UnitCents * input.Quantity
	return gross * (10_000 - input.DiscountBPS) / 10_000
}
```

##### Python

```python
from decimal import Decimal, ROUND_HALF_UP


def invoice_total(
    subtotal: Decimal,
    tax_rate: Decimal,
    discount: Decimal,
) -> Decimal:
    """Calculate cents deterministically from explicit monetary policy inputs."""
    if subtotal < 0 or tax_rate < 0 or discount < 0:
        raise ValueError("invoice inputs must be non-negative")
    # Decimal arithmetic and an explicit rounding rule avoid platform drift.
    total = subtotal * (Decimal("1") + tax_rate) - discount
    return max(total, Decimal("0")).quantize(Decimal("0.01"), ROUND_HALF_UP)
```

##### C++

```cpp
/** Contains every policy input that can influence the quoted price. */
struct PriceInput {
  std::int64_t unit_cents;           ///< Uses integer minor units to avoid floating-point drift.
  std::int64_t quantity;             ///< Must be non-negative and multiplication-safe.
  std::int64_t discount_basis_points; ///< Must be within the inclusive range 0..10,000.
};

/** Calculates a repeatable total, rounding any fractional cent down. */
std::int64_t price_cents(const PriceInput& input) {
  /** Captures the exact undiscounted amount under the caller's validated bounds. */
  const auto gross = input.unit_cents * input.quantity;
  return gross * (10'000 - input.discount_basis_points) / 10'000;
}
```

### Stochastic operation

**Definition**

An operation whose contract describes a probability distribution over possible outcomes.

**Description**

Random sampling, randomized search, simulations, and probabilistic prediction can be stochastic. The
same business input may produce a different valid result because each run makes a new random choice.
That does not prevent one run from being deterministic after its random choices and execution
environment are fixed. Evaluate the contract across repeated trials rather than treating one sample
as the whole distribution.

**Reach for when**

Use this term when variation is an intended part of the algorithm rather than an accidental race or
hidden dependency.

#### Code samples

##### TypeScript

```ts
/** RandomSource makes probability an explicit, replaceable boundary for replay and tests. */
interface RandomSource {
  /** Returns a sample in [0, 1); values outside that contract are programmer defects. */
  next(): number
}

/** Selects the experiment variant using only the injected sample and calibrated probability. */
function chooseVariant(random: RandomSource, treatmentProbability: number): 'control' | 'treatment' {
  return random.next() < treatmentProbability ? 'treatment' : 'control'
}
```

##### Go

```go
// RandomSource exposes the sole nondeterministic input to selection.
type RandomSource interface {
	// Intn returns a value in [0, n) and requires n to be positive.
	Intn(n int) int
}

// Choose returns one candidate using the injected source, permitting reproducible tests.
func Choose[T any](source RandomSource, candidates []T) (T, error) {
	if len(candidates) == 0 {
		var zero T
		return zero, errors.New("at least one candidate is required")
	}
	return candidates[source.Intn(len(candidates))], nil
}
```

##### Python

```python
from collections.abc import Callable, Sequence
from typing import TypeVar


T = TypeVar("T")  # The choice preserves the sequence's element type.


def choose_variant(items: Sequence[T], random_index: Callable[[int], int]) -> T:
    """Choose through an injected source that must return an index below its bound."""
    if not items:
        raise ValueError("at least one variant is required")
    # The injected source owns the distribution; this function enforces its bound.
    index = random_index(len(items))
    if not 0 <= index < len(items):
        raise ValueError("random source returned an out-of-range index")
    return items[index]
```

##### C++

```cpp
/** Exposes the sole nondeterministic input to selection. */
class RandomSource {
public:
  /** Enables cleanup through an injected random-source abstraction. */
  virtual ~RandomSource() = default;
  /** Returns an index below exclusive_upper; violating the bound is an implementation defect. */
  virtual std::size_t index_below(std::size_t exclusive_upper) = 0;
};

/** Chooses one candidate through the injected distribution; empty input is refused. */
template <class T>
std::optional<T> choose(RandomSource& random, std::span<const T> candidates) {
  if (candidates.empty()) return std::nullopt;
  return candidates.at(random.index_below(candidates.size()));
}
```

### Uncontrolled nondeterminism

**Definition**

Variation caused by inputs, interleavings, or dependency behavior that the system neither controls
nor records.

**Description**

Thread scheduling, unordered iteration, clocks, mutable dependencies, and races can all change
results without a deliberate probability model. This is different from a stochastic contract whose
random source and distribution are intentional. Some uncontrolled variation can be removed by
exposing inputs or defining ordering. Variation owned by a dependency must be recorded or tolerated.

**Reach for when**

Reach for uncontrolled-nondeterminism analysis when repeated execution differs and the system cannot
name, fix, or replay the choice that caused the difference.

### Random seed

**Definition**

An initial value used to produce a repeatable pseudorandom sequence for a particular algorithm and
implementation.

**Description**

Recording a seed can make one random source repeatable. It does not freeze changes in libraries,
parallel execution, hardware, floating-point behavior, or external services. Treat the generator
and its version as part of the effective input.

**Reach for when**

Use a random seed for repeatable tests, simulations, and diagnosis when the operation owns its
random-number generator.

### Auditability

**Definition**

The ability to determine what happened, when, under whose authority, and with which inputs and
versions.

**Description**

Auditability depends on retained records, not on being able to run the operation again. An auditable
stochastic operation stores the exact output it accepted along with its effective inputs and
execution metadata.

**Reach for when**

Use audit records when later investigation must explain a decision or effect.

### Replayability

**Definition**

The ability to execute a recorded procedure again from preserved inputs.

**Description**

Replay proves that the system can repeat the work, not that it will produce the same output.

Replays must isolate or replace external side effects. Otherwise they can charge, notify, and mutate
production a second time.

**Reach for when**

Use replay for recovery, diagnosis, migration, and comparison when inputs and operation versions are
available.

### Reproducibility

**Definition**

The ability to obtain the same result again under stated conditions.

**Description**

Deterministic operations can be reproducible when all effective inputs and implementation details
are fixed. A stochastic operation may also be reproducible when its random choices, generator,
environment, and execution order are captured. An externally controlled operation often cannot be
reproduced exactly. Its stored output preserves history but does not count as executing the operation
again. Define whether "same" means identical bytes or an allowed semantic range.

**Reach for when**

Use reproducibility when a result must be independently verified or reconstructed.

### Request artifact

**Definition**

The exact serialized request sent to an executor after assembly, defaults, and truncation.

**Description**

Storing source pieces may not reconstruct what crossed the boundary. Code can reorder, omit, encode,
or truncate them. When policy permits retention, protect the final bytes and replay-relevant headers
according to their sensitivity. Removing or changing a secret makes the retained value a derivative,
not the exact request.

**Reach for when**

Use a request artifact when audit or replay depends on the exact input seen by another executor.

### Redacted request record

**Definition**

A diagnostic copy of a request with sensitive values removed or replaced.

**Description**

A redacted record can preserve structure, identifiers, and safe fields for debugging. It is not
byte-for-byte evidence of what was sent and may not support exact replay, hashing, or signature
verification. If policy forbids retaining the exact request, record that limitation explicitly.

**Reach for when**

Use a redacted request record when diagnosis needs request context but retaining secrets or sensitive
payload bytes would violate policy.

### Recorded outcome

**Definition**

The immutable result accepted from one completed invocation.

**Description**

A recorded outcome preserves what actually happened even if execution cannot reproduce it. Keep raw
bytes or a lossless representation, the invocation identity, response metadata, and the rule that
selected it as authoritative.

**Reach for when**

Use a recorded outcome for stochastic, nondeterministic, or externally controlled work whose exact
historical result matters.

### Operation version

**Definition**

An identity for the code and behavior implementing one logical step.

**Description**

Changing parsing rules, calculation order, defaults, or external request construction can change
results. A version lets checkpoint and replay logic distinguish compatible work from work that needs
recalculation.

**Reach for when**

Use an operation version when durable work can outlive a deployment or when results need lineage.

### Dependency pinning

**Definition**

Selecting exact versions of libraries, tools, runtime images, and other executable dependencies.

**Description**

Pinning reduces silent behavior change. It does not guarantee availability of the pinned artifact or
eliminate platform differences. Preserve lockfiles and immutable image or binary digests where the
dependency participates in reproducibility.

**Reach for when**

Use dependency pinning when deployments, replay, and evaluation need a known implementation.

### Adapter

**Definition**

A component that translates one dependency's protocol and data into the application's own contract.

**Description**

An adapter owns transport details such as authentication, request encoding, response normalization,
timeouts, remote error classification, request identifiers, and rate-limit metadata. It should not
silently decide business policy such as whether an ambiguous write is safe to retry.

**Reach for when**

Use an adapter to keep provider-specific mechanics out of durable workflow and domain logic.

## Level 7: Validation and automated decisions

Recorded outcomes often feed another decision. Exact rules can reject malformed data. Other
decisions rely on scores, estimates, or human judgment and can be wrong in both directions. This
level keeps the observation separate from the trusted rule that acts on it. The same ideas apply to
fraud checks, spam filters, anomaly detection, risk scoring, and human review.

### Deterministic validator

**Definition**

A validator whose result is fixed by its effective inputs and versioned rules.

**Description**

Schema checks, range checks, signature verification, and parser-based structural rules can be
deterministic. Their failure messages and ordering should also be stable when callers or tests rely
on them.

**Reach for when**

Use a deterministic validator for rules that can be stated exactly and must behave consistently.

### Probabilistic evaluator

**Definition**

An evaluator whose output represents uncertainty or whose errors are measured empirically.

**Description**

Fraud scores, anomaly detectors, and statistical classifiers can produce uncertainty-bearing output.
A deterministic classifier can still be probabilistic in this sense even if the same input always
gets the same score. Its output is evidence for a decision, not the decision itself. Compare its
decisions with cases whose correct outcomes were established independently.

**Reach for when**

Use a probabilistic evaluator when the desired property cannot be captured by a reliable exact rule.

### Hard gate

**Definition**

An enforced boundary that prevents a transition when its decision rule rejects.

**Description**

A hard gate describes enforcement, not how its evidence was produced. It may enforce an exact rule,
a threshold over an uncertain score, or an authorized human decision. Name the evidence, decision
rule, version, and rejection behavior. A numeric comparison does not make uncertain evidence exact.

**Reach for when**

Use a hard gate when rejection must prevent the next transition and the system can enforce that
boundary.

### Soft gate

**Definition**

A nonblocking or explicitly overridable result that records concern without independently preventing
a transition.

**Description**

A soft gate describes enforcement, not the certainty of its evidence. It may report an exact rule or
an uncertain score as a warning, recommendation, or review request. If policy makes the result
blocking, it becomes a hard gate even when the underlying evidence is probabilistic.

**Reach for when**

Use a soft gate when the result should inform a person or later policy without controlling the
transition by itself.

### Finding

**Definition**

A structured observation that identifies a rule, location, severity, and explanation.

**Description**

Findings preserve why an evaluator objected. A useful finding is specific enough for a person or
repair step to act on. It should not carry an authoritative pass value that can contradict its own
severity.

**Reach for when**

Use findings when validation or evaluation must explain individual problems instead of returning
one boolean.

### Measurement

**Definition**

A recorded numeric or categorical observation used by a decision rule.

**Description**

A measurement needs units, range, method, and evaluator version. More decimal places do not create
more certainty. If repeated evaluations vary, retain enough data to describe that variation.

**Reach for when**

Use a measurement when policy needs a value that can be calibrated, compared, or monitored.

### Derived decision

**Definition**

A decision calculated by trusted code from validated findings, measurements, and policy.

**Description**

The evaluator reports observations. Application code decides whether those observations permit a
state transition. This prevents an untrusted or probabilistic component from declaring itself
acceptable and keeps the final rule versioned and testable.

**Reach for when**

Use a derived decision whenever observations come from a component that should not control the
business transition directly.

#### Code samples

##### TypeScript

```ts
/** Finding contributes calibrated evidence without granting the evaluator decision authority. */
interface Finding {
  /** Stable evidence category used by the owning policy. */
  readonly code: string
  /** Calibrated severity on the closed interval [0, 1]. */
  readonly severity: number
}

/** Decision records both outcome and the score that caused it for later audit. */
interface Decision {
  /** Indicates whether aggregate evidence stayed within policy. */
  readonly accepted: boolean
  /** Preserves the maximum severity used by this policy. */
  readonly score: number
}

/** Derives authority-owned acceptance from findings and an explicit policy threshold. */
function decide(findings: readonly Finding[], maximumAcceptedSeverity: number): Decision {
  /** The worst finding owns the decision; an empty evaluation has no adverse evidence. */
  const score = Math.max(0, ...findings.map(finding => finding.severity))
  return { accepted: score <= maximumAcceptedSeverity, score }
}
```

##### Go

```go
// Finding is one independently measured risk contribution.
type Finding struct {
	// Severity is a calibrated non-negative score, not evaluator prose.
	Severity int
}

// Decision is derived locally so an external evaluator cannot self-approve.
type Decision struct {
	// Accepted reports whether aggregate risk is within policy.
	Accepted bool
	// Score preserves the value compared with the threshold for audit.
	Score int
}

// DeriveDecision sums findings and accepts scores at or below the explicit threshold.
func DeriveDecision(findings []Finding, threshold int) Decision {
	score := 0
	for _, finding := range findings {
		score += finding.Severity
	}
	return Decision{Accepted: score <= threshold, Score: score}
}
```

##### Python

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Finding:
    """Carries evaluator evidence without granting it decision authority."""

    confidence: float  # Calibration defines values on the inclusive 0..1 scale.


def should_accept(findings: tuple[Finding, ...], threshold: float) -> bool:
    """Accept only when all findings meet the independently chosen threshold."""
    if not 0.0 <= threshold <= 1.0:
        raise ValueError("threshold must be between zero and one")
    if any(not 0.0 <= finding.confidence <= 1.0 for finding in findings):
        raise ValueError("finding confidence must be between zero and one")
    return bool(findings) and all(
        finding.confidence >= threshold for finding in findings
    )
```

##### C++

```cpp
/** Carries calibrated evidence without granting the evaluator decision authority. */
struct Finding {
  double severity; ///< Policy requires a finite value on the closed interval [0, 1].
};

/** Preserves both the decision and the score that caused it for audit. */
struct Decision {
  bool accepted; ///< Reports whether all evidence stayed within policy.
  double score;  ///< Records the maximum observed severity, or zero for no findings.
};

/** Derives acceptance from validated findings and an explicit calibrated threshold. */
Decision decide(std::span<const Finding> findings, double maximum_accepted_severity) {
  /** Tracks the worst finding because policy treats any severe observation as decisive. */
  const auto worst = std::ranges::max_element(findings, {}, &Finding::severity);
  /** Defines empty evidence as zero adverse severity for this policy. */
  const double score = worst == findings.end() ? 0.0 : worst->severity;
  return {score <= maximum_accepted_severity, score};
}
```

### Self-reported decision

**Definition**

A decision value supplied by the same external or untrusted evaluator whose work is being checked.

**Description**

A response may contain `accepted: true` while also reporting a blocking finding. Treat the
self-reported value as untrusted input. Validate the observations and derive the authoritative
decision in code the system owns.

**Reach for when**

Use this term to identify evaluator output that must not directly drive a protected transition.

### Calibration

**Definition**

Measuring how evaluator outputs correspond to trusted labeled outcomes.

**Description**

Calibration shows what a score means in practice. It provides the evidence for choosing a threshold
and reveals whether a value such as `0.90` has the same meaning across versions or populations.

**Reach for when**

Use calibration before turning a probabilistic score into an automated decision.

### False acceptance

**Definition**

An unacceptable item that the system incorrectly accepts.

**Description**

False acceptance is one side of evaluator error. Its cost depends on the business effect, such as an
invalid payment, unsafe configuration, or fraudulent account passing a gate.

**Reach for when**

Use false-acceptance rate to measure the risk of letting bad cases through.

### False rejection

**Definition**

An acceptable item that the system incorrectly rejects.

**Description**

False rejection creates denied service, manual review, and repeated work. Tightening a threshold to
reduce false acceptance often increases false rejection, so both rates belong in the decision.

**Reach for when**

Use false-rejection rate to measure the cost of blocking good cases.

### Threshold

**Definition**

A boundary that turns a measurement into a category or action.

**Description**

A threshold should come from calibrated data and stated error costs. Keep it in versioned policy,
record the value used for each decision, and reevaluate it when the evaluator or population changes.

**Reach for when**

Use a threshold when policy must map a measurement to a discrete outcome.

### Inter-rater agreement

**Definition**

A measure of how consistently independent evaluators assign the same labels or scores.

**Description**

Low agreement shows that the target itself may be ambiguous. A precise automated threshold cannot
repair a label that trusted reviewers do not interpret consistently.

**Reach for when**

Use inter-rater agreement when human or automated judgments define the expected result.

### Bounded remediation

**Definition**

A repair process with an explicit limit on attempts, elapsed time, or cost.

**Description**

Repair can oscillate, introduce a different violation, or repeatedly fail on impossible input. Each
attempt should retain the original objective and current findings. Exhaustion should enter a clear
blocked or rejected state.

**Reach for when**

Use bounded remediation when the system automatically modifies and reevaluates rejected work.

### Local optimization

**Definition**

Improving one measured property while making the broader result worse.

**Description**

A repair can satisfy a narrow score by deleting useful information or moving the problem elsewhere.
Retest all protected properties after repair and compare the result with the original objective.

**Reach for when**

Use this term when an automated repair passes its immediate check but may damage another requirement.

### Regression

**Definition**

A previously acceptable behavior that becomes worse after a change.

**Description**

Regressions can affect correctness, latency, cost, security, or evaluator error rates. Define which
measurements are protected and how much change the release process permits.

**Reach for when**

Use regression checks whenever code, policy, dependencies, or evaluators change behavior.

## Level 8: Trust and containment

The decisions and executors from earlier levels cross boundaries between identities with different
authority. Failures are not always accidental. This level explains how to limit what input, code,
and identities may do.

### Untrusted input

**Definition**

Data whose producer is not authorized to control how the receiving system executes or decides.

**Description**

Untrusted does not mean malicious. It means the receiver validates the data and treats it as data,
even if it contains instructions, code-like text, paths, or URLs. Trust is granted by an explicit
boundary and policy, not by a familiar file format.

**Reach for when**

Use this classification for data crossing from users, tenants, remote services, files, or lower-trust
components.

### Policy as code

**Definition**

Rules expressed as executable logic rather than passive values.

**Description**

Executable policy can read data, consume resources, and contain defects. Review, version, test, and
restrict it like application code. A configuration file becomes code when its language can compute
or invoke behavior.

**Reach for when**

Use policy as code when rules need expressive, versioned evaluation, and apply software controls to
the result.

### Trust boundary

**Definition**

A point where data, code, or authority moves between parties with different permissions or
assumptions.

**Description**

Marking a trust boundary forces the design to say who controls the input, what the receiver
validates, and which capabilities become reachable. Process and network boundaries are common trust
boundaries, but two modules in one process can also have different authority.

**Reach for when**

Use trust boundaries while mapping where validation, authentication, authorization, and containment
must occur.

### Threat model

**Definition**

A written account of protected assets, trusted actors, possible attackers, entry points, and expected
abuse.

**Description**

A threat model connects controls to actual risks. It should cover mistakes and compromised trusted
components as well as deliberately hostile input. Update it when authority, data flow, or external
dependencies change.

**Reach for when**

Use a threat model before choosing security controls for a new boundary or sensitive effect.

### Authentication

**Definition**

Establishing which identity is making a request.

**Description**

Authentication answers "who is this?" It does not answer whether that identity may perform the
requested action. Credentials need validation, expiry, rotation, and protection from replay where
the protocol requires it.

**Reach for when**

Use authentication whenever behavior or data access depends on the caller's identity.

### Authorization

**Definition**

Deciding whether an authenticated identity may perform a specific action on a specific resource.

**Description**

Authorization belongs at the point that controls the effect. A caller saying it already checked is
not enough when the receiver can enforce the rule. Include tenant, resource, action, and current
state in the decision.

**Reach for when**

Enforce authorization on each protected operation at the component that owns the data or effect.

### Capability

**Definition**

An explicit permission or unforgeable reference that grants a narrow operation.

**Description**

Capabilities make authority concrete. A component that can write one output object but cannot list
the bucket or read credentials has less room to cause harm than a component with a broad account
token.

**Reach for when**

Use capabilities to give workers and plugins only the operations their task requires.

### Least privilege

**Definition**

Giving an identity or component only the permissions needed for its current responsibility.

**Description**

Least privilege limits damage from defects and compromise. Separate roles for claiming work,
executing code, approving changes, and applying sensitive effects when those responsibilities do not
need the same authority.

**Reach for when**

Use least privilege when creating service accounts, database roles, filesystem access, and network
policies.

### Sandbox

**Definition**

A restricted execution environment that limits accessible resources and effects.

**Description**

A sandbox needs actual controls for filesystem, network, environment, system calls, CPU, memory, and
time. Running untrusted code in a child process is isolation from crashes, not a security sandbox by
itself.

**Reach for when**

Use a sandbox when executing code or parsers that should not inherit the host process's authority.

### Time-of-check to time-of-use race

**Definition**

A race where data changes after validation but before the system uses it.

**Description**

Checking a path and reopening it later, approving a mutable record and applying it later, or hashing
files before deployment all create this gap. Use an immutable snapshot, hold the correct lock, or
make the protected action conditionally verify the same version.

**Reach for when**

Use this term whenever checking and acting occur as separate operations on mutable state.

### Promotion

**Definition**

An authorized transition that makes a specific version eligible for a more trusted environment or
effect.

**Description**

Promotion should name an immutable version or digest. If the promoted bytes can change in place, the
approval does not identify what later runs execute.

**Reach for when**

Use promotion for configuration, policy, code, or data that moves from candidate to approved use.

### Signature

**Definition**

Cryptographic evidence that a holder of a private key signed specific bytes.

**Description**

Verification proves that the signature matches the bytes and public key under the chosen scheme. It
does not prove the signer understood, approved, or safely produced those bytes. A system may treat a
signature as approval only when policy binds that key, signing purpose, subject, and context to an
authorized approval action. Key expiry, revocation, and canonicalization remain part of the system.

**Reach for when**

Use a signature when another component must verify that an identified key signed exact bytes without
trusting the storage path that supplied them.

### Attestation

**Definition**

A recorded statement by an identified actor about an artifact, action, or result.

**Description**

An attestation may state that a build passed, an artifact was reviewed, or a deployment used a
specific version. It needs a subject identity, issuer, predicate, timestamp, and a way to verify its
integrity.

**Reach for when**

Use attestations when downstream systems need machine-readable evidence of a prior trusted action.

### Resource limit

**Definition**

A bound on how much time, memory, storage, network, concurrency, or other capacity work may consume.

**Description**

Limits protect neighboring work and make failure behavior predictable. Define what happens at the
limit, which unit is measured, and whether partial output remains usable. A timeout alone does not
limit memory or output size.

**Reach for when**

Add resource limits where variable or untrusted work could exhaust shared capacity.

### Environment scrubbing

**Definition**

Removing secrets and unrelated process variables before starting less-trusted code.

**Description**

Child processes often inherit the parent's full environment. Build an allowlist of required values
instead of trying to remember every secret to remove. Environment scrubbing complements filesystem
and network controls; it does not replace them.

**Reach for when**

Use environment scrubbing before starting subprocesses, plugins, build tools, and user-supplied code.

### Parser-based checking

**Definition**

Parsing input into a structured representation before enforcing rules about its structure.

**Description**

Parser-based checks understand the difference between executable code, quoted strings, comments,
and nested syntax. Use a maintained parser for the actual language and reject malformed input before
walking the structure.

**Reach for when**

Use parser-based checking for structural, nesting, reference, and syntax-aware security rules.

### Substring checking

**Definition**

Searching raw text for a character sequence without understanding its syntax or meaning.

**Description**

Substring checks work for literal bans and simple diagnostics. They produce false matches and miss
equivalent encodings when used for structural rules. Do not use them to validate a language grammar,
URL target, or authorization policy.

**Reach for when**

Use substring checking only when the rule truly concerns the raw character sequence.

### Injection

**Definition**

A vulnerability where untrusted data changes the commands, queries, or instructions an interpreter
executes.

**Description**

SQL injection, shell injection, template injection, and instruction injection share the same shape.
The system places data into a control language without a boundary the interpreter enforces. Use
typed APIs, parameterization, constrained grammars, and separated instruction and data channels.

**Reach for when**

Use injection analysis whenever untrusted input reaches an interpreter or evaluator.

### Server-side request forgery

**Definition**

Abuse of a server's network access through attacker-controlled request targets.

**Description**

A supplied URL may reach loopback services, cloud metadata, private networks, or redirects to
blocked destinations. Validate resolution and redirects, apply network egress rules, and prefer
named allowed sources over arbitrary URLs.

**Reach for when**

Use SSRF protections whenever a server fetches a location influenced by a less-trusted caller.

### Stored cross-site scripting

**Definition**

Browser-executable input that the system stores and later serves to another user.

**Description**

The dangerous effect occurs on later rendering, sometimes in an administrator's browser. Escape for
the output context, sanitize allowed markup, and use browser policies as another layer rather than
the only defense.

**Reach for when**

Use stored-XSS protections when persisted user-controlled text can appear in HTML or script-capable
views.

### Secret leakage

**Definition**

Credentials or sensitive internal data reaching storage, logs, users, or dependencies that should
not receive them.

**Description**

Common paths include inherited environments, error messages, request logging, traces, crash dumps,
and copied production data. Redact before persistence and design interfaces that never accept
secrets they do not need.

**Reach for when**

Use secret-leakage analysis anywhere sensitive values cross a logging, storage, process, or network
boundary.

### Data minimization

**Definition**

Collecting and retaining only the data required for a stated purpose.

**Description**

Extra data increases breach impact, access complexity, and deletion work. Keep exact inputs needed
for audit or replay, but separate that need from collecting unrelated personal or secret data.

**Reach for when**

Use data minimization while designing artifacts, logs, request records, and evaluation corpora.

### Retention policy

**Definition**

A rule for how long the system keeps particular records and what happens when that period ends.

**Description**

Retention must reconcile recovery, audit, privacy, legal, and cost requirements. Deleting an
artifact can make old work impossible to reproduce, so record which guarantees end with deletion.

**Reach for when**

Define retention for durable artifacts and records whose removal changes recovery, audit, privacy,
or deduplication guarantees.

### Tenant isolation

**Definition**

Controls that prevent one customer or security domain from reading, changing, or exhausting another
one's resources.

**Description**

Isolation includes authorization, storage queries, encryption boundaries, cache keys, queue
fairness, and resource budgets. A tenant identifier in a request is data until the receiver binds it
to an authenticated identity.

**Reach for when**

Use tenant isolation whenever one deployment processes data or work for more than one security
domain.

## Level 9: Delivery, approval, and intervention

Trusted decisions often authorize an effect in another system. An internal result is not the same as
an applied external change. This level names the states between producing a result, authorizing it,
and proving its effect.

### Delivery

**Definition**

Sending an artifact, command, or desired change to another component.

**Description**

Delivery can be accepted before the receiver applies the change. It may also repeat after an
ambiguous response. Record the delivery identity, target, requested version, attempts, and observed
receiver state.

**Reach for when**

Use delivery when completed internal work must cross another ownership or transaction boundary.

### Acknowledgement

**Definition**

A receiver's statement that it accepted or completed a specific operation.

**Description**

The protocol must say what an acknowledgement proves. It may mean bytes reached a broker, a record
committed, or the final effect became active. Acknowledging before durable acceptance can lose work
after a receiver crash.

**Reach for when**

Use acknowledgements when a sender needs a defined point at which it may stop retrying or advance
state.

### Desired state

**Definition**

A durable description of the state the system intends a resource to reach.

**Description**

Desired state separates intent from one delivery attempt. A controller can compare it with observed
state and keep reconciling until they match. Updating the desired version creates a new target rather
than editing the history of an earlier attempt.

**Reach for when**

Use desired state when convergence matters more than performing one command exactly once.

### Observed state

**Definition**

The state a trusted read reports for a resource at a particular time and version.

**Description**

Observed state may lag, come from a cache, or omit an effect still in progress. Record enough
version and source information to know what the observation can prove before comparing it with
desired state.

**Reach for when**

Use observed state in reconciliation and read-after-write verification.

### Activation

**Definition**

Making an approved version take effect for its intended users or workload.

**Description**

Delivery, approval, and activation are separate transitions. A deployment can upload configuration
without activating it. Record the exact activated version and verify the target applied it.

**Reach for when**

Use activation when a delivered artifact should remain inert until another authorized transition.

### Approval

**Definition**

A recorded decision authorizing a specific subject and version for a stated action.

**Description**

Approval should identify the approver, policy, exact artifact or state version, scope, and time. An
approval attached only to a mutable record identifier can silently apply to later unreviewed bytes.

**Reach for when**

Use approval when policy requires an authorized actor or service to permit a sensitive transition.

### Version-bound approval

**Definition**

An approval whose subject is one immutable version or digest.

**Description**

Changing the subject creates a new version that lacks the old approval unless policy explicitly
allows a defined class of changes. This keeps the authorization tied to what the approver actually
reviewed.

**Reach for when**

Use version-bound approval for releases, configurations, policies, data exports, and other mutable
resources whose exact contents matter.

#### Code samples

##### TypeScript

```ts
/** Approval binds reviewer authority to immutable artifact content. */
interface Approval {
  /** Identifies the reviewer whose authority was checked elsewhere. */
  readonly reviewerId: string
  /** Identifies the exact reviewed bytes, not a mutable artifact name. */
  readonly artifactDigest: string
}

/** Refuses stale approval after any artifact content change. */
function isApprovedVersion(approval: Approval, currentArtifactDigest: string): boolean {
  return approval.artifactDigest === currentArtifactDigest
}
```

##### Go

```go
// Approval binds authority to the exact bytes reviewed.
type Approval struct {
	// ArtifactDigest is the SHA-256 digest approved by the reviewer.
	ArtifactDigest [32]byte
}

// ErrApprovalVersionMismatch preserves refusal identity for callers and tests.
var ErrApprovalVersionMismatch = errors.New("approval does not match artifact version")

// AcceptApproval returns authority only when the current artifact matches the reviewed digest.
func AcceptApproval(approval Approval, currentArtifact []byte) error {
	if sha256.Sum256(currentArtifact) != approval.ArtifactDigest {
		return ErrApprovalVersionMismatch
	}
	return nil
}
```

##### Python

```python
from dataclasses import dataclass
from hmac import compare_digest


@dataclass(frozen=True)
class Approval:
    """Binds an approver's decision to immutable artifact content."""

    artifact_digest: str  # This exact digest was presented during review.
    approver_id: str  # Audit records attribute the decision to this identity.


def require_current_approval(approval: Approval, current_digest: str) -> None:
    """Reject approval after any artifact change, including a post-review edit."""
    if not compare_digest(approval.artifact_digest, current_digest):
        raise PermissionError("approval does not cover the current artifact")
```

##### C++

```cpp
/** Binds reviewer authority to one immutable SHA-256 artifact identity. */
struct Approval {
  std::string reviewer_id;               ///< Attributes the decision to an authorized reviewer.
  std::array<std::byte, 32> artifact_digest; ///< Identifies the exact bytes presented for review.
};

/** Refuses stale approval after any content change; both digests are already trusted hashes. */
bool covers_current_version(
    const Approval& approval,
    const std::array<std::byte, 32>& current_digest) {
  return approval.artifact_digest == current_digest;
}
```

### Approval invalidation

**Definition**

Ending an approval's authority after its subject or required conditions change.

**Description**

Invalidation may happen by creating a new unapproved version, revoking the approver's authority, or
changing the governing policy. Keep the old approval in history while preventing it from authorizing
the new action.

**Reach for when**

Use approval invalidation whenever approved state can change before activation or continued use.

### Human gate

**Definition**

A transition that requires a decision from an authorized person.

**Description**

A human gate is still a system boundary. Present the exact subject and evidence, record the person's
identity and decision, prevent stale approvals, and define what happens if the request changes while
review is open.

**Reach for when**

Use a human gate when risk, policy, or unresolved judgment reserves a decision for a person.

### Manual intervention

**Definition**

An authorized operator action that inspects or changes work outside its normal automatic path.

**Description**

Intervention tools should expose current ownership, attempts, artifacts, and failure reason. Commands
such as retry, skip, compensate, or replace need the same invariant checks and audit records as
automatic transitions. Direct database edits bypass those protections.

**Reach for when**

Use manual intervention for blocked, ambiguous, or exceptional work that automation cannot safely
resolve.

### Redrive

**Definition**

Returning failed or quarantined work to normal processing under an explicit new attempt.

**Description**

Redrive should preserve the old failure history, apply current authorization and compatibility
checks, and avoid releasing a large backlog without capacity limits. Correct the cause before
repeating an item that will fail the same way.

**Reach for when**

Use redrive after a poison item, dependency failure, or bad configuration has been corrected.

## Level 10: Proof and evaluation

The guarantees and controls in the earlier levels need evidence. A resilient design is a set of
claims about behavior under pressure. This level explains how to test those claims without relying
on one friendly example.

### Test oracle

**Definition**

The rule or trusted source that decides whether a test result is correct.

**Description**

An assertion, reference implementation, labeled outcome, or invariant can act as an oracle. If the
oracle repeats the same defect as the implementation, the test can pass while behavior is wrong.

**Reach for when**

Use an explicit test oracle whenever expected behavior is not obvious from one output literal.

### Evaluation case

**Definition**

A controlled input with an expected result, invariant, or trusted labeled outcome.

**Description**

Cases should include successful, rejected, boundary, and adversarial behavior. For stateful systems,
the case also needs starting state and expected preserved state after failure.

**Reach for when**

Use evaluation cases to measure validators, policies, stochastic operations, and system changes
against known expectations.

### Evaluation corpus

**Definition**

A versioned collection of evaluation cases.

**Description**

Version the cases, labels, selection rules, and expected metrics together. A corpus should represent
real operating conditions while keeping sensitive data and duplicated cases under control.

**Reach for when**

Use an evaluation corpus when one case cannot describe the range of expected behavior.

### Development set

**Definition**

Evaluation cases inspected and used while changing the implementation or policy.

**Description**

The development set gives fast feedback and helps diagnose known failures. Performance on it becomes
optimistic as engineers tune directly against its cases.

**Reach for when**

Use a development set for routine implementation and policy tuning.

### Holdout set

**Definition**

Evaluation cases withheld from routine tuning and used to estimate behavior on unseen cases.

**Description**

A holdout remains useful only while its cases and answers stay out of the development loop. Repeated
release failures can leak enough information to overfit it, so replace or rotate it under a defined
policy.

**Reach for when**

Use a holdout when release confidence depends on generalizing beyond cases already studied.

### Evaluation leakage

**Definition**

Information from evaluation cases or answers influencing the system being evaluated.

**Description**

Leakage can enter through copied fixtures, cached results, feature preparation, or manual tuning. It
makes measured performance look better without improving behavior on genuinely new work.

**Reach for when**

Use leakage analysis whenever evaluation data shares storage, tooling, or human workflows with
development.

### Baseline

**Definition**

The current or simpler behavior used as the point of comparison.

**Description**

A baseline turns "better" into a measured claim. Record its exact version, inputs, environment, and
known limitations so the comparison does not move between runs.

**Reach for when**

Use a baseline before claiming a change improves correctness, reliability, latency, or cost.

### Paired evaluation

**Definition**

Comparing two systems or versions on the same cases and relevant conditions.

**Description**

Pairing removes differences caused by case selection. For stochastic behavior, control shared inputs
and record independent random trials so the comparison measures the change rather than sampling
luck.

**Reach for when**

Use paired evaluation when deciding whether a candidate should replace a baseline.

### Repeated trial

**Definition**

Running the same evaluation condition several times to measure variation.

**Description**

Repeated trials matter for stochastic algorithms, concurrency, timing-sensitive behavior, and
uncontrolled dependencies. Record the number of trials and their distribution instead of reporting
only the best or average result.

**Reach for when**

Use repeated trials whenever one run is not representative of the operation's behavior.

### Confidence interval

**Definition**

A range calculated by a stated method to express uncertainty in an estimated value.

**Description**

A confidence interval estimates how much the measured value might move if the sampling were repeated.
It does not account for wrong labels, leaked cases, a changing evaluator, or examples that do not
represent real work. Report the calculation method and sample size with the interval.

**Reach for when**

Use a confidence interval when reporting a metric estimated from sampled or repeated cases.

### Regression budget

**Definition**

The maximum allowed degradation in a protected measurement.

**Description**

A release may improve one result while worsening another. State separate limits for correctness,
error rates, latency, cost, and other protected behavior. A budget needs a baseline and enough
measurement precision to detect the allowed change.

**Reach for when**

Use a regression budget to turn release tradeoffs into explicit pass or reject rules.

### Side-effect sink

**Definition**

The component that performs or records a final effect behind an interchangeable interface.

**Description**

Production may use a component that performs a real payment, notification, or deployment. Tests and
evaluations can use a recording implementation that preserves the request without mutating
production. Keep the workflow logic the same and replace only the boundary that owns the effect.

**Reach for when**

Use a side-effect sink when replay or evaluation needs production behavior without production
mutations.

#### Code samples

##### TypeScript

```ts
/** Effect describes an already-decided terminal action shared by production and evaluation. */
interface Effect {
  /** Identifies the recipient selected by core logic. */
  readonly recipient: string
  /** Carries immutable content selected by core logic. */
  readonly body: string
}

/** EffectSink isolates unsafe delivery from reusable decision logic. */
interface EffectSink {
  /** Accepts effects in call order; implementations define durability and retry semantics. */
  send(effect: Effect): Promise<void>
}

/** RecordingSink preserves evaluation effects without performing production mutations. */
class RecordingSink implements EffectSink {
  /** Stores a private ordered copy so callers cannot mutate the evaluation record. */
  readonly #recorded: Effect[] = []

  /** Records a fresh value and never contacts the production destination. */
  async send(effect: Effect): Promise<void> {
    this.#recorded.push({ ...effect })
  }

  /** Returns a snapshot so consumers cannot mutate subsequently reported results. */
  effects(): readonly Effect[] {
    return this.#recorded.map(effect => ({ ...effect }))
  }
}
```

##### Go

```go
// EffectSink is the terminal boundary shared by production and evaluation paths.
type EffectSink interface {
	// Send accepts an already-decided effect; implementations define durability and delivery.
	Send(context.Context, []byte) error
}

// RecordingSink captures copied effects without performing production I/O.
type RecordingSink struct {
	// Effects retains calls in order for evaluation assertions.
	Effects [][]byte
}

// Send records an owned copy so later caller mutation cannot rewrite evidence.
func (sink *RecordingSink) Send(_ context.Context, effect []byte) error {
	sink.Effects = append(sink.Effects, slices.Clone(effect))
	return nil
}
```

##### Python

```python
from dataclasses import dataclass, field
from typing import Protocol


class EffectSink(Protocol):
    """Separates a stable decision path from its terminal mutation mechanism."""

    def send_email(self, recipient: str, body: str) -> None:
        """Accept one email intent; implementations decide how it is delivered."""
        ...


@dataclass
class RecordingSink:
    """Captures intents in evaluation without performing production effects."""

    emails: list[tuple[str, str]] = field(default_factory=list)  # Preserves call order.

    def send_email(self, recipient: str, body: str) -> None:
        """Record the exact intent so evaluation can assert production-path behavior."""
        self.emails.append((recipient, body))


def notify_user(sink: EffectSink, recipient: str) -> None:
    """Run identical notification logic against production or recording sinks."""
    sink.send_email(recipient, "Your report is ready")
```

##### C++

```cpp
/** Describes an already-decided terminal action shared by production and evaluation. */
struct Effect {
  std::string recipient; ///< Identifies the destination selected by core logic.
  std::string body;      ///< Carries immutable content selected by core logic.
};

/** Isolates unsafe delivery from reusable decision logic. */
class EffectSink {
public:
  /** Enables cleanup through either production or evaluation implementations. */
  virtual ~EffectSink() = default;
  /** Accepts effects in call order; implementations own delivery and failure semantics. */
  virtual void send(const Effect& effect) = 0;
};

/** Captures effects for evaluation without contacting production destinations. */
class RecordingSink final : public EffectSink {
public:
  /** Stores an owned value so later caller mutation cannot rewrite evidence. */
  void send(const Effect& effect) override { recorded_.push_back(effect); }

  /** Exposes an immutable view whose lifetime is bounded by this sink. */
  std::span<const Effect> effects() const noexcept { return recorded_; }

private:
  std::vector<Effect> recorded_; ///< Preserves accepted effects in call order.
};
```

### Production-path parity

**Definition**

Using the same core logic in evaluation and production while replacing only unsafe terminal effects
or uncontrollable boundaries.

**Description**

A separate evaluation implementation can test itself instead of the production behavior. Share
state transitions, validation, retry classification, and request construction. Use explicit fakes
or recording sinks at the boundary whose real mutation the evaluation must avoid.

**Reach for when**

Use production-path parity when evaluation results are meant to predict deployed behavior.

### Evaluator drift

**Definition**

Change in an evaluator's behavior over time without a corresponding change in the evaluated cases.

**Description**

Dependencies, policies, labels, serving infrastructure, and populations can all drift. Run stable
control cases, version evaluator inputs, and compare distributions so a silent change does not look
like an implementation improvement.

**Reach for when**

Use evaluator-drift monitoring for probabilistic, remote, human, or frequently updated evaluators.

### Fault injection

**Definition**

Deliberately triggering a failure at a chosen point to verify recovery behavior.

**Description**

Kill the worker after an external response but before local commit. Delay a heartbeat past lease
expiry. Drop an acknowledgement. Each injection should target a named failure window and assert the
final state, duplicate effects, and retained evidence.

**Reach for when**

Use fault injection to prove claims about retries, fencing, transactions, recovery, and degraded
dependencies.

### Deterministic scheduler

**Definition**

A test scheduler that controls when concurrent tasks run so selected interleavings can be repeated.

**Description**

Ordinary concurrency tests depend on timing and may miss rare races. A controlled scheduler can
pause operations at meaningful points and replay the ordering that exposed a defect.

**Reach for when**

Use a deterministic scheduler to test races, cancellation, lease loss, and conflicting transitions.

### Model checking

**Definition**

Exploring states and transitions in a simplified description of the system to find invariant
violations.

**Description**

A model omits implementation detail and keeps the state that matters to the protocol. A lease model
might track only the owner, generation, expiration, and whether each worker may write. Tools can
explore message loss, retries, ownership changes, and concurrency far more thoroughly than a few
handwritten examples.

A successful check establishes the requested property only for the explored model under the tool's
bounds and assumptions. Tests still need to connect that model to the implementation.

**Reach for when**

Use model checking for small coordination protocols whose failure states are hard to cover by timing
tests alone.

## Level 11: Operational control

Correct behavior under one test is not enough. Operators need signals and controls that keep a busy
or degraded system understandable.

### Observability

**Definition**

The ability to infer a system's internal behavior from the signals it records.

**Description**

Observability should answer concrete questions such as why a run is stuck, which attempt owns it,
and where latency accumulated. Logs, metrics, and traces are ingredients. They help only when their
identities and fields connect to the durable work model.

**Reach for when**

Use observability to diagnose production behavior without attaching a debugger or reproducing the
failure first.

### Log

**Definition**

A timestamped record of one event.

**Description**

A useful log names the run, step, attempt, invocation, operation version, and outcome fields relevant
to the event. Avoid credentials and uncontrolled payloads. Logs may be sampled or lost, so they do
not replace durable business state or an audit log.

**Reach for when**

Use logs for detailed diagnosis of discrete events and failures.

### Metric

**Definition**

A numeric measurement aggregated over time or a set of events.

**Description**

Metrics reveal rates, levels, and distributions such as queue depth, completion rate, lease expiry,
latency, and retries. Keep label values bounded. Putting a unique run identifier in a metric label
can overwhelm the monitoring system.

**Reach for when**

Use metrics for trends, capacity, service objectives, and alerts.

### Trace

**Definition**

A causally connected record of operations across components.

**Description**

A trace follows one request or run through claims, steps, dependency calls, and delivery. Sampling
means traces cannot be the sole source of audit or recovery truth. Propagate trace context separately
from stable business identities.

**Reach for when**

Use traces to locate latency and failure across service boundaries.

### Correlation identifier

**Definition**

An identifier copied across related records so they can be searched together.

**Description**

A correlation identifier helps connect logs and calls. It does not prove causality, ownership, or
idempotency. Prefer stable domain identities such as run and attempt IDs where they already express
the relationship.

**Reach for when**

Use a correlation identifier when existing business identities cannot connect diagnostic records.

### Audit log

**Definition**

An append-only record of security-sensitive or governance-relevant actions.

**Description**

An audit log records actor, action, subject, version, time, authority, and result. Restrict mutation,
protect integrity, and define retention. Ordinary application logs do not become an audit log merely
by storing them longer.

**Reach for when**

Use an audit log for approvals, promotions, administrative actions, permission changes, and sensitive
effects.

### Service-level indicator

**Definition**

A measured value that represents one aspect of service behavior.

**Description**

Completion latency, successful delivery rate, and durable queue age can be indicators. Define the
population, measurement point, exclusions, and time window so the number cannot change meaning
between dashboards.

**Reach for when**

Use an SLI to measure behavior users or dependent systems care about.

### Service-level objective

**Definition**

A target range for a service-level indicator over a stated period.

**Description**

An SLO turns reliability into an operating target, such as 99.9 percent of accepted runs reaching a
terminal state within ten minutes over 30 days. It also needs a rule for how the team responds when
the target is at risk or has been missed.

**Reach for when**

Use an SLO when a team needs a measurable reliability target rather than the word "reliable."

### Alert

**Definition**

A notification that a measured condition requires timely human or automated action.

**Description**

An alert should name the affected behavior, likely impact, and first diagnostic path. Alerts tied to
symptoms and service objectives are more useful than alerts on every unusual internal event.

**Reach for when**

Use an alert when delay in responding to a condition increases user impact or recovery cost.

### Rate limit

**Definition**

A cap on operations allowed during a time interval.

**Description**

Rate limits protect dependencies, tenants, and cost. Decide whether the limit applies globally, per
tenant, per identity, or per operation. Coordinate distributed clients or accept that local limits
can exceed the intended global total.

**Reach for when**

Use a rate limit when operation frequency must remain within a provider or system budget.

### Concurrency budget

**Definition**

A limit on work allowed to execute at the same time.

**Description**

Concurrency controls active pressure more directly than a rate limit. Apply separate budgets to
scarce dependencies and noisy tenants. Release capacity when work ends, times out, or loses
ownership.

**Reach for when**

Use a concurrency budget when simultaneous work consumes connections, memory, CPU, or remote slots.

### Cost budget

**Definition**

A limit on money or metered resource use for an operation, tenant, or period.

**Description**

Track committed and still-possible cost across retries and ambiguous outcomes. Decide which work
stops when the budget ends and record that as an explicit policy result.

**Reach for when**

Use a cost budget when external calls or computation have meaningful variable expense.

### Backpressure

**Definition**

A signal or mechanism that slows producers when consumers cannot keep up.

**Description**

Without backpressure, queues, memory, or latency grow until the system fails less predictably.
Backpressure can block producers, reduce acceptance, lower concurrency, or return an overload
response. The response should propagate toward the source of work.

**Reach for when**

Use backpressure when incoming work can exceed sustained processing capacity.

#### Code samples

##### TypeScript

```ts
/** AdmissionResult distinguishes accepted work from immediate overload refusal. */
type AdmissionResult<T> =
  | {
      /** Signals that the task ran within capacity. */ readonly accepted: true
      /** Carries the completed task value. */ readonly value: T
    }
  | {
      /** Signals that no capacity was consumed. */ readonly accepted: false
      /** Gives callers a stable retry decision. */ readonly reason: 'capacity_full'
    }

/** WorkLimiter reserves at most maxConcurrent slots in this process. */
class WorkLimiter {
  /** Counts slots currently owned by unfinished tasks. */
  #active = 0

  /** Fixes the process-local capacity for the limiter's lifetime. */
  readonly #maxConcurrent: number

  /** Sets the hard concurrency bound; non-positive values are programmer errors. */
  constructor(maxConcurrent: number) {
    if (maxConcurrent < 1) throw new RangeError('maxConcurrent must be positive')
    this.#maxConcurrent = maxConcurrent
  }

  /** Rejects immediately at capacity and releases accepted slots even when work fails. */
  async run<T>(work: () => Promise<T>): Promise<AdmissionResult<T>> {
    if (this.#active >= this.#maxConcurrent) return { accepted: false, reason: 'capacity_full' }
    this.#active += 1
    try {
      return { accepted: true, value: await work() }
    } finally {
      this.#active -= 1
    }
  }
}
```

##### Go

```go
// ErrAtCapacity identifies immediate admission refusal without starting work.
var ErrAtCapacity = errors.New("worker capacity is full")

// Gate bounds concurrent work; its channel capacity is the configured limit.
type Gate struct {
	// slots contains one token per admitted operation and is safe for concurrent use.
	slots chan struct{}
}

// NewGate constructs a fixed-capacity gate and panics on a non-positive programmer input.
func NewGate(capacity int) *Gate {
	if capacity < 1 {
		panic("gate capacity must be positive")
	}
	return &Gate{slots: make(chan struct{}, capacity)}
}

// TryEnter admits immediately or refuses without waiting when all slots are occupied.
func (gate *Gate) TryEnter() (func(), error) {
	select {
	case gate.slots <- struct{}{}:
		// leave releases exactly the slot acquired by this call and must run once.
		leave := func() { <-gate.slots }
		return leave, nil
	default:
		return nil, ErrAtCapacity
	}
}
```

##### Python

```python
import asyncio
from collections.abc import Awaitable, Callable
from typing import TypeVar


T = TypeVar("T")  # The limiter returns the submitted operation's value unchanged.


class CapacityLimiter:
    """Bounds in-flight operations and makes overload an immediate refusal."""

    def __init__(self, capacity: int) -> None:
        """Create a limiter with a positive, fixed concurrency budget."""
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._capacity = capacity  # The policy remains fixed for this limiter's lifetime.
        self._active = 0  # The guard below owns every update to this count.
        self._guard = asyncio.Lock()  # Check and reservation must be one event-loop step.

    async def run(self, operation: Callable[[], Awaitable[T]]) -> T:
        """Run when a slot is immediately available; otherwise reject the work."""
        async with self._guard:
            if self._active >= self._capacity:
                raise RuntimeError("capacity is full")
            self._active += 1
        try:
            return await operation()
        finally:
            async with self._guard:
                self._active -= 1
```

##### C++

```cpp
/** Owns process-local admission slots and releases them with RAII. */
class CapacityLimiter {
public:
  /** Returns one slot on destruction and must not outlive the limiter that created it. */
  using Permit = std::unique_ptr<void, std::function<void(void*)>>;

  /** Fixes a positive concurrency bound for the limiter's lifetime. */
  explicit CapacityLimiter(std::ptrdiff_t capacity) : slots_(validated_capacity(capacity)) {}

  /** Admits immediately or returns empty without starting work when capacity is full. */
  std::optional<Permit> try_acquire() {
    if (!slots_.try_acquire()) return std::nullopt;
    return Permit{this, [this](void*) { slots_.release(); }};
  }

private:
  /** Rejects invalid policy before the semaphore observes its positive-count precondition. */
  static std::ptrdiff_t validated_capacity(std::ptrdiff_t capacity) {
    if (capacity <= 0) throw std::invalid_argument("capacity must be positive");
    return capacity;
  }

  std::counting_semaphore<> slots_; ///< Serializes admission and bounds unfinished work.
};
```

### Admission control

**Definition**

A decision made before accepting new work based on capacity, policy, and current load.

**Description**

Admission control keeps accepted work within a serviceable bound. It can reserve capacity for
priority work and reject requests early with a clear retry signal instead of accepting work that
will miss its deadline.

**Reach for when**

Use admission control when queue growth or overload would make already accepted work fail.

### Load shedding

**Definition**

Deliberately rejecting or dropping selected work to protect the rest of the system during overload.

**Description**

Define which work can be shed, how callers learn about it, and whether it may retry. Dropping random
work deep inside the system can create ambiguous effects and unfairness.

**Reach for when**

Use load shedding when demand exceeds safe capacity and partial service is better than total
collapse.

### Circuit breaker

**Definition**

A stateful control that temporarily stops calls to a failing dependency.

**Description**

A circuit breaker opens after a defined failure condition, rejects or redirects calls for a period,
then allows limited probes. It prevents callers from amplifying an outage. It does not repair the
dependency or make abandoned effects safe.

**Reach for when**

Use a circuit breaker when repeated calls to a failing dependency waste capacity or worsen recovery.

#### Code samples

##### TypeScript

```ts
/** BreakerState makes probe ownership and reopening time explicit and reproducible. */
type BreakerState =
  | {
      /** Closed calls flow normally. */ readonly kind: 'closed'
      /** Counts consecutive failures. */ readonly failures: number
    }
  | {
      /** Open calls are refused until this injected-time deadline. */ readonly kind: 'open'
      /** Earliest epoch millisecond for a probe. */ readonly retryAtMs: number
    }
  | { /** Half-open permits exactly one externally coordinated probe. */ readonly kind: 'half-open' }

/** Advances the breaker after time observation without reading a clock or mutating state. */
function onTime(state: BreakerState, nowMs: number): BreakerState {
  return state.kind === 'open' && nowMs >= state.retryAtMs ? { kind: 'half-open' } : state
}

/** Applies a call outcome; reaching the threshold opens for the explicit recovery interval. */
function onResult(
  state: BreakerState,
  succeeded: boolean,
  nowMs: number,
  threshold: number,
  resetAfterMs: number,
): BreakerState {
  if (succeeded) return { kind: 'closed', failures: 0 }
  /** A failed half-open probe reopens immediately; closed calls increment toward the threshold. */
  const failures = state.kind === 'closed' ? state.failures + 1 : threshold
  return failures >= threshold ? { kind: 'open', retryAtMs: nowMs + resetAfterMs } : { kind: 'closed', failures }
}
```

##### Go

```go
// BreakerState names authority to call the protected dependency.
type BreakerState string

const (
	// Closed permits calls while failures remain below policy.
	Closed BreakerState = "closed"
	// Open refuses calls until the explicit retry time arrives.
	Open BreakerState = "open"
	// HalfOpen permits one probe whose result decides recovery.
	HalfOpen BreakerState = "half-open"
)

// Breaker is a value snapshot; callers serialize concurrent updates externally.
type Breaker struct {
	// State controls whether ordinary traffic or only a probe is permitted.
	State BreakerState
	// RetryAt is meaningful only while State is Open.
	RetryAt time.Time
}

// Ready moves an expired open breaker to half-open using caller-controlled time.
func Ready(current Breaker, now time.Time) Breaker {
	if current.State == Open && !now.Before(current.RetryAt) {
		return Breaker{State: HalfOpen}
	}
	return current
}

// RecordResult closes a successful probe or reopens any failed call for cooldown.
func RecordResult(current Breaker, succeeded bool, now time.Time, cooldown time.Duration) Breaker {
	if succeeded {
		return Breaker{State: Closed}
	}
	return Breaker{State: Open, RetryAt: now.Add(cooldown)}
}
```

##### Python

```python
from dataclasses import dataclass
from enum import Enum


class CircuitState(Enum):
    """Names whether ordinary calls, no calls, or one probe is allowed."""

    CLOSED = "closed"  # Ordinary calls are allowed and failures are counted.
    OPEN = "open"  # Calls are refused until the retry deadline.
    HALF_OPEN = "half_open"  # One controlled probe decides recovery.


@dataclass(frozen=True)
class Circuit:
    """Keeps breaker decisions pure by receiving monotonic time explicitly."""

    state: CircuitState  # Governs whether the next call is admitted.
    failures: int  # Consecutive failures count only while closed.
    retry_at: float | None  # Monotonic deadline exists only while open.


def before_call(circuit: Circuit, now: float) -> Circuit:
    """Admit a closed call or earn one half-open probe after the deadline."""
    if circuit.state is CircuitState.OPEN:
        if circuit.retry_at is not None and now >= circuit.retry_at:
            return Circuit(CircuitState.HALF_OPEN, circuit.failures, None)
        raise RuntimeError("circuit is open")
    if circuit.state is CircuitState.HALF_OPEN:
        raise RuntimeError("half-open probe already in flight")
    return circuit


def after_call(
    circuit: Circuit,
    succeeded: bool,
    now: float,
    failure_limit: int,
    reset_after: float,
) -> Circuit:
    """Close on success or open when the explicit failure policy is exhausted."""
    if circuit.state is CircuitState.OPEN:
        raise ValueError("an open circuit cannot have an admitted result")
    if succeeded:
        return Circuit(CircuitState.CLOSED, 0, None)
    # Count the admitted failure exactly once before applying the opening policy.
    failures = circuit.failures + 1
    if circuit.state is CircuitState.HALF_OPEN or failures >= failure_limit:
        return Circuit(CircuitState.OPEN, failures, now + reset_after)
    return Circuit(CircuitState.CLOSED, failures, None)
```

##### C++

```cpp
/** Names whether ordinary traffic, no traffic, or one coordinated probe is allowed. */
enum class CircuitState {
  closed,    ///< Ordinary calls flow while failures remain below policy.
  open,      ///< Calls are refused until the explicit retry deadline.
  half_open, ///< Exactly one externally coordinated probe decides recovery.
};

/** Is an immutable breaker snapshot; callers serialize concurrent replacements. */
struct Circuit {
  CircuitState state; ///< Controls which calls may be admitted.
  unsigned failures;  ///< Counts consecutive failures while closed.
  std::chrono::steady_clock::time_point retry_at; ///< Is meaningful only while open.
};

/** Advances an expired open circuit to half-open using caller-controlled monotonic time. */
Circuit on_time(Circuit current, std::chrono::steady_clock::time_point now) {
  if (current.state == CircuitState::open && now >= current.retry_at) {
    return {CircuitState::half_open, current.failures, {}};
  }
  return current;
}

/** Applies one admitted result, closing on success or opening under explicit policy. */
Circuit on_result(
    Circuit current,
    bool succeeded,
    std::chrono::steady_clock::time_point now,
    unsigned failure_limit,
    std::chrono::steady_clock::duration cooldown) {
  if (succeeded) return {CircuitState::closed, 0, {}};
  /** A failed probe opens immediately; a closed call increments toward the limit. */
  const auto failures = current.state == CircuitState::closed ? current.failures + 1 : failure_limit;
  return failures >= failure_limit
      ? Circuit{CircuitState::open, failures, now + cooldown}
      : Circuit{CircuitState::closed, failures, {}};
}
```

### Bulkhead

**Definition**

Separating capacity so failure or overload in one class of work cannot consume every shared
resource.

**Description**

Separate worker pools, connection pools, queues, or concurrency budgets can isolate tenants and
dependencies. The partitions need sizing and unused-capacity rules or they can waste resources while
another partition is overloaded.

**Reach for when**

Use bulkheads when one dependency, tenant, or workload can starve unrelated work.

## Level 12: Recovery and change

Production systems change while durable work and data remain. This final level names the promises
needed to deploy, restore, and evolve them safely.

### Schema migration

**Definition**

A versioned change to durable data structure or meaning.

**Description**

A migration includes the schema change, existing-data treatment, compatibility period, and recovery
plan. Backfills are production workloads with retries, checkpoints, capacity limits, and failure
states of their own.

**Reach for when**

Use a schema migration whenever deployed code changes how durable records are written or understood.

### Backward compatibility

**Definition**

The ability of newer code to understand data, requests, or messages created by older code.

**Description**

Backward compatibility lets new workers resume old runs and consume queued messages during a rolling
deployment. Preserve old meanings until every older producer and durable record is accounted for.

**Reach for when**

Use backward compatibility when new consumers coexist with old data or producers.

### Forward compatibility

**Definition**

The ability of older code to tolerate data or messages produced by newer code.

**Description**

Forward compatibility often means ignoring unknown optional fields while rejecting new meanings
that would be unsafe to misunderstand. It matters during rollback and mixed-version deployment.

**Reach for when**

Use forward compatibility when old consumers may receive newer records or traffic.

### Rolling deployment

**Definition**

Replacing instances gradually so old and new versions run at the same time.

**Description**

During the rollout, both versions may claim work, read the same records, and exchange messages. The
compatibility contract must cover that overlap and a possible rollback, not only the final all-new
state.

**Reach for when**

Use rolling deployment when service must remain available while instances change version.

### Expand-and-contract migration

**Definition**

A migration sequence that first adds a compatible representation, moves readers and writers, then
removes the old representation.

**Description**

Expansion keeps old code working while new code begins using the new shape. Data is backfilled and
verified before contraction removes old fields or behavior. Each phase is independently deployable
and recoverable.

**Reach for when**

Use expand and contract for incompatible schema or protocol changes that must pass through a
mixed-version period.

#### Code samples

##### TypeScript

```ts
/** LegacyUser is accepted only during the mixed-version migration window. */
interface LegacyUser {
  /** Legacy combined name remains readable until old writers are retired. */
  readonly name: string
}

/** ExpandedUser is the compatible form all new writes produce. */
interface ExpandedUser {
  /** Preserves the legacy field while old readers remain deployed. */
  readonly name: string
  /** Supplies the new independently addressable given name. */
  readonly givenName: string
  /** Supplies the new independently addressable family name. */
  readonly familyName: string
}

/** Reads either deployed representation into one internal value. */
function readUser(row: LegacyUser | ExpandedUser): ExpandedUser {
  if ('givenName' in row) return { ...row }
  /** The expansion assumes the final space separates family name during this migration. */
  const separator = row.name.lastIndexOf(' ')
  return separator < 0
    ? { name: row.name, givenName: row.name, familyName: '' }
    : { name: row.name, givenName: row.name.slice(0, separator), familyName: row.name.slice(separator + 1) }
}

/** Writes both old and new fields so either application version can read the row. */
function writeUser(givenName: string, familyName: string): ExpandedUser {
  return { name: `${givenName} ${familyName}`.trim(), givenName, familyName }
}
```

##### Go

```go
// StoredUser is the expanded write shape retained during migration.
type StoredUser struct {
	// FullName keeps old readers working until contraction is safe.
	FullName string
	// GivenName is populated for new readers before FullName is removed.
	GivenName string
}

// DecodeGivenName reads the new field and falls back to the legacy representation.
func DecodeGivenName(stored StoredUser) string {
	if stored.GivenName != "" {
		return stored.GivenName
	}
	given, _, _ := strings.Cut(stored.FullName, " ")
	return given
}

// EncodeUser writes both representations so old and new readers remain compatible.
func EncodeUser(givenName, familyName string) StoredUser {
	return StoredUser{
		FullName:  strings.TrimSpace(givenName + " " + familyName),
		GivenName: givenName,
	}
}
```

##### Python

```python
from dataclasses import dataclass
from typing import Mapping


@dataclass(frozen=True)
class CustomerName:
    """Provides one domain shape while old and new storage records coexist."""

    full_name: str  # The application consumes the normalized expanded value.


def read_name(record: Mapping[str, str]) -> CustomerName:
    """Prefer the expanded field while retaining compatibility with legacy rows."""
    # New data wins if a partially migrated row temporarily contains both fields.
    value = record.get("full_name") or record.get("name")
    if not value:
        raise ValueError("record has no customer name")
    return CustomerName(value)


def write_name(name: CustomerName) -> dict[str, str]:
    """Dual-write equivalent fields until every reader understands full_name."""
    return {"name": name.full_name, "full_name": name.full_name}
```

##### C++

```cpp
/** Represents a legacy row accepted only during the mixed-version window. */
struct LegacyUser {
  std::string name; ///< Keeps the combined name readable until old writers retire.
};

/** Is the compatible form produced by every new write during expansion. */
struct ExpandedUser {
  std::string name;        ///< Preserves compatibility with deployed legacy readers.
  std::string given_name;  ///< Gives new readers an independently addressable field.
  std::string family_name; ///< Gives new readers the remaining name component.
};

/** Reads either deployed schema into one expanded application value. */
ExpandedUser read_user(const std::variant<LegacyUser, ExpandedUser>& row) {
  if (const auto* expanded = std::get_if<ExpandedUser>(&row)) return *expanded;
  /** Uses the final space as the documented, reversible-enough migration assumption. */
  const auto& name = std::get<LegacyUser>(row).name;
  /** Locates the migration separator without altering the stored legacy value. */
  const auto separator = name.rfind(' ');
  return separator == std::string::npos
      ? ExpandedUser{name, name, ""}
      : ExpandedUser{name, name.substr(0, separator), name.substr(separator + 1)};
}

/** Dual-writes old and new fields so either deployed application version can read the row. */
ExpandedUser write_user(std::string given_name, std::string family_name) {
  /** Retains the exact compatibility spelling expected by legacy readers. */
  const auto name = family_name.empty() ? given_name : given_name + " " + family_name;
  return {name, std::move(given_name), std::move(family_name)};
}
```

### Backup

**Definition**

A separate retained copy of data that can be used after loss or corruption.

**Description**

Replication is not a backup because deletion and corruption can replicate too. A backup needs a
known scope, retention schedule, integrity check, encryption policy, and restore procedure.

**Reach for when**

Use backups for data whose loss cannot be repaired from another authoritative source.

### Restore

**Definition**

Reconstructing usable state from a backup or other retained record.

**Description**

A backup is only credible after a restore test. Restoration must include keys, schemas, artifact
stores, configuration, and the ordering needed to make related data consistent. Verify the restored
system before reopening writes.

**Reach for when**

Use restore procedures to prove the system can recover the data its backup policy claims to protect.

### Failover

**Definition**

Moving service authority from a failed or isolated component to a replacement.

**Description**

Failover must establish one current authority, fence the old one, route traffic, and identify any
data not yet replicated. Fast routing without safe ownership can turn an outage into conflicting
writes.

**Reach for when**

Use failover when a redundant component should take over after loss of the active one.

### Recovery point objective

**Definition**

The maximum acceptable data-loss interval for a stated disaster.

**Description**

An RPO of five minutes means the business accepts losing no more than five minutes of committed
history in the covered disaster. The written target is not evidence that the system meets it.
Measured replication behavior and recovery drills must support the claim across databases and
artifact stores.

**Reach for when**

Use an RPO to choose replication and backup frequency from an explicit data-loss tolerance.

### Recovery time objective

**Definition**

The target maximum time to restore a defined service after a disaster.

**Description**

An RTO includes detection, decision, infrastructure replacement, data restoration, verification,
and reopening service. A recovery plan that takes longer in drills does not meet its written RTO.

**Reach for when**

Use an RTO to design and test the recovery process against an explicit outage-duration target.

### Disaster recovery

**Definition**

The people, systems, data, and procedures used to restore service after a large failure.

**Description**

Disaster recovery covers more than starting replacement servers. It includes authority, credentials,
backups, dependencies, communication, integrity checks, and the decision to return to normal
operation. Exercise the procedure under realistic loss assumptions.

**Reach for when**

Use disaster-recovery planning for failures larger than ordinary instance or dependency recovery.

### Essential complexity

**Definition**

Complexity caused by the problem's unavoidable requirements and failure boundaries.

**Description**

An external payment cannot share a local database transaction. That fact creates real work around
idempotency and reconciliation. This is essential complexity because removing the supporting code
would remove a required guarantee, not merely simplify the implementation.

**Reach for when**

Reach for essential-complexity analysis when comparing designs that must satisfy the same external
effects, failure boundaries, and recovery guarantees.

### Accidental complexity

**Definition**

Complexity introduced by a chosen implementation rather than required by the problem.

**Description**

Extra coordinators, duplicated state machines, or unsuitable frameworks can add failure modes
without improving the guarantee. Prove which mechanism enforces each invariant and remove machinery
that enforces none.

**Reach for when**

Use this term when a design is difficult because of its chosen parts rather than its required
behavior.

### Build-versus-buy boundary

**Definition**

The point where a team chooses between operating its own mechanism and depending on a maintained
system that provides it.

**Description**

A database-backed queue may fit well, but the team then owns claims, leases, fencing, retry
scheduling, poison-item handling, metrics, and recovery. A purchased or managed system moves some of
that work to a dependency while adding its own contract and limits.

**Reach for when**

Use a build-versus-buy boundary to compare the full operating responsibility, not only initial code
size or license cost.

## Minimum working model

```text
1. Business work has durable identities that outlive workers.
2. Runs contain steps; steps have attempts; attempts make invocations.
3. Durable state records ownership, progress, outcomes, and terminal decisions.
4. State transitions preserve named invariants through enforceable conditions.
5. Recoverable ownership needs expiration and fencing, not heartbeats alone.
6. A timeout creates suspicion and may leave an external outcome unknown.
7. Retries imply duplicate attempts; receivers need stable identities for one effect.
8. One transaction protects only the resources inside its boundary.
9. Outboxes preserve outbound intent; inboxes or idempotent receivers handle duplicates.
10. Stochastic contracts and deterministic executions are separate; uncontrolled variation is recorded or removed.
11. Exact replay needs preserved effective inputs; exact history often needs stored outcomes.
12. Validation checks observations; trusted policy derives protected decisions.
13. Approvals and promotions refer to immutable versions, not mutable names.
14. Untrusted code and input receive explicit capabilities, limits, and containment.
15. Overload requires budgets, backpressure, admission control, or deliberate shedding.
16. Mixed-version deployment is a normal operating state with a compatibility contract.
17. Recovery claims are tested at named failure windows and through actual restore drills.
18. A production guarantee names its invariant, failure behavior, enforcement, and proof.
```
