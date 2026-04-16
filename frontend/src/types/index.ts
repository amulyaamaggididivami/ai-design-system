import type { ReactNode } from 'react';

export type VisualizationFrameProps = {
  className?: string;
};

export type VizRow = {
  id?: string;
  vendor: string;
  pricing?: number;
};

export type PointPair = [string, string | number];

export type MiniBarRow = [string, number, string];

export type SankeyNodeData = {
  id: string;
  name: string;
  valueLabel?: string;
};

export type SankeyLinkData = {
  source: string;
  target: string;
  value: number;
};

export type SeriesChartColors = {
  axisLine?: string;
  line?: string;
  areaFill?: string;
  point?: string;
};

export type BarChartColors = {
  axisLine?: string;
  bars?: string[];
  valueLabel?: string;
};

export type PieChartColors = {
  slices?: string[];
};

export type TrendChartColors = {
  axisLine?: string;
  line?: string;
  point?: string;
};

export type SankeyChartColors = {
  links?: string;
  activeLinks?: string;
  nodes?: string[];
  activeNodes?: string;
};

export type BarChartProps = {
  rows?: VizRow[];
  colors?: BarChartColors;
} & VisualizationFrameProps;

export type LineChartProps = {
  rows?: VizRow[];
  colors?: SeriesChartColors;
} & VisualizationFrameProps;

export type AreaChartProps = {
  rows?: VizRow[];
  colors?: SeriesChartColors;
} & VisualizationFrameProps;

export type PieChartProps = {
  rows?: VizRow[];
  variant: 'pie' | 'donut';
  colors?: PieChartColors;
} & VisualizationFrameProps;

export type DonutChartProps = {
  rows?: VizRow[];
  colors?: PieChartColors;
} & VisualizationFrameProps;

export type MiniBarsProps = {
  rows?: MiniBarRow[];
  colors?: PieChartColors;
} & VisualizationFrameProps;

export type ProcessSankeyProps = {
  selectedEntity?: string | null;
  colors?: SankeyChartColors;
} & VisualizationFrameProps;

export type RankingSankeyProps = {
  rows?: VizRow[];
  colors?: SankeyChartColors;
} & VisualizationFrameProps;

export type SankeySvgProps = {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
  width?: number;
  height?: number;
  ariaLabel: string;
  selectedEntity?: string | null;
  colors?: SankeyChartColors;
} & VisualizationFrameProps;

export type SeriesChartProps = {
  rows?: VizRow[];
  variant: 'line' | 'area';
  colors?: SeriesChartColors;
} & VisualizationFrameProps;

export type TrendChartProps = {
  points?: PointPair[];
  colors?: TrendChartColors;
} & VisualizationFrameProps;

export type ChartFrameProps = {
  children: ReactNode;
  className?: string;
};

export type BaseVisualizationConfig =
  | {
      type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'sankey';
      rows: VizRow[];
    }
  | {
      type: 'flow';
      selectedEntity?: string | null;
    }
  | {
      type: 'trend';
      points: PointPair[];
    }
  | {
      type: 'mini-bars';
      rows: MiniBarRow[];
    }
  | { type: 'stacked-horizontal-bar-chart'; data: ContractData }
  | { type: 'multi-metric-constellation-chart'; items: ContractorRow[] }
  | { type: 'progress-race-chart'; items: ContractorRow[] }
  | { type: 'hub-and-spoke-radial-chart'; segments: EWStatusRow[]; title?: string }
  | { type: 'dot-matrix-chart'; items: EWCategoryRow[]; title?: string }
  | { type: 'ranked-card-leaderboard'; items: EWOpenContractorRow[]; title?: string }
  | { type: 'proportional-band-chart'; severities: EWSeverityRow[]; title?: string }
  | { type: 'radial-fan-tree-chart'; total: number; items: NCEContractorRow[] }
  | { type: 'semi-circular-gauge-chart'; value: number; confirmed: number; total: number }
  | { type: 'segmented-split-bar-chart'; items: VariationRow[] }
  | { type: 'balance-scale-chart'; left: QuotationSide; right: QuotationSide }
  | { type: 'area-line-chart'; points: QuotationTrendPoint[] }
  | { type: 'trend-view'; points: QuotationTrendPoint[] }
  | { type: 'weekly-flow'; items: ContractorRow[] };

