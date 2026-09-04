---
name: mermaid
description: Use when creating, editing, or embedding a Mermaid diagram (flowchart, sequence, state, class, ER, gantt) — especially in a doc that renders on a dark background, or when a diagram comes out too wide, has unreadable / low-contrast text, blanks its labels, or fails to render. Triggers on "mermaid diagram", "add a diagram", "architecture diagram", "sequence diagram", "flowchart", "diagram won't render", "diagram text is grey / unreadable", "diagram is too wide".
---

# mermaid

Author Mermaid diagrams that **render correctly the first time and read clearly** — with verified canonical templates per diagram type, layout rules that prevent the common "too wide / unreadable / won't render" failures, and a browser render-and-verify loop.

**Core principle: a diagram you have not rendered is not done.** Mermaid fails silently — a reserved word or a bad theme key produces an error bomb or invisible text, and a syntax lint will not catch it. Always render and look. See `references/render-verify.md`.

These templates encode lessons learned the hard way (a 5-version theme bake-off, two text-contrast regressions, a reserved-word parse error). Use them; don't re-derive them.

## Which diagram type — pick by what you're showing

| You're showing… | Use | Reference |
|---|---|---|
| Components / layers / system architecture / build-vs-buy | **flowchart** | `references/flowchart.md` |
| A message exchange over time across actors (an API handshake, a checkout, an approval) | **sequence** | `references/sequence.md` |
| A lifecycle / status machine (draft → in review → published) | **state** (`stateDiagram-v2`) | `references/state.md` |
| Data model / object structure / interfaces | **class** | `references/class.md` |
| Entities and their relationships (tables, cardinality) | **ER** (`erDiagram`) | `references/er.md` |
| A schedule / build sequence / roadmap on a timeline | **gantt** | `references/gantt.md` |

Rules of thumb: **sequence** when *order over time* matters; **flowchart** when *structure/relationships* matter; **state** when a thing moves between named statuses; **ER** for data, **class** for code, **gantt** for time. Don't force a flowchart to tell a time-ordered story — that's a sequence.

## Universal readability rules (apply to every diagram)

1. **Start every diagram with the contrast header.** The #1 failure on dark-background renderers (custom doc sites, dark IDE preview) is grey/invisible text: subgraph titles, swimlane labels and edge labels inherit the page's light body color. Setting an explicit theme in the diagram's own init directive fixes the **SVG** text (sequence messages, actor names, state labels) — mermaid sets those colors instead of leaving them to inherit. **Flowchart htmlLabels are the exception:** node/subgraph-title/edge labels render as HTML (`<foreignObject><p>`, because `<br/>` forces htmlLabels), so on a *light-text host page* (a dark-themed doc site whose CSS sets `p{color:light}`) they inherit the host color and stay grey **even with the header** — theme vars only reach SVG text. That case needs the label-scoped `themeCSS` in the exception below; see `references/render-verify.md`. Per-type headers are in each reference; the general form:

   ```
   %%{init: {'theme':'base','themeVariables':{'fontSize':'14px','textColor':'#111','primaryTextColor':'#111','primaryColor':'#eaf2ff','primaryBorderColor':'#3b6fb0','lineColor':'#888','titleColor':'#111','clusterBkg':'#f7f8fa','clusterBorder':'#cccccc'}}}%%
   ```

   **Do NOT fix contrast with `themeCSS 'text{fill:#111}'`.** It works for static text but **blanks white autonumber digits** in sequence diagrams (forces them dark → invisible), and it can fill `rect.actor` boxes black (black-on-black names) if you target `.actor`. Theme the colors via `themeVariables`, don't sledgehammer with CSS. (Both bugs were found in the bake-off — see `references/render-verify.md`.)

   **The one place `themeCSS` IS the fix — flowchart htmlLabels on a light-text host.** For the grey-flowchart-label case above (node/subgraph/edge labels inheriting a dark-themed page's light `p{color}`), a label-scoped rule on **`color` (never `fill`)** is correct — the flowchart template ships with it:

   ```
   'themeCSS':'.nodeLabel,.nodeLabel p,.edgeLabel,.edgeLabel p,.cluster-label,.cluster-label p{color:#111 !important}'
   ```

   It touches label `color` only, so it can't blank autonumber digits (that bug is `fill` on `text`). `classDef … color:` protects **node** labels but not subgraph titles or edge labels, so the themeCSS is still needed for those. The prohibition above is specifically about `text{fill}` / `.actor{fill}`, which break sequences.

2. **Quote every node label and use `<br/>` for line breaks.** `A["Order<br/>history"]`. Unquoted labels with spaces, `/`, `()`, or `·` break the parser. `<br/>` keeps boxes narrow and readable (htmlLabels render it).

3. **Colour by meaning with `classDef`, not ad-hoc.** Define a small semantic palette once and apply with `:::name`. Keep `color:#111…#222` (dark) on light fills. One example convention (swap the meanings to fit your domain): green = owned/primary, blue = shared/platform, amber = third-party, grey = external, red = gate/risk, dashed = future/planned.

4. **Never use a reserved word as a node/participant id.** `end`, `off`, `on`, `as`, `click`, `class`, `state`, `graph`, `subgraph`, `style`, `direction` collide with the grammar. `OFF` → `off` → parse error ("got 'off'"). Use `SVC`, `END_`, etc. This is the single most common silent parse failure.

5. **Keep labels ASCII-ish.** `·` and `+` are fine inside quoted labels; avoid `×` (use `x`), smart quotes, and arrows-in-text. Em-dash `—` is fine in quoted labels and notes.

6. **Render and verify before declaring done** (`references/render-verify.md`). Numeric/lint checks are not enough — a fill rule can hit shapes as well as text; only a screenshot proves it.

## Layout rules (prevent "too wide" and "hairball")

- **Independent groups stack vertically with invisible links.** N subgraphs with no edges between them lay out **side-by-side → too wide**. Chain them top-to-bottom with `~~~` (invisible link): `G1 ~~~ G2 ~~~ G3`. Works subgraph-to-subgraph.
- **Layered architecture: `direction LR` inside each subgraph, `flowchart TB` outside.** Each layer becomes a horizontal band; layers stack vertically. Far more readable than letting dagre place a dense graph.
- **Trim edges.** Group membership (a subgraph) already conveys "these belong together" — you don't need an edge to every node. Fewer edges = fewer crossings.
- **Sequence diagrams: group participants into coloured swimlanes** with `box rgb(r,g,b) Label … end`. Order participants by org/role so each box is contiguous; some back-arrows are fine.
- **Wide flowchart → consider `flowchart LR`; tall list of steps → `flowchart TB`.**

## Process

1. Pick the type (table above).
2. Open the matching `references/<type>.md`, copy the canonical template (it already has the contrast header + layout pattern).
3. Fill in real nodes/labels. Keep ids reserved-word-free; quote labels; `<br/>` for width.
4. **Render and verify** (`references/render-verify.md`): render, screenshot, confirm it renders (no error bomb), text is readable, nothing is black-on-black or grey, width is sane.
5. Iterate on the source — never on the rendered output.
