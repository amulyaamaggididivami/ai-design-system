# @divami_artefacts/ai-design-system

A React component library of data visualization widgets — charts, sankey diagrams, highlights, and a universal `VisualizationRenderer` — built with Vite and TypeScript.

---

## Installation

```bash
npm install @divami_artefacts/ai-design-system
```

### Peer dependencies

Make sure your project has these installed:

```bash
npm install react react-dom
```

---

## Setup

Import the stylesheet once in your app entry (e.g. `main.tsx`):

```ts
import '@divami_artefacts/ai-design-system/styles';
```

---

## Components

### `VisualizationRenderer` — Universal renderer

The easiest way to render any chart. Pass a typed `config` object and it picks the right component automatically.

```tsx
import { VisualizationRenderer } from '@divami_artefacts/ai-design-system';

// Bar / Line / Area / Pie / Donut
<VisualizationRenderer config={{ type: 'bar', rows: [{ vendor: 'Alpha', pricing: 120 }] }} />
<VisualizationRenderer config={{ type: 'line', rows: [{ vendor: 'Q1', pricing: 80 }] }} />
<VisualizationRenderer config={{ type: 'area', rows: [{ vendor: 'Q1', pricing: 80 }] }} />
<VisualizationRenderer config={{ type: 'pie',  rows: [{ vendor: 'Alpha', pricing: 40 }] }} />
<VisualizationRenderer config={{ type: 'donut', rows: [{ vendor: 'Alpha', pricing: 40 }] }} />

// Trend sparkline
<VisualizationRenderer config={{ type: 'trend', points: [['Jan', 10], ['Feb', 20]] }} />

// Mini bars
<VisualizationRenderer config={{ type: 'mini-bars', rows: [['Alpha', 80, '#4f8ef7']] }} />

// Sankey (ranked)
<VisualizationRenderer config={{ type: 'sankey', rows: [{ vendor: 'Alpha', pricing: 120 }] }} />

// Causal flow sankey
<VisualizationRenderer config={{ type: 'flow', selectedEntity: 'Alpha' }} />

// Optional className for sizing
<VisualizationRenderer config={{ type: 'bar', rows: [] }} className="h-64 w-full" />
```

**`config` type reference:**

| `type`              | Required fields                                              |
| ------------------- | ------------------------------------------------------------ |
| `line / area / bar / pie / donut / sankey` | `rows: VizRow[]`                     |
| `trend`             | `points: PointPair[]`                                        |
| `mini-bars`         | `rows: MiniBarRow[]`                                         |
| `flow`              | `selectedEntity?: string \| null`                           |
| `contract-value-orb` | `data: ContractData`                                        |
| `contract-bars`     | `contractors: ContractorRow[]`                               |
| `commitment-race`   | `contractors: ContractorRow[]`                               |
| `status-arc`        | `segments: EWStatusRow[]; title?: string`                    |
| `ew-category`       | `categories: EWCategoryRow[]; title?: string`                |
| `contractor-rank`   | `contractors: EWOpenContractorRow[]; title?: string`         |
| `severity-bands`    | `severities: EWSeverityRow[]; title?: string`                |
| `nce-tree`          | `total: number; byContractor: NCEContractorRow[]`            |
| `compensation-gauge` | `pct: number; confirmed: number; total: number`             |
| `variation-split`   | `contractors: VariationRow[]`                                |
| `quotation-balance` | `accepted: QuotationSide; submitted: QuotationSide`          |
| `quotation-trend`   | `trend: QuotationTrendPoint[]`                               |
| `weekly-flow`       | `contractors: ContractorRow[]`                               |

---

### `BarChart`

```tsx
import { BarChart } from '@divami_artefacts/ai-design-system';

<BarChart
  rows={[
    { vendor: 'Alpha Corp', pricing: 120 },
    { vendor: 'Beta Ltd',   pricing: 85 },
  ]}
  colors={{ bars: ['#4f8ef7', '#a78bfa'], axisLine: '#e5e7eb' }}
  className="h-48"
/>
```

| Prop        | Type              | Description                     |
| ----------- | ----------------- | ------------------------------- |
| `rows`      | `VizRow[]`        | Data rows `{ vendor, pricing }` |
| `colors`    | `BarChartColors`  | Optional color overrides        |
| `className` | `string`          | CSS class for sizing            |

---

### `LineChart` / `AreaChart`

```tsx
import { LineChart, AreaChart } from '@divami_artefacts/ai-design-system';

<LineChart rows={[{ vendor: 'Jan', pricing: 40 }, { vendor: 'Feb', pricing: 60 }]} />
<AreaChart rows={[{ vendor: 'Jan', pricing: 40 }, { vendor: 'Feb', pricing: 60 }]} />
```

