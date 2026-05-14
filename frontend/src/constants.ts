import type { SankeyLinkData, SankeyNodeData } from './types';

export const CHART_TYPE = {
  LINE: 'line',
  AREA: 'area',
  BAR: 'bar',
  PIE: 'pie',
  DONUT: 'donut',
  SANKEY: 'sankey',
  FLOW: 'flow',
  TREND: 'trend',
  MINI_BARS: 'mini-bars',
  STACKED_HORIZONTAL_BAR: 'stacked-horizontal-bar-chart',
  MULTI_METRIC_CONSTELLATION: 'multi-metric-constellation-chart',
  PROGRESS_RACE: 'progress-race-chart',
  HUB_AND_SPOKE_RADIAL: 'hub-and-spoke-radial-chart',
  DOT_MATRIX: 'dot-matrix-chart',
  RANKED_CARD_LEADERBOARD: 'ranked-card-leaderboard',
  PROPORTIONAL_BAND: 'proportional-band-chart',
  RADIAL_FAN_TREE: 'radial-fan-tree-chart',
  SEMI_CIRCULAR_GAUGE: 'semi-circular-gauge-chart',
  SEGMENTED_SPLIT_BAR: 'segmented-split-bar-chart',
  BALANCE_SCALE: 'balance-scale-chart',
  AREA_LINE: 'area-line-chart',
  TREND_VIEW: 'trend-view',
  WEEKLY_FLOW: 'weekly-flow',
  HORIZONTAL_BAR: 'horizontal-bar-chart',
} as const;

// export const palette = ['#6bbcff', '#5fe6dd', '#d7bc6d', '#95a9ff', '#7fb58a', '#ee8a8a'];
export const palette = ['#4C93D9', '#5DA537', '#F3862C', '#4F72C6', '#A0B724', '#EEBF3B', '#3C45D1'];

export const flowGraph: {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
} = {
  nodes: [
    { id: 'supplier-x', name: 'Supplier X', valueLabel: 'Si +0.12%' },
    { id: 'bf3-superheat', name: 'BF-3 Superheat', valueLabel: '22°C (target 34)' },
    { id: 'ccm3-solidification', name: 'CCM-3 Solidification', valueLabel: 'Rate deviation' },
    { id: 'grade-risk', name: 'Grade Risk', valueLabel: 'Automotive 74%' }
  ],
  links: [
    { source: 'supplier-x', target: 'bf3-superheat', value: 92 },
    { source: 'bf3-superheat', target: 'ccm3-solidification', value: 87 },
    { source: 'ccm3-solidification', target: 'grade-risk', value: 74 }
  ]
};
