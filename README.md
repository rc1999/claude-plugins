# claude-plugins

Rafal's Claude Code plugin marketplace.

## Install

```bash
claude plugin marketplace add rc1999/claude-plugins
claude plugin install mermaid@rafal
claude plugin install browser-test@rafal
```

## Plugins

| Plugin | What it does |
|---|---|
| `mermaid` | Author Mermaid diagrams that render correctly the first time and read clearly. Verified templates per diagram type (flowchart, sequence, state, class, ER, gantt), readability and layout rules, the dark-background contrast fix, and a render-and-verify loop. |
| `browser-test` | Browser-test a deployed web app behind an SSO login wall (Cloudflare Access, Google SSO, Okta). Reuses your already-authenticated Chrome session over raw Chrome DevTools Protocol with a zero-dependency driver (`rawcdp.cjs`). VERIFY/CHECK QA loop, hard assertions, report template. |

## Layout

```
.claude-plugin/marketplace.json   marketplace manifest
plugins/<name>/.claude-plugin/plugin.json
plugins/<name>/skills/<skill>/SKILL.md
```

Each plugin lives in `plugins/<name>` and is referenced from the marketplace with a relative `source`.

## License

MIT.
