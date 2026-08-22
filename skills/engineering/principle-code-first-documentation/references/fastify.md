# Fastify

Use Fastify's official [`@fastify/swagger`](https://github.com/fastify/fastify-swagger)
plugin in dynamic mode to generate Swagger or OpenAPI from route schemas, and
[`@fastify/swagger-ui`](https://github.com/fastify/fastify-swagger-ui) to serve
the interactive documentation. Plain JSDoc on a handler is required reasoning,
but Fastify derives the generated operation from route schema metadata.

## Configure the generator

Install both plugins with the project's package manager. Register
`@fastify/swagger` before every route so route discovery can see the complete
server, then register `@fastify/swagger-ui` with the intended route prefix. Pass
an `openapi` configuration when the project requires OpenAPI 3.x; the plugin's
default without it is Swagger-compatible output.

Dynamic mode is the code-first path. Do not switch to static mode, which serves a
separately maintained description. Register shared schemas with stable `$id`
values and reference them where the server already follows that pattern.

## Document each route

Keep useful JSDoc on each named handler and encode the public contract in the
route's `schema`:

- `operationId`, `summary`, `description`, `tags`, `deprecated`, and security;
- `params`, `querystring`, `headers`, and `body` JSON schemas with field
  descriptions, constraints, requiredness, formats, units, and safe examples;
- a `response` schema and condition-specific description for every status the
  handler or error boundary deliberately returns; and
- response headers, content types, and reusable `$ref` schemas where supported
  by the selected specification version.

Do not hide an undocumented public route merely to make the generated schema
pass review. Use `hide` only for routes that are intentionally outside the
published contract.

## Generate and verify

Wait for `fastify.ready()` before calling `fastify.swagger()`. Inspect that object
or use the project's Fastify CLI generation command to write the artifact. The
Swagger UI plugin exposes JSON, YAML, and UI routes under its configured prefix;
its default prefix is `/documentation`. Exercise those routes and compare the
generated operation with runtime validation, reply statuses, authentication
hooks, and error handling.
