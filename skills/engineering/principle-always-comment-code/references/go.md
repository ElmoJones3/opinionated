# Go comments

Use Go doc comments for packages and declarations. Use complete sentences and
start a declaration comment with the declared name when Go's documentation tools
expect it.

## Document every package and file

Every package has a `doc.go`. Its package comment explains why the package exists,
its responsibility, its important assumptions, and the constraints callers must
respect. Treat `doc.go` as part of every package change. Review it and update any
affected claims in the same change.

Each other `.go` file starts with a standalone comment explaining why that file
exists inside the package and which assumptions or boundaries belong specifically
to it. Keep that comment separate from the `package` clause so Go does not merge
several file comments into one package comment. Build constraints and required
legal headers remain in their required positions.

## Document every declaration and member

Add a doc comment to every exported or unexported constant, variable, type, alias,
function, method, struct, and interface. Document named local declarations when
the function introduces them. The enclosing function comment may document
parameters and results when that keeps the contract clearer than line comments.

Every struct field and interface method gets its own comment. Record why it is
present and any zero-value meaning, units, valid range, ownership, mutation,
lifecycle, nil behavior, or concurrency contract. State whether a type is safe
for concurrent use and whether its zero value is useful when either fact matters.

Use Go's `TODO(name): explanation` or `BUG(name): explanation` note form when a
real name is available. The explanation still states what remains, why, and the
condition for resolving it.

## Verify with the standard tools

Run `gofmt` or `go fmt` and the repository's normal `go vet` and test commands.
Use `go doc` to inspect rendered package and declaration comments when formatting
or links matter. Go's standard tools do not enforce comments on every unexported
or local declaration, so finish with the changed-file audit from the main skill.

Reference: [Go doc comments](https://go.dev/doc/comment).
