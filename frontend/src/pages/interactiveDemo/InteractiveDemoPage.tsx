import { useState, useCallback } from 'react';

import { StackedHorizontalBarChart } from '../../components/stackedHorizontalBarChart';
import { Trend } from '../../components/trend';

// ─── Dummy contractors ────────────────────────────────────────────────────────
// ids MUST match keys in seriesByEntity below

const BAR_DATA = {
  items: [
    { id: 'SRM Civils',     name: 'SRM Civils',      abbreviation: 'SRM',   base: 8_500_000,  variation: 1_200_000, total: 9_700_000,  percentage: 76 },
    { id: 'CISDI UK',       name: 'CISDI UK',         abbreviation: 'CISDI', base: 12_300_000, variation: 4_100_000, total: 16_400_000, percentage: 91 },
    { id: 'Bath Demolition',name: 'Bath Demolition',  abbreviation: 'Bath D',base: 3_200_000,  variation: 900_000,   total: 4_100_000,  percentage: 68 },
    { id: 'Skanska',        name: 'Skanska Opt A',    abbreviation: 'Ska',   base: 5_800_000,  variation: 1_500_000, total: 7_300_000,  percentage: 85 },
    { id: 'Knights Brown',  name: 'Knights Brown',    abbreviation: 'KnBr',  base: 7_100_000,  variation: 2_300_000, total: 9_400_000,  percentage: 79 },
  ],
  totals: { base: 36_900_000, variation: 10_000_000, total: 46_900_000 },
};

// ─── Per-contractor monthly quotation trends (6 months) ──────────────────────
// Each entry: { week: 'Mon YYYY', count: number, value: number }

const SERIES_BY_ENTITY: Record<string, { week: string; count: number; value: number }[]> = {
  'SRM Civils': [
    { week: 'Jan 2025', count: 8,  value: 720_000  },
    { week: 'Feb 2025', count: 12, value: 1_100_000 },
    { week: 'Mar 2025', count: 15, value: 1_400_000 },
    { week: 'Apr 2025', count: 10, value: 920_000  },
    { week: 'May 2025', count: 18, value: 1_800_000 },
    { week: 'Jun 2025', count: 14, value: 1_350_000 },
  ],
  'CISDI UK': [
    { week: 'Jan 2025', count: 5,  value: 980_000  },
    { week: 'Feb 2025', count: 8,  value: 1_600_000 },
    { week: 'Mar 2025', count: 6,  value: 1_200_000 },
    { week: 'Apr 2025', count: 12, value: 2_400_000 },
    { week: 'May 2025', count: 9,  value: 1_900_000 },
    { week: 'Jun 2025', count: 11, value: 2_200_000 },
  ],
  'Bath Demolition': [
    { week: 'Jan 2025', count: 15, value: 320_000  },
    { week: 'Feb 2025', count: 20, value: 440_000  },
    { week: 'Mar 2025', count: 18, value: 390_000  },
    { week: 'Apr 2025', count: 22, value: 480_000  },
    { week: 'May 2025', count: 17, value: 360_000  },
    { week: 'Jun 2025', count: 25, value: 540_000  },
  ],
  'Skanska': [
    { week: 'Jan 2025', count: 3,  value: 650_000  },
    { week: 'Feb 2025', count: 5,  value: 1_050_000 },
    { week: 'Mar 2025', count: 4,  value: 840_000  },
    { week: 'Apr 2025', count: 7,  value: 1_470_000 },
    { week: 'May 2025', count: 6,  value: 1_260_000 },
    { week: 'Jun 2025', count: 8,  value: 1_680_000 },
  ],
  'Knights Brown': [
    { week: 'Jan 2025', count: 10, value: 1_100_000 },
    { week: 'Feb 2025', count: 9,  value: 990_000  },
    { week: 'Mar 2025', count: 13, value: 1_430_000 },
    { week: 'Apr 2025', count: 11, value: 1_210_000 },
    { week: 'May 2025', count: 14, value: 1_540_000 },
    { week: 'Jun 2025', count: 12, value: 1_320_000 },
  ],
};

