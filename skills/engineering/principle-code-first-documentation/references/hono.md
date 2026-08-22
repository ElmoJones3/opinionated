# Hono

Hono's documented code-first path uses
[`@hono/zod-openapi`](https://hono.dev/examples/zod-openapi) to combine Zod
validation, route metadata, and OpenAPI generation. The official
[`@hono/swagger-ui`](https://hono.dev/examples/swagger-ui) middleware serves an
interactive UI. Plain JSDoc on a handler is important teammate and consumer
context, but these packages do not derive the route contract from that comment.

## Configure the generator

Install `@hono/zod-openapi`, use `OpenAPIHono`, and define routes with
`createRoute`. Register an OpenAPI document endpoint with `app.doc(...)`. Install
and mount `@hono/swagger-ui` against that endpoint when the application should
serve Swagger UI.

Follow the project's package manager and dependency policy. Keep documentation
routes behind the same exposure controls as the rest of the server when policy
requires it.

## Document each route

Keep a thoughtful JSDoc comment on the named handler or route declaration, then
encode the generated contract in `createRoute` and Zod metadata:

- method, OpenAPI path, operation identifier, summary, description, tags, and
  deprecation state;
- `request.params`, `request.query`, `request.headers`, `request.cookies`, and
  request body content as applicable;
- Zod field descriptions, constraints, formats, requiredness, registered schema
  names, and safe examples; and
- every response status with a condition-specific description, media type,
  schema, headers, and links where applicable.

Declare security schemes in the document and operation security requirements in
route metadata. Keep the path passed to `createRoute` in OpenAPI form, including
braced path parameters, and ensure it maps to the runtime route.

## Verify the generated product

Fetch the endpoint registered by `app.doc(...)` and inspect the changed operation.
Confirm the Zod validation accepted by the handler matches the published request
schema and every `c.json` or other response path matches a documented status and
body. Load the configured Swagger UI route and prove it resolves the generated
document rather than a separately maintained object.