export type VisualizationRendererProps = {
  config: BaseVisualizationConfig;
  className?: string;
};

// ─── Contract Management Dashboard Types ─────────────────────────────────────

export type ContractorRow = {
  id: string;
  name: string;
  abbreviation?: string;
  base?: number;
  variation?: number;
  total?: number;
  percentage?: number;
};

export type ContractData = {
  items: (ContractorRow | number | null)[];
  totals?: { base?: number; variation?: number; total?: number } | null;
};

export type EWStatusRow = { status: string; count: number };
export type EWCategoryRow = { category: string; fullName: string; count: number };
export type EWSeverityRow = { severity: string; count: number };
export type EWOpenContractorRow = { id: string; name: string; abbreviation?: string; count?: number };

export type NCEContractorRow = { id: string; name: string; abbreviation?: string; count?: number };
export type NCECompensationData = { total: number; confirmed: number; pctConfirmed: number };

export type VariationRow = {
  id: string;
  name: string;
  abbreviation?: string;
  implemented?: number;
  unimplemented?: number;
};

export type QuotationSide = { value: number; count: number; label: string };
export type QuotationSummary = { left: QuotationSide; right: QuotationSide };
export type QuotationTrendPoint = { week: string; count: number; value: number };

// ─── Key Highlights Types ────────────────────────────────────────────────────

export type KeyHighlightChip = { value: string; label: string; color?: string };
export type KeyHighlightBadge = { text: string; severity: 'red' | 'amber' | 'green' };
export type KeyHighlightDot = { val: number; color?: string; name: string };
export type FlagsListRow = { text: string; tag: string; date: string; severity: 'red' | 'amber' | 'green' };
export type ComparisonRow = { label: string; cells: string[]; color?: string };

export type ScorecardRow = {
  name: string;
  value: string;
  pct: number;        // 0–100, drives the inline bar width
  color?: string;
  badge?: string;
  badgeSeverity?: 'green' | 'amber' | 'red';
  sublabel?: string;
};

export type KeyHighlightBlock =
  | { type: 'stats';           items: Array<{ value: string; label: string; color?: string }>; takeaway?: string }
  | { type: 'chips';           items: KeyHighlightChip[]; takeaway?: string }
  | { type: 'ranked';          items: Array<{ name: string; value: string; color?: string; kpiLabel?: string }>; takeaway?: string }
  | { type: 'proportion';      leftPct: number; leftLabel: string; leftValue: string; leftColor?: string; rightPct: number; rightLabel: string; rightValue: string; rightColor?: string; chips?: KeyHighlightChip[]; takeaway?: string }
  | { type: 'ring';            pct: number; label: string; color?: string; chips?: KeyHighlightChip[]; takeaway?: string }
  | { type: 'badges';          items: KeyHighlightBadge[]; textSize?: number; takeaway?: string }
  | { type: 'dot-strip';       min: number; max: number; unit: string; dots: KeyHighlightDot[]; chips?: KeyHighlightChip[]; takeaway?: string }
  | { type: 'scorecard-rows';  items: ScorecardRow[]; takeaway?: string }
  | { type: 'flags-list';      items: FlagsListRow[]; takeaway?: string }
  | { type: 'comparison-rows'; columns: string[]; rows: ComparisonRow[]; takeaway?: string };

// ─── Dual-Segment Horizontal Bar Chart Types ─────────────────────────────────

export type DualSegmentBarRow = {
  id: string;
  name: string;
  primaryValue?: number;    // First segment value (optional — row is skipped if missing/invalid)
  secondaryValue?: number;  // Second segment value (optional)
};

// ─── Narrative Chain Types ──────────────────────────────────────────────────

export type NarrativeStep = {
  id: string;
  questionText: string;
  title: string;
  insight: string;
  vizConfigs: BaseVisualizationConfig[];
  followupIds: string[];
  keyInsights: string[];
  keyHighlights?: KeyHighlightBlock;
};
