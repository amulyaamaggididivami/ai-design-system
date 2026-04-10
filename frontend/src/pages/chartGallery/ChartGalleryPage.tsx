import { useEffect } from 'react';

import { KeyHighlights } from '../../components/keyHighlights/KeyHighlights';
import { Trend } from '../../components/trend/Trend';
import { VisualizationRenderer } from '../../components/visualizationRenderer/VisualizationRenderer';
import type { KeyHighlightBlock } from '../../types';

// ─── Group 1: Generic chart mock data ────────────────────────────────────────

/** bar / line / area / pie / donut / sankey */
const vizRows = [
  { id: 'a', vendor: 'Acme Corp',    pricing: 82 },
  { id: 'b', vendor: 'BuildRight',   pricing: 64 },
  { id: 'c', vendor: 'CostCo Build', pricing: 47 },
  { id: 'd', vendor: 'DeltaWork',    pricing: 91 },
  { id: 'e', vendor: 'EdgeWorks',    pricing: 73 },
];

/** trend — [label, value][] */
const trendPoints: [string, number][] = [
  ["Feb 2025", 3], ["Mar 2025", 2], ["Apr 2025", 15], ["May 2025", 12], ["Jun 2025", 35], ["Jul 2025", 24], ["Aug 2025", 12], ["Sep 2025", 30], ["Oct 2025", 15], ["Nov 2025", 12], ["Dec 2025", 11], ["Jan 2026", 18], ["Feb 2026", 16], ["Mar 2026", 16]
];
/** mini-bars — [label, value, color][] */
const miniBarsRows: [string, number, string][] = [
  ['Acme',   82, '#6366f1'],
  ['Build',  64, '#22d3ee'],
  ['CostCo', 47, '#f59e0b'],
  ['Delta',  91, '#10b981'],
  ['Edge',   73, '#e879f9'],
];

// ─── Group 2: Domain-specific chart mock data ─────────────────────────────────

/**
 * Q1 — contract-value-orb
 * Horizontal bars: base (solid) + variation (lighter) per entity.
 * ContractorRow: { id, name, abbreviation?, base?, variation?, total?, percentage? }
 * totals: { base?, variation?, total? } — shown as "Portfolio: £xM" in legend
 */
const contractValueData = {
  contractors: [
    { id: 'c1', name: 'Tata Projects',        base: 142, variation: 18.4, total: 160.4, percentage: 87 },
    { id: 'c2', name: 'L&T Construction',     base: 198, variation: 12.6, total: 210.6, percentage: 92 },
    { id: 'c3', name: 'Afcons Infra',      base: 89,  variation: 22.1, total: 111.1, percentage: 78 },
    { id: 'c4', name: 'NCC Ltd',             base: 156, variation: 8.9,  total: 164.9, percentage: 95 },
    { id: 'c5', name: 'KEC International',    base: 74,  variation: 31.2, total: 105.2, percentage: 69 },
    { id: 'c6', name: 'KEC International',    base: 142,  variation: 18.4, total: 160.4, percentage: 87 },
    { id: 'c7', name: 'KEC International',    base: 74,  variation: 31.2, total: 105.2, percentage: 69 },
    { id: 'c8', name: 'KEC International',    base: 74,  variation: 31.2, total: 105.2, percentage: 69 },
    { id: 'c9', name: 'KEC International',    base: 198,  variation: 12.6, total: 210.6, percentage: 92 },
    { id: 'c10', name: 'KEC International',    base: 74,  variation: 31.2, total: 105.2, percentage: 69 },
    { id: 'c11', name: 'KEC International',    base: 74,  variation: 31.2, total: 105.2, percentage: 69 },
    { id: 'c12', name: 'KEC International',    base: 74,  variation: 31.2, total: 105.2, percentage: 69 },
    { id: 'c13', name: 'KEC International',    base: 74,  variation: 31.2, total: 105.2, percentage: 69 },
    { id: 'c14', name: 'KEC International',    base: 74,  variation: 31.2, total: 105.2, percentage: 69 },
    

  ],
  totals: { base: 659, variation: 93.2, total: 752.2 },
};

