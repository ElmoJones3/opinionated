# JavaScript and TypeScript comments

Use JSDoc blocks for files, declarations, and members. TypeScript already owns
static type information, so its JSDoc should preserve purpose, assumptions,
limitations, lifecycle, and gotchas instead of copying the signature.

## Cover the whole file

Start every source file with a JSDoc file overview that explains why the module
exists and which assumptions or boundaries it owns. Add a JSDoc block to every
public or private constant, variable, type alias, enum and enum value, class,
interface, constructor, function, method, accessor, property, and named callback.

Document every object, class, type, and interface property individually. Record
meaning, units, defaults, valid states, ownership, mutation, optionality,
lifecycle, or ordering requirements where applicable. Document parameters,
returns, thrown failures, deprecations, and side effects when they carry contract
information the signature cannot express.

Use ordinary comments inside an implementation only to preserve a choice,
invariant, or gotcha. Do not narrate each expression or branch.

## Install JSDoc enforcement

Use the repository's existing package manager. Install ESLint and the parser
required by the project when they are absent, then install `eslint-plugin-jsdoc`.
Preserve the existing flat or legacy ESLint configuration.

If the repository has no JavaScript package manifest or ESLint configuration,
create the minimal conventional files needed to record these development
dependencies and run the checks. A request for one source file does not waive
the tooling required by this mandatory rule.

Configure documentation failures as errors. Require a file overview and JSDoc on
every declaration and member context the active JavaScript or TypeScript parser
exposes. Do not limit checks to exports or exempt private, short, empty, or
constructor declarations. Enable rules that reject empty blocks and missing
descriptions. Keep type-tag requirements compatible with the language: JavaScript
may need JSDoc types, while TypeScript should not duplicate its annotations.

Run the configured ESLint command after the change. Then perform the manual audit,
because a syntactically valid JSDoc block can still say nothing useful.

References: [TypeScript JSDoc support](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
and [`eslint-plugin-jsdoc`](https://github.com/gajus/eslint-plugin-jsdoc).
