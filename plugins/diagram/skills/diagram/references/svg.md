# svg — drawing one by hand, and keeping it readable

Hand-authored SVG buys exact placement: lanes that line up, a line routed around a box instead of
through it, an encoding carried by colour. You pay for it in arithmetic. These are the rules that
make the arithmetic come out.

## Embedded or portable — settle this before the first shape

The fork from step 2 of the skill decides how every element is written, and converting afterwards
means touching all of them.

**Embedded.** Shapes carry classes; the host page's CSS gives those classes fills and strokes from
its own custom properties. The diagram follows the page's light and dark themes with no work, and
it matches the surrounding design because it is drawing with the same tokens.

```html
<rect x="24" y="64" width="190" height="52" rx="2" class="d-box" />
<!-- in the page's stylesheet -->
.d-box  { fill: var(--paper); stroke: var(--rule-strong); stroke-width: 1; }
.d-varus{ fill: var(--accent-soft); stroke: var(--accent); }
```

Lift that `<svg>` out of its page and every shape renders with the UA defaults: black fill, no
stroke. **Nothing warns you.** It is the single most common way a diagram is lost.

**Portable.** Shapes carry their own paint, either as presentation attributes or in a `<style>`
element inside the `<svg>`. An internal `<style>` keeps the file readable and is the better default;
either survives being referenced from an `<img>`, where external CSS never reaches.

```html
<svg viewBox="0 0 960 470" xmlns="http://www.w3.org/2000/svg">
  <style>
    .d-box { fill: #fff; stroke: #b9c3c0; stroke-width: 1; }
    @media (prefers-color-scheme: dark) {
      .d-box { fill: #101413; stroke: #3b4745; }
    }
  </style>
  ...
</svg>
```

The media query inside a portable file does reach the viewer's setting in current browsers when the
file is referenced from an `<img>`. **Confirm it where you are publishing** rather than assuming:
some hosts proxy images, and a two-file `<picture>` with `media="(prefers-color-scheme: dark)"` is
the arrangement that works everywhere.

**Converting embedded to portable** is mechanical: resolve every custom property to a literal, move
the rules into an internal `<style>`, add the `xmlns`, and re-check the four things in
`verify.md` — a token that resolved against the page may not have an equivalent standing alone.

## Lay the grid before you draw

Pick `viewBox="0 0 W H"` from the content, not from a preset, and let CSS scale it
(`width: 100%; height: auto`). Then write the coordinates down as a plan and draw from the plan.

A three-lane flow, which is the shape most "who does what" diagrams want:

```
viewBox 0 0 960 470          keep every x within [8, 952]

lane captions   y = 44, 168, 356      small uppercase, at x = 24
band 1 (people)    boxes y = 64,  h = 52
band 2 (the agent) container y = 176, h = 136, queues inside at y = 200, h = 88
band 3 (machines)  boxes y = 372, h = 52, their arrow labels at y = 444

columns: 24..214   286..462   534..710   760..936
```

Shared baselines and even gaps are most of what makes a hand drawing read as deliberate. Eyeballed
offsets read as noise, and they are the reason a diagram looks amateur even when every element is
correct.

## Arrowheads

One `<marker>` per colour in `<defs>`, referenced by a fragment id. `orient="auto-start-reverse"`
lets the same marker serve `marker-start`, which is how a two-way handshake gets one line instead
of two.

```html
<defs>
  <marker id="ah" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="8" markerHeight="7"
          orient="auto-start-reverse"><polygon points="0,0 10,4 0,8" class="ah-ink" /></marker>
</defs>
<path d="M330,200 L560,120" class="arr" marker-start="url(#ah)" marker-end="url(#ah)" />
```

A marker inherits nothing useful from the line it sits on, so give each marker's polygon its own
class and match it to the stroke by hand. A teal line with a black arrowhead is the tell that you
forgot.

## Label every arrow, and keep every label clear of every line

An unlabelled arrow says "related somehow". `opens the ticket`, `ready, unblocked`,
`polls every 30s` says something. Put the label on the mark; put the explanation in the caption.

Four collisions account for nearly every failure, and all four are invisible until you look:

- **Running off the edge.** A label with `text-anchor="end"` at `x=62` extends *left* to negative
  coordinates and is simply gone. Keep the anchored edge inside `[8, W-8]`, and remember that the
  anchor decides which way the text grows.
- **A diagonal crossing its own caption.** Text placed beside a sloping line meets it somewhere.
  Put a diagonal's label in nearby empty space instead — the gap between two containers, the area
  under the arrow's origin — rather than trying to run it alongside.
- **Two labels on one line of text.** Vertical arrows a hundred units apart get labels that collide
  long before the arrows do. Stagger them: one at `y=136`, the next at `y=150`, the next at `y=164`.
- **A label under a box.** For a short horizontal hop between two boxes, put the label *below* the
  row at a shared `y`, centred on the gap. It escapes the boxes entirely and the row reads as a
  sequence.

Keep label text around 10 to 13px at the drawn scale, and a word to three long.

## Route around, never through

A line that passes through a container says the thing travels through it. When it does not — a
person committing straight to the repository without the agent in the way — route it around the
outside with two segments and let the detour carry the meaning:

```html
<path d="M920,116 V398 H904" class="arr" marker-end="url(#ah)" />
```

Leave a clear channel outside the container when you lay the grid, or there will be nowhere to put
it.

## Draw the thing, not its name

A box labelled `queue` says less than the prose it sits beside. A container holding two chips with
an arrow between them, a title, and a line saying how it is ordered shows what a queue *is* here.
The same applies to a cache, a buffer, a retry: show the parts the argument turns on.

Spend colour on meaning and nowhere else. One accent for the subject of the diagram, one semantic
hue for the thing that carries risk or age, everything else in the page's foreground. Two encodings
is the ceiling; a third stops being an encoding and starts being decoration.

## Finish it

```html
<figure>
  <svg viewBox="0 0 960 470" role="img" aria-label="one sentence, the same claim as the caption">
    ...
  </svg>
  <figcaption>What the picture shows that the prose does not.</figcaption>
</figure>
```

One figure, one claim, in the caption and in the `aria-label`. Keep `<script>` and `<foreignObject>`
out of the SVG. Where a drawing wants long decorative path data, it wants a real graphics tool
instead — simplify.

## Wider than the text column

A flow diagram needs more width than a readable measure. Break it out of the column rather than
shrinking it, and let it scroll on a phone:

```css
.figure-wide { width: min(58rem, calc(100vw - 40px));
               margin-inline: calc((var(--measure) - min(58rem, calc(100vw - 40px))) / 2); }
.fig-scroll  { overflow-x: auto; }
.flowdiag    { display: block; width: 100%; min-width: 640px; height: auto; }
```

The `min-width` is what stops a phone from squeezing 10px labels into nothing; the scroll container
is what stops that min-width from scrolling the whole page sideways.
