# The minimum mental model for distributed systems

A worker asks a payment provider to capture $40. The provider captures the money. Its reply never
reaches the worker.

What should the worker do?

It cannot safely report failure because the charge exists. It cannot safely send a fresh request
because that might charge another $40. Waiting longer may produce an answer, but the worker can
crash while it waits. A replacement worker then knows only what the system recorded before the
crash.

That small failure contains most of distributed systems design. One component kept running after
another lost contact with it. The caller knows what it asked for, but not what happened elsewhere.
The system must preserve that uncertainty and decide whether work can continue without repeating
the intended effect.

This guide works through the incident with four questions:

1. What might have happened?
2. Which facts survive the worker?
3. How can another worker continue safely?
4. Where does each guarantee end?

The payment example stays with us throughout the guide. Two short examples later apply the same
questions to device control and email. TypeScript appears only where code makes a state or decision
clearer than prose.

We assume that components can crash, pause, lose messages, repeat messages, or observe them in a
different order. We do not cover participants that deliberately forge messages or lie about their
state. Those systems need additional security and agreement mechanisms.

The companion [distributed systems glossary](./distributed-systems-glossary.md) supplies compact
definitions and samples in TypeScript, Go, Python, and C++. This guide explains the model without
requiring those links.

## Question 1: What might have happened?

Here is the failure as a timeline:

```text
order worker                     payment provider
     |                                  |
     |---- capture order-1042, $40 ---->|
     |                                  | commits capture pay-7781
     |                                  | sends success reply
     |             X<-------------------| reply is lost
     |                                  |
     | deadline passes                  |
```

The worker's timeout is real, but it describes the worker. It means, "I stopped waiting before I
received an acceptable reply." It does not mean, "The provider did not capture the money."

Several histories produce the same timeout:

| Possible history | Provider changed state? | Worker received a reply? |
| --- | --- | --- |
| Request never left the worker | No | No |
| Request was lost in transit | No | No |
| Provider refused it and the reply was lost | No | No |
| Provider captured the money and the reply was lost | Yes | No |
| Provider is still working | Not yet, but it still may | No |

