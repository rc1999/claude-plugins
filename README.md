# claude-plugins

Rafal's Claude Code plugin marketplace. Marketplace name: `rafal`.

## Plugins

| Plugin | What it does |
|---|---|
| `diagram` | Produce a diagram in the form its destination can actually render: hand-authored SVG (embedded in a page, or portable as a file), a Mermaid fence, or a PNG. Carries the format-choice table, the SVG craft that survives a theme change, the conversions between all three, and a render-and-look loop in a real browser. |
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
claude plugin install diagram@rafal
claude plugin install mermaid@rafal
claude plugin install browser-test@rafal
```

Inside a session:

```
/plugin install diagram@rafal
/plugin install mermaid@rafal
/plugin install browser-test@rafal
```

Install any of them. The `@rafal` suffix names this marketplace.

### 3. Verify

```bash
claude plugin list
```

The plugins you installed should show. In a session, `/diagram`, `/mermaid` and `/browser-test` appear in the skill list. Restart any open Claude Code session so the new skills load.

### Update

```bash
claude plugin marketplace update rafal
claude plugin update diagram@rafal
claude plugin update mermaid@rafal
claude plugin update browser-test@rafal
```

### Uninstall

```bash
claude plugin uninstall diagram@rafal
claude plugin uninstall mermaid@rafal
claude plugin uninstall browser-test@rafal
claude plugin marketplace remove rafal
```

## First use

### diagram

No setup beyond a local Chrome, which it uses to screenshot what it drew. Say where the diagram has to land ("a diagram for the README", "add one to this page") and it picks the form from the destination: a Mermaid fence where the renderer supports one, hand-authored SVG where the layout has to be exact, a PNG only where SVG is refused. It hands the Mermaid path to the `mermaid` skill. References live in `plugins/diagram/skills/diagram/references/`.

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
