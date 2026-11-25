---
name: session-pickup
description: "Resume or take over one specific prior session's in-flight work: read its trail, name the resume point, and continue without redoing what landed. Use for 'pick up where that session left off' or 'take over this branch'."
disable-model-invocation: true
---

# Session pickup

Read [transcripts and subagents in Claude Code](../recall/references/claude-code.md) once per session before you follow this skill. It says where transcripts live and how to spawn each kind of subagent.

**You own the resume point. Read the prior trail, don't redo it.**

Context across several recent chats is the **recall** skill, not this.

1. Locate the prior trail. It is a transcript in the active workspace's folder, a session the user links, or a pushed branch. Read the first messages and the last messages first, then scan back for the decision points. Parse a long transcript in a transcript-mining subagent and keep only the reduced timeline in the main thread.
2. Reconstruct operational state. The branch and worktree, what already landed (`git log`, `git diff` against the base), the open todos, the decisions made. The prior trail is authoritative input. Resist the bias to re-derive it.
3. Diff done vs pending. Compare what shipped against what was planned, name the resume point, do not re-run the prior repro or redo completed work. A "let me verify from scratch" pass means you're treating the trail as untrustworthy when it's authoritative.
4. Pick the verdict: continue the execution, ship a finished recommendation, ratify or override a prior conclusion, or postmortem a failed run. The pickup ends here. The remaining work proceeds as its own task.
5. Verify the inherited claims against the original goal on the real artifact: run it, read the diff, check the PR. A passing prior self-report is not the proof.

**Reply:** where the prior agent stopped, what you inherited vs redid (ideally nothing redone), the resume point, and the outcome.