/**
 * Q2 — contract-bars
 * Triangle KPI map per entity — same ContractorRow[] shape as above.
 * Each triangle vertex = base (top), variation (lower-right), percentage (lower-left).
 */
const contractBarsContractors = contractValueData.contractors;

/**
 * Q3 — commitment-race
 * Progress race — how far each entity is toward 100% commitment.
 * Same ContractorRow[] — only percentage and abbreviation are rendered.
 */
const commitmentRaceContractors = contractValueData.contractors;

/**
 * Q4 — status-arc
 * Arc/donut — EW status split.
 * EWStatusRow: { status: string, count: number }
 * title is optional — displayed above the arc.
 */
const statusArcSegments = [
  { status: 'Open',      count: 18 },
  { status: 'Submitted', count: 10 },
  { status: 'Closed',    count: 12 },
];

/**
 * Q5 — ew-category
 * Dot columns — each dot = one EW, grouped by category.
 * EWCategoryRow: { category: string (short), fullName: string, count: number }
 */
const ewCategories = [
  { category: 'Ground',     fullName: 'Ground Conditions', count: 12 },
  { category: 'Design',     fullName: 'Design Issues',     count: 8  },
  { category: 'Employer',   fullName: 'Employer Risk',     count: 7  },
  { category: 'Weather',    fullName: 'Weather Events',    count: 6  },
  { category: 'Regulatory', fullName: 'Regulatory',        count: 5  },
  { category: 'Other',      fullName: 'Other',             count: 2  },
];

/**
 * Q6 — contractor-rank
 * Ranked horizontal exposure bars — open count per entity.
 * EWOpenContractorRow: { id, name, abbreviation?, count? }
 */
const contractorRankContractors = [
  { id: 'c1', name: 'Tata Projects',     abbreviation: 'Tata',   count: 7 },
  { id: 'c3', name: 'Afcons Infra',      abbreviation: 'Afcons', count: 4 },
  { id: 'c2', name: 'L&T Construction',  abbreviation: 'L&T',    count: 3 },
  { id: 'c5', name: 'KEC International', abbreviation: 'KEC',    count: 2 },
  { id: 'c4', name: 'NCC Ltd',           abbreviation: 'NCC',    count: 2 },
];

/**
 * Q7 — severity-bands
 * Horizontal spectrum from Critical → Low.
 * EWSeverityRow: { severity: string, count: number }
 * Order matters — rendered left to right.
 */
const severityBands = [
  { severity: 'Critical', count: 5  },
  { severity: 'High',     count: 14 },
  { severity: 'Medium',   count: 13 },
  { severity: 'Low',      count: 8  },
];

/**
 * Q8 — nce-tree
 * Radial tree — branch thickness proportional to count per entity.
 * NCEContractorRow: { id, name, abbreviation?, count? }
 * total = sum of all counts (displayed at root).
 */
const nceTotal = 25;
const nceByContractorData = [
  { id: 'c1', name: 'Tata Projects',     abbreviation: 'Tata',   count: 8 },
  { id: 'c3', name: 'Afcons Infra',      abbreviation: 'Afcons', count: 6 },
  { id: 'c2', name: 'L&T Construction',  abbreviation: 'L&T',    count: 4 },
  { id: 'c4', name: 'NCC Ltd',           abbreviation: 'NCC',    count: 4 },
  { id: 'c5', name: 'KEC International', abbreviation: 'KEC',    count: 3 },
];

/**
 * Q9 — compensation-gauge
 * Needle gauge — pct sweeps needle, confirmed/total shown in centre.
 * pct: 0–100  |  confirmed: number of confirmed NCEs  |  total: total NCEs
 */
