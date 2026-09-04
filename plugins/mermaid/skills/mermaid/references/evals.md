# evals — regression suite for the mermaid skill

Test prompts + pass criteria. Run after any edit to the skill or its templates.
Every eval is **render-and-verify**: build the diagram per the skill, render it (mmdc or
the target renderer), and check by eye. A diagram you have not looked at is not a pass.

Render all five in one pass:

```
npx -y @mermaid-js/mermaid-cli -i evals.md -o out.md -e png -b white
```

Then look at each `out-N.png`. Every eval must satisfy the four universal checks:
**renders (no error bomb) · text readable (no grey-on-bg, no black-on-black) · width sane · not a hairball.**

| # | Prompt | Type | Specifically proves | Pass criteria |
|---|---|---|---|---|
| E1 | "Diagram a 3-tier web app: clients → services → data + a third-party API." | flowchart | contrast header, `classDef` palette, `flowchart TB` + `direction LR` per subgraph, `~~~` stacking | 3 layers stack vertically, each layer horizontal; green=own / amber=third-party / grey=external; all subgraph titles + node labels dark-on-light; not a wide strip |
| E2 | "Sequence for a checkout: shopper → API → inventory → payment, with an in-stock / out-of-stock branch." | sequence | coloured swimlanes, `autonumber`, reserved-word-safe ids, `alt/else` | actor text readable; **autonumber digits white on their badge, NOT blanked**; swimlane titles readable; alt/else renders |
| E3 | "State machine for an order: placed → paid → shipped → delivered, with cancel + refund branches." | state | contrast header, branching, start/end pseudo-states | all states + transition labels readable; branches render; `[*]` start/end present |
| E4 | "ER model for a blog: users, posts, comments with cardinality." | ER | crow's-foot cardinality, attribute blocks, `PK`/`FK` | entities + attribute rows readable; cardinality symbols correct; relationship labels present |
| E5 | "Four independent pipeline stages (ingest / transform / store / serve) — keep it narrow." | flowchart | the "too wide" fix: `~~~` stacks independent subgraphs vertically | 4 groups stack **top-to-bottom**, not side-by-side; each group internally horizontal; fits a column |
| E6 | Re-render E1 on a **light-text host** (inject `p{color:light}`, see below). | flowchart | the dark-host htmlLabel leak: theme vars only style SVG text, so flowchart labels grey out on a dark-themed page unless the template's `themeCSS` holds | with the leak injected, **node labels, subgraph titles, AND edge labels all stay dark-on-light** — none grey. Grey titles/edges = the flowchart template lost its `themeCSS` |

## Light-text host check (E6) — the regression white-bg mmdc masks

E1–E5 render on white, which **cannot** catch the "flowchart htmlLabels grey out on a dark-themed host" bug (`render-verify.md` § dark host page): white-bg mmdc has no light-text page to inherit from. Add one render that simulates a dark-themed host's light `p{color}`:

```
printf 'p,li,span,div{color:#9fb0c3;}\n' > leak.css
npx -y @mermaid-js/mermaid-cli -i e1.mmd -o e6.png -b '#f6f8fa' -C leak.css
```

Look at `e6.png`: node labels, **subgraph titles, and edge labels** must all be dark. Any grey = the flowchart template lost its label-scoped `themeCSS`. This is the executable guard for that regression; run it whenever a flowchart template header changes.

## Genericity check (post-edit)

The skill and its templates must stay domain-neutral. After any edit, grep for domain creep:

```
grep -rinE "custody|vault|fincrime|kyc|settle|ledger|payment flow|hex ?trust|nomos|quorum" skills/mermaid/
```

Expect no matches. Examples across the references should span varied neutral domains
(web app, e-commerce, blog, CI/pipeline, docs) — not one industry.

## Canonical eval sources

The five diagram sources are the genericized templates in `references/<type>.md` plus the
two extra shapes (E2 checkout, E5 four-stage). To regenerate the suite, copy each template,
render, and confirm against the pass criteria above.
