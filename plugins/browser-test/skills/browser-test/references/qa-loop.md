# browser-test — QA loop detail

Adapted from Eric Tech's `playwright-qa` skill. Auth differs: we reuse the user's live SSO session over CDP (see SKILL.md), so there is **no** test-user provisioning and **no** login-form automation here. Everything below is the QA loop run *after* the session is attached.

## Modes

- **VERIFY** — reproduce a reported bug before fixing. Follow the repro steps from the ticket; screenshot each step; the run "passes" when the bug is reproduced.
- **CHECK** — confirm a fix landed. Walk the affected flow; the run passes when the expected UI/behavior is present and all hard assertions hold.

## Route detection

```bash
git diff --name-only HEAD
```

Map changed files to routes from the app's router. Examples:

| Changed path | Likely route |
|---|---|
| `src/pages/dashboard/**`, `app/dashboard/**` | `/dashboard` |
| `src/routes/<x>.tsx` | `/<x>` |
| (no obvious match) | `/` |

Confirm the route with the user if ambiguous. Don't hardcode.

## Driver — rawcdp.cjs (default)

Build a `steps.json` and run `node <skill>/references/rawcdp.cjs steps.json`. It drives a single page target over raw CDP (no `connectOverCDP` all-target hang) and returns a JSON report. Step DSL:

```json
[{"goto":"https://app.example.com/<route>","settle":3000},
 {"shot":".browser-test/01.png"},
 {"click":"text=Next"},
 {"wait":1500},
 {"shot":".browser-test/02.png"},
 {"eval":"document.querySelectorAll('tr').length"}]
```

- `goto` — navigate (`settle` ms wait; default 2500). `shot` — screenshot at the fixed viewport. `click` — `text=<label>` (matches a/button/[role=button]/submit) or a CSS selector. `wait` — sleep. `eval` — Runtime.evaluate, value into the report.
- **Native dialogs block CDP.** A control that calls `window.confirm()` freezes the page — the click step never returns and the dialog can't be clicked over CDP. Before such a click, add `{"eval":"window.confirm=()=>true;window.alert=()=>{}"}`.
- Report fields: `mainStatus`, per-step results, `consoleErrors`, `failedRequests`, `final.{url,host,title,bodyLen}`.
- Screenshots go to files; the report is terse text — no accessibility-tree dump, naturally low-token.

## Locator strategy

1. `text=<label>` — most stable for the rawcdp clicker.
2. CSS selector with a `[data-testid]` — when text is ambiguous.
3. Never raw CSS classes / nth-child — they break on every design tweak.

## Hard assertions (read from the rawcdp report; fail the run if any trip)

- `consoleErrors` is empty.
- `failedRequests` has no status `>= 500`.
- `failedRequests` has no unexpected `401`/`403`, **and** `final.host` is the app host (not `accounts.google.com` / a login page). Either is the canary that the SSO session expired — stop, redo SKILL.md step 1, re-run.
- `final.bodyLen` non-trivial, page-type specific:
  - list page → ≥1 row rendered
  - detail page → ≥3 fields populated
  - form page → expected inputs present
  - static page → expected headline/landmark present
- **Page identity vs a control** — a `200` with a non-trivial body is NOT proof the URL resolved. Single-page apps served from an edge worker or static host return the SPA shell for unmatched paths, and an ACL denial can serve `index.html` — both look like success to every assertion above. For each target route, add an `eval` step asserting a marker unique to that page (`document.title`, a heading, a known element), and compare `bodyLen` against a known-good control page fetched in the same run; a large delta means the shell, not the page. Real case: a wrong URL returned `200` rendering the portal home (1773 chars) where the target page is 3851 — empty console, no 4xx/5xx.

## Optional forensics (for hard-to-repro bugs)

When a finding is flaky, capture and attach: console log, page-error log, and a network HAR. Keep them in the gitignored screenshot folder alongside the numbered PNGs.

## Budget

Cap screenshots (~30/page) and wall-clock (~30 min) per run so context doesn't creep. If a flow needs more, split it into a second run.

## Viewports

- Default `1280×800` (rawcdp.cjs default).
- Responsive apps: re-run with `--width 375` (mobile) / `--width 768` (tablet) on the primary route.
