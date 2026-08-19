# opinionated

My machine setup and a growing collection of agent skills. The defaults are choices. These are mine.

The skills follow the open [Agent Skills](https://agentskills.io/) format and include packaging for [Codex and ChatGPT](https://learn.chatgpt.com/docs/build-skills) and [Claude Code](https://code.claude.com/docs/en/plugins).

## Contents

- [Skills](#skills)
- [Install](#install)
- [Machine setup](#machine-setup)
- [Repository layout](#repository-layout)
- [Adding a skill](#adding-a-skill)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Skills

| Skill | Purpose | Invocation |
| --- | --- | --- |
| [`bruh`](skills/bruh/SKILL.md) | Restates the last response in plain human language. Adapted from pstack's `bro`. | Codex: `$bruh`. Claude: `/bruh`. |
| [`unslop`](skills/unslop/SKILL.md) | Removes AI tells and restores a human voice. | Applies automatically. It can also be invoked directly. |

More will land here.

## Install

Clone the repository somewhere permanent, then run the installer:

```bash
git clone https://github.com/ElmoJones3/opinionated.git
cd opinionated
./install.sh
```

This links every skill into `~/.agents/skills`, the personal discovery directory used by Codex. To install the same skills for Claude Code too:

```bash
./install.sh --claude
```

The installer uses symlinks, so edits in this checkout are live. It will not overwrite an existing skill. Rerun it after adding another skill.

Creating a personal skills directory for the first time may require restarting the agent. After that, both Codex and Claude Code detect edits to installed skills.

The repository also includes `.codex-plugin/plugin.json` and `.claude-plugin/plugin.json` for packaged distribution.

## Machine setup

The macOS bootstrap installs the tracked Homebrew bundle, Oh My Zsh, Grok Build, and mise. It links the tracked zsh and mise configuration, installs the declared runtimes, and configures Git with SSH signing.

```bash
./cfg/setup.sh
```

Read [`cfg/setup.sh`](cfg/setup.sh) before running it. It installs software and replaces existing tracked configuration only after making timestamped backups.

## Repository layout

| Path | Purpose |
| --- | --- |
| `skills/` | Canonical Agent Skills shared by every supported host. |
| `skills/*/agents/openai.yaml` | Codex and ChatGPT presentation metadata. |
| `.codex-plugin/` | Codex and ChatGPT plugin manifest. |
| `.claude-plugin/` | Claude Code plugin manifest. |
| `cfg/` | Brew, mise, zsh, Git, and machine bootstrap configuration. |
| `install.sh` | Safe, repeatable personal skill installation. |

## Adding a skill

Each skill lives at `skills/<name>/SKILL.md`. Keep agent-neutral instructions in `SKILL.md` and product metadata under `agents/`.

After adding a skill:

```bash
./install.sh
```

## Acknowledgements

[`bruh`](skills/bruh/SKILL.md) and [`unslop`](skills/unslop/SKILL.md) began with excellent work by [Lauren Tan](https://github.com/poteto) in Cursor's [pstack plugin](https://github.com/cursor/plugins/tree/main/pstack). Her original MIT notice is preserved in each adapted skill directory.

## License

Original work in this repository is licensed under the [MIT License](LICENSE). Adapted skills retain their upstream copyright and license notices.
