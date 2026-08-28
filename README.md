# opinionated

I have opinions. This is my setup; I hope it helps you somehow.

- Stan

## The machine recipe

The first setup happened by hand:

1. Install Homebrew from the stock macOS Terminal.
2. Install Ghostty and switch into it.
3. Install Oh My Zsh.
4. Bring over the working `.zshrc`, then clean it up for version control.
5. Install the command line tools in the Brewfile.
6. Install Grok Build.
7. Install mise from `mise.run`, not Homebrew.
8. Use mise for current Go and Node, plus Python 3.12.
9. Configure Git identity and SSH commit signing.

[`cfg/setup.sh`](cfg/setup.sh) turns that sequence into one command:

```bash
./cfg/setup.sh
```

It currently supports macOS. It installs software, so read it before running it. Existing `.zshrc` and mise configuration files get timestamped backups. The bootstrap copies `.zshrc` into an editable machine-owned file and links the tracked mise policy.

The Git defaults are mine. Anyone else should pass their own values:

```bash
GIT_USER_NAME="Your Name" GIT_USER_EMAIL="you@example.com" ./cfg/setup.sh
```

Raycast and Cursor stay manual. Both are downloads with account setup, and pretending that a shell script completes those jobs would be fiction. The script also leaves the first Grok Build and Codex sign-ins to the person at the keyboard.

## Why

### Homebrew

Homebrew Bundle owns machine-level packages, applications, editor extensions, and global Go tools. [`cfg/Brewfile`](cfg/Brewfile) is both an install list and a checklist. Every entry has a comment explaining why it is there. A future cleanup should be able to answer a simple question: do I still use this?

### mise

