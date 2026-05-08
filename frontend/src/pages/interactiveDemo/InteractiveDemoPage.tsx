import { useState, useCallback } from 'react';

import { StackedHorizontalBarChart } from '../../components/stackedHorizontalBarChart';
import { SegmentedSplitBarChart } from '../../components/segmentedSplitBarChart/SegmentedSplitBarChart';
import { ProgressRaceChart } from '../../components/progressRaceChart/ProgressRaceChart';
import { Trend } from '../../components/trend';
import { SemiCircularGaugeChart } from '../../components/semiCircularGaugeChart/SemiCircularGaugeChart';
import { RadialFanTreeChart } from '../../components/radialFanTreeChart/RadialFanTreeChart';
import type { GaugeEntityData } from '../../components/semiCircularGaugeChart/types';
import type { RadialFanEntityData } from '../../components/radialFanTreeChart/types';
import type { VariationRow, ContractorRow } from '../../types';

// ─── Contractor IDs ───────────────────────────────────────────────────────────
// All datasets MUST use these exact keys so cross-chart selection works.
const IDS = {
  srm:    'SRM Civils',
  cisdi:  'CISDI UK',
  bath:   'Bath Demolition',
  ska:    'Skanska',
  knights:'Knights Brown',
};

// ─── Stacked horizontal bar ───────────────────────────────────────────────────
const BAR_DATA = {
  items: [
    { id: IDS.srm,     name: 'SRM Civils',     abbreviation: 'SRM',    base: 8_500_000,  variation: 1_200_000, total: 9_700_000  },
    { id: IDS.cisdi,   name: 'CISDI UK',        abbreviation: 'CISDI',  base: 12_300_000, variation: 4_100_000, total: 16_400_000 },
    { id: IDS.bath,    name: 'Bath Demolition', abbreviation: 'Bath D', base: 3_200_000,  variation: 900_000,   total: 4_100_000  },
    { id: IDS.ska,     name: 'Skanska Opt A',   abbreviation: 'Ska',    base: 5_800_000,  variation: 1_500_000, total: 7_300_000  },
    { id: IDS.knights, name: 'Knights Brown',   abbreviation: 'KnBr',   base: 7_100_000,  variation: 2_300_000, total: 9_400_000  },
  ],
  totals: { base: 36_900_000, variation: 10_000_000, total: 46_900_000 },
};

// ─── Segmented split bar (variations) ────────────────────────────────────────
const VARIATION_ITEMS = [
  { id: IDS.srm,     name: 'SRM Civils',     abbreviation: 'SRM',    implemented: 18, unimplemented: 7  },
  { id: IDS.cisdi,   name: 'CISDI UK',        abbreviation: 'CISDI',  implemented: 31, unimplemented: 5  },
  { id: IDS.bath,    name: 'Bath Demolition', abbreviation: 'Bath D', implemented: 9,  unimplemented: 11 },
  { id: IDS.ska,     name: 'Skanska Opt A',   abbreviation: 'Ska',    implemented: 14, unimplemented: 4  },
  { id: IDS.knights, name: 'Knights Brown',   abbreviation: 'KnBr',   implemented: 22, unimplemented: 8  },
];

// ─── Progress race ────────────────────────────────────────────────────────────
const RACE_ITEMS = [
  { id: IDS.srm,     name: 'SRM Civils',     abbreviation: 'SRM',    percentage: 76, total: 9_700_000  },
  { id: IDS.cisdi,   name: 'CISDI UK',        abbreviation: 'CISDI',  percentage: 91, total: 16_400_000 },
  { id: IDS.bath,    name: 'Bath Demolition', abbreviation: 'Bath D', percentage: 68, total: 4_100_000  },
  { id: IDS.ska,     name: 'Skanska Opt A',   abbreviation: 'Ska',    percentage: 85, total: 7_300_000  },
  { id: IDS.knights, name: 'Knights Brown',   abbreviation: 'KnBr',   percentage: 79, total: 9_400_000  },
];

