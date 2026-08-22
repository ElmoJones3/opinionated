# Gin with Swag and gin-swagger

Use the repository's existing Gin documentation integration when present. The
conventional code-first path is [Swag](https://github.com/swaggo/swag), which
parses Go comments into Swagger 2.0 files, plus
[gin-swagger](https://github.com/swaggo/gin-swagger), which serves Swagger UI.

## Configure the generator

Install the generator with the versioning policy used by the project. The
upstream command is:

```text
go install github.com/swaggo/swag/cmd/swag@latest
```

Add `github.com/swaggo/gin-swagger` and `github.com/swaggo/files` to the module,
import the generated docs package, and register the UI handler. `swag init` looks
for general API annotations in `main.go` by default; pass `-g` when the owning
file lives elsewhere. Keep the canonical command in project automation rather
than relying on a developer to remember flags.

## Document each handler

Keep a normal Go doc comment that explains why the handler exists and its public
assumptions. In the same comment block, supply the Swag operation annotations the
real boundary requires, including:

- `@ID`, `@Summary`, `@Description`, and `@Tags`;
- `@Accept` and `@Produce` for request and response media types;
- one `@Param` for every path, query, header, body, and form input;
- `@Success` and `@Failure` for every deliberate status and body shape;
- `@Header` for observable response headers;
- `@Security` for operation-level requirements; and
- `@Router` with the exact registered path and HTTP method.

Use general API annotations for title, version, base path, host, schemes, contact,
and security definitions. Document struct fields and enum values because Swag
uses those declarations to describe schemas.

## Generate and verify

Run the repository's equivalent of:

```text
swag fmt
swag init
```

Swag normally writes `docs/docs.go`, `docs/swagger.json`, and
`docs/swagger.yaml`. Inspect the changed route in the generated artifact and load
the configured UI route; the gin-swagger example uses `/swagger/index.html`.
Confirm all registered routes are discoverable, especially when packages require
the generator's internal- or dependency-parsing flags.