mise owns language runtimes. Its official installer is deliberate. The Homebrew formula is convenient, but [mise documents the release binary from `mise.run` as its preferred installation path](https://mise.jdx.dev/installing-mise.html).

Go and Node track their current releases because that works for my general development. Python does not. [`cfg/mise.toml`](cfg/mise.toml) pins Python 3.12 because it is the newest practical line for the PyTorch stack I use with NVIDIA V100s. In LLM and BERT work, the newest Python release is often just the first one that a dependency does not support yet.

### sops and age

These belong together. sops encrypts structured configuration while leaving the file reviewable in Git. age supplies the recipients. The public recipient can live beside encrypted files. The private identity stays on the machine.

This repository does not contain secrets. The tools are part of my baseline because other repositories do, including [`cluster-alpha`](https://github.com/ElmoJones3/cluster-alpha), where encrypted configuration belongs in Git and decryption keys absolutely do not.

### zsh and Oh My Zsh

[`cfg/zshrc`](cfg/zshrc) is the shell muscle memory I carried from the previous laptop. It keeps the aliases I actually use, activates mise and zoxide, and adds Grok completion. It is intentionally boring. A shell configuration should save keystrokes, not become a second operating system.

### Keep the primary workstation recorded

The primary workstation owns its live shell and installed Homebrew state. The repository keeps reviewable snapshots. Capture is explicit and one-way:

```bash
make sync-zsh
make sync-brew
```

`sync-zsh` validates the live file before replacing `cfg/zshrc`. It rejects pnpm-owned path blocks because mise owns Node tooling here, and it rejects literal home paths that would make the public snapshot specific to one account.

`sync-brew` asks Homebrew for the installed-state snapshot, validates the generated Brewfile, and preserves the existing rationale for declarations that did not change. It does not install or remove software.

Run the complete repository gate before committing:

```bash
make validate
```

The gate checks Python formatting and lint, executes the tests, passes every skill through skill-creator's canonical validator, and checks plugin manifests, versions, catalog counts, agent metadata, shell syntax, the Brewfile, and Git whitespace.

### SSH signing

[`cfg/git.sh`](cfg/git.sh) configures Git identity and signs commits with the same Ed25519 key used for GitHub authentication. If the key is missing, the script can create it. It stops short of touching GitHub and prints the remaining account steps instead.

## Agent skills

The repository currently has 50 skills in seven categories. Each skill owns one rule or one coordinated review. That split matters. An agent should load the rule it needs, not a handbook full of unrelated preferences.

The skills follow the open [Agent Skills](https://agentskills.io/) format. The same `SKILL.md` directories work with [Codex and ChatGPT](https://learn.chatgpt.com/docs/build-skills) and [Claude Code](https://code.claude.com/docs/en/plugins). Product-specific manifests package those shared instructions without maintaining a second copy.

| Category | Skills | What they govern |
| --- | ---: | --- |
| [Communication](skills/communication/README.md) | 3 | Plain language, human voice, and respect for user authority. |
| [Engineering](skills/engineering/README.md) | 6 | Code comments, generated API contracts, domain behavior, pure transformations, project terminology, and decision records. |
| [Productivity](skills/productivity/README.md) | 1 | Shared understanding, question dependencies, decisions, and provenance across long conversations. |
| [Security](skills/security/README.md) | 4 | SOPS naming, safe synchronization, repository setup, and audits. |
| [Systems](skills/systems/README.md) | 15 | Distributed work, uncertainty, retries, authority, effects, capacity, recovery, containment, and audits. |
| [Testing](skills/testing/README.md) | 12 | TDD, characterization, honest fixtures, faithful boundaries, execution, and behavior-specific proof. |
| [UI](skills/ui/README.md) | 9 | React component boundaries, layout, styling, variants, prop contracts, compound APIs, shadcn normalization, and state. |

Some rules are mandatory whenever their subject appears. Explicit review skills run only when asked. The frontmatter says which is which; the prose does not get to quietly weaken it.

## Install the skills

There are two ways in. Use the Skills CLI for a managed project install. Clone the repository when you want edits here to go live on your machine. Installing the same skill both ways can leave your agent with duplicate names.

### Codex, Claude Code, and other agents

Run this inside the project that should receive the skills:

```bash
npx skills@latest add ElmoJones3/opinionated
```

The installer finds every skill in the repository, then asks which skills and coding agents you want. It installs the selection and records its source in `skills-lock.json`. Refresh installed skills when you choose:

```bash
npx skills update
```

`update` refreshes skills already recorded in the lock file. Rerun `add` when this repository gains a new skill that you also want installed.

### Work on the skills themselves

Clone the repository somewhere permanent, then link the skills into your personal agent directory:

```bash
git clone https://github.com/ElmoJones3/opinionated.git
cd opinionated
./install.sh
```

Codex reads the links from `~/.agents/skills`. Add Claude Code with:

```bash
./install.sh --claude
```

The installer refuses to overwrite a skill it does not manage. Because the installed skills are symlinks, edits in this checkout are live. Rerun the installer after adding another skill so the new directory gets linked too.

The repository also includes `.codex-plugin/plugin.json` for the plugin directory shared by ChatGPT and Codex, plus `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` for Claude Code.

Claude Code can install the whole collection as a namespaced plugin:

```text
/plugin marketplace add ElmoJones3/opinionated
/plugin install opinionated@opinionated
```

Plugin skills use the `opinionated:` namespace. For example, invoke `unslop` as `/opinionated:unslop`.

## Repository map

| Path | What is there |
| --- | --- |
| `cfg/Brewfile` | Machine packages, applications, extensions, global tools, and their reasons. |
| `cfg/mise.toml` | Go, Node, and the intentional Python 3.12 pin. |
| `cfg/zshrc` | Shared shell configuration and aliases. |
| `cfg/git.sh` | Git identity, SSH key setup, and commit signing. |
| `cfg/setup.sh` | The macOS rebuild sequence. |
| `docs/` | Generally useful engineering references and direct source material for skills. |
| `skills/communication/` | Rules for language, voice, and agent authority. |
| `skills/engineering/` | Rules for code comments, generated API contracts, domain code, value transformations, terminology, and ADRs. |
| `skills/productivity/` | Workflows for durable shared understanding and conversational provenance. |
| `skills/security/` | SOPS setup, synchronization, naming, and audit rules. |
| `skills/systems/` | Distributed-systems routing, durable work, failure-boundary, effect, recovery, and containment rules. |
| `skills/testing/` | Testing process, proof strategies, fixtures, boundaries, determinism, execution, and support. |
| `skills/ui/` | React component authoring rules and the explicit review pass. |
| `skills/**/agents/openai.yaml` | Codex and ChatGPT presentation metadata. |
| `.codex-plugin/` | Shared ChatGPT and Codex plugin metadata. |
| `.claude-plugin/` | Claude Code plugin and marketplace metadata. |
| `Makefile` | One-way workstation capture, validation, formatting, tests, and version updates. |
| `scripts/` | Tested capture, version, and repository-validation commands. |
| `tests/` | Isolated proofs for the repository maintenance commands. |
| `install.sh` | Personal skill installation through live symlinks. |

## Add a skill

Each skill lives in one of the seven category directories and contains `SKILL.md`. Keep the main instructions agent-neutral. Put OpenAI presentation metadata under `agents/`, preserve upstream licenses, and say where remixed work came from. Update the category README when the skill changes what that category claims to cover.

Add the skill directory to the `skills` array in [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json). Claude needs explicit paths because this repository groups some skills into category directories.

After adding one:

```bash
./install.sh
```

## Acknowledgements

[`bruh`](skills/communication/bruh/SKILL.md) and [`unslop`](skills/communication/unslop/SKILL.md) started with work by [Lauren Tan](https://github.com/poteto) in Cursor's [pstack plugin](https://github.com/cursor/plugins/tree/main/pstack). Her original MIT notice is preserved in each adapted skill directory. These are remixes, not an attempt to claim the excellent first draft.

[`mind-merge`](skills/productivity/mind-merge/SKILL.md) adapts the useful questioning pressure in Matt Pocock's [`grilling`](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling) skill into a graph-backed, recoverable adjudication workflow. His MIT notice is preserved with the skill.

## License

Original work in this repository is licensed under the [MIT License](LICENSE). Adapted skills retain their upstream copyright and license notices.
