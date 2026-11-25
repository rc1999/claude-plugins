---
name: automate-me
description: "Use for \"automate me\", \"create/update/refresh my -mode skill\", \"turn/capture my preferences or working style into a skill\", or wanting agents to follow how the user works. Drafts or revises a personal -mode skill, optionally pulling fresh evidence from recent transcripts."
disable-model-invocation: true
---

# Automate me

Read [transcripts and subagents in Claude Code](../recall/references/claude-code.md) once per session before you follow this skill. It says where transcripts live and how to spawn each kind of subagent.

A guided flow for turning the user's working conventions into a skill agents will follow. The output is one `-mode` skill tailored to them (e.g. `jay-mode`, `priya-mode`).

This skill sequences three things: an inline mining pass (step 1), the authoring rules (step 4), and the **unslop** skill (prose discipline).

## Flow

### 0. Check for an existing skill

Look for `~/.claude/skills/*-mode/SKILL.md` and `.claude/skills/*-mode/SKILL.md` matching the user's handle. If one exists, confirm intent with `AskUserQuestion` (unless they already said "update my skill" or similar):

- Update the existing skill (default for repeat runs)
- Start fresh (rare, ask why before doing it)

Update mode changes the rest of the flow:
- Step 1 mines only history since the skill was last edited: `git log -1 --format=%cI <path>` for a file in a repository, the file's modification time otherwise.
- Step 2 asks what's changed or missing, not what to capture from zero.
- Step 4 edits the existing file in place. Preserve sections the user hasn't contradicted. Revise ones with new evidence. Add new sections only for genuinely new rules.

### 1. Mine their history

Mine the active workspace's transcript folder only.

Survey recent agent conversations within that scope for recurring patterns. Run parallel transcript-mining subagents across slices of history (e.g. last 2-4 weeks, split into 3 slices so each has enough material). Each subagent reads transcripts from the folder you give it, looks for the signals below, and returns a short structured list of patterns it saw, each with the session id as evidence. Default signals worth hunting:

- Response preferences (length, tone, format, "dumb it down" corrections)
- Delegation habits (subagents, models, specialized workflows, parallelism)
- Verification posture (what "done" means, unit tests vs live repro, reviewers)
- Code and prose discipline (style, principles cited, lint/format tools)
- Process conventions (worktrees, commits, PRs, review/merge tooling)
- Meta preferences (fixing skills mid-task, proposing new ones)

Cross-check across slices before elevating a signal. Patterns seen in 2+ slices are high-confidence. Lone signals are weak and usually get dropped.

A workspace with too few transcripts to fill three slices gets one direct pass and no fan-out. With none, say so and build the skill from step 2 alone.

### 2. Ask the user directly

Mining misses intent that hasn't come up yet. Use `AskUserQuestion` (structured multi-choice) rather than asking the user to type from scratch.

Shape: `AskUserQuestion` takes at most 4 options per question, so split the areas across two questions with `multiSelect: true`. Start broad ("Which areas matter most?"), then follow up on the selected areas with specific options. After the structured rounds, one free-form chat question catches anything the options missed.

Keep it to two rounds of structured questions.

### 3. Cluster findings

Group the combined signals into sections. [The mode skeleton](references/mode-skeleton.md) lists the common sections and the granularity of a rule. Use only the sections that apply. The skeleton's example rules show shape. The user's rules come from steps 1 and 2.

### 4. Draft the skill

Author the skill by the **writing-for-agents** skill when the session lists one. Otherwise follow [the bundled authoring rules](references/authoring.md). Placement:

- Path: an existing mode skill stays where it is. A new one defaults to `~/.claude/skills/<handle>-mode/SKILL.md`, which follows the user across projects. Use `.claude/skills/<handle>-mode/SKILL.md` when the user wants the mode shared with the repository.
- Handle: the user's first name or chosen identifier.
- Frontmatter `description`: trigger on their name + `/<handle>-mode` + "work in their style", not on generic keywords like "write code" or "review PR". Keep it one quoted YAML scalar.
- Frontmatter `disable-model-invocation: true` by default. Opt out only if the user explicitly wants their mode to apply on every turn.

### 5. Iterate on prose

Apply the **unslop** skill and the authoring rules from step 4 to every line.

Show the draft to the user and take feedback. Expect multiple iterations. Cut ruthlessly. A mode skill is not a manual.

### 6. Land it

Write the file only after the user has read the draft and approved it.

- A personal skill under `~/.claude/skills/` is done once written. Tell the user it loads in their next session.
- A project skill is committed on a branch off the default branch. Open a PR when the user asks for one.

## Guardrails

- **Don't overfit to one conversation.** A preference stated once and contradicted another time is noise. Require multiple instances before codifying it.
- **Don't be clever.** Restating other skills' contents, inventing metaphors, or writing "poetic" prose for an agent reader is cost without benefit. Keep it operational.
- **Reference, don't inline.** Other skills the user relies on should appear as path references, not pasted excerpts. Same for any principle docs they maintain elsewhere.
- **Keep sections minimal.** Only add a section if the user has a specific, non-default rule there. "Communicate clearly" is not a section. "Short paragraphs. Tables when comparing options. Bullets only when items are genuinely parallel." is.
- **Name conventions generic.** Use "the user" or "the human" in imperatives, not the author's first name.
- **Don't force symmetry.** If a user has no process rules worth writing down, skip the Process section entirely.
- **Keep private context out.** A mode skill quotes habits, not transcript content. Leave out names, customers, secrets, and anything from another project.

## Evaluation

A `-mode` skill is subjective output. A test/iterate benchmark loop isn't useful here. Vibe-check with the user: does it read like them? Did it miss anything? Then ship.

Tune the description only if the skill's trigger accuracy turns out to be a problem in practice.

## When not to use

- User wants a task-specific skill (not working conventions): author it directly, no mining required.
- User wants to capture one narrow workflow (e.g. "how I write commit messages"). That's a regular skill, not a mode skill.
