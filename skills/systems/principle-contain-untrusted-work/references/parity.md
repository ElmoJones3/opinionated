# Worked-example parity contract

Every branch shares one invariant: lower-trust data selects only declared behavior and never acquires authority outside the receiver's validated protocol. Implement each branch the language reference claims to support as a separate short example.

## Structured input or interpreter

- **Scenario:** untrusted structured data contains code-like text but may select only one declared operation.
- **Enforcement:** a maintained parser, typed fields, parameterized interpreter API, and receiver authorization.
- **Failures and proof:** malformed syntax, injection strings, and unauthorized operations remain data and create no effect.

## Network fetch

- **Scenario:** a lower-trust caller supplies a target that may redirect.
- **Enforcement:** named-source policy, resolution and redirect checks, and deployed egress controls.
- **Failures and proof:** loopback, private, metadata, rebinding, and redirect targets are denied at the real network boundary.

## Restricted execution

- **Scenario:** validated input runs with one output capability.
- **Enforcement:** environment allowlist plus named OS or container controls for filesystem, network, system calls, processes, CPU, memory, time, and output as claimed.
- **Failures and proof:** ambient secrets, forbidden resources, symlink or version races, and resource exhaustion are denied by the real boundary; a child process alone is not a sandbox.

## Tenant authority

- **Scenario:** one authenticated tenant requests an allowed effect on its own resource.
- **Enforcement:** receiver-side tenant binding, narrow capability, database query or row policy, and fair resource budget.
- **Failures and proof:** caller-supplied tenant IDs and cross-tenant resource references cannot read, change, or exhaust another tenant.

Parser and launch APIs may vary. Infrastructure claims must name the actual deployed mechanism.
