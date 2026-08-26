---
name: principle-contain-untrusted-work
description: Treat lower-trust data as data and restrict the authority and resources of code, parsers, plugins, tools, and workers that process it. Mandatory when lower-trust input is interpreted or executed, selects a path, URL, query, or command, or receives access to files, networks, secrets, tenants, or sensitive effects.
---

# Contain work at the trust boundary

Untrusted does not mean malicious. It means the producer is not authorized to control how the receiver executes or decides. Familiar formats, internal networks, generated text, configuration, and child processes do not grant trust by themselves.

## Map authority before execution

Name the protected assets, actors, entry points, likely abuse or mistakes, and the effect owner. Authenticate the caller, then authorize the exact tenant, resource, action, current state, and version where the effect is controlled.

Give each worker a narrow capability instead of ambient credentials. Separate claiming, execution, approval, and sensitive application roles when one does not need the others. Bind tenant identity to authenticated authority at the receiver; a tenant field in a request is only data.

## Build real containment

Select the boundary the task changes: structured input, an interpreter, process execution, a network fetch, tenant authority, or retained data. Apply every control needed by that path, not every control listed here.

- Use typed APIs, parameterized queries, and separated instruction/data channels at interpreters.
- Parse structured languages before enforcing structure; substring bans do not validate syntax, URLs, paths, or policy.
- Run untrusted code in a sandbox that actually restricts filesystem, network, system calls, environment, CPU, memory, time, processes, and output as required.
- Build an environment allowlist. A child process normally inherits secrets and authority from its parent.
- Apply network egress and redirect controls to caller-influenced fetches.
- Use immutable snapshots, locks, or conditional version checks to close validation-to-use races.
- Limit and account for resource use; define what survives when a limit is reached.
- Minimize retained data and state where redaction prevents exact audit or replay.

A subprocess is crash isolation, not a security sandbox. A signature proves that a key signed exact bytes; policy must still bind the key, purpose, subject, context, expiry, and revocation to authority.

## Coordinate adjacent principles

Use `principle-version-decisions-and-intervention` for approval and promotion, `principle-operational-control` for shared capacity and tenant fairness, and the relevant security and API-boundary skills for secrets and public request contracts.

## Prove it

Load `principle-testing-guidelines`, `principle-test-boundaries`, `principle-test-fixtures`, `principle-test-proof-failures`, and `principle-test-execution`. Exercise the applicable malformed and well-formed hostile inputs, interpreter boundary, symlink or version race, environment inheritance, blocked network or filesystem access, resource exhaustion, cross-tenant access, and denial path at the real enforcing boundary. A mock cannot prove kernel, container, database-role, or network-policy isolation.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Input selects only declared, authorized operations through typed or parser-defined fields; it cannot inject new commands into an interpreter.
- Authority is narrow, receiver-enforced, and tenant-bound.
- Containment covers every capability the threat model requires.
- Validation and use refer to the same immutable version.
- Tests cross the real security boundary and prove denied effects remain absent.
