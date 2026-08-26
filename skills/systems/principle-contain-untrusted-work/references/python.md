# Python

Application validation narrows a request. It does not replace process, container, database-role, or network enforcement.

## Structured input

```python
"""Limit lower-trust jobs to receiver-owned operations and resources."""

import json
from dataclasses import dataclass
from typing import Literal, Protocol


@dataclass(frozen=True)
class Job:
    """Represent the only instruction shape lower-trust JSON may select."""

    operation: Literal["render"]  # Receiver-owned behavior, never arbitrary code.
    template_text: str  # Data passed through the interpreter's parameter API.
    resource_id: str  # Resource checked against current authenticated authority.


@dataclass(frozen=True)
class AuthenticatedJobActor:
    """Carry receiver-trusted identity, never authority claimed by job JSON."""

    tenant_id: str  # Tenant bound by authentication middleware.
    subject_id: str  # Accountable authenticated caller.


class JobAuthorization(Protocol):
    """Check current receiver-owned authority for one declared operation."""

    def may_use_resource(
        self,
        actor: AuthenticatedJobActor,
        resource_id: str,
        operation: Literal["render"],
    ) -> bool:
        """Bind actor, tenant, resource, and operation before interpretation."""
        ...


def parse_authorized_job(
    raw: str,
    actor: AuthenticatedJobActor,
    authorization: JobAuthorization,
) -> Job:
    """Parse one job and refuse behavior outside current receiver authority."""
    # value remains inert parsed data until every receiver-owned rule passes.
    value = json.loads(raw)
    if not isinstance(value, dict) or set(value) != {
        "operation",
        "template_text",
        "resource_id",
    }:
        raise ValueError("job shape is not allowed")
    if (
        value["operation"] != "render"
        or not isinstance(value["template_text"], str)
        or not isinstance(value["resource_id"], str)
    ):
        raise ValueError("job values are not allowed")
    # job is typed but remains unauthorized until the receiver checks current ownership.
    job = Job("render", value["template_text"], value["resource_id"])
    if not authorization.may_use_resource(actor, job.resource_id, job.operation):
        raise PermissionError("resource is not authorized")
    return job
```

Use the maintained schema library already adopted by the repository when one exists. Pass `template_text` through a parameter or data API. Never concatenate it into source, SQL, shell, or query text.

## Network fetch

```python
from typing import Protocol
from urllib.parse import urlsplit


class FetchPolicy(Protocol):
    """Own resolution, connect, redirects, and deployed egress enforcement."""

    def open_verified(self, target: str) -> bytes:
        """Recheck every target and bind the connection to approved resolution."""
        ...


def fetch_named_source(raw_target: str, policy: FetchPolicy) -> bytes:
    """Accept HTTPS syntax before the enforcing policy opens the connection."""
    # parsed proves URL structure only; policy still owns destination authority.
    parsed = urlsplit(raw_target)
    if parsed.scheme != "https" or parsed.hostname is None:
        raise ValueError("source must be an absolute HTTPS URL")
    return policy.open_verified(raw_target)
```

The real policy rejects loopback, private, link-local, metadata, unapproved ports, rebinding, and redirect targets, then uses deployed egress controls. Parsing and one DNS lookup are not sufficient.

## Restricted execution

```python
from dataclasses import dataclass
import subprocess
from typing import Protocol


@dataclass(frozen=True)
class LaunchRequest:
    """Contain trusted executable choice, immutable arguments, and job input."""

    executable: str  # Selected by trusted configuration.
    arguments: tuple[str, ...]  # Data passed without shell interpolation.
    input_bytes: bytes  # Only job content exposed to the restricted worker.


class Sandbox(Protocol):
    """Own the named container or OS controls and bounded output."""

    def run(self, request: LaunchRequest) -> bytes:
        """Enforce configured filesystem, network, syscall, process, CPU, memory, time, and output limits."""
        ...


def run_with_hygiene(request: LaunchRequest) -> subprocess.CompletedProcess[bytes]:
    """Avoid shell interpolation and ambient environment inheritance, but provide no sandbox."""
    return subprocess.run(
        [request.executable, *request.arguments],
        input=request.input_bytes,
        env={"PATH": "/usr/bin:/bin", "LANG": "C.UTF-8"},
        shell=False,
        capture_output=True,
        timeout=10,
        check=False,
    )
```

Use `Sandbox.run` for containment and name its deployed mechanism. The subprocess helper is launch hygiene only; it does not remove the parent's filesystem or network authority.

## Tenant authority

```python
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class Actor:
    """Carry tenant authority derived from verified credentials."""

    tenant_id: str  # Server-bound tenant, never copied from request JSON.
    subject_id: str  # Accountable authenticated caller.


class TenantStore(Protocol):
    """Enforce tenant and version scope in the authoritative state change."""

    def update_owned(
        self, tenant_id: str, resource_id: str, expected_version: int
    ) -> bool:
        """Change one row only when tenant, resource, and version match."""
        ...
```

## Proof

Exercise malformed documents, extra operations, unauthorized resources, and injection strings against the real parser, authorization service, and interpreter. Test private, loopback, metadata, rebinding, and redirect targets through deployed egress. Prove environment absence separately from real sandbox denials and output bounds. Exercise cross-tenant references and resource exhaustion at the receiver and database policy. Mark unavailable infrastructure guarantees unverified.
