# Authoring rules

The fallback for sessions with no **writing-for-agents** skill. It covers what a Claude Code skill file needs and how to write one an agent follows the same way each run.

## The file

A skill is a folder holding `SKILL.md`. The folder sits directly in `~/.claude/skills/` or `.claude/skills/`, one level deep. The folder name is the skill name: lowercase letters, digits, and hyphens.

`SKILL.md` opens with YAML frontmatter:

```yaml
---
name: jay-mode
description: "Jay's working style. Use for Jay, /jay-mode, or requests to work in Jay's style."
disable-model-invocation: true
---
```

- `name` matches the folder name.
- `description` is one scalar on one line. Quote it whenever it holds a colon, a quote mark, or a `#`.
- `disable-model-invocation: true` means only the user typing `/<name>` runs the skill, and its description costs no context. Leave the field out and the description loads into every session so the agent can run the skill on its own.

Check the frontmatter parses before you show the draft: the block has both `---` lines and each field is on its own line.

## The description

The description decides when the skill fires. State what the skill is, then one trigger per distinct case. Put the most distinctive word first. Leave out what the body already says.

## The body

- Write each rule as the behavior you want. "Reply in under ten lines" steers better than a list of things to avoid. Keep a prohibition only for a hard limit, and pair it with what to do instead.
- Make each rule specific enough to check. "Run the test suite before saying done" is checkable. "Be careful" is not.
- State each rule once, under the one heading where it belongs.
- Cut any rule the agent follows by default. The test is whether the line changes behavior.
- Keep the file short. Move long reference material into a sibling file and point at it with a line that says when to read it.
- Point at other skills and docs by path. A copied excerpt goes stale.
- Use one name per thing and repeat it.

## Before showing the draft

Read the draft once as the agent would, top to bottom. Each section holds at least one rule that changes behavior, and no rule appears twice.
