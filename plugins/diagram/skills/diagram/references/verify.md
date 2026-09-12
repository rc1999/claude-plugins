# verify — prove it rendered before you ship it

A drawing fails **silently and visually**. A label runs off the left edge, a diagonal crosses its
own caption, a colour resolves to the ground it sits on. None of those is a syntax error, and no
linter catches any of them. **Render it, screenshot it, look at it.**

## The loop

1. **Render the real thing.** The page the diagram will live in, in a real browser — not the SVG
   file alone, which has none of the host's CSS and so proves nothing about an embedded diagram.
2. **Screenshot it.**
3. **Crop to the figure.** A full-page screenshot at 3000px tall renders 10px labels as grey mush,
   and you will pass a diagram that is broken.
4. **Check four things by eye.**
5. **Fix the source and render again.** Never edit rendered output.

## The four checks

- **It is there.** Every box, every line, every arrowhead. A shape drawn outside the `viewBox` is
  absent with no error, and a standalone file that fails to parse as XML shows a broken-image box
  rather than a diagram — `svg.md` carries the entity rule that causes it.
- **Every label is readable and inside the frame.** Watch the left edge especially: an
  `text-anchor="end"` label grows leftward and disappears past zero.
- **No label touches a line or another label.** This is what you are really here for; it is the
  failure hand-authored SVG makes every time.
- **The colours resolve.** In an embedded diagram, in both themes. A token that exists only in one
  theme's block renders as the UA default in the other, which is usually black on black.

## Screenshot a local page

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --hide-scrollbars \
  --window-size=1100,3000 --virtual-time-budget=4000 \
  --screenshot=shot.png page.html
```

`--virtual-time-budget` gives web fonts time to land; without it, a font-dependent layout is
measured before the font arrives. Crop to the figure with the offset you read off the full shot:

```bash
sips -c 820 1100 --cropOffset 2500 0 shot.png --out figure.png   # height width, then y x
```

Then open `figure.png` and look at it.

## Check the other theme

Stamp the root element rather than changing the machine's setting:

```bash
sed 's/<html/<html data-theme="dark"/' page.html > dark.html   # or inject the attribute at the top
```

A page that switches on `prefers-color-scheme` alone also needs the emulation:

```bash
"$CHROME" --headless --disable-gpu --screenshot=dark.png \
  --force-dark-mode --enable-features=WebContentsForceDark page.html
```

Stamping the attribute is the reliable one; reach for the flags only when the page has no stamp.

## Where a wrapper is needed

An embedded SVG must be screenshotted **inside its page**. A portable SVG can be shot on its own,
but Chrome renders a bare `.svg` at its intrinsic size, so wrap it to fix the width:

```html
<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#fff}svg{display:block;width:960px;height:auto}</style>
<!-- the svg, inline -->
```

Set that background explicitly. A transparent PNG checked against a white page and then pasted onto
a dark one is a bug you shipped yourself.

## For a Mermaid fence

The `mermaid` skill owns that loop, including the error bomb, the reserved words, and the
dark-host-page label leak that a white-background render cannot reproduce. Use it.
