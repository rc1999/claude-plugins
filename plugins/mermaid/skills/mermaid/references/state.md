# state — lifecycle / status machine

**Use when** a single thing moves between named statuses over its life: a document (draft → review → published), a support ticket, an order, an agent task. Use `stateDiagram-v2` (newer renderer, better layout).

## Canonical template

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontSize':'14px','textColor':'#111','primaryTextColor':'#111','primaryColor':'#d7f0d0','primaryBorderColor':'#2f7d32','lineColor':'#888'}}}%%
stateDiagram-v2
  [*] --> Draft
  Draft --> Review: submit
  Review --> Approved: pass
  Review --> Rejected: fail
  Approved --> Published: publish
  Published --> [*]
  Rejected --> [*]
```

## Composite (nested) states

```mermaid
%%{init: {'theme':'base','themeVariables':{'textColor':'#111','primaryTextColor':'#111','primaryColor':'#d7f0d0','primaryBorderColor':'#2f7d32','lineColor':'#888'}}}%%
stateDiagram-v2
  [*] --> Active
  state Active {
    [*] --> Idle
    Idle --> Running: start
    Running --> Idle: pause
  }
  Active --> Done: finish
  Done --> [*]
```

## Gotchas

- `[*]` is the start/end pseudo-state. Transition labels go after `:`.
- State **names** can't contain spaces directly — use an alias: `state "Long name" as S1`, then transition on `S1`.
- For choice/branch points: `state c <<choice>>` then `c --> A: cond1` / `c --> B: cond2`.
- `direction LR` (top of the diagram body) flips orientation if it grows too tall.
- No `classDef`-style colouring is needed for most state diagrams; the contrast header is enough. To colour a state: `classDef done fill:#d7f0d0,color:#111` then `class Published done`.
