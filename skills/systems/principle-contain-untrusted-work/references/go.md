# Go

Application checks narrow requests. They do not replace kernel, container, database-role, or network enforcement.

## Structured input

```go
// Package containment limits authority granted to lower-trust jobs.
package containment

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
)

// AuthenticatedJobActor carries authority derived from verified credentials.
type AuthenticatedJobActor struct {
	// TenantID is server-bound and never copied from lower-trust JSON.
	TenantID string
	// SubjectID identifies the accountable authenticated caller.
	SubjectID string
}

// JobAuthorization checks current receiver-owned authority before interpretation.
type JobAuthorization interface {
	// MayUseResource binds actor, tenant, resource, and operation at the receiver.
	MayUseResource(ctx context.Context, actor AuthenticatedJobActor, resourceID, operation string) (bool, error)
}

// Job is the only receiver-owned operation lower-trust JSON may select.
type Job struct {
	// Operation must equal render; other operations remain unauthorized data.
	Operation string `json:"operation"`
	// TemplateText remains data for the maintained interpreter API.
	TemplateText string `json:"templateText"`
	// ResourceID is checked against authenticated authority at the receiver.
	ResourceID string `json:"resourceId"`
}

// DecodeAuthorizedJob rejects malformed, trailing, or unauthorized work before execution.
func DecodeAuthorizedJob(
	ctx context.Context,
	reader io.Reader,
	actor AuthenticatedJobActor,
	authorization JobAuthorization,
) (Job, error) {
	// decoder owns one strict JSON document so undeclared fields cannot select behavior.
	decoder := json.NewDecoder(reader)
	decoder.DisallowUnknownFields()
	// job remains inert data until the operation allowlist passes.
	var job Job
	// err records syntax and shape refusal before any interpreter receives input.
	if err := decoder.Decode(&job); err != nil {
		return Job{}, fmt.Errorf("decode job: %w", err)
	}
	// trailing detects a second JSON value instead of silently authorizing its prefix.
	var trailing json.RawMessage
	// trailingErr must be io.EOF after the one allowed document and surrounding whitespace.
	trailingErr := decoder.Decode(&trailing)
	if trailingErr != io.EOF {
		return Job{}, fmt.Errorf("job must contain exactly one JSON value")
	}
	if job.Operation != "render" {
		return Job{}, fmt.Errorf("operation %q is not allowed", job.Operation)
	}
	// allowed is receiver-owned current authority, not a claim from the JSON document.
	allowed, err := authorization.MayUseResource(ctx, actor, job.ResourceID, job.Operation)
	if err != nil {
		return Job{}, fmt.Errorf("authorize job: %w", err)
	}
	if !allowed {
		return Job{}, fmt.Errorf("resource is not authorized")
	}
	return job, nil
}
```

Pass `TemplateText` through a parameter or data API in the maintained interpreter. Never form shell, SQL, source, or query text with concatenation.

## Network fetch

```go
import (
	"context"
	"fmt"
	"net/url"
)

// FetchPolicy owns resolution, connect, redirect, and deployed egress enforcement.
type FetchPolicy interface {
	// OpenVerified rechecks every target and binds the connection to approved resolution.
	OpenVerified(ctx context.Context, target *url.URL) ([]byte, error)
}

// FetchNamedSource accepts HTTPS syntax before the enforcing policy opens the connection.
func FetchNamedSource(ctx context.Context, rawTarget string, policy FetchPolicy) ([]byte, error) {
	// target and err establish URL syntax only; policy still owns destination authority.
	target, err := url.ParseRequestURI(rawTarget)
	if err != nil || target.Scheme != "https" || target.Hostname() == "" {
		return nil, fmt.Errorf("source must be an absolute HTTPS URL")
	}
	return policy.OpenVerified(ctx, target)
}
```

The real policy rejects loopback, private, link-local, metadata, unapproved ports, rebinding, and redirects, then relies on deployed egress controls. `url.Parse` and one DNS check do not earn that claim.

## Restricted execution

```go
import (
	"context"
	"os/exec"
)

// LaunchRequest contains trusted executable choice, immutable arguments, and job input.
type LaunchRequest struct {
	// Executable comes from trusted configuration, never lower-trust input.
	Executable string
	// Arguments pass data without shell interpolation.
	Arguments []string
	// Input is the only job content exposed to the restricted worker.
	Input []byte
}

// Sandbox owns the named OS or container controls and bounded output.
type Sandbox interface {
	// Run enforces the configured filesystem, network, syscall, process, CPU, memory, time, and output limits.
	Run(ctx context.Context, request LaunchRequest) ([]byte, error)
}

// CommandWithHygiene prevents shell interpolation and ambient environment inheritance only.
func CommandWithHygiene(ctx context.Context, request LaunchRequest) *exec.Cmd {
	// command deliberately has no shell and receives a complete environment allowlist below.
	command := exec.CommandContext(ctx, request.Executable, request.Arguments...)
	command.Env = []string{"PATH=/usr/bin:/bin", "LANG=C.UTF-8"}
	return command
}
```

`exec.Cmd` is not a sandbox. Use `Sandbox.Run` for the containment claim and name the deployed mechanism.

## Tenant authority

```go
// Actor carries tenant authority derived from verified credentials.
type Actor struct {
	// TenantID is server-bound and never copied from request JSON.
	TenantID string
	// SubjectID identifies the accountable caller.
	SubjectID string
}

// TenantStore enforces tenant and version scope where state changes.
type TenantStore interface {
	// UpdateOwned changes one row only when tenant, resource, and version match.
	UpdateOwned(ctx context.Context, tenantID, resourceID string, expectedVersion int64) (bool, error)
}
```

## Proof

Exercise malformed documents, concatenated JSON values, unauthorized resources, and injection strings against the real parser, authorization service, and interpreter API. Test loopback, private, metadata, rebinding, and redirects through deployed egress. Check environment scrubbing separately from real sandbox denials and output limits. Test cross-tenant references and fair capacity at the receiver and database. Mark unavailable kernel, container, database-role, and network-policy claims unverified.