const compensationGaugeData = { pct: 60, confirmed: 15, total: 25 };

/**
 * Q10 — variation-split
 * Stacked bar — implemented (solid) vs unimplemented (lighter) per entity.
 * VariationRow: { id, name, abbreviation?, implemented?, unimplemented? }
 */
const variationSplitContractors = [
  { id: 'c1', name: 'Tata Projects',     abbreviation: 'Tata',   implemented: 12, unimplemented: 4 },
  { id: 'c2', name: 'L&T Construction',  abbreviation: 'L&T',    implemented: 8,  unimplemented: 6 },
  { id: 'c3', name: 'Afcons Infra',      abbreviation: 'Afcons', implemented: 5,  unimplemented: 9 },
  { id: 'c4', name: 'NCC Ltd',           abbreviation: 'NCC',    implemented: 11, unimplemented: 2 },
  { id: 'c5', name: 'KEC International', abbreviation: 'KEC',    implemented: 6,  unimplemented: 8 },
  { id: 'c5', name: 'KEC International', abbreviation: 'KEC',    implemented: 6,  unimplemented: 8 },
  { id: 'c5', name: 'KEC International', abbreviation: 'KEC',    implemented: 6,  unimplemented: 8 },
  { id: 'c5', name: 'KEC International', abbreviation: 'KEC',    implemented: 6,  unimplemented: 8 },
  { id: 'c5', name: 'KEC International', abbreviation: 'KEC',    implemented: 6,  unimplemented: 8 },
  { id: 'c5', name: 'KEC International', abbreviation: 'KEC',    implemented: 6,  unimplemented: 8 },
  { id: 'c5', name: 'KEC International', abbreviation: 'KEC',    implemented: 6,  unimplemented: 8 },
  { id: 'c5', name: 'KEC International', abbreviation: 'KEC',    implemented: 6,  unimplemented: 8 },
];

/**
 * Q11 — quotation-balance
 * Balance beam — left pan = accepted, right pan = submitted.
 * QuotationSide: { value: number, count: number, label: string }
 * The beam tilts based on value difference.
 */
const quotationBalanceData = {
  accepted:  { value: 28.4, count: 31, label: '£28.4M' },
  submitted: { value: 19.8, count: 22, label: '£19.8M' },
};

/**
 * Q12 — quotation-trend
 * Line + bar combo — weekly submission volume and value.
 * QuotationTrendPoint: { week: string, count: number, value: number }
 */
const quotationTrendData = [
  { week: 'W1',  count: 2, value: 1.8 },
  { week: 'W2',  count: 3, value: 2.4 },
  { week: 'Wsdfghjk3',  count: 1, value: 0.9 },
  { week: 'W4',  count: 4, value: 3.6 },
  { week: 'W5',  count: 5, value: 4.1 },
  { week: 'W6',  count: 3, value: 2.8 },
  { week: 'W7',  count: 6, value: 5.2 },
  { week: 'W8',  count: 4, value: 3.9 },
  { week: 'W9',  count: 7, value: 6.4 },
  { week: 'W10dfghjk', count: 29, value: 7.1 },
  { week: 'W1sdfghj1', count: 5, value: 4.8 },
  { week: 'W1sdfghj2', count: 30, value: 8.3 },
  { week: 'W1wertyui2', count: 9, value: 8.3 },
  { week: 'W1xcvbn2', count: 15, value: 8.3 },
  { week: 'W12wertyuio', count: 50, value: 8.3 },
  { week: 'W12', count: 10, value: 8.3 },
  { week: 'W12', count: 9, value: 8.3 },
  { week: 'W12', count: 9, value: 8.3 },
  { week: 'W12', count: 20, value: 8.3 },
  { week: 'W12', count: 9, value: 8.3 },

  

];

/**
 * Q13 — weekly-flow
 * Sankey flow — base + variation streams per contractor converge into total commitment.
 * Same ContractorRow[] — base, variation, total, percentage.
 */
