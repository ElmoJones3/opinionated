---
name: principle-code-first-documentation
description: Treat generated OpenAPI and its documentation UI as part of every HTTP boundary. Mandatory when creating, changing, reviewing, or diagnosing an HTTP server, route, handler, request or response schema, or API error contract.
---

# Code-first API documentation

An HTTP handler is not complete until consumers can discover its real contract
from generated documentation. Treat the OpenAPI or Swagger description and its
documentation UI as first-party server outputs, not follow-up prose and not an
aspirational contract maintained somewhere else.

Apply `principle-always-comment-code` alongside this skill. Write every handler
comment or docstring as if it will appear verbatim in a public documentation UI:
preserve why the operation exists, the conditions a caller must satisfy, its
side effects and lifecycle, and any limitation or gotcha a consumer needs before
calling it. Do not use a generic declaration comment as a substitute for the API
contract below.

The framework decides how code becomes OpenAPI. Gin and Express integrations can
parse annotations in handler comments. FastAPI includes handler docstrings but
derives most structure from types and decorators. Hono and Fastify derive the
contract from route and schema metadata rather than bare comments. Keep the
public prose beside the handler in every case, then encode the same contract in
the framework-recognized metadata. Never claim a comment is generator input when
the selected tool does not parse it.

## Establish the documentation path

Before changing an API boundary:

1. Identify the server framework, installed schema generator, generated artifact,
   and documentation UI route.
2. Read [the OpenAPI contract](references/openapi.md) and the matching framework
   reference:
   - [Gin](references/gin.md)
   - [FastAPI](references/fastapi.md)
   - [Hono](references/hono.md)
   - [Express](references/express.md)
   - [Fastify](references/fastify.md)
3. Extend the project's existing code-first path when it can describe the real
   contract. If none exists, install and configure the conventional integration
   documented in the framework reference with the project's package manager.
4. Keep generated files generated. Change handler comments, types, decorators,
   or route schemas, then rerun the generator. Never repair drift by hand-editing
   generated output.

Do not change specification versions or replace an established generator merely
for uniformity. In particular, the common Swag integration for Gin emits Swagger
2.0. Name the artifact honestly while preserving the same completeness standard.

## Make every operation tell the truth

Keep the following facts at the handler boundary and in the generated operation:

- a stable, unique operation identifier and a concise, outcome-oriented summary;
- a description that explains purpose, caller obligations, consequential side
  effects, idempotency or retry behavior, ordering, consistency, and material
  limitations;
- tags or grouping that match the server's public vocabulary;
- every path, query, header, and cookie parameter, including location, type,
  requiredness, format, units, defaults, constraints, and semantic meaning;
- every accepted request media type and body schema, with required fields and
  examples where an example removes real ambiguity;
- every observable success, redirect, client-error, and server-error response,
  including status, media type, schema, headers, and the condition that produces
  it;
- authentication, authorization schemes and scopes, including operations that
  deliberately override server-wide security;
- pagination, rate limits, caching, deprecation, callbacks, or streaming behavior
  when the operation exposes them; and
- explicit assumptions and gotchas that affect a correct client.

Describe the transport contract, not an imagined business rule. The implementation,
types, validation, error mapping, tests, and generated operation must agree. If
the handler can return a status or shape that the schema omits, either document
it or correct the behavior in scope. Never advertise a response the code cannot
produce.

Public documentation is not permission to disclose secrets, credentials,
internal topology, exploit details, personal data, or private implementation
notes. Use safe, representative examples. Follow the repository's exposure and
authentication policy for the documentation endpoints; first-party does not mean
publicly unauthenticated.

## Verify the generated product

Before finishing an API change:

1. Run the project's OpenAPI or Swagger generation step and fail on parser or
   validation errors.
2. Inspect the generated operation for every changed route. Compare method and
   path, parameters, body, success responses, failure responses, security, and
   public prose against the handler's observable behavior.
3. Exercise the schema endpoint and documentation UI using the project's normal
   test or run path. Prove that both load the newly generated operation; do not
   merely prove that the server starts.
4. Run the project's formatter, linter, type checks, and relevant tests. Apply
   the repository's testing skills when production behavior or automated tests
   change.
5. Include regenerated artifacts when the repository tracks them, and confirm
   they contain no unrelated drift.
6. Report the generation command, validation or test evidence, schema endpoint,
   UI endpoint, and any intentional omission or access restriction.

A handler with thoughtful prose but no generated operation is incomplete. A
generated operation with generic prose, missing failures, or a contract that
does not match the server is also incomplete.
