# session-reviews

A Claude Code plugin for reviewing your sessions: rebuild context across chats, catch up within one, resume a prior session, and turn what the transcripts show into skill edits. The skills come from [pstack](https://github.com/cursor/plugins/tree/main/pstack), extracted with the parts they need so they run without the rest of pstack.

This plugin first shipped from `rc1999/vibe-apps-platform`, as `recall` and then `session-reviews`. It lives here now.

## Skills

| Skill | Use it for |
| --- | --- |
| `/session-reviews:recall` | "Catch me up", "where did I leave off", "recall my work on X". Mines this workspace's transcripts, sweeps the issue tracker and other shared sources, checks the result against `git` and the forge, and replies with a capsule, tagged threads, problems, and one next move. |
| `/session-reviews:ketchup` | Catching up inside the current chat: what changed since your last message, and every call waiting on you. Read-only. |
| `/session-reviews:session-pickup` | Resuming one specific prior session or branch. |
| `/session-reviews:automate-me` | Turning your working habits into a personal `<handle>-mode` skill. Mines transcripts, asks you what it missed, and drafts the skill for your approval. |
| `/session-reviews:reflect` | Mining the current chat for lessons that will last, each proposed as an edit to a skill the session used. Edits nothing before you approve. |
| `/session-reviews:unslop` | Cutting AI tells from prose. `recall` writes its brief through it. |

Each skill sets `disable-model-invocation: true`, so it runs only when you type it.

## Install

As a Claude Code plugin, from the `rafal` marketplace:

```bash
claude plugin marketplace add rc1999/claude-plugins
claude plugin install session-reviews@rafal
```

Each skill is then `/session-reviews:<name>`.

As plain skills, with the `skills` CLI:

```bash
npx skills add rc1999/claude-plugins --list                     # see what the repository holds
npx skills add rc1999/claude-plugins -s recall ketchup session-pickup automate-me reflect unslop -a claude-code
```

Install all six together. They read each other by relative path, and `session-pickup`, `automate-me` and `reflect` read `recall`'s `references/claude-code.md`. Each skill is then `/<name>`.

## What it reads

`recall` reads `~/.claude/projects/<slug>/*.jsonl` for the active workspace only. A machine with no earlier transcripts, such as a fresh cloud container, gives it nothing to mine, and it then reports from live state and the shared record alone.

## Provenance

Source: `cursor/plugins`, folder `harness/pstack/claude-code`, commit `aaeb0ea3a0584995aa8f55ce44c6c5259414b896`, pstack version 0.15.46. MIT, copyright Lauren Tan. See [LICENSE](LICENSE).

| File here | Upstream | Changes |
| --- | --- | --- |
| `skills/unslop/SKILL.md` | `skills/unslop/SKILL.md` | None. |
| `skills/recall/SKILL.md` | `skills/recall/SKILL.md` | Points at `references/claude-code.md` in place of the Cursor adapter and the `poteto-mode` Subagents section. Drops the Cursor transcript path. Cites session ids. |
| `skills/session-pickup/SKILL.md` | `skills/poteto-mode/playbooks/session-pickup.md` | Promoted from a playbook to a skill. The two principle skills it cited are stated inline. Step 4 no longer routes to other playbooks. |
| `skills/automate-me/` | `skills/automate-me/SKILL.md` | Transcript paths, `AskUserQuestion` with its four-option limit, and `.claude/skills` paths replace the Cursor ones. A new mode skill defaults to `~/.claude/skills`. Authoring follows a `writing-for-agents` skill when the session has one, else the bundled `references/authoring.md`, in place of Cursor's `create-skill`. `references/mode-skeleton.md` replaces `poteto-mode` as the shape to follow. Landing no longer opens a PR unprompted. Both reference files are new. |
| `skills/ketchup/SKILL.md` | `skills/ketchup/SKILL.md` | The plain-words voice is stated inline in place of the pointer to `bro`. Mermaid is the only drawn visual, since Claude Code has no `/visualize`. Screenshots are sent as files or given as paths, not embedded. |
| `skills/reflect/SKILL.md` | `skills/reflect/SKILL.md` | `.claude/skills` paths replace the Cursor ones. Reads the session's `.jsonl` when the chat was summarized. Skills from an installed plugin are copied out before editing. |
| `skills/recall/references/claude-code.md` | `docs/harness/claude-code.md` and the Subagents section of `skills/poteto-mode/SKILL.md` | Rewritten. Keeps only the transcript layout and the two subagent kinds these skills spawn. |

Left out: `ketchup-video` and `bro`; the rest of `poteto-mode`; `setup-pstack` and its per-role model rule.
