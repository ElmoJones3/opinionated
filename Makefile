# The active mise Python runs dependency-free sync and version commands.
PYTHON ?= python3
# The private environment owns validator, formatter, and linter dependencies.
VENV := .venv
# This interpreter proves validation uses the dependencies recorded by the repository.
VENV_PYTHON := $(VENV)/bin/python
# The stamp refreshes dependencies whenever their declaration or tool policy changes.
DEV_STAMP := $(VENV)/.requirements-dev.stamp
# Python quality checks include repository commands, tests, and executable skill helpers.
PYTHON_SOURCES := scripts tests skills/systems/distributed-systems-audit/scripts

# These are command entry points, not files produced by Make.
.PHONY: help sync-zsh sync-brew version dev format lint test quick-validate validate

# help prints the supported workflows without requiring callers to read recipes.
help:
	@printf '%s\n' \
	  'make sync-zsh                 Capture ~/.zshrc into cfg/zshrc.' \
	  'make sync-brew                Capture installed Homebrew state into cfg/Brewfile.' \
	  'make version VERSION=0.2.0    Update every versioned plugin manifest.' \
	  'make format                   Apply Ruff fixes and Black formatting.' \
	  'make test                     Run repository maintenance tests.' \
	  'make quick-validate           Validate skills, manifests, cfg, and catalogs.' \
	  'make validate                 Run formatting checks, tests, and quick validation.'

# sync-zsh is deliberately one-way from the primary workstation into Git.
sync-zsh:
	$(PYTHON) -m scripts.sync_zsh

# sync-brew snapshots the primary workstation while retaining authored comments.
sync-brew:
	$(PYTHON) -m scripts.sync_brew

# version refuses an omitted VERSION before either plugin manifest changes.
version:
	@if [ -z "$(VERSION)" ]; then printf '%s\n' 'VERSION is required, for example: make version VERSION=0.2.0' >&2; exit 2; fi
	$(PYTHON) -m scripts.version "$(VERSION)"

# dev records the environment needed to run every Python quality check.
dev: $(DEV_STAMP)

# The dependency stamp changes only after pip completes the declared environment.
$(DEV_STAMP): requirements-dev.txt pyproject.toml
	$(PYTHON) -m venv $(VENV)
	$(VENV_PYTHON) -m pip install -r requirements-dev.txt
	@touch $(DEV_STAMP)

# format applies import fixes before Black settles final Python layout.
format: dev
	$(VENV)/bin/ruff check --fix $(PYTHON_SOURCES)
	$(VENV)/bin/black $(PYTHON_SOURCES)

# lint proves Ruff and Black accept the committed Python without rewriting it.
lint: dev
	$(VENV)/bin/ruff check $(PYTHON_SOURCES)
	$(VENV)/bin/black --check $(PYTHON_SOURCES)

# test executes every maintenance test with verbose collection evidence.
test: dev
	$(VENV_PYTHON) -m unittest discover -v

# quick-validate delegates each skill to skill-creator and checks repository parity.
quick-validate: dev
	$(VENV_PYTHON) -m scripts.quick_validate

# validate is the complete local gate used before committing a repository batch.
validate: lint test quick-validate
