// ─── Core colours ─────────────────────────────────────────────────────────────
export const colors = {
  bg:          '#0C0E12',
  bgSoft:      '#0C1420',
  panel:       'rgba(7, 12, 23, 0.94)',
  panelStrong: 'rgba(10, 16, 29, 0.98)',
  line:        'rgba(109, 123, 156, 0.12)',
  lineStrong:  'rgba(109, 123, 156, 0.2)',
  text:        '#F7F7F7',
  muted:       '#94979C',
  mutedSoft:   'rgba(156, 163, 175, 0.9)',
  blue:        '#5c83ff',
  teal:        '#29cfd6',
  tealSoft:    'rgba(41, 207, 214, 0.14)',
  gold:        '#9eb2ff',
  goldSoft:    'rgba(158, 178, 255, 0.12)',
  red:         '#95a0b8',
  yellow:      '#cfd7e6',
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const shadows = {
  sm: '0 12px 30px rgba(0, 0, 0, 0.24)',
  md: '0 22px 54px rgba(0, 0, 0, 0.30)',
  lg: '0 28px 78px rgba(0, 0, 0, 0.36)',
} as const;

// ─── Radii ────────────────────────────────────────────────────────────────────
export const radius = {
  xl: '28px',
  lg: '22px',
  md: '18px',
  sm: '14px',
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
export const layout = {
  sidebarCollapsed: '74px',
  sidebarExpanded:  '232px',
  insightsWidth:    'min(420px, 34vw)',
  canvasMax:        '1240px',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  sans:  '"Satoshi", "Manrope", "Segoe UI", sans-serif',
  serif: '"Satoshi", "Manrope", "Segoe UI", sans-serif',
  mono:  '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
} as const;

// ─── Easing ───────────────────────────────────────────────────────────────────
export const easing = {
  default: 'cubic-bezier(.22, 1, .36, 1)',
} as const;

// ─── Tone palette  (CSS .tone-0 … .tone-5) ────────────────────────────────────
export const tonePalette = [
  '#6bbcff', // 0 – blue
  '#5fe6dd', // 1 – teal
  '#d7bc6d', // 2 – gold
  '#95a9ff', // 3 – lavender
  '#7fb58a', // 4 – green
  '#ee8a8a', // 5 – red
] as const;

// ─── Canvas colour constants (CC) ─────────────────────────────────────────────
export const CC = {
  bg:      '#0C0E12',
  bgL:     '#0C1420',
  bgDeep:  '#070B12',  // deeper background used by some chart containers
  sf:      '#13161B',
  bd:      '#22262F',
  blue:    '#4C93D9',
  cyan:    '#36BFFA',
  orange:  '#EC772A',
  red:     '#EC772A',
  green:   '#5DA537',
  purple:  '#818FF8',
  amber:   '#EEBF3B',
  t1:      '#F7F9FA',
  t2:      '#B3B5B6',
  t3:      '#94979C',
  t4:      '#334155',
} as const;

// ─── Status / badge colours ───────────────────────────────────────────────────
export const statusColors = {
  positive:     '#34D399',
  positiveBg:   '#34D39918',
  warning:      '#FBBF24',
  warningBg:    '#FBBF2418',
  negative:     '#F06060',
  negativeBg:   '#F0606018',
  toggleActive: '#71B941',
} as const;

// ─── Canvas palette ───────────────────────────────────────────────────────────
export const PALETTE = [CC.blue, CC.amber, CC.purple, CC.green, CC.red] as const;

// ─── Chart component palette ──────────────────────────────────────────────────
export const chartPalette = [
  '#4C93D9', '#5DA537', '#F3862C', '#4F72C6',
  '#A0B724', '#EEBF3B', '#3C45D1',
] as const;

// ─── Canvas font-family strings ───────────────────────────────────────────────
// Use these when setting fontFamily in React inline styles or canvas ctx.font.
export const CANVAS_SANS = "'Satoshi Variable', 'DM Sans', sans-serif";
export const CANVAS_MONO = "'JetBrains Mono', monospace";

// ─── Canvas typography tokens ─────────────────────────────────────────────────
export const AXIS_LABEL = {
  font:          `400 16px ${CANVAS_SANS}`,
  color:         CC.t1,
  letterSpacing: '0px',
} as const;

export const CHART_VALUE = {
  font:  `500 16px ${CANVAS_SANS}`,
  color: CC.t1,
} as const;

export const LEGEND_LABEL = {
  font:          `400 18px ${CANVAS_SANS}`,
  color:         CC.t2,
  letterSpacing: '0px',
} as const;

// Mono font sizes used across chart canvas drawing
export const MONO_SM      = { font: `9px ${CANVAS_MONO}` }  as const;
export const MONO_SM_BOLD = { font: `bold 9px ${CANVAS_MONO}` } as const;
export const MONO_MD      = { font: `10px ${CANVAS_MONO}` } as const;
export const MONO_MD_BOLD = { font: `bold 10px ${CANVAS_MONO}` } as const;
export const MONO_LG_BOLD = { font: `bold 12px ${CANVAS_MONO}` } as const;

// Satoshi Variable sizes used for chart display values
export const DISPLAY_MD = { font: `500 24px ${CANVAS_SANS}`, color: CC.t1 } as const;
export const SANS_SM    = { font: `400 12px ${CANVAS_SANS}`, color: CC.t2 } as const;
export const SANS_LG    = { font: `12px 'DM Sans', sans-serif` }            as const;

// ─── Chart/D3 derived tokens ──────────────────────────────────────────────────
// Opacity variants of base colours used exclusively in chart CSS classes.
export const chartTokens = {
  lineStroke:       'rgba(92, 131, 255, 0.96)',   // --blue at 96 %
  trendStroke:      'rgba(41, 207, 214, 0.92)',   // --teal at 92 %
  areaFill:         'rgba(41, 207, 214, 0.20)',   // --teal at 20 %
  pointStroke:      'rgba(5, 9, 20, 0.96)',       // near-bg
  trendPointStroke: 'rgba(5, 9, 20, 0.90)',
  axisStroke:       'rgba(148, 163, 184, 0.24)',
  axisStrokeMuted:  'rgba(148, 163, 184, 0.14)',
  labelFill:        'rgba(245, 247, 251, 0.72)',
  valueFill:        '#f5f7fb',
  valueDim:         'rgba(245, 247, 251, 0.68)',
  border:           'rgba(255, 255, 255, 0.08)',
  borderSubtle:     'rgba(255, 255, 255, 0.12)',
  bgStart:          'rgba(9, 15, 26, 0.92)',
  bgEnd:            'rgba(12, 20, 32, 0.88)',
  bgInset:          'rgba(255, 255, 255, 0.03)',
  miniTrackFill:    'rgba(255, 255, 255, 0.08)',
  sankeyLink:       'rgba(107, 188, 255, 0.28)',  // tone-0 at 28 %
  sankeyLinkActive: 'rgba(95, 230, 221, 0.56)',   // tone-1 at 56 %
  sankeyNode:       'rgba(92, 131, 255, 0.86)',   // --blue at 86 %
  sankeyNodeActive: 'rgba(95, 230, 221, 0.92)',   // tone-1 at 92 %
} as const;

// ─── CSS custom property injection ────────────────────────────────────────────
// Call once at app startup (before React renders) to drive all CSS vars from
// the token objects above. Changing any value here and calling applyTheme()
// again will update the entire application.
export function applyTheme(): void {
  const s = document.documentElement.style;

  // Core colours
  s.setProperty('--bg',           colors.bg);
  s.setProperty('--bg-soft',      colors.bgSoft);
  s.setProperty('--panel',        colors.panel);
  s.setProperty('--panel-strong', colors.panelStrong);
  s.setProperty('--line',         colors.line);
  s.setProperty('--line-strong',  colors.lineStrong);
  s.setProperty('--text',         colors.text);
  s.setProperty('--muted',        colors.muted);
  s.setProperty('--muted-soft',   colors.mutedSoft);
  s.setProperty('--blue',         colors.blue);
  s.setProperty('--teal',         colors.teal);
  s.setProperty('--teal-soft',    colors.tealSoft);
  s.setProperty('--gold',         colors.gold);
  s.setProperty('--gold-soft',    colors.goldSoft);
  s.setProperty('--red',          colors.red);
  s.setProperty('--yellow',       colors.yellow);

  // Shadows
  s.setProperty('--shadow-sm', shadows.sm);
  s.setProperty('--shadow-md', shadows.md);
  s.setProperty('--shadow-lg', shadows.lg);

  // Radii
  s.setProperty('--radius-xl', radius.xl);
  s.setProperty('--radius-lg', radius.lg);
  s.setProperty('--radius-md', radius.md);
  s.setProperty('--radius-sm', radius.sm);

  // Layout
  s.setProperty('--sidebar-collapsed', layout.sidebarCollapsed);
  s.setProperty('--sidebar-expanded',  layout.sidebarExpanded);
  s.setProperty('--insights-width',    layout.insightsWidth);
  s.setProperty('--canvas-max',        layout.canvasMax);

  // Typography
  s.setProperty('--sans',  typography.sans);
  s.setProperty('--serif', typography.serif);
  s.setProperty('--mono',  typography.mono);

  // Easing
  s.setProperty('--ease', easing.default);

  // Tone palette
  tonePalette.forEach((color, i) => {
    s.setProperty(`--tone-${i}`, color);
  });

  // Chart / D3 derived tokens
  s.setProperty('--chart-line-stroke',        chartTokens.lineStroke);
  s.setProperty('--chart-trend-stroke',       chartTokens.trendStroke);
  s.setProperty('--chart-area-fill',          chartTokens.areaFill);
  s.setProperty('--chart-point-stroke',       chartTokens.pointStroke);
  s.setProperty('--chart-trend-point-stroke', chartTokens.trendPointStroke);
  s.setProperty('--chart-axis-stroke',        chartTokens.axisStroke);
  s.setProperty('--chart-axis-muted',         chartTokens.axisStrokeMuted);
  s.setProperty('--chart-label-fill',         chartTokens.labelFill);
  s.setProperty('--chart-value-fill',         chartTokens.valueFill);
  s.setProperty('--chart-value-dim',          chartTokens.valueDim);
  s.setProperty('--chart-border',             chartTokens.border);
  s.setProperty('--chart-border-subtle',      chartTokens.borderSubtle);
  s.setProperty('--chart-bg-start',           chartTokens.bgStart);
  s.setProperty('--chart-bg-end',             chartTokens.bgEnd);
  s.setProperty('--chart-bg-inset',           chartTokens.bgInset);
  s.setProperty('--chart-mini-track',         chartTokens.miniTrackFill);
  s.setProperty('--sankey-link',              chartTokens.sankeyLink);
  s.setProperty('--sankey-link-active',       chartTokens.sankeyLinkActive);
  s.setProperty('--sankey-node',              chartTokens.sankeyNode);
  s.setProperty('--sankey-node-active',       chartTokens.sankeyNodeActive);
}