const weeklyFlowContractors = contractValueData.contractors;

// ─── KeyHighlights blocks for each Q ─────────────────────────────────────────

const HIGHLIGHTS: Record<string, KeyHighlightBlock> = {

  // Q1 — 3 equal stat tiles: total, base, variations
  q1: {
    type: 'stats',
    items: [
      { value: '£752.2M', label: 'total portfolio commitment' },
      { value: '£659M',   label: 'base contract value across all 5 active contractors',           },
      { value: '£93.2M',  label: 'variations approved — 12.4% on top of base contract value',     },
      { value: 'L&T',     label: 'largest share at £210.6M total — 28% of the full portfolio',     },
      { value: 'KEC 42%', label: 'highest variation-to-base ratio — 3× the portfolio average',    },
    ],
    takeaway: 'L&T and NCC together anchor 50% of portfolio value. KEC\'s 42% variation ratio is 3× the average — the clearest single-contractor risk flag.',
  },

  // Q2 — comparison table: base / variations / var % per contractor
  q2: {
    type: 'comparison-rows',
    columns: ['Base', 'Variations', 'Var %'],
    rows: [
      { label: 'L&T',    cells: ['£198M', '£12.6M', '6%'],  color: '#22D3EE' },
      { label: 'NCC',    cells: ['£156M', '£8.9M',  '6%'],  color: '#A78BFA' },
      { label: 'Tata',   cells: ['£142M', '£18.4M', '13%'], color: '#3B8BF6' },
      { label: 'Afcons', cells: ['£89M',  '£22.1M', '25%'], color: '#FBBF24' },
      { label: 'KEC',    cells: ['£74M',  '£31.2M', '42%'], color: '#34D399' },
    ],
    takeaway: 'KEC\'s 42% variation-to-base ratio is 7× higher than L&T and NCC — the most exposed contractor despite holding the smallest base.',
  },

  // Q3 — chips: portfolio avg, spread, contractors below 80%
  q3: {
    type: 'chips',
    items: [
      { value: '84%',    label: 'portfolio-weighted average commitment — 16 points below full close',  },
      { value: '26 pts', label: 'spread from NCC (95%) to KEC (69%) — widest performance gap',      },
      { value: '2 of 5', label: 'contractors below the 80% target — Afcons at 78% and KEC at 69%',},
    ],
    takeaway: 'The 26-point spread signals a deeply uneven portfolio — KEC\'s 42% variation ratio is the primary factor keeping its commitment furthest from the finish line.',
  },

  // Q4 — chips: total EWs, open, pending, resolution rate
  q4: {
    type: 'chips',
    items: [
      { value: '40 EWs',   label: 'total Early Warnings active across all 5 contractors right now',  },
      { value: '18 Open',  label: '45% still active and unresolved — risk actively in flight',        },
      { value: '10 Stuck', label: 'submitted but awaiting decision — in commercial or legal limbo',  },
      { value: '30%',      label: 'resolution rate — only 12 of 40 EWs fully closed to date',       },
    ],
    takeaway: '70% of EWs remain live — the combined open and pending backlog will convert to NCEs if commercial decisions are not accelerated.',
  },

  // Q5 — scorecard rows: all 5 categories with proportional bar
  q5: {
    type: 'scorecard-rows',
    items: [
      { name: 'Ground',     value: '12 EWs', pct: 100, color: '#3B8BF6', sublabel: '30% of portfolio — dominant category' },
      { name: 'Design',     value: '8 EWs',  pct: 67,  color: '#22D3EE', sublabel: '20% — often contractor-caused' },
      { name: 'Employer',   value: '7 EWs',  pct: 58,  color: '#FBBF24', sublabel: '17.5% — slowest category to resolve' },
      { name: 'Weather',    value: '6 EWs',  pct: 50,  color: '#A78BFA', sublabel: '15% — force majeure risk profile' },
      { name: 'Regulatory', value: '5 EWs',  pct: 42,  color: '#34D399', sublabel: '12.5% — compliance-driven' },
    ],
    takeaway: 'Ground Conditions (30%) and Design Issues (20%) account for half of all EWs — both categories are strongly correlated with NCE escalation.',
  },

  // Q6 — scorecard rows: open EW count per contractor with risk badge
  q6: {
    type: 'scorecard-rows',
    items: [
      { name: 'Tata',   value: '7 open', pct: 100, color: '#3B8BF6', badge: 'High risk',    sublabel: '39% of all open EWs' },
      { name: 'Afcons', value: '4 open', pct: 57,  color: '#FBBF24', badge: 'Elevated',    sublabel: '22% — combined 61%' },
      { name: 'L&T',    value: '3 open', pct: 43,  color: '#22D3EE', badge: 'Moderate',  sublabel: '17% share' },
      { name: 'NCC',    value: '2 open', pct: 29,  color: '#A78BFA', badge: 'Low risk',  sublabel: '11% — well managed' },
      { name: 'KEC',    value: '2 open', pct: 29,  color: '#34D399', badge: 'Low risk',  sublabel: '11% — well managed' },
    ],
    takeaway: 'Tata holds 39% of open EWs — resolving Tata\'s backlog alone would reduce the total portfolio open count by over a third.',
  },

  // Q7 — badges: Critical / High / Medium / Low severity
  q7: {
    type: 'badges',
    items: [
      { text: '5 Critical — all currently unresolved, highest escalation and adjudication risk in the portfolio', severity: 'red'   },
      { text: '14 High severity — at risk of escalating to Critical without active commercial intervention',      severity: 'amber' },
      { text: '13 Medium severity — significant volume, close monitoring required across all 5 contractors',      severity: 'amber' },
      { text: '8 Low severity — flagged for awareness only, no immediate financial or schedule exposure',         severity: 'green' },
    ],
    takeaway: 'Critical + High EWs (19 total) account for 47.5% of the portfolio — all 5 Critical items remain unresolved.',
  },

  // Q8 — scorecard rows: NCE count per contractor with share sublabel
  q8: {
    type: 'scorecard-rows',
    items: [
      { name: 'Tata',   value: '8 NCEs', pct: 100, color: '#3B8BF6', sublabel: '32% of total — highest raiser' },
      { name: 'Afcons', value: '6 NCEs', pct: 75,  color: '#FBBF24', sublabel: '24% — Tata + Afcons = 56%' },
      { name: 'L&T',    value: '4 NCEs', pct: 50,  color: '#22D3EE', sublabel: '16% share' },
      { name: 'NCC',    value: '4 NCEs', pct: 50,  color: '#A78BFA', sublabel: '16% share' },
      { name: 'KEC',    value: '3 NCEs', pct: 38,  color: '#34D399', sublabel: '12% — fewest despite highest var ratio' },
    ],
    takeaway: 'Tata\'s NCE concentration (32%) mirrors its EW exposure (39%) — both metrics converge on the same contractor as the portfolio\'s primary risk driver.',
  },

  // Q9 — badges: confirmation rate signals
  q9: {
    type: 'badges',
    items: [
      { text: '10 NCEs unconfirmed — each a potential adjudication trigger and active financial liability', severity: 'red'   },
      { text: '40% dispute rate — above typical 25% benchmark, signals contractor commercial aggression',  severity: 'red'   },
      { text: '60% confirmation rate — at the amber-zone boundary, below the target performance threshold', severity: 'amber' },
      { text: '15 NCEs confirmed — obligations legally established, budgeted and approved for payment',     severity: 'green' },
    ],
    takeaway: 'The 40% dispute rate exceeds typical benchmarks — 10 contested NCEs represent the portfolio\'s most volatile financial exposure.',
  },

  // Q10 — chips: overall implementation rate, backlog, spread
  q10: {
    type: 'chips',
    items: [
      { value: '59%',    label: 'overall portfolio implementation rate — 42 of 71 variations actioned', },
      { value: '29',     label: 'variations still pending across all contractors — unresolved backlog',  },
      { value: '49 pts', label: 'spread from NCC (85%) to Afcons (36%) — largest discipline gap',       },
    ],
    takeaway: 'Afcons\' 9 and KEC\'s 8 pending variations together account for 59% of the entire unimplemented backlog.',
  },

  // Q11 — comparison table: accepted / submitted / gap
  q11: {
    type: 'comparison-rows',
    columns: ['Value', 'Count', 'Avg deal'],
    rows: [
      { label: 'Accepted',  cells: ['£28.4M', '31 quotes', '~£916K'], color: '#34D399' },
      { label: 'Submitted', cells: ['£19.8M', '22 quotes', '~£900K'], color: '#FBBF24' },
      { label: 'Gap (+)',   cells: ['+£8.6M', '+9 quotes', '—'],       color: '#3B8BF6' },
    ],
    takeaway: 'The £19.8M pending pipeline represents 41% of already-accepted value — resolution of submitted quotations will define the quarter\'s commercial outcome.',
  },

  // Q12 — stats: totals, peak week, growth factor, peak value, acceleration
  q12: {
    type: 'stats',
    items: [
      { value: '57',    label: 'total submissions over the 12-week window',                    color: '#22D3EE' },
      { value: '9',     label: 'Week 12 peak — highest single-week volume on record',          color: '#3B8BF6' },
      { value: '4.5×',  label: 'W12 vs W1 growth factor — acceleration across 12 weeks',      color: '#FBBF24' },
      { value: '£8.3M', label: 'Week 12 value — highest-value week in the 12-week window',    color: '#34D399' },
      { value: '+80%',  label: 'W11→W12 final-week acceleration — sharpest single-step jump', color: '#F06060' },
    ],
    takeaway: 'Week 12 alone accounts for 16% of all 12-week submissions at the highest value on record — the claim period is entering its most active phase.',
  },

  // Q13 — proportion split: base 88% vs variations 12% + chips
  q13: {
    type: 'proportion',
    leftPct: 88,   leftLabel: 'Base Value',  leftValue: '£659M',   leftColor: '#3B8BF6',
    rightPct: 12,  rightLabel: 'Variations', rightValue: '£93.2M', rightColor: '#FBBF24',
    chips: [
      { value: 'KEC 42%',    label: 'highest variation-to-base ratio — 3× the portfolio average',            color: '#34D399' },
      { value: 'Afcons 25%', label: 'second-highest — KEC + Afcons drive 57% of variation value',           color: '#FBBF24' },
      { value: '£93.2M',     label: 'total approved variations — equivalent to adding a 6th mid-size contractor', color: '#22D3EE' },
      { value: '2 of 5',     label: 'contractors above 20% variation rate — concentrated in the bottom tier', color: '#A78BFA' },
    ],
    takeaway: 'KEC and Afcons contribute 57% of all variation value despite holding only 23% of base contract value — the portfolio\'s primary financial concentration risk.',
  },
};

