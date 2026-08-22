# FastAPI

FastAPI generates OpenAPI from path-operation decorators, Python type
annotations, Pydantic models, dependency and security declarations, and response
metadata. It also uses a path-operation function's docstring as the operation
description. Bare prose cannot replace the structured declarations.

Use FastAPI's official guidance for
[path-operation configuration](https://fastapi.tiangolo.com/tutorial/path-operation-configuration/),
[advanced operation configuration](https://fastapi.tiangolo.com/advanced/path-operation-advanced-configuration/),
and [metadata and documentation URLs](https://fastapi.tiangolo.com/tutorial/metadata/).

## Document each path operation

Write a useful function docstring for the public description. FastAPI supports
Markdown and can stop the OpenAPI-visible part at a form-feed character when
internal documentation must follow. Keep public consumer guidance before that
boundary.

Use decorators and types to declare the machine contract:

- choose an explicit, unique `operation_id` when stability matters to generated
  clients;
- set `summary`, tags, status code, response description, and `deprecated` where
  needed;
- type path, query, header, cookie, and body inputs with constraints and useful
  field descriptions;
- declare `response_model` or an accurate return type for the primary response;
- use `responses` for additional statuses, media types, models, examples, and
  response headers; and
- express authentication and scopes through FastAPI's security dependencies so
  OpenAPI reflects the actual boundary.

Do not rely on FastAPI's generated function-name summary or generic "Successful
Response" text when it fails to explain the consumer contract. Do not bypass
typed request or response declarations and then assume the generated schema
still describes runtime behavior.

## Verify the generated product

FastAPI serves the schema at `/openapi.json`, Swagger UI at `/docs`, and ReDoc at
`/redoc` by default; all are configurable or may be disabled. Exercise the
project's configured paths. Parse `app.openapi()` or the schema response in a
test and inspect the changed operation's request, responses, security, and
description. Then load each enabled documentation UI and confirm it consumes the
same schema.