// ─── Trend — per-contractor monthly series + aggregate ────────────────────────
const SERIES_BY_ENTITY: Record<string, { week: string; count: number; value: number }[]> = {
  [IDS.srm]: [
    { week: 'Jan 2025', count: 8,  value: 720_000   },
    { week: 'Feb 2025', count: 12, value: 1_100_000  },
    { week: 'Mar 2025', count: 15, value: 1_400_000  },
    { week: 'Apr 2025', count: 10, value: 920_000   },
    { week: 'May 2025', count: 18, value: 1_800_000  },
    { week: 'Jun 2025', count: 14, value: 1_350_000  },
  ],
  [IDS.cisdi]: [
    { week: 'Jan 2025', count: 5,  value: 980_000   },
    { week: 'Feb 2025', count: 8,  value: 1_600_000  },
    { week: 'Mar 2025', count: 6,  value: 1_200_000  },
    { week: 'Apr 2025', count: 12, value: 2_400_000  },
    { week: 'May 2025', count: 9,  value: 1_900_000  },
    { week: 'Jun 2025', count: 11, value: 2_200_000  },
  ],
  [IDS.bath]: [
    { week: 'Jan 2025', count: 15, value: 320_000   },
    { week: 'Feb 2025', count: 20, value: 440_000   },
    { week: 'Mar 2025', count: 18, value: 390_000   },
    { week: 'Apr 2025', count: 22, value: 480_000   },
    { week: 'May 2025', count: 17, value: 360_000   },
    { week: 'Jun 2025', count: 25, value: 540_000   },
  ],
  [IDS.ska]: [
    { week: 'Jan 2025', count: 3,  value: 650_000   },
    { week: 'Feb 2025', count: 5,  value: 1_050_000  },
    { week: 'Mar 2025', count: 4,  value: 840_000   },
    { week: 'Apr 2025', count: 7,  value: 1_470_000  },
    { week: 'May 2025', count: 6,  value: 1_260_000  },
    { week: 'Jun 2025', count: 8,  value: 1_680_000  },
  ],
  [IDS.knights]: [
    { week: 'Jan 2025', count: 10, value: 1_100_000  },
    { week: 'Feb 2025', count: 9,  value: 990_000   },
    { week: 'Mar 2025', count: 13, value: 1_430_000  },
    { week: 'Apr 2025', count: 11, value: 1_210_000  },
    { week: 'May 2025', count: 14, value: 1_540_000  },
    { week: 'Jun 2025', count: 12, value: 1_320_000  },
  ],
};

const AGGREGATE_POINTS = [
  { week: 'Jan 2025', count: 41, value: 3_770_000 },
  { week: 'Feb 2025', count: 54, value: 5_180_000 },
  { week: 'Mar 2025', count: 56, value: 5_260_000 },
  { week: 'Apr 2025', count: 62, value: 6_480_000 },
  { week: 'May 2025', count: 64, value: 6_860_000 },
  { week: 'Jun 2025', count: 70, value: 7_090_000 },
];

// ─── Radial fan tree (NCE distribution) ──────────────────────────────────────
const NCE_ITEMS = [
  { id: IDS.srm,     name: 'SRM Civils',     abbreviation: 'SRM',    count: 18, label: '18 NCEs' },
  { id: IDS.cisdi,   name: 'CISDI UK',        abbreviation: 'CISDI',  count: 24, label: '24 NCEs' },
  { id: IDS.bath,    name: 'Bath Demolition', abbreviation: 'Bath D', count: 12, label: '12 NCEs' },
  { id: IDS.ska,     name: 'Skanska Opt A',   abbreviation: 'Ska',    count: 14, label: '14 NCEs' },
  { id: IDS.knights, name: 'Knights Brown',   abbreviation: 'KnBr',   count: 13, label: '13 NCEs' },
];
const NCE_TOTAL = NCE_ITEMS.reduce((s, c) => s + (c.count ?? 0), 0);

