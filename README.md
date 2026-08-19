# opinionated

I bought a new Mac, set it up mostly from memory, then realized memory was the worst place to keep the recipe. This repository is the recipe.

It has two jobs. `cfg/` rebuilds the terminal and development environment I use every day. `skills/` changes how my coding agents behave. If a tool is here, it should earn its place. If an agent phrase annoys me twice, it becomes a rule.

This is not a universal dotfiles framework. It is my setup, written down well enough to share, audit, and change without losing the plot.

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

It currently supports macOS. It installs software, so read it before running it. Existing `.zshrc` and mise configuration files get timestamped backups before the tracked files are linked.

The Git defaults are mine. Anyone else should pass their own values:

```bash
GIT_USER_NAME="Your Name" GIT_USER_EMAIL="you@example.com" ./cfg/setup.sh
```

Raycast and Cursor stay manual. Both are downloads with account setup, and pretending that a shell script completes those jobs would be fiction. The script also leaves the first Grok Build and Codex sign-ins to the person at the keyboard.

## Why these choices

### Homebrew

Homebrew owns machine-level packages and applications. [`cfg/Brewfile`](cfg/Brewfile) is both an install list and a checklist. Every entry has a comment explaining why it is there. A future cleanup should be able to answer a simple question: do I still use this?

### mise

mise owns language runtimes. Its official installer is deliberate. The Homebrew formula is convenient, but [mise documents the release binary from `mise.run` as its preferred installation path](https://mise.jdx.dev/installing-mise.html).

Go and Node track their current releases because that works for my general development. Python does not. [`cfg/mise.toml`](cfg/mise.toml) pins Python 3.12 because it is the newest practical line for the PyTorch stack I use with NVIDIA V100s. In LLM and BERT work, the newest Python release is often just the first one that a dependency does not support yet.

### sops and age

These belong together. sops encrypts structured configuration while leaving the file reviewable in Git. age supplies the recipients. The public recipient can live beside encrypted files. The private identity stays on the machine.

This repository does not contain secrets. The tools are part of my baseline because other repositories do, including [`cluster-alpha`](https://github.com/ElmoJones3/cluster-alpha), where encrypted configuration belongs in Git and decryption keys absolutely do not.

### zsh and Oh My Zsh

[`cfg/zshrc`](cfg/zshrc) is the shell muscle memory I carried from the previous laptop. It keeps the aliases I actually use, activates mise and zoxide, and adds Grok completion. It is intentionally boring. A shell configuration should save keystrokes, not become a second operating system.

### SSH signing

[`cfg/git.sh`](cfg/git.sh) configures Git identity and signs commits with the same Ed25519 key used for GitHub authentication. If the key is missing, the script can create it. It stops short of touching GitHub and prints the remaining account steps instead.

## Agent skills

This is where the repository will grow.

The skills use the open [Agent Skills](https://agentskills.io/) format. The same source directories work with [Codex and ChatGPT](https://learn.chatgpt.com/docs/build-skills) and [Claude Code](https://code.claude.com/docs/en/plugins). Product-specific manifests provide packaging without splitting the actual instructions into separate copies.

### bruh

[`bruh`](skills/bruh/SKILL.md) restates the last response in plain language. It began as Lauren Tan's wonderfully direct `bro` skill. I renamed it to match the man invoking it. It runs only when called.

### unslop

[`unslop`](skills/unslop/SKILL.md) removes AI tells and puts a human voice back into the answer. Lauren's original is excellent, so this copy keeps most of her rule set and gives her credit.

The remix already has opinions. A fake architectural "fork" becomes a short list of options and a direct request for the decision. "Load-bearing" is gone in favor of naming the real dependency. More irritations will earn rules as they reveal themselves.

## Install the skills

There are two ways in. Use the Skills CLI when you want ordinary files in a project. Clone the repository when you want to edit the skills here and have those edits go live on your machine. Installing the same skill both ways can leave your agent with duplicate names.

### Codex, Claude Code, and other agents

Run this inside the project that should receive the skills:

```bash
npx skills@latest add ElmoJones3/opinionated
```

The installer finds `bruh` and `unslop`, then asks which skills and coding agents you want. It copies the selected files into the project and records their source in `skills-lock.json`. Pull later changes when you choose:

```bash
npx skills update
```

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

The repository also includes `.codex-plugin/plugin.json` and `.claude-plugin/plugin.json` for packaged distribution. Autocomplete handles the plugin namespace.

## Repository map

| Path | What is there |
| --- | --- |
| `cfg/Brewfile` | Machine packages and the reason each one is installed. |
| `cfg/mise.toml` | Go, Node, and the intentional Python 3.12 pin. |
| `cfg/zshrc` | Shared shell configuration and aliases. |
| `cfg/git.sh` | Git identity, SSH key setup, and commit signing. |
| `cfg/setup.sh` | The macOS rebuild sequence. |
| `skills/` | Canonical, agent-neutral skill instructions. |
| `skills/*/agents/openai.yaml` | Codex and ChatGPT presentation metadata. |
| `.codex-plugin/` | Codex and ChatGPT plugin metadata. |
| `.claude-plugin/` | Claude Code plugin metadata. |
| `install.sh` | Personal skill installation through live symlinks. |

## Add a skill

Each skill lives at `skills/<name>/SKILL.md`. Keep the main instructions agent-neutral. Put host metadata under `agents/`, preserve upstream licenses, and say where remixed work came from.

After adding one:

```bash
./install.sh
```

## Acknowledgements

[`bruh`](skills/bruh/SKILL.md) and [`unslop`](skills/unslop/SKILL.md) started with work by [Lauren Tan](https://github.com/poteto) in Cursor's [pstack plugin](https://github.com/cursor/plugins/tree/main/pstack). Her original MIT notice is preserved in each adapted skill directory. These are remixes, not an attempt to claim the excellent first draft.

## License

Original work in this repository is licensed under the [MIT License](LICENSE). Adapted skills retain their upstream copyright and license notices.