| Prop     | Type                 | Description              |
| -------- | -------------------- | ------------------------ |
| `rows`   | `VizRow[]`           | Data rows                |
| `colors` | `SeriesChartColors`  | `line`, `areaFill`, etc. |

---

### `PieChart` / `DonutChart`

```tsx
import { PieChart, DonutChart } from '@divami_artefacts/ai-design-system';

<PieChart   variant="pie"   rows={[{ vendor: 'A', pricing: 60 }, { vendor: 'B', pricing: 40 }]} />
<DonutChart rows={[{ vendor: 'A', pricing: 60 }, { vendor: 'B', pricing: 40 }]} />
```

---

### `TrendChart`

Sparkline-style trend line.

```tsx
import { TrendChart } from '@divami_artefacts/ai-design-system';

<TrendChart
  points={[['Week 1', 10], ['Week 2', 18], ['Week 3', 14], ['Week 4', 22]]}
  colors={{ line: '#4f8ef7', point: '#fff' }}
/>
```

---

### `MiniBars`

Compact horizontal bar list.

```tsx
import { MiniBars } from '@divami_artefacts/ai-design-system';

// MiniBarRow = [label, value, color]
<MiniBars rows={[
  ['Alpha', 80, '#4f8ef7'],
  ['Beta',  55, '#a78bfa'],
]} />
```

---

### `ProcessSankey` / `RankingSankey` / `SankeySvg`

```tsx
import { ProcessSankey, RankingSankey, SankeySvg } from '@divami_artefacts/ai-design-system';

// Flow sankey driven by an entity selection
<ProcessSankey selectedEntity="Alpha Corp" />

// Ranked sankey from VizRow data
<RankingSankey rows={[{ vendor: 'Alpha', pricing: 120 }]} />

// Raw SVG sankey with full node/link control
<SankeySvg
  ariaLabel="Project cost flow"
  nodes={[{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }]}
  links={[{ source: 'a', target: 'b', value: 100 }]}
  width={600}
  height={400}
/>
```

---

### `SeriesChart`

Combined line/area chart with a `variant` prop.

```tsx
import { SeriesChart } from '@divami_artefacts/ai-design-system';

<SeriesChart variant="line" rows={[{ vendor: 'Jan', pricing: 50 }]} />
<SeriesChart variant="area" rows={[{ vendor: 'Jan', pricing: 50 }]} />
```

---

### `KeyHighlights`

Renders a rich highlight block — supports stat chips, badges, dots, flags, comparison tables, and scorecards.

```tsx
import { KeyHighlights } from '@divami_artefacts/ai-design-system';
import type { KeyHighlightBlock } from '@divami_artefacts/ai-design-system';

const block: KeyHighlightBlock = {
  type: 'stat',
  title: 'Total Contracts',
  value: '142',
  chips: [
    { value: '+12', label: 'this month', color: 'green' },
  ],
};

<KeyHighlights block={block} />
```

---

### `ChartFrame`

A simple wrapper that provides consistent padding/sizing for any custom chart content.

```tsx
import { ChartFrame } from '@divami_artefacts/ai-design-system';

<ChartFrame className="h-64">
  <p>Custom content</p>
</ChartFrame>
```

---

## Utility Functions

### `hydrateVisualizationMounts`

Renders `VisualizationRenderer` into all DOM elements that have a `data-visualization` attribute — useful for server-rendered or CMS pages.

```ts
import { hydrateVisualizationMounts } from '@divami_artefacts/ai-design-system';

// Call after the DOM is ready
hydrateVisualizationMounts();
```

Add to your HTML:

```html
<div data-visualization='{"type":"bar","rows":[{"vendor":"Alpha","pricing":100}]}'></div>
```

### `serializeVisualizationConfig`

Safely serializes a config object into a `data-visualization` attribute string.

```ts
import { serializeVisualizationConfig } from '@divami_artefacts/ai-design-system';

const attr = serializeVisualizationConfig({ type: 'bar', rows: [] });
// → '{"type":"bar","rows":[]}'
```

### `cleanupVisualizationMounts`

Unmounts all hydrated visualization roots. Call before navigating away or on component unmount.

```ts
import { cleanupVisualizationMounts } from '@divami_artefacts/ai-design-system';

cleanupVisualizationMounts();
```

---

## Type Exports

All shared types are re-exported for use in consuming projects:

```ts
import type {
  BaseVisualizationConfig,
  VizRow,
  PointPair,
  MiniBarRow,
  SankeyNodeData,
  SankeyLinkData,
  KeyHighlightBlock,
} from '@divami_artefacts/ai-design-system';
```

---

## Building the library

```bash
npm run build:lib   # outputs to dist/
npm pack            # creates .tgz for distribution
```

---

## License

MIT © Divami Design Labs


