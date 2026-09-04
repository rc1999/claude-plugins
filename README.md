# claude-plugins

Rafal's Claude Code plugin marketplace. Marketplace name: `rafal`.

## Plugins

| Plugin | What it does |
|---|---|
| `mermaid` | Author Mermaid diagrams that render correctly the first time and read clearly. Verified templates per diagram type (flowchart, sequence, state, class, ER, gantt), readability and layout rules, the dark-background contrast fix, and a render-and-verify loop. |
| `browser-test` | Browser-test a deployed web app behind an SSO login wall (Cloudflare Access, Google SSO, Okta). Reuses your already-authenticated Chrome session over raw Chrome DevTools Protocol with a zero-dependency driver (`rawcdp.cjs`). VERIFY/CHECK QA loop, hard assertions, report template. |

## Install

Requires Claude Code with plugin support (`claude plugin --help` works).

### 1. Add the marketplace

From a terminal:

```bash
claude plugin marketplace add rc1999/claude-plugins
```

Or inside a Claude Code session:

```
/plugin marketplace add rc1999/claude-plugins
```

### 2. Install the plugins

Terminal:

```bash
claude plugin install mermaid@rafal
claude plugin install browser-test@rafal
```

Inside a session:

```
/plugin install mermaid@rafal
/plugin install browser-test@rafal
```

Install one or both. The `@rafal` suffix names this marketplace.

### 3. Verify

```bash
claude plugin list
```

Both plugins should show as installed. In a session, `/mermaid` and `/browser-test` appear in the skill list. Restart any open Claude Code session so the new skills load.

### Update

```bash
claude plugin marketplace update rafal
claude plugin update mermaid@rafal
claude plugin update browser-test@rafal
```

### Uninstall

```bash
claude plugin uninstall mermaid@rafal
claude plugin uninstall browser-test@rafal
claude plugin marketplace remove rafal
```

## First use

### mermaid

No setup. Ask for a diagram ("add a sequence diagram for the checkout flow"). The skill picks the diagram type, applies the contrast header and layout rules, and asks you to render before calling it done. Templates live in `plugins/mermaid/skills/mermaid/references/`.

### browser-test

One-time setup per machine, from `plugins/browser-test/skills/browser-test/references/setup.md`:

1. Create a dedicated Chrome profile dir: `mkdir -p ~/.browser-test/chrome-profile`.
2. Add the `bt-chrome` alias to your shell (launches Chrome on that profile with `--remote-debugging-port=9222`).
3. Run `bt-chrome`, log in to the gated app by hand once. The session cookie persists in the profile.

After that, ask "browser test the deployed app at https://..." and the skill drives the live app over CDP. Needs Node 18+ for `rawcdp.cjs`. No npm install.

## Layout

```
.claude-plugin/marketplace.json   marketplace manifest
plugins/<name>/.claude-plugin/plugin.json
plugins/<name>/skills/<skill>/SKILL.md
```

Each plugin lives in `plugins/<name>` and is referenced from the marketplace with a relative `source`.

## License

MIT.
