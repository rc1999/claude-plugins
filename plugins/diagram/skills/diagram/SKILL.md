---
name: diagram
description: Use when a diagram has to land somewhere specific — a README, a wiki page, an HTML page or artifact, a slide, a chat message — or when one must move between those, or ship as a standalone SVG or a PNG. Picks the form from the destination, draws the mechanism, and proves it rendered. Triggers on "add a diagram", "diagram for the README", "embed this diagram in markdown", "export the diagram", "SVG diagram", "make it a PNG", "the diagram is clipped / unreadable / invisible in dark mode".
---

# diagram

**The destination picks the form.** Everything else follows from that one decision, and getting it
wrong is a rewrite rather than an edit: an SVG styled by its host page renders as invisible shapes
the moment you lift it out.

Three forms, and a skill each way of drawing them.

| Where it lands | Form | Who draws it |
| --- | --- | --- |
| A GitHub README, issue, pull request, or any renderer with Mermaid | a ```mermaid fence | the `mermaid` skill |
| An HTML page, an Artifact, a themed doc site | **embedded SVG**, styled by the page | `references/svg.md` |
| Markdown with no Mermaid — a wiki, Confluence, a PDF, a repo README that must show a picture | **portable SVG**, a file carrying its own styles | `references/svg.md` |
| A chat message, a slide, an email, anywhere SVG is refused | **PNG**, generated from one of the above | `references/png.md` |

**Mermaid first where it renders.** A fence anyone can edit beats a hand-drawn picture only you can
change. Reach for SVG when the drawing needs a layout Mermaid will not hold: swimlanes with exact
alignment, a line routed deliberately around a box, an encoding carried by two colours.

## 1. Earn the picture

A diagram earns its place when it shows a **mechanism** the reader would otherwise assemble from
prose: where data flows, which parts talk, what changes between two options, what states a thing
moves through. Where a sentence says it faster, write the sentence.

Done when you can say in one line what the picture shows that the surrounding text does not.

## 2. Pick the form, and commit to it

Take the row from the table. Then settle the fork that the table's two SVG rows hide, because it
decides how every shape is written:

- **Embedded** takes its colours from the host page, through classes and CSS custom properties. It
  follows the page's light and dark themes for free. It cannot be moved.
- **Portable** carries its own colours, as presentation attributes or a `<style>` inside the
  `<svg>`. It travels anywhere, including into an `<img>`, and follows a theme only if you write
  the media query yourself.

Done when the destination, the form, and the portability are written down in one sentence you can
check the finished file against.

## 3. Draw the mechanism

The drawing rules are the same whichever form you chose: show the parts the argument turns on,
label every arrow with what crosses it, keep one figure to one claim, and place everything on a
grid. `references/svg.md` carries them, along with the layout recipes and the label-collision
traps that make hand-authored SVG fail.

For a Mermaid fence, invoke the `mermaid` skill and follow it. It owns the per-type templates, the
contrast header, the reserved words, and the too-wide fixes.

Done when every arrow carries a label and every label sits clear of every line.

## 4. Render and look

**A diagram you have not seen rendered is not done.** Hand-authored SVG fails the way Mermaid does,
silently and visually: a label runs off the left edge, a diagonal crosses its own caption, a colour
resolves to the ground it sits on. None of that is a syntax error.

`references/verify.md` is the loop: screenshot the real page in a real browser, crop to the figure,
and check four things by eye. Run it in both themes when the diagram claims to follow one.

Done when you have looked at a cropped screenshot of the figure and the four checks pass.

## 5. Place it

- **Embedded SVG**: inline in the page, wrapped in `<figure>` with a `<figcaption>` stating the
  claim, and `role="img"` plus an `aria-label` carrying the same claim.
- **Portable SVG**: a file next to the document, referenced as an image. GitHub strips inline
  `<svg>` from markdown, so `![Alt](flow.svg)` is the form that works there.
- **PNG**: generated at twice the display size and committed beside its source, because a PNG with
  no source goes stale silently.

Done when the diagram renders where it was meant to land, checked by opening it there.
