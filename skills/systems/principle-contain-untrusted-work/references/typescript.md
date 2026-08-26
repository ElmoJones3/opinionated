# TypeScript

Apply only the branches the changed path crosses. Application validation narrows requests; kernel, container, database, and network policy enforce capabilities the process must not own.

## Structured input

```ts
/** ParsedJob is the only instruction shape lower-trust JSON may select. */
interface ParsedJob { /** operation is chosen from receiver-owned behavior. */ readonly operation: "render"; /** templateText remains data even when it contains code-like text. */ readonly templateText: string; /** resourceId is authorized at the receiver. */ readonly resourceId: string; }
/** Authorization binds authenticated authority to one resource and operation. */
interface Authorization { /** mayUseResource checks current server-side ownership. */ mayUseResource(resourceId: string, operation: "render"): Promise<boolean>; }

/** parseJob uses the maintained schema validator already adopted by the repository. */
declare function parseJob(raw: unknown): ParsedJob;
/** authorizeJob refuses before an interpreter or effect receives the payload. */
async function authorizeJob(raw: unknown, authority: Authorization): Promise<ParsedJob> {
  /** job exists only after syntax and operation selection pass receiver validation. */
  const job = parseJob(raw);
  if (!(await authority.mayUseResource(job.resourceId, job.operation))) throw new Error("resource not authorized");
  return job;
}
```

Pass `templateText` through the interpreter's parameter or data API. Never concatenate it into source, SQL, shell, or a query language. A validation library such as Zod is appropriate only when the project already uses it.

## Network fetch

```ts
/** FetchPolicy owns scheme, hostname, resolution, redirect, and deployed egress checks. */
interface FetchPolicy { /** openVerified resolves and connects through the approved network path, rechecking every redirect. */ openVerified(target: URL): Promise<Uint8Array>; }
/** fetchNamedSource accepts only HTTPS URLs and delegates rebinding-safe connection to policy. */
async function fetchNamedSource(rawTarget: string, policy: FetchPolicy): Promise<Uint8Array> {
  /** target is parsed structure, not proof that its resolved destination is allowed. */
  const target = new URL(rawTarget);
  if (target.protocol !== "https:") throw new Error("only HTTPS sources are allowed");
  return policy.openVerified(target);
}
```

`openVerified` must reject loopback, private, link-local, metadata, unapproved ports, DNS rebinding, and redirect targets, then connect through the deployed egress restriction. Parsing a URL or checking one DNS answer is not that enforcement.

## Restricted execution

```ts
import { spawn } from "node:child_process";

/** LaunchRequest contains immutable validated input and no ambient environment. */
interface LaunchRequest { /** executable is selected by trusted configuration. */ readonly executable: string; /** arguments contain data without shell interpolation. */ readonly arguments: readonly string[]; /** input is the only job data exposed to the child. */ readonly input: Uint8Array; }
/** Sandbox owns the named container or OS controls and returns bounded output. */
interface Sandbox { /** run enforces filesystem, network, syscall, process, CPU, memory, time, and output policy as configured. */ run(request: LaunchRequest): Promise<Uint8Array>; }

/** spawnWithHygiene shows safe argument and environment handling but is not a sandbox. */
function spawnWithHygiene(request: LaunchRequest) {
  return spawn(request.executable, [...request.arguments], { shell: false, env: { PATH: "/usr/bin:/bin", LANG: "C.UTF-8" }, stdio: ["pipe", "pipe", "pipe"] });
}
```

Use `Sandbox.run` for the containment claim and name its deployed mechanism. `spawnWithHygiene` avoids shell interpolation and secret inheritance; the child still has the parent's OS authority unless a real boundary removes it.

## Tenant authority

```ts
/** AuthenticatedActor derives tenant authority from verified credentials, never request JSON. */
interface AuthenticatedActor { /** tenantId is bound by authentication middleware. */ readonly tenantId: string; /** subjectId identifies the accountable caller. */ readonly subjectId: string; }
/** TenantStore enforces tenant scope in the same query or row policy that changes state. */
interface TenantStore { /** updateOwnedResource refuses cross-tenant identity and stale versions atomically. */ updateOwnedResource(tenantId: string, resourceId: string, expectedVersion: number): Promise<"updated" | "denied_or_stale">; }
/** updateResource spends the authenticated tenant's capacity and authority only. */
async function updateResource(actor: AuthenticatedActor, resourceId: string, version: number, store: TenantStore) {
  return store.updateOwnedResource(actor.tenantId, resourceId, version);
}
```

## Proof

Send malformed documents, extra operations, and injection strings through the real parser and interpreter API. Test loopback, private, metadata, rebinding, and redirect targets through deployed egress controls. Prove environment absence separately from real sandbox filesystem, network, process, and resource denials. Exercise cross-tenant references and resource exhaustion at the receiver and database policy. Mark kernel, container, database-role, or egress guarantees unverified when that boundary is unavailable; convenient fakes cannot prove them.
