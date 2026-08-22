# Python comments

Use docstrings for modules, classes, functions, methods, and properties. Use
adjacent comments for named values or fields that Python's docstring machinery
cannot attach to directly.

## Cover the whole module

Every Python file starts with a module docstring after any required shebang or
encoding declaration. It explains why the module exists and its assumptions or
boundaries.

Add a docstring to every public or private class, constructor, function, method,
property, and named callback. Document every module value, class attribute,
dataclass field, enum value, and named local declaration with an adjacent comment
or in the nearest owning docstring. Each field explanation records its purpose
and any units, valid range, default, ownership, mutability, lifecycle, or special
requirements.

Function and method docstrings document parameter assumptions, return semantics,
raised failures, mutation, and side effects when the signature does not make them
complete. Keep one-line docstrings to one line. Use the repository's established
Google, NumPy, or PEP 257 convention; use PEP 257 when the project has none.

## Install formatting and enforcement

Use the project's existing Python package manager to add Black and Ruff as
development dependencies when either is absent. Preserve existing tool settings.
Configure Black as the formatter. Enable Ruff's `D` rules and the project's
existing docstring convention, or `pep257` when no convention exists.

If the repository has no package metadata or tool configuration, create the
smallest conventional project configuration that records both development tools
and their settings. Install them into the project environment. A request for one
module does not waive this setup.

Run Black, Ruff, and the project's normal type and test checks. Ruff's missing
docstring rules focus on public modules and declarations and do not prove field,
private declaration, local declaration, or comment quality coverage. Finish with
the manual changed-file audit.

References: [Black](https://black.readthedocs.io/en/stable/) and
[Ruff's pydocstyle rules](https://docs.astral.sh/ruff/rules/#pydocstyle-d).
