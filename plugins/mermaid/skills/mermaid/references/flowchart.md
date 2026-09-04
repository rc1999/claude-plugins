# flowchart — components, layers, architecture

**Use when** showing structure: components and how they relate, a layered/system architecture, a build-vs-buy map, a decision tree, a one-to-many fan-out. NOT for time-ordered message flows (use sequence).

## Canonical template — layered architecture

`flowchart TB` outside, `direction LR` inside each subgraph → each layer is a horizontal band, layers stack top-to-bottom. Independent layers chained with `~~~` so they don't spread sideways.

```mermaid
%%{init: {'theme':'base','themeCSS':'.nodeLabel,.nodeLabel p,.edgeLabel,.edgeLabel p,.cluster-label,.cluster-label p,.node .label{color:#111 !important}','themeVariables':{'fontSize':'14px','textColor':'#111','primaryTextColor':'#111','primaryColor':'#eaf2ff','primaryBorderColor':'#3b6fb0','lineColor':'#888','titleColor':'#111','clusterBkg':'#f7f8fa','clusterBorder':'#cccccc'}}}%%
flowchart TB
  classDef own    fill:#d7f0d0,stroke:#2f7d32,color:#13431a;
  classDef shared fill:#d4e4fb,stroke:#2858a8,color:#15315f;
  classDef third  fill:#ffe9b8,stroke:#b8721d,color:#5e3a0a;
  classDef ext    fill:#e7e7e7,stroke:#6f6f6f,color:#2b2b2b;
  classDef future fill:#ffffff,stroke:#b8721d,stroke-dasharray:4,color:#5e3a0a;

  subgraph L1["1 · Client surface"]
    direction LR
    A["Browsers<br/>+ mobile"]:::ext --> B["API gateway"]:::own
  end
  subgraph L2["2 · Application services"]
    direction LR
    C["Orders service"]:::own --> D["Inventory service"]:::own
  end
  subgraph L3["3 · External services"]
    direction LR
    E["Analytics API"]:::third
    F["Email / SMS"]:::ext
  end
  SEAM["Recommendations<br/>Phase 2"]:::future

  B --> C
  D --> E
  D --> F
  C -.-> SEAM
  L1 ~~~ L2 ~~~ L3
```

## Simple fan-out (one-to-many)

```mermaid
%%{init: {'theme':'base','themeCSS':'.nodeLabel,.nodeLabel p,.edgeLabel,.edgeLabel p,.cluster-label,.cluster-label p,.node .label{color:#111 !important}','themeVariables':{'fontSize':'14px','textColor':'#111','primaryTextColor':'#111','primaryColor':'#eaf2ff','primaryBorderColor':'#3b6fb0','lineColor':'#888'}}}%%
flowchart LR
  classDef own fill:#d7f0d0,stroke:#2f7d32,color:#13431a;
  classDef ext fill:#e7e7e7,stroke:#6f6f6f,color:#2b2b2b;
  IN["Requests in"]:::ext --> SPLIT["Dispatcher"]:::own
  SPLIT --> A["Worker A"]:::ext
  SPLIT --> B["Worker B"]:::ext
  SPLIT --> C["Worker C"]:::ext
  A --> OUT["Merged result"]:::own
  B --> OUT
  C --> OUT
```

## Gotchas

- **Too wide?** Independent subgraphs spread sideways. Chain with `G1 ~~~ G2 ~~~ G3` to stack vertically; or switch `TB`↔`LR`.
- **Hairball?** Drop edges that only restate subgraph membership. Order subgraphs to match flow.
- **Edge labels:** `A -->|label text| B` — plain text, no quotes, avoid `/` `()` in the label.
- **Subgraph titles + edge labels read grey on a light-text host page** (a dark-themed doc site whose CSS sets `p{color:light}`) — they're htmlLabels that inherit the host color, and the contrast header's theme vars only reach SVG text, so the header alone does **not** fix them. The `themeCSS` in the template (label-scoped `color`) does; keep it. `classDef … color:` covers node labels but not titles/edge labels. See `render-verify.md`.
- Node ids must avoid reserved words (`end`, `class`, `state`, `style`, `direction`, …). Label can be anything (quoted).
