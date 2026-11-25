# Mode skeleton

The shape of a `-mode` skill: the common sections and how specific a rule is. Each example rule is invented to show granularity. Keep a section only when the user has a specific rule for it, and write their rule there.

```markdown
---
name: <handle>-mode
description: "<Name>'s working style. Use for <Name>, /<handle>-mode, or requests to work in <Name>'s style."
disable-model-invocation: true
---

# <Name> mode

## Response style

Length, tone, format.
Example: Lead with the answer in one sentence. Tables when comparing options.

## Autonomy

How much to do without asking, and which actions always wait for a yes.
Example: Proceed on anything reversible. Ask before a force-push or a deploy.

## Understand first

Which skills or steps to reach for when scoping or investigating a change.
Example: Read the ADRs in `docs/adr/` before proposing a design.

## Subagents

When to delegate, how much to run in parallel, which model for which job.
Example: Send any search across more than five files to a subagent.

## Prose and code discipline

Principles, lint tools, style guides.
Example: Name the data shape before writing a function.

## Review and verify

What "done" means, repro posture, live-testing tools.
Example: Reproduce the bug with a failing test before fixing it.

## Process

Worktrees, commits, PRs, review and merge tooling.
Example: One logical change per commit. Open a PR only when asked.

## Skills

Skill-authoring habits and when to propose a new skill.
Example: When a skill gives a wrong instruction, fix the skill before continuing.
```