// ─── Drill-down: SegmentedSplitBarChart — per-contractor package breakdown ────
const VARIATION_BY_ENTITY: Record<string, VariationRow[]> = {
  [IDS.srm]: [
    { id: 'srm-civil',  name: 'Civil Works',  abbreviation: 'Civil',  implemented: 8,  unimplemented: 3 },
    { id: 'srm-steel',  name: 'Steel Frame',  abbreviation: 'Steel',  implemented: 6,  unimplemented: 2 },
    { id: 'srm-ground', name: 'Groundworks',  abbreviation: 'Grd',    implemented: 4,  unimplemented: 1 },
    { id: 'srm-finish', name: 'Finishing',    abbreviation: 'Fin',    implemented: 0,  unimplemented: 1 },
  ],
  [IDS.cisdi]: [
    { id: 'cis-struct', name: 'Structural',   abbreviation: 'Str',    implemented: 12, unimplemented: 2 },
    { id: 'cis-mech',   name: 'Mechanical',   abbreviation: 'Mech',   implemented: 8,  unimplemented: 1 },
    { id: 'cis-hvac',   name: 'HVAC',         abbreviation: 'HVAC',   implemented: 5,  unimplemented: 2 },
    { id: 'cis-elec',   name: 'Electrical',   abbreviation: 'Elec',   implemented: 4,  unimplemented: 0 },
    { id: 'cis-civil',  name: 'Civil',        abbreviation: 'Civil',  implemented: 2,  unimplemented: 0 },
  ],
  [IDS.bath]: [
    { id: 'bath-p1',    name: 'Phase 1',      abbreviation: 'Ph1',    implemented: 5,  unimplemented: 5 },
    { id: 'bath-p2',    name: 'Phase 2',      abbreviation: 'Ph2',    implemented: 3,  unimplemented: 4 },
    { id: 'bath-p3',    name: 'Phase 3',      abbreviation: 'Ph3',    implemented: 1,  unimplemented: 2 },
  ],
  [IDS.ska]: [
    { id: 'ska-found',  name: 'Foundation',   abbreviation: 'Fnd',    implemented: 7,  unimplemented: 1 },
    { id: 'ska-super',  name: 'Superstructure',abbreviation: 'Sup',   implemented: 5,  unimplemented: 2 },
    { id: 'ska-mep',    name: 'MEP',          abbreviation: 'MEP',    implemented: 2,  unimplemented: 1 },
  ],
  [IDS.knights]: [
    { id: 'kn-conc',    name: 'Concrete',     abbreviation: 'Con',    implemented: 10, unimplemented: 3 },
    { id: 'kn-steel',   name: 'Steelwork',    abbreviation: 'Stl',    implemented: 7,  unimplemented: 3 },
    { id: 'kn-roof',    name: 'Roofing',      abbreviation: 'Rof',    implemented: 4,  unimplemented: 1 },
    { id: 'kn-fitout',  name: 'Fit-Out',      abbreviation: 'Fit',    implemented: 1,  unimplemented: 1 },
  ],
};

// ─── Drill-down: ProgressRaceChart — per-contractor milestone completion ───────
// base = 100 for all items (percentage is the primary signal)
const RACE_BY_ENTITY: Record<string, ContractorRow[]> = {
  [IDS.srm]: [
    { id: 'srm-m1', name: 'Design',       abbreviation: 'Des',  base: 100, total: 100, percentage: 100 },
    { id: 'srm-m2', name: 'Mobilisation', abbreviation: 'Mob',  base: 100, total: 92,  percentage: 92  },
    { id: 'srm-m3', name: 'Main Works',   abbreviation: 'Main', base: 100, total: 76,  percentage: 76  },
    { id: 'srm-m4', name: 'Handover',     abbreviation: 'Hand', base: 100, total: 28,  percentage: 28  },
  ],
  [IDS.cisdi]: [
    { id: 'cis-m1', name: 'Design',       abbreviation: 'Des',  base: 100, total: 100, percentage: 100 },
    { id: 'cis-m2', name: 'Procurement',  abbreviation: 'Pro',  base: 100, total: 97,  percentage: 97  },
    { id: 'cis-m3', name: 'Fabrication',  abbreviation: 'Fab',  base: 100, total: 91,  percentage: 91  },
    { id: 'cis-m4', name: 'Erection',     abbreviation: 'Ere',  base: 100, total: 68,  percentage: 68  },
    { id: 'cis-m5', name: 'Testing',      abbreviation: 'Tst',  base: 100, total: 12,  percentage: 12  },
  ],
  [IDS.bath]: [
    { id: 'bat-m1', name: 'Planning',        abbreviation: 'Pln', base: 100, total: 100, percentage: 100 },
    { id: 'bat-m2', name: 'Deconstruction',  abbreviation: 'Dec', base: 100, total: 85,  percentage: 85  },
    { id: 'bat-m3', name: 'Clearance',       abbreviation: 'Clr', base: 100, total: 54,  percentage: 54  },
    { id: 'bat-m4', name: 'Reinstatement',   abbreviation: 'Rst', base: 100, total: 22,  percentage: 22  },
  ],
  [IDS.ska]: [
    { id: 'ska-m1', name: 'Design',        abbreviation: 'Des', base: 100, total: 100, percentage: 100 },
    { id: 'ska-m2', name: 'Foundation',    abbreviation: 'Fnd', base: 100, total: 94,  percentage: 94  },
    { id: 'ska-m3', name: 'Frame',         abbreviation: 'Frm', base: 100, total: 85,  percentage: 85  },
    { id: 'ska-m4', name: 'Fit-Out',       abbreviation: 'Fit', base: 100, total: 45,  percentage: 45  },
    { id: 'ska-m5', name: 'Commissioning', abbreviation: 'Com', base: 100, total: 10,  percentage: 10  },
  ],
  [IDS.knights]: [
    { id: 'kn-m1', name: 'Mobilisation',   abbreviation: 'Mob', base: 100, total: 100, percentage: 100 },
    { id: 'kn-m2', name: 'Groundworks',    abbreviation: 'Grd', base: 100, total: 87,  percentage: 87  },
    { id: 'kn-m3', name: 'Superstructure', abbreviation: 'Sup', base: 100, total: 79,  percentage: 79  },
    { id: 'kn-m4', name: 'Finishes',       abbreviation: 'Fin', base: 100, total: 38,  percentage: 38  },
  ],
};

