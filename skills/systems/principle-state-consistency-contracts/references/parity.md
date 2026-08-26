# Worked-example parity contract

- **Scenario:** a catalog display may use bounded stale data, but payment recovery may authorize another effect only from a complete authority-bound observation.
- **Invariant:** a weaker read never silently satisfies a stronger freshness or completeness requirement.
- **Identity and state:** the requirement and observation repeat the exact key scope and version authority; source, authority epoch, comparable version or watermark, observation time, deadline, and fallback remain explicit.
- **Enforcement boundary:** the chosen data service and adapter enforce or report the actual read contract.
- **Required failures:** mismatched key or version authority, recently observed but lagging data, authority unavailable, read-your-writes failure, sequence gap, and failover epoch change.
- **Required proof:** direct policy tests plus the production dependency for replication semantics. A test double counts only when it reproduces the production system's relevant replication lag, partition fallback, session progress, and failover behavior; otherwise mark the claim unverified.
- **Language freedom:** client APIs may vary; authority, freshness, completeness, and fallback must not.
