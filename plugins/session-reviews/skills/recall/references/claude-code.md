# Transcripts and subagents in Claude Code

The session-reviews skills read this file once per session. It holds the facts they share. It lives in the **recall** skill's folder so that it travels with the skills however they are installed.

## Transcripts

A session's transcript is `~/.claude/projects/<slug>/<session>.jsonl`. With `CLAUDE_CONFIG_DIR` set, that folder replaces `~/.claude`.

- `<slug>` is the workspace's absolute path with each `/` and `.` changed to `-`, so `/Users/you/proj` is `-Users-you-proj`.
- Each line is one JSON event. Lines whose `type` is `user` or `assistant` are the chat messages. The other types are harness bookkeeping.
- The newest `.jsonl` directly in the folder is the current session.
- `<slug>/<session>/subagents/` holds that session's subagent transcripts.

Read only the active workspace's folder. Another project's folder holds private chats, so open it only when the user names that project.

## Subagents

Spawn subagents with the `Agent` tool. They run in the background and notify you when they finish.

| Job | `Agent` call |
| --- | --- |
| Mine transcripts | `subagent_type: "Explore"`, `model: "haiku"`. The brief says "do not edit files". |
| Investigate a shared-record source (issue tracker, chat, docs, error tracking) | `subagent_type: "general-purpose"`, no `model`. This type keeps the session's MCP servers. `Explore` drops them. |

Give each brief file paths, not pasted transcript text. If `Agent` rejects a `model` value, omit `model` and say so in your reply.

You own every subagent's findings. Check each claim that the brief depends on before you repeat it.

## The other session-reviews skills

Each skill sets `disable-model-invocation: true`, so the `Skill` tool refuses it. To run one from another, `Read` `../<name>/SKILL.md` and follow it. They sit beside each other as sibling folders, both in the plugin and when installed one by one. When you tell the user to run one, write `/session-reviews:<name>` if this file's path contains `/plugins/`, else `/<name>`.
