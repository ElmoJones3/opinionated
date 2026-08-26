# Temporal boundary reference

Use Temporal Workflow history and server retry state as the orchestration authority within their configured durability and retention scope. Do not mirror every Activity attempt, lease, or timer into application storage without a separate business, audit, query, or retention requirement.

Keep the business obligation and external effect key stable across Activity retries, Workflow retries, and Continue-As-New. An Activity attempt number and Workflow Run ID identify executions, not the receiver's logical effect.

Temporal server configuration owns Activity retry scheduling and Schedule-To-Start, Start-To-Close, Schedule-To-Close, and Heartbeat timeout timers. Activity integration code:

- preserves the stable effect key and interprets receiver results honestly;
- accounts for HTTP clients, SDKs, proxies, and other retries Temporal cannot see;
- heartbeats resumable progress and cooperates with delivered cancellation; and
- keeps unknown external outcomes durable enough for safe retry, query, reconciliation, or intervention.

The receiver owns idempotency arbitration. A heartbeat does not fence a stale external effect. A timeout or cancellation delivered to an Activity does not prove the external receiver stopped.

Keep network, database, filesystem, and other nondeterministic external calls in Activities. Workflow code uses Temporal's replay-safe time, randomness, side-effect, and versioning mechanisms. A Workflow replay must not redispatch a production effect outside Activity command history.