The worker cannot distinguish those histories from elapsed time alone. Its honest result is
`outcome_unknown`, also called an
[ambiguous outcome](./distributed-systems-glossary.md#ambiguous-outcome).

This is the first habit to learn. Record what the system knows. `confirmed`, `refused`, and
`unknown` lead to different recovery actions. Collapsing all three into `success` or `failure`
removes information the next worker needs.

### Components fail independently

The worker timed out, but the provider remained healthy enough to commit. That is
[partial failure](./distributed-systems-glossary.md#partial-failure). Different components fail,
pause, recover, and observe events independently.

A local exception cannot roll back a remote commit. A cleanup block cannot run after a machine
loses power. A database transaction cannot undo a provider call unless the provider participates in
that exact transaction protocol.

This applies even when the word "distributed" feels too grand for the application. A web process
and its database can fail independently. So can an application and an object store, or a command-line
tool and the API it calls.

For each boundary, ask:

- Can the receiver keep working after the caller loses contact?
- What can each side know if the reply disappears?
- Which effects can still happen after the caller's deadline?

Those questions reveal whether failure can leave the two sides with different facts.

### Messages change arrival order, not source truth

Requests, replies, and queued messages can be delayed, lost, duplicated, or reordered. A queue
service, often called a broker, may durably retain a message and still deliver it more than once. An
acknowledgement may disappear after the receiver commits.

Suppose a consumer sees `order_completed` before `payment_captured`. Arrival order does not tell it
which fact happened first. If source order matters, the producer can number events within one order.
The consumer then waits when it sees a gap and ignores an exact redelivery it already applied.

That rule needs real support. One source must bind each number to one immutable event. The consumer
must save both the event receipt and the resulting state in one database transaction. Otherwise a
crash between those writes can apply the event twice or lose its state change.

The system rarely needs one global order for every event. It usually needs order within a smaller
scope, such as one order ID. The glossary covers the related terms under
[delivery](./distributed-systems-glossary.md#delivery),
[deduplication](./distributed-systems-glossary.md#deduplication), and
[inbox pattern](./distributed-systems-glossary.md#inbox-pattern).

A transport delivery ID is not automatically a business identity. A message may be new while the
effect it requests is a retry. Keep both identities when the distinction matters.

### Cancellation is another uncertain message

A caller may request cancellation after a timeout, but the cancellation can race with completion.
It can also be delayed or lose its reply. Only a receiver result such as
`cancelled_before_commit` establishes that the original effect cannot occur. A
`cancellation_requested` result does not.

Deadlines work the same way. They help a component refuse new work that is no longer useful. They
do not reach across a broken connection and stop remote work by themselves.

At this point the worker has one solid fact: it asked for one $40 capture and does not know the
result. Now it needs to survive a crash without losing that fact.

## Question 2: Which facts survive the worker?

A running process is temporary. When it exits, its variables, timers, in-memory locks, and local
queues vanish. Another process cannot inspect the lost call stack.

State that must survive belongs in [durable state](./distributed-systems-glossary.md#durable-state).
For this payment, a durable record needs to preserve:

- the order and logical effect that are owed;
- the provider, account, environment, operation, and stable key that identify the effect;
- the request details, or a trusted digest that detects changed details;
- the latest confirmed provider observation;
- each authorized physical attempt and its known outcome; and
- the version or ownership generation needed to reject a stale writer.

An in-memory queue can help a live process schedule work. It cannot be the only record that the work
exists. A timeout counter can guide the current attempt. It cannot tell a replacement whether the
provider already captured the money.

### Store intent separately from observation

The durable record should distinguish what the business still requires from what the system has
observed. `Capture requested` means the workflow still owes one capture under a stable identity. It
does not claim that the provider lacks that capture. The provider may already have applied it while
the local record still says `requested`.

Here is one possible domain shape. It rules out combinations such as `confirmed` without a provider
capture ID. A creation or storage decoder must validate these values before ordinary behavior uses
them.

```ts
/** CaptureIdentity binds one order obligation to one receiver namespace and exact request. */
interface CaptureIdentity {
  /** Obligation ID has a local uniqueness rule, so the order cannot acquire a second identity. */
  readonly obligationId: string
  /** Receiver scope is a validated provider, account, environment, and operation tuple. */
  readonly receiverScope: string
  /** Effect key remains stable for every equivalent delivery of this capture. */
  readonly effectKey: string
  /** Versioned request digest rejects reuse after amount, currency, or destination changes. */
  readonly requestDigest: string
}

/** CaptureOutcome records confirmed knowledge, never a guess derived from a timeout. */
type CaptureOutcome =
  | {
      /** Requested keeps the obligation live when a prior provider call may have succeeded. */
      readonly status: 'requested'
    }
  | {
      /** Confirmed requires an observation bound to this exact capture identity. */
      readonly status: 'confirmed'
      /** Provider capture ID names the exact effect for reconciliation or refund. */
      readonly providerCaptureId: string
    }
  | {
      /** Refused requires provider evidence that this request cannot still commit. */
      readonly status: 'refused'
      /** Refusal code preserves the receiver's stable business result. */
      readonly refusalCode: string
    }
  | {
      /** Needs attention preserves an unresolved obligation when automation is no longer safe. */
      readonly status: 'needs_attention'
      /** Reason identifies the missing protection that stopped automation. */
      readonly reason: string
    }

/** CaptureRecord keeps immutable effect identity beside its latest earned outcome. */
interface CaptureRecord {
  /** Identity remains unchanged through delivery, retry, reconciliation, and compensation. */
  readonly identity: CaptureIdentity
  /** Outcome changes only after an identity-bound provider result or explicit operator policy. */
  readonly outcome: CaptureOutcome
}
```

The type is not the storage enforcement. Local storage still needs a uniqueness rule that binds one
order capture to one immutable `CaptureIdentity`. Without it, two workers can create different keys
for the same $40 obligation and defeat provider-side deduplication.

Attempt history belongs beside this logical state. Before any provider call, the dispatcher should
durably reserve an attempt. That record names the effect identity and starts as `authorized`. Once a
call may have left the process, an abandoned authorization is treated as `unknown`. A pending result
stores the provider operation ID. A confirmed result stores the capture ID. A refusal stores the
provider evidence that no capture can still commit.

### One obligation can have many executions

Three things are easy to blur together:

1. **Logical work.** The order owes one $40 capture.
2. **Physical execution.** A worker makes a provider call. Recovery may make another call.
3. **Observable effect.** The provider's balance changes, perhaps once and perhaps more if its
   contract permits duplication.

The glossary gives a more detailed work hierarchy of
[run](./distributed-systems-glossary.md#run), [step](./distributed-systems-glossary.md#step),
[attempt](./distributed-systems-glossary.md#attempt), and
[invocation](./distributed-systems-glossary.md#invocation). The minimum distinction is simpler:
retrying code does not create a new business obligation, and counting executions does not reveal
how many effects happened.

A workflow retry may create a new step attempt. An HTTP client's retry inside that attempt creates
another provider invocation. A transport may retransmit bytes below both layers. Always name the
layer being retried. Each physical call needs diagnostic identity, while equivalent calls keep the
same logical effect identity.

Sometimes the effect count cannot be recovered. If the receiver has no complete lookup, retained
identity, or reconciliation evidence, the system may have to keep the outcome unknown and require a
business decision. It must not infer success or absence from the attempt count.

### New code and restored state inherit the same obligation

Deployments replace processes. They do not replace durable rows, queued messages, checkpoints,
artifacts, or provider effects. During a rolling deployment, old and new code run together. During
a rollback, old code may read values already written by the newer version.

New code must understand records and messages created by old code. Old code may also need to
tolerate safe additions written by new code during mixed deployment or rollback. An
[expand-and-contract migration](./distributed-systems-glossary.md#expand-and-contract-migration)
adds a compatible form, moves readers and writers, verifies old data, then removes the old form in
a later deployment. Backfills are production work with checkpoints, retries, and capacity limits of
their own.

Restoration creates a harder version of the same problem. A database snapshot can move local state
backward while payments, emails, broker deliveries, and object-store writes remain in the present.
The snapshot may even predate the local payment intent and effect key.

Complete reconciliation then requires a record that the restored database did not roll back. That
might be a provider ledger, a provider export covering the missing period, or a separately retained
operation journal. If no complete record exists, some external effects cannot be discovered and
must remain unknown.

Keep workers that produce external effects stopped during restore. Compare the restored snapshot
with the external record, run required migrations, and verify the result before reopening writes.
Later sections explain the same restore problem for worker ownership and queued delivery.

The glossary covers [backward compatibility](./distributed-systems-glossary.md#backward-compatibility),
[forward compatibility](./distributed-systems-glossary.md#forward-compatibility), and
[restore](./distributed-systems-glossary.md#restore).

The durable record can now outlive its original worker and the version of code that created it. The
next question is how a replacement acts without making the situation worse.

## Question 3: How can another worker continue safely?

A retry is another execution. It reduces the chance that omitted work stays omitted, but it raises
the chance that completed work happens again. Whether that trade is safe depends on what the caller
knows and what the receiver promises.

Start with the result of the previous call:

| Observation | What it establishes | Next move |
| --- | --- | --- |
| Local validation refused before any call | No remote request was made | Return the refusal |
| Receiver confirms no effect was accepted | This attempt created no effect | Retry if policy allows |
| Reply is missing or came from an intermediary | The effect may exist | Query, retry under idempotency, or preserve unknown |
| Receiver says the operation is pending | The effect can still complete | Wait or reconcile later |
| Local code breaks an invariant | Repeating the same code does not repair it | Preserve evidence and stop automatic attempts |

A `429`, `503`, gateway error, or broken connection does not automatically prove that no effect was
accepted. Only a response defined by the receiver's operation contract can make that claim.

### Idempotency belongs to the receiver

An idempotent operation lets equivalent requests converge on one logical effect. The receiver may
execute its lookup and validation many times. What matters is that it does not apply the business
change again.

For payment capture, the caller sends a stable effect identity. The receiver must:

1. scope the key to the account, environment, and operation;
2. compute a digest from one canonical request representation;
3. arbitrate concurrent calls carrying the same identity;
4. bind the accepted effect to the stored response in the same indivisible decision; and
5. return that response for an equivalent later call.

If the receiver records the key after the effect in a separate commit, it can crash between the two
and repeat the effect. If it records success before the effect, it can replay success for work that
never happened. A strict at-most-one-effect claim needs atomic arbitration or an equivalent receiver
protocol. Detecting duplicates later and refunding them is a weaker compensation guarantee.

Finite retention needs its own rule. A caller-side check that the key has not expired is not enough.
The request can arrive after expiry, clocks can disagree, and an earlier request may still be
delayed. For a strict claim, the receiver must permanently reject reuse of a consumed key, retain a
tombstone, or enforce an arrival deadline with its own clock. A protocol based on bounded delay and
clock difference must state those bounds and leave enough margin before authorizing another call.

The glossary's [idempotency-key sample](./distributed-systems-glossary.md#idempotency-key) shows the
basic replay and changed-request decisions. A production receiver should derive the digest from its
canonical request rather than trusting a caller to describe its own payload. For example, the
normalization must decide whether `40`, `40.00`, and `USD 40.00` represent the same capture request.

### Recovery chooses an action from established facts

A replacement worker reads the durable capture state and queries the provider by the complete
identity. That lookup must include every earlier request in the provider account, including queued
or pending work. Its response carries the same provider, account, environment, operation, key, and
request digest so the local system can reject a misrouted answer.

After the boundary validates that identity, the central decision is small:

| Established fact | Decision | Enforcement still needed |
| --- | --- | --- |
| Capture exists under this identity | Confirm the capture ID | Conditional local transaction |
| Earlier request is pending | Reconcile later | Durable wake-up or scan |
| Lookup cannot establish an outcome | Reconcile later | Preserve `requested` state |
| Receiver protection and policy cover another equivalent call | Reserve a retry | Attempt, budget, capacity, and deadline reservation |
| No safe automatic conclusion or call exists | Move to needs attention | Preserve the identity and reason |

Retry eligibility is not permission for an uncounted network call. Immediately before calling the
provider, effectful code must:

1. reserve an attempt against the durable payment record and retry budget in one indivisible
   database change;
2. acquire capacity at the intended local or global scope;
3. recheck and propagate an absolute deadline; and
4. issue one provider invocation, or charge any lower-level retry to the same budget.

Several workers may all observe that retry looks safe. The reservation decides which one may act.
If a worker disappears after reservation, recovery treats the abandoned attempt as unknown. An
exhausted budget ends automatic calls for now. It does not turn the payment into ordinary failure.

### Concurrent workers need enforced authority

Two workers can read the same durable obligation. A lease may expire while the first worker pauses,
then a second worker takes over. When the first wakes up, both may try to record or deliver work.

The protected local change needs one database operation that says, in effect:

```text
update this payment
only if its version and current ownership generation still match
```

If the database changes no row, the worker lost authority. Reading the version in application code
and later issuing an unconditional update leaves a race between the check and the write.

A lease expiry does not stop the old worker. A
[fencing token](./distributed-systems-glossary.md#fencing-token) lets the protected resource reject
an old ownership generation. Exact-current fencing compares with the current generation during the
write. Some resources instead remember the largest token they have seen and reject older tokens
after a newer one arrives. That weaker high-watermark form does not prove that the caller owns the
current lease.

Local fencing protects local commits. It cannot stop a stale worker from calling the payment
provider. This design treats a committed capture intent as irrevocably authorized, so repeated calls
with its identity are safe under provider idempotency. If business policy can revoke that authority,
the provider must validate the cancellation or ownership generation. Otherwise a late capture needs
an explicit compensation such as refund.

Token allocation must not move backward after restore. Two calls carrying the same current token
can still race, so the state version, uniqueness rule, and provider idempotency contract remain
necessary.

A restore must create a new ownership generation from a source the restored snapshot did not roll
back, or otherwise prove that the new token is larger than every token issued before the restore.
Until then, workers remain unable to claim work.

### Recovery traffic can overload the system

Imagine one hundred payment calls timing out because the provider is slow. The HTTP client retries
each call three times. The workflow runner also retries each step three times. A recovery scanner
finds the same pending records and adds its own calls. One slow dependency now receives far more
than one hundred requests.

A queue absorbs a short burst. It does not create processing capacity. If work arrives faster than
it completes for long enough, a finite queue fills and queue age grows. Callers may time out while
their work remains queued, then add retries for work that still exists.

The attempt reservation and capacity acquisition above make overload part of the recovery protocol.
Admission control can refuse new obligations before acceptance. Backpressure tells producers to
slow down. Load shedding may discard work before acceptance, but already accepted work needs a
durable cancellation, deferral, or compensation state.

Deadlines help only when each actor checks them before starting more work. They do not prove that
queued, running, or remote work stopped. Capacity also has scope. Ten calls per process across
twenty processes permit two hundred calls, so a global provider limit needs coordinated admission
or local shares whose total stays inside the provider budget.

The glossary's [backpressure sample](./distributed-systems-glossary.md#backpressure) shows one local
TypeScript concurrency limit. Useful operational evidence includes queue age, in-flight work,
refusal rate, physical calls per logical effect, and time spent unresolved.

Another worker can now continue without guessing, bypassing authority, or creating unlimited retry
traffic. The last question is which resource earns each promise.

## Question 4: Where does each guarantee end?

The payment workflow crosses a database, queue service, dispatcher, network, and payment provider.
No single mechanism controls all of them.

### One transaction covers its participants

Suppose the order service needs to mark an order `awaiting_payment` and publish a capture request.
Updating the database and publishing directly to the queue service creates a gap:

```text
update order, then crash, then publish     order waits forever
publish request, then crash, then update   payment may exist for an unchanged order
```

If the order row and an outbox table share one database, one transaction can commit both:

```text
one database transaction
├── order state = awaiting_payment
├── payment intent = requested, immutable effect identity
└── outbox row = capture requested
```

That commit is atomic for those rows, meaning either all of them commit or none of them do. It does
not include the queue service or payment provider. An outbox dispatcher later delivers the durable
message. If it crashes after publishing but before recording delivery, it publishes again. The
receiver's idempotency contract handles the repeated effect request.

The [outbox sample](./distributed-systems-glossary.md#outbox-pattern) shows a TypeScript settlement
boundary for state and local message intent. Its adapter must use one real transaction. Calling two
repository methods inside one application function does not create atomicity.

A restore can bring back an outbox row that was already delivered. Redelivering it is unsafe if the
receiver no longer remembers the effect identity. Before restarting dispatchers, restoration must
reconcile and retire such rows or establish that the receiver still rejects the late duplicate.

Even the database commit can have an ambiguous outcome. The database may commit all three rows and
lose the reply. A settlement command therefore needs stable identity and a way to query or repeat
the conditional operation. Its caller-visible results should distinguish:

- committed;
- rejected without commit because the expected version was stale; and
- outcome unknown because contact was lost during commit.

Atomicity answers whether participating changes commit together. It does not tell the caller which
outcome occurred after a broken connection, and it does not validate the business transition.

### Delivery, reconciliation, and compensation do different jobs

An effect outside the local transaction needs a protocol.

Delivery keeps durable intent moving after the process that created it dies. The outbox row says a
dispatcher still owes the provider request. Retry and redelivery rules govern how it keeps trying.

Reconciliation compares durable intent with provider state. It asks about the complete effect
identity and records captured, pending, stable absence, or unknown. A response that omits queued
work or reads a lagging copy cannot safely authorize another unprotected capture.

Compensation creates a new effect that tries to repair an unwanted committed effect. If fulfillment
becomes impossible after capture, a refund may be the accepted business response. The capture still
happened. The refund has its own identity, retries, uncertain outcomes, and idempotency requirements.
It is not a rollback of history.

A [saga](./distributed-systems-glossary.md#saga) can organize several local commits and
compensations. Other actors may observe intermediate states while the saga runs, so each state needs
defined behavior of its own.

Here is how the four questions transfer to effects unlike payment.

A device controller loses the acknowledgement for a valve command. The valve may have moved even
though the controller timed out. The command identity and uncertain result must survive the
controller process. A replacement can read current valve state, but current state may not prove
whether that particular command ran. Repeating physical motion may be unsafe, and a reversing
command is a new effect rather than a rollback.

An email dispatcher loses the provider's acceptance reply. Its durable delivery intent survives the
dispatcher. A stable provider key may prevent duplicate acceptance if the provider offers that
contract. A receipt can prove provider acceptance without proving that the recipient read or even
received the message. Email usually cannot be recalled, so the design must prevent duplicates,
tolerate them, or preserve uncertainty for manual handling.

### Freshness is part of a read

"Read the current state" is incomplete when data has replicas, caches, or asynchronous projections.
Ask what the caller needs:

- After a user changes a password, must the next read reflect it?
- May the order screen lag payment confirmation for a few seconds?
- Can payment recovery trust a provider lookup enough to issue another call?
- Should the system refuse a payment decision when it cannot reach the authority?

Those answers define the consistency and freshness promise. A client that must see its own completed
write needs read-your-writes behavior. A catalog page may accept a stated amount of lag. Eventual
consistency promises convergence if updates stop and communication continues, but it gives no useful
deadline unless the contract adds one.

Some decisions need linearizable access. Every completed operation appears to occur at one point
between its start and finish, and operations that do not overlap preserve real-time order. The
contract still needs an object or key scope. An incomplete operation may or may not have taken
effect.

When a network partition prevents contact with the authority, a component may have to refuse an
operation that needs that answer. Serving an older copy preserves availability by weakening
freshness. That may be correct for a catalog page and wrong for authorizing another payment.

A version token needs an authority epoch, or another ordering scheme that never reuses versions,
when restore or failover can move its version space backward. Every fresh read also needs a deadline
and a stated fallback: return older data with its version, return unavailable, or use a separately
approved source.

The glossary expands these terms under
[consistency model](./distributed-systems-glossary.md#consistency-model) and
[read-your-writes consistency](./distributed-systems-glossary.md#read-your-writes-consistency).

### Make variable inputs visible

The recovery decision depends on provider observation, time, policy, capacity, and the schedule in
which workers race. Hiding those values in process globals makes a failure hard to reproduce. Pass
them into the decision or record them when replay matters.

Ask two separate questions:

1. What outcomes does the operation contract permit?
2. Can every effective input and schedule be controlled or replayed?

A deterministic calculation owes the same output for the same effective input. Retry jitter is
stochastic because it intentionally samples a delay from a probability distribution. A concurrent
protocol may allow several schedules without assigning probabilities to them.

Recording a random sample, clock reading, provider response, configuration version, or worker
generation can move it from ambient process state into replayable input. Recording is a mechanism,
not a separate kind of result.

Evidence follows the claim. Test deterministic decisions with exact inputs and outputs. Test retry
jitter across repeated samples and assert its bounds rather than one exact delay. Exercise
concurrent recovery under controlled schedules and faults around the named commit windows. Those
tests cover the cases and environments that ran, not every possible production history.

See [deterministic operation](./distributed-systems-glossary.md#deterministic-operation),
[stochastic operation](./distributed-systems-glossary.md#stochastic-operation), and
[uncontrolled nondeterminism](./distributed-systems-glossary.md#uncontrolled-nondeterminism) for
the broader vocabulary.

### Write each guarantee as a complete argument

The design now contains many useful words: durable, ordered, idempotent, atomic, fresh, safe to
retry. None is a complete guarantee by itself.

Write each important claim with these fields:

| Field | Question it answers |
| --- | --- |
| Claim | What user-visible or business behavior is promised? |
| Scope | Which operation, identities, resources, and time window does it cover? |
| Assumptions | What must remain true outside the enforcing mechanism? |
| Invariant | Which condition must never be violated, if the claim is a safety property? |
| Enforcement or measurement | Which mechanism preserves the invariant or measures the objective? |
| Failure behavior | What becomes visible when the system cannot continue safely? |
| Evidence | Which tests, analyses, observations, and recovery exercises support the claim? |

Here is the payment claim filled in:

| Field | Payment capture guarantee |
| --- | --- |
| Claim | Equivalent deliveries create at most one capture for one accepted order payment. |
| Scope | Capture requests through the named provider account and environment using the order's one immutable effect identity. |
| Assumptions | Dispatchers never create a second identity for the order payment. The provider rejects late or reused identities after active deduplication retention ends. |
| Invariant | One order payment maps to one external identity, and that identity maps to at most one provider capture. |
| Enforcement or measurement | Local uniqueness binds the order payment to its identity. The provider atomically arbitrates that identity with capture creation and retains a tombstone or enforces an arrival cutoff. |
| Failure behavior | Missing replies leave the intent requested. Recovery queries or redelivers the same identity. Missing protection moves the obligation to needs attention. |
| Evidence | Exercise local uniqueness and transaction isolation, concurrent provider calls, late arrival beyond normal retention, named commit and reply-loss faults, duplicate monitoring, and restore from a snapshot older than provider effects. |

This is an at-most-one-effect claim. It does not promise that capture eventually succeeds. A
separate delivery objective would state how long accepted payment intents may remain unresolved and
what happens when that objective is missed.

The word "proof" needs the same scope as the guarantee. A database constraint can enforce an
invariant under the database's documented assumptions. An integration test can show that the
application reached that constraint with a particular schema and engine configuration. Fault
injection can exercise named windows. Monitoring can reveal past failures. No one piece establishes
every future execution.

Evidence should confirm that the intended test ran, the fault hook activated, and the real engine,
schema, transaction isolation, and provider configuration owned the observed behavior. A restore
claim needs a restore drill. A backup listing is insufficient.

If the claim is an invariant, identify the indivisible decision that prevents its violation. If the
claim concerns latency, availability, restoration, or probability, identify the mechanism and
measurement that define it. A code comment or architecture diagram can record the argument, but
neither enforces the deployed behavior.

## Resolve the original incident

We can now finish the payment story without guessing.

1. The order transaction records `awaiting_payment`, one immutable payment identity, and an outbox
   delivery request.
2. A dispatcher atomically claims that delivery and creates an authorized attempt under the current
   ownership generation and retry budget.
3. After acquiring provider capacity and checking the absolute deadline, the dispatcher sends one
   capture call. Any lower-level retry needs another reservation or consumes the same reserved
   budget.
4. The provider atomically binds the effect identity to capture `pay-7781` and its response.
5. The response disappears. The abandoned attempt is `unknown`; the durable payment intent remains
   `requested`.
6. The dispatcher crashes. The outbox row, payment intent, and authorized attempt survive.
7. Another authorized dispatcher queries the provider using the complete identity. The answer is
   bound to that provider, account, environment, operation, key, and request digest.
8. The provider returns capture `pay-7781`. No second capture is created.
9. One local transaction records confirmation, advances the order, closes the original capture
   delivery, and writes the receipt intent to the outbox.
10. If that commit reply disappears, the caller queries or repeats the stable conditional command.
    It does not infer rollback from the broken connection.

During restoration, dispatchers remain stopped until the system creates a new authority epoch and
compares restored intent with an external ledger or other record outside the snapshot. If no record
can reveal post-snapshot effects, those outcomes remain unknown.

The system did not make the network reliable. It kept uncertainty visible, preserved the facts
needed for recovery, repeated work only under a receiver-enforced identity, and limited every claim
to the resource that enforces it.

## The fifteen-idea reference card

The incident produced the full model. Keep this list for design reviews after the reasoning is
familiar.

1. Components fail independently. Partial failure is normal.
2. Process memory disappears. State that must survive needs durable ownership.
3. Logical work, physical attempts, and observable effects are different things.
4. Messages and replies can be delayed, lost, duplicated, or reordered.
5. A timeout proves that waiting ended, not that remote work failed.
6. Concurrent actors need explicit authority enforced where state changes.
7. Retries trade possible omission for possible duplication.
8. Idempotency is a receiver-enforced contract for one logical effect.
9. One atomic commit covers only the resources participating in it.
10. Cross-boundary effects need an explicit delivery, reconciliation, or compensation protocol.
11. Consistency and freshness guarantees must be stated rather than assumed.
12. Deterministic and stochastic result contracts need different evidence; uncontrolled inputs and
    schedules need control or recording.
13. Capacity is finite. Overload behavior is part of correctness.
14. Deployments and restoration happen against durable state created by older versions.
15. Every guarantee names its scope, assumptions, invariant when applicable, enforcement or
    measurement, failure behavior, and evidence.

For compact definitions or another language sample, continue with the
[distributed systems glossary](./distributed-systems-glossary.md).
