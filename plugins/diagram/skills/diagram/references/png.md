# png — when a picture of a picture is the answer

PNG is the last resort. It cannot be diffed, it goes stale without saying so, and it is unreadable
to anything that reads text. Reach for it only where SVG is refused: a chat message, a slide deck,
an email, an export somebody asked for by name.

**Always commit the source beside it.** A PNG with no source is a diagram nobody can change.

## From an SVG, at twice the size

Wrap the SVG in a page that fixes its width, then screenshot at a device scale factor of 2 so it
stays sharp on a retina display and when scaled down.

```bash
cat > wrap.html <<'H'
<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#fff}svg{display:block;width:960px;height:auto}</style>
H
cat flow.svg >> wrap.html

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=960,288 \
  --screenshot=flow.png wrap.html
```

`--window-size` takes CSS pixels and the scale factor multiplies them, so that command produces a
1920 by 576 file. Size the window to the SVG's aspect ratio: a window taller than the drawing gives
you a band of background, a shorter one crops the bottom off with no warning.

Set the wrapper's background to the ground the PNG will actually sit on. White is the safe default
and a transparent export is the usual way to end up with black text on a dark slide.

## From a Mermaid fence

```bash
npx -y @mermaid-js/mermaid-cli -i diagram.mmd -o diagram.png -b '#f6f8fa' -s 2
```

The `mermaid` skill carries the traps around this, including the one where a white-background
render hides a contrast bug that only appears on a dark host page.

## Check it

Open the PNG and look at it, at the size it will be seen. Text that is legible at 1920 wide can be
mush in a chat message rendered at 600. If it is, the drawing has too much in it for the space —
cut the content rather than raising the resolution.