// ─── Drill-down: RadialFanTreeChart — per-contractor NCE by type ──────────────
const NCE_BY_ENTITY: Record<string, RadialFanEntityData> = {
  [IDS.srm]: {
    total: 18, totalLabel: '18 NCEs',
    items: [
      { id: 'srm-weather', name: 'Weather',      abbreviation: 'Wthr', count: 8 },
      { id: 'srm-site',    name: 'Site Conds',   abbreviation: 'Site', count: 5 },
      { id: 'srm-design',  name: 'Design Chg',   abbreviation: 'Dsgn', count: 3 },
      { id: 'srm-utility', name: 'Utility',      abbreviation: 'Util', count: 2 },
    ],
  },
  [IDS.cisdi]: {
    total: 24, totalLabel: '24 NCEs',
    items: [
      { id: 'cis-design',  name: 'Design Chg',   abbreviation: 'Dsgn', count: 10 },
      { id: 'cis-material',name: 'Material',     abbreviation: 'Mtrl', count: 7  },
      { id: 'cis-delay',   name: 'Delay',        abbreviation: 'Dly',  count: 4  },
      { id: 'cis-var',     name: 'Variation',    abbreviation: 'Var',  count: 3  },
    ],
  },
  [IDS.bath]: {
    total: 12, totalLabel: '12 NCEs',
    items: [
      { id: 'bat-site',    name: 'Site Conds',   abbreviation: 'Site', count: 6 },
      { id: 'bat-weather', name: 'Weather',      abbreviation: 'Wthr', count: 4 },
      { id: 'bat-utility', name: 'Utility',      abbreviation: 'Util', count: 2 },
    ],
  },
  [IDS.ska]: {
    total: 14, totalLabel: '14 NCEs',
    items: [
      { id: 'ska-design',  name: 'Design Chg',   abbreviation: 'Dsgn', count: 7 },
      { id: 'ska-material',name: 'Material',     abbreviation: 'Mtrl', count: 4 },
      { id: 'ska-delay',   name: 'Delay',        abbreviation: 'Dly',  count: 3 },
    ],
  },
  [IDS.knights]: {
    total: 13, totalLabel: '13 NCEs',
    items: [
      { id: 'kn-weather',  name: 'Weather',      abbreviation: 'Wthr', count: 5 },
      { id: 'kn-site',     name: 'Site Conds',   abbreviation: 'Site', count: 4 },
      { id: 'kn-design',   name: 'Design Chg',   abbreviation: 'Dsgn', count: 2 },
      { id: 'kn-utility',  name: 'Utility',      abbreviation: 'Util', count: 2 },
    ],
  },
};

// ─── Gauge — per-contractor + aggregate ──────────────────────────────────────
const GAUGE_BY_ENTITY: Record<string, GaugeEntityData> = {
  [IDS.srm]:     { confirmed: 14, total: 18 },
  [IDS.cisdi]:   { confirmed: 22, total: 24 },
  [IDS.bath]:    { confirmed: 7,  total: 12 },
  [IDS.ska]:     { confirmed: 11, total: 14 },
  [IDS.knights]: { confirmed: 9,  total: 13 },
};
const GAUGE_AGGREGATE: GaugeEntityData = { confirmed: 63, total: 81 };

// ─── Page ─────────────────────────────────────────────────────────────────────

