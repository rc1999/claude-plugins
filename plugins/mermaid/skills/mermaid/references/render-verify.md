# render-verify — prove the diagram before you ship it

Mermaid fails **silently and visually**, not at lint time. A reserved word, a bad theme key, or an over-broad CSS rule produces an error bomb, invisible text, or black-on-black boxes — none of which a syntax check catches. **Render it, screenshot it, look at it.** A diagram you haven't seen rendered is not done.

## The loop

1. **Render** the doc with a real Mermaid renderer (the same one the doc will use — dark-background renderers are where contrast bugs show). Mermaid v11 renders `%%{init}%%` directives and `box`/`<br/>`/`~~~`.
2. **Screenshot** the diagram.
3. **Check four things, by eye:**
   - **Renders at all** — no "Syntax error in text" bomb. (A bomb still produces an `<svg>`, so "an SVG exists" is NOT proof — look for the error text.)
   - **Text readable** — node labels, **subgraph titles**, **swimlane box titles**, edge labels, notes, and **autonumber digits** all visible. No grey-on-dark, no black-on-black.
   - **Width sane** — not spread sideways into an unreadable strip (see flowchart `~~~` stacking).
   - **Not a hairball** — edges legible, crossings minimal.
4. **Fix the source and re-render.** Never edit rendered output.

### Optional programmatic pre-check (necessary, not sufficient)

Detect the error bomb and obvious contrast problems before eyeballing — but you STILL must look, because a fill rule can blacken shapes as well as text:

```js
// per .mermaid element, in the rendered page:
const bomb = /syntax error|mermaid version 1/i.test(el.textContent);   // true = failed
const titleDark = getComputedStyle(el.querySelector('.cluster-label')).color; // want near-black
const actorRect = getComputedStyle(el.querySelector('rect.actor')).fill;       // want light, NOT black
```

## Reserved words — never use as a node/participant/state id

`end`, `off`, `on`, `as`, `class`, `state`, `style`, `graph`, `subgraph`, `direction`, `click`, `link`, `call`. These collide with the grammar. The classic: `participant OFF as Offline Worker` → lowercased to `off` → `Parse error … got 'off'`. Rename to `SVC`, `OPR`, `END_`, etc. This is the most common silent parse failure.

## Contrast — theme the colours, don't sledgehammer with CSS

The dark-background "grey text" bug is the host page leaving text colours unset, so they inherit the page's light body colour. The fix is an **explicit theme in the diagram's own init** (`theme:'base'` + `themeVariables`, per the per-type templates) — mermaid then sets every text colour.

**Avoid `themeCSS: 'text{fill:#111}'` as the contrast fix.** Bake-off findings:

| Approach | Static text | Autonumber digits | Actor boxes | Verdict |
|---|---|---|---|---|
| `themeVariables` (theme:base) | dark ✓ | white, visible ✓ | light ✓ | **use this** |
| `theme:'default'` / `'neutral'` | dark ✓ | visible ✓ | light ✓ | fine (neutral makes notes dark-grey) |
| `themeCSS text{fill:#111}` | dark ✓ | **blanked (black on dark badge)** ✗ | ok | avoid |
| `themeCSS .actor{fill:#111}` | — | — | **black-on-black** ✗ | never |

If you must use `themeCSS` (e.g. to fix only cluster titles without re-theming), scope it to label classes and **exclude** sequence text: target `.cluster-label, .edgeLabel`, never bare `text{}` or `.actor`.

## The dark *host page* case — flowchart htmlLabels stay grey even with the header

The contrast header styles SVG `<text>` (sequence messages, actor names, state labels). It does **not** reach flowchart **htmlLabels** — node, subgraph-title, and edge labels render as HTML (`<foreignObject><p>…</p>`) because `<br/>` forces htmlLabels on. On a **light-text host page** (a dark-themed doc site whose stylesheet sets `body` / `p { color: <light> }`), those `<p>` elements inherit the host's light colour and go grey — *even with the contrast header present*. Sequences are unaffected (SVG text obeys `textColor`); flowcharts grey out. The tell: **"sequence diagrams read fine, flowcharts are unreadable."**

- `classDef … color:#dark` **protects node labels** (verified: node text survives the host leak) but **not** subgraph titles or edge labels — those carry no classDef.
- The complete fix is a **label-scoped `themeCSS` on `color`** (never `fill`), in the diagram's own init — the per-type flowchart template ships with it:

  ```
  'themeCSS':'.nodeLabel,.nodeLabel p,.edgeLabel,.edgeLabel p,.cluster-label,.cluster-label p{color:#111 !important}'
  ```

  This is the one place `themeCSS` is correct: the § Contrast warning is about `text{fill}` / `.actor{fill}` (which blank autonumber digits and blacken actor boxes). A `color`-only, label-scoped rule can touch neither, so sequences stay intact.

**Verifying this one is the trap:** white-background `mmdc` **cannot reproduce it** — it has no light-text host page to inherit from, so a flowchart that greys out in production renders perfectly in `mmdc`. That is exactly how it ships unnoticed. Reproduce by injecting a host leak:

```
printf 'p,li,span,div{color:#9fb0c3;}\n' > leak.css
npx -y @mermaid-js/mermaid-cli -i diagram.mmd -o out.png -b '#f6f8fa' -C leak.css
```

Grey labels in `out.png` = the bug; dark = fixed. Better still, render inside the **actual** dark-themed host and look. (Origin: a doc set rendered fine in `mmdc` but greyed every flowchart on its dark-themed HTML site — header present and correct; the htmlLabel `<p>` inheritance is what the white-bg verify had masked. Sequences on the same site were fine, which is the diagnostic fingerprint.)

## Layout fixes at a glance

- **Too wide** (independent groups side-by-side) → chain subgraphs `G1 ~~~ G2 ~~~ G3` to stack vertically.
- **Layered architecture** → `flowchart TB` + `direction LR` inside each subgraph (horizontal bands, stacked).
- **Hairball** → delete edges that only restate subgraph membership; reorder subgraphs to match flow.
- **Sequence too cramped** → group participants into `box` swimlanes; order by role so boxes are contiguous.

## Origin

These rules come from a verified build: a 5-version theme bake-off (themeCSS vs themeVariables vs neutral vs default vs both), two text-contrast regressions caught only by screenshot, and a reserved-word (`OFF`) parse error. Every template in this skill was rendered and visually confirmed before being written down.