// ─── Aggregate trend (sum across all contractors per month) ───────────────────
const AGGREGATE_POINTS = [
  { week: 'Jan 2025', count: 41,  value: 3_770_000  },
  { week: 'Feb 2025', count: 54,  value: 5_180_000  },
  { week: 'Mar 2025', count: 56,  value: 5_260_000  },
  { week: 'Apr 2025', count: 62,  value: 6_480_000  },
  { week: 'May 2025', count: 64,  value: 6_860_000  },
  { week: 'Jun 2025', count: 70,  value: 7_090_000  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function InteractiveDemoPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);

  const handleBarClick = useCallback((id: string, label: string) => {
    // Toggle: clicking the same bar again deselects it
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
          Click any bar to drill into that contractor's monthly quotation trend.
          Click the same bar again to reset.
        </p>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>Contract Value by Contractor</span>
          <span style={styles.sectionHint}>broadcaster — click a bar</span>
        </div>
        <StackedHorizontalBarChart
          data={BAR_DATA}
          onItemClick={handleBarClick}
        />
      </div>

      <div style={styles.connector}>
        <div style={styles.connectorLine} />
        <span style={styles.connectorLabel}>
          {selectedId
            ? `↓  filtering trend to: ${selectedLabel}`
            : '↓  select a bar above to filter'}
        </span>
        <div style={styles.connectorLine} />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>Monthly Quotation Trend</span>
          <div style={styles.sectionRight}>
            <span style={styles.sectionHint}>listener — reacts to bar click</span>
            {selectedId && (
              <button style={styles.clearBtn} onClick={handleClear}>
                ✕ clear filter
              </button>
            )}
          </div>
        </div>

        {selectedId && (
          <div style={styles.filterBadge}>
            <span style={styles.filterDot} />
            Showing: <strong style={{ marginLeft: 4 }}>{selectedLabel}</strong>
          </div>
        )}

        <Trend
          points={AGGREGATE_POINTS}
          selectedId={selectedId}
          seriesByEntity={SERIES_BY_ENTITY}
        />
      </div>

      <div style={styles.debugBox}>
        <span style={styles.debugTitle}>State</span>
        <code style={styles.debugCode}>
          selectedId: {selectedId ?? 'null'}{'\n'}
          seriesByEntity[selectedId] has {selectedId ? (SERIES_BY_ENTITY[selectedId]?.length ?? 0) : '—'} points
        </code>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0d1424',
    padding: '40px 48px',
    fontFamily: "'Satoshi Variable', 'DM Sans', sans-serif",
    color: '#ccd6f6',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(204,214,246,0.55)',
    margin: 0,
  },
  section: {
    marginBottom: 8,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '20px 24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e2e8f0',
    letterSpacing: '0.02em',
    textTransform: 'uppercase' as const,
  },
  sectionRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  sectionHint: {
    fontSize: 11,
    color: 'rgba(204,214,246,0.4)',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 8px',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  connector: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
  },
  connectorLine: {
    flex: 1,
    height: 1,
    background: 'rgba(255,255,255,0.08)',
  },
  connectorLabel: {
    fontSize: 12,
    color: 'rgba(204,214,246,0.45)',
    whiteSpace: 'nowrap' as const,
    transition: 'color 0.2s',
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
    marginBottom: 14,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#818ff8',
    flexShrink: 0,
  },
  clearBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 5,
    color: 'rgba(204,214,246,0.7)',
    fontSize: 11,
    padding: '3px 10px',
    cursor: 'pointer',
  },
  debugBox: {
    marginTop: 32,
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: '12px 16px',
  },
  debugTitle: {
    fontSize: 11,
    color: 'rgba(204,214,246,0.35)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    display: 'block',
    marginBottom: 6,
  },
  debugCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: 'rgba(204,214,246,0.6)',
    whiteSpace: 'pre' as const,
  },
};