export function InteractiveDemoPage() {
  const [selectedId,    setSelectedId]    = useState<string | undefined>(undefined);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);

  const handleClick = useCallback((id: string, label: string) => {
    setSelectedId(prev => (prev === id ? undefined : id));
    setSelectedLabel(prev => (prev === label ? undefined : label));
  }, []);

  const handleClear = useCallback(() => {
    setSelectedId(undefined);
    setSelectedLabel(undefined);
  }, []);

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <h1 style={styles.title}>Interactive Chart Demo</h1>
        <p style={styles.subtitle}>
          Click a contractor in the <strong style={{ color: '#e2e8f0' }}>Contract Value</strong> chart
          to drill down — all other charts switch to that contractor's detail. Click again to reset.
        </p>
        {selectedLabel && (
          <div style={styles.globalBadge}>
            <span style={styles.filterDot} />
            Filtered to: <strong style={{ marginLeft: 4 }}>{selectedLabel}</strong>
            <button style={styles.clearBtn} onClick={handleClear}>✕</button>
          </div>
        )}
      </div>

      {/* ── Broadcasters + dimming ── */}
      <div style={styles.row}>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelLabel}>Contract Value</span>
            <span style={styles.badgeBroadcast}>broadcaster — click to drill down</span>
          </div>
          <StackedHorizontalBarChart
            data={BAR_DATA}
            onItemClick={handleClick}
            selectedId={selectedId}
            data-testid="demo-bar"
          />
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelLabel}>Milestone Completion</span>
            <span style={styles.badge}>drills to contractor milestones</span>
          </div>
          <ProgressRaceChart
            items={RACE_ITEMS}
            itemsByEntity={RACE_BY_ENTITY}
            onItemClick={handleClick}
            selectedId={selectedId}
            data-testid="demo-race"
          />
        </div>

      </div>

      <div style={styles.row}>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelLabel}>Variations by Package</span>
            <span style={styles.badge}>drills to contractor packages</span>
          </div>
          <SegmentedSplitBarChart
            items={VARIATION_ITEMS}
            itemsByEntity={VARIATION_BY_ENTITY}
            labelA="Implemented"
            labelB="Unimplemented"
            unit="variations"
            onItemClick={handleClick}
            selectedId={selectedId}
            data-testid="demo-split"
          />
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelLabel}>NCE Distribution</span>
            <span style={styles.badge}>drills to NCE type breakdown</span>
          </div>
          <RadialFanTreeChart
            total={NCE_TOTAL}
            totalLabel={`${NCE_TOTAL} total NCEs`}
            items={NCE_ITEMS}
            dataByEntity={NCE_BY_ENTITY}
            onItemClick={handleClick}
            selectedId={selectedId}
            data-testid="demo-radial"
          />
        </div>

      </div>

      <div style={styles.row}>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelLabel}>Compensation Events</span>
            <span style={styles.badge}>listener</span>
          </div>
          <SemiCircularGaugeChart
            confirmed={GAUGE_AGGREGATE.confirmed}
            total={GAUGE_AGGREGATE.total}
            label="NCEs confirmed as compensation events"
            selectedId={selectedId}
            selectedLabel={selectedLabel}
            gaugeByEntity={GAUGE_BY_ENTITY}
            data-testid="demo-gauge"
          />
        </div>

      </div>

      {/* ── Trend listener ── */}
      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <span style={styles.panelLabel}>Monthly Quotation Trend</span>
          <span style={styles.badge}>listener — switches to selected contractor</span>
        </div>
        {selectedLabel && (
          <div style={styles.filterBadge}>
            <span style={styles.filterDot} />
            Showing: <strong style={{ marginLeft: 4 }}>{selectedLabel}</strong>
          </div>
        )}
        <Trend
          points={AGGREGATE_POINTS}
          selectedId={selectedId}
          seriesByEntity={SERIES_BY_ENTITY}
          data-testid="demo-trend"
        />
      </div>

    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    height: '100vh',
    overflowY: 'auto',
    background: '#0d1424',
    padding: '32px 40px',
    fontFamily: "'Satoshi Variable', 'DM Sans', sans-serif",
    color: '#ccd6f6',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 6px',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(204,214,246,0.5)',
    margin: '0 0 10px',
  },
  globalBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(94,114,244,0.15)',
    border: '1px solid rgba(94,114,244,0.35)',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    color: '#a5b4fc',
  },
  row: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  panel: {
    flex: 1,
    minWidth: 320,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '16px 20px',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  badge: {
    fontSize: 10,
    color: 'rgba(204,214,246,0.35)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 4,
    padding: '2px 7px',
  },
  badgeBroadcast: {
    fontSize: 10,
    color: 'rgba(105,223,233,0.8)',
    background: 'rgba(105,223,233,0.08)',
    border: '1px solid rgba(105,223,233,0.25)',
    borderRadius: 4,
    padding: '2px 7px',
  },
  filterBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(94,114,244,0.15)',
    border: '1px solid rgba(94,114,244,0.35)',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    color: '#a5b4fc',
    marginBottom: 12,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#818ff8',
    flexShrink: 0,
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(165,180,252,0.7)',
    fontSize: 12,
    cursor: 'pointer',
    marginLeft: 6,
    padding: '0 2px',
  },
};