export function ChartGalleryPage() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>Chart Gallery</h1>

      {/* ── Group 1: Generic ───────────────────────────────────────────── */}
      <h2>Generic Charts</h2>

      <h3>bar</h3>
      <VisualizationRenderer config={{ type: 'bar', rows: vizRows }} />

      <h3>line</h3>
      <VisualizationRenderer config={{ type: 'line', rows: vizRows }} />

      <h3>area</h3>
      <VisualizationRenderer config={{ type: 'area', rows: vizRows }} />

      <h3>pie</h3>
      <VisualizationRenderer config={{ type: 'pie', rows: vizRows }} />

      <h3>donut</h3>
      <VisualizationRenderer config={{ type: 'donut', rows: vizRows }} />

      <h3>sankey</h3>
      <VisualizationRenderer config={{ type: 'sankey', rows: vizRows }} />

      <h3>trend</h3>
      <VisualizationRenderer config={{ type: 'trend', points: trendPoints }} />

      <h3>mini-bars</h3>
      <VisualizationRenderer config={{ type: 'mini-bars', rows: miniBarsRows }} />

      <h3>flow</h3>
      <VisualizationRenderer config={{ type: 'flow', selectedEntity: 'c1' }} />

      {/* ── Group 2: Domain-specific (Project Dashboard Q1–Q13) ─────────── */}
      <h2 style={{ marginTop: 48 }}>Project Dashboard Charts</h2>

      <h3>Q1 — contract-value-orb</h3>
      <VisualizationRenderer config={{ type: 'contract-value-orb', data: contractValueData }} />
      <KeyHighlights block={HIGHLIGHTS.q1} />

      <h3>Q2 — contract-bars</h3>
      <VisualizationRenderer config={{ type: 'contract-bars', contractors: contractBarsContractors }} />
      <KeyHighlights block={HIGHLIGHTS.q2} />

      <h3>Q3 — commitment-race</h3>
      <VisualizationRenderer config={{ type: 'commitment-race', contractors: commitmentRaceContractors }} />
      <KeyHighlights block={HIGHLIGHTS.q3} />

      <h3>Q4 — status-arc</h3>
      <VisualizationRenderer config={{ type: 'status-arc', segments: statusArcSegments, title: 'Early Warning Status Split' }} />
      <KeyHighlights block={HIGHLIGHTS.q4} />

      <h3>Q5 — ew-category</h3>
      <VisualizationRenderer config={{ type: 'ew-category', categories: ewCategories, title: 'Early Warnings by Category' }} />
      <KeyHighlights block={HIGHLIGHTS.q5} />

      <h3>Q6 — contractor-rank</h3>
      <VisualizationRenderer config={{ type: 'contractor-rank', contractors: contractorRankContractors }} />
      <KeyHighlights block={HIGHLIGHTS.q6} />

      <h3>Q7 — severity-bands</h3>
      <VisualizationRenderer config={{ type: 'severity-bands', severities: severityBands }} />
      <KeyHighlights block={HIGHLIGHTS.q7} />

      <h3>Q8 — nce-tree</h3>
      <VisualizationRenderer config={{ type: 'nce-tree', total: nceTotal, byContractor: nceByContractorData }} />
      <KeyHighlights block={HIGHLIGHTS.q8} />

      <h3>Q9 — compensation-gauge</h3>
      <VisualizationRenderer config={{ type: 'compensation-gauge', pct: compensationGaugeData.pct, confirmed: compensationGaugeData.confirmed, total: compensationGaugeData.total }} />
      <KeyHighlights block={HIGHLIGHTS.q9} />

      <h3>Q10 — variation-split</h3>
      <VisualizationRenderer config={{ type: 'variation-split', contractors: variationSplitContractors }} />
      <KeyHighlights block={HIGHLIGHTS.q10} />

      <h3>Q11 — quotation-balance</h3>
      <VisualizationRenderer config={{ type: 'quotation-balance', accepted: quotationBalanceData.accepted, submitted: quotationBalanceData.submitted }} />
      <KeyHighlights block={HIGHLIGHTS.q11} />

      <h3>Q12 — quotation-trend</h3>
      <VisualizationRenderer config={{ type: 'quotation-trend', trend: quotationTrendData }} />
      <KeyHighlights block={HIGHLIGHTS.q12} />

      <h3>Trend (standalone)</h3>
      <Trend trend={quotationTrendData} data-testid="gallery-trend" />

      <h3>Q13 — weekly-flow</h3>
      <VisualizationRenderer config={{ type: 'weekly-flow', contractors: weeklyFlowContractors }} />
      <KeyHighlights block={HIGHLIGHTS.q13} />
    </div>
  );
}
