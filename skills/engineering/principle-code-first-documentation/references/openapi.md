# OpenAPI contract

OpenAPI is the machine-readable HTTP interface description. Swagger UI is one
consumer that renders such a description. Use the names deliberately: a server
may generate OpenAPI without serving Swagger UI, and older integrations may
generate Swagger 2.0 rather than OpenAPI 3.x.

The [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) is the
authority for fields and semantics. Use a version supported by the project's
generator instead of copying syntax from a different version. The specification
defines the interface so people and tools can understand the service without
reading its source or observing network traffic; code-first generation makes the
source boundary responsible for keeping that description true.

## Operation completeness

For every changed operation, inspect the generated description rather than
assuming annotations were recognized. Confirm:

- `operationId` is unique and stable enough for generated clients;
- `summary` says what outcome the operation provides;
- `description` preserves caller obligations, side effects, retry or idempotency
  behavior, consistency, limitations, and deprecation details;
- parameters name the correct location and requiredness, and schemas preserve
  formats, ranges, patterns, units, defaults, nullability, and examples;
- request bodies declare every accepted media type and required field;
- responses cover every status the boundary deliberately emits, not only the
  happy path, and describe response headers and bodies;
- security requirements and scopes match middleware and operation-level
  overrides; and
- reusable schemas and security schemes use components or definitions according
  to the selected specification version.

Do not use `default` as a way to avoid documenting known failure states. Do not
invent examples that violate the schema. Do not expose credentials, live tokens,
personal data, internal hostnames, or implementation-only details.

## Generated artifact and UI

Generate from the code path that owns routing and validation. If the repository
commits JSON, YAML, or generated source, regenerate it with the canonical command
and review the diff. Treat a parser warning, unresolved schema, duplicate
operation identifier, missing route, or Swagger UI rendering failure as a broken
build rather than a documentation nuisance.

[Swagger UI](https://github.com/swagger-api/swagger-ui) renders an interactive
documentation application from a Swagger or OpenAPI description. Verify both the
raw schema endpoint and the UI route. Protect or disable the UI in deployed
environments when repository policy requires it, but keep the generation path
testable.
