# Express

Express does not generate OpenAPI itself. When the repository has no established
integration, use [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) to parse
OpenAPI annotations collocated with routes and
[swagger-ui-express](https://github.com/scottie1984/swagger-ui-express) to serve
the result. If the project already uses another code-first generator, preserve
it and follow its syntax.

## Configure the generator

Install both packages with the project's package manager. Configure
`swagger-jsdoc` with an OpenAPI `definition` and `apis` globs that include every
route file. Set `failOnErrors: true` so malformed annotations fail validation.
Pass the resulting specification to `swagger-ui-express` and mount it at the
project's documentation route.

Keep the generation or export command in package scripts or test automation. A
glob that silently excludes a new route is a broken configuration.

## Document each route

Place an `@openapi` JSDoc block immediately beside the Express route it describes.
Keep the handler's declaration JSDoc useful under `principle-always-comment-code`;
the OpenAPI block must additionally define:

- the exact path and method, stable operation identifier, summary, description,
  tags, and deprecation state;
- path, query, header, and cookie parameters with accurate schemas and
  constraints;
- request body content by media type;
- every response status, description, media type, schema, and observable header;
  and
- operation security that matches the actual middleware chain.

Document reusable schemas and security schemes under the top-level components
owned by the generator configuration or annotated source. Do not let middleware
validation, authorization, or error handling create undocumented boundary
behavior.

## Generate and verify

Run the project script that evaluates `swagger-jsdoc` with validation enabled and
exports or serves the resulting object. Assert that the changed path and method
exist in the object, then load the Swagger UI mount. Compare all `res.status`,
redirect, error middleware, and response-body paths with the declared responses.
