import { useState, useMemo } from 'react';

import { Trend } from '../trend/Trend';
import { ClickableRaceChart } from './ClickableRaceChart';
import {
  widgetRoot,
  widgetHeader,
  widgetTitle,
  widgetSubtitle,
  resetButton,
  connectorRow,
  trendLabel,
  selectionBar,
  selectionDot,
  selectionLabel,
  selectionSublabel,
} from './styles';
import type { InteractiveRaceTrendWidgetProps } from './types';

/** Accent colour for the status bar — green / amber / red by commitment % */
function commitColor(pct: number): string {
  if (pct >= 75) return '#16B364';
  if (pct >= 40) return '#FAC515';
  return '#D92D20';
}

/** Animated vertical SVG arrow pointing downward, pulsing when active */
function ConnectorDown({ active }: { active: boolean }) {
  return (
    <svg
      width={48}
      height={40}
      viewBox="0 0 48 40"
      fill="none"
      aria-hidden="true"
      style={{ opacity: active ? 1 : 0.3, transition: 'opacity 0.3s ease' }}
    >
      {/* Vertical dashed line */}
      <line
        x1={24} y1={0} x2={24} y2={28}
        stroke={active ? '#2970FF' : '#94979C'}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      {/* Arrow head pointing down */}
      <polyline
        points="17,22 24,32 31,22"
        stroke={active ? '#2970FF' : '#94979C'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Pulsing dot when active */}
      {active && (
        <circle cx={24} cy={14} r={3} fill="#2970FF" opacity={0.8}>
          <animate attributeName="cy" values="2;28;2" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.9;0" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

export function InteractiveRaceTrendWidget({
  contractors,
  portfolioTrend,
  'data-testid': testId,
}: InteractiveRaceTrendWidgetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedContractor = useMemo(
    () => contractors.find(c => c.id === selectedId) ?? null,
    [contractors, selectedId],
  );

  // Switch to the selected contractor's trend; fall back to portfolio aggregate
  const activePoints = useMemo(
    () => (selectedContractor ? selectedContractor.trend : portfolioTrend),
    [selectedContractor, portfolioTrend],
  );

  const handleContractorClick = (id: string) => {
    // Toggle: clicking the already-selected lane deselects it
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleReset = () => setSelectedId(null);

  const trendTitle = selectedContractor
    ? `${selectedContractor.name} — Submission Trend`
    : 'Portfolio — Submission Trend';

  const accentColor = selectedContractor
    ? commitColor(selectedContractor.percentage ?? 0)
    : '#2970FF';

  const totalSubmissions = activePoints.reduce((sum, p) => sum + p.count, 0);

  return (
    <div data-testid={testId ?? 'interactive-race-trend-widget'} style={widgetRoot}>
      {/* ── Header ── */}
      <div style={widgetHeader}>
        <div>
          <p style={widgetTitle}>Commitment Race × Submission Trend</p>
          <p style={widgetSubtitle}>
            {selectedContractor
              ? `Showing submission trend for ${selectedContractor.name}`
              : "Click any contractor lane to drill into their submission trend"}
          </p>
        </div>
        {selectedId !== null && (
          <button
            style={resetButton}
            onClick={handleReset}
            aria-label="Reset to portfolio view"
            data-testid="interactive-race-reset-button"
          >
            ← Portfolio view
          </button>
        )}
      </div>

      {/* ── Race chart (top) ── */}
      <div data-testid="interactive-race-chart">
        <ClickableRaceChart
          contractors={contractors}
          selectedId={selectedId}
          onContractorClick={handleContractorClick}
          data-testid="interactive-race-clickable"
        />
      </div>

      {/* ── Vertical connector arrow ── */}
      <div data-testid="interactive-race-connector" style={connectorRow} aria-hidden="true">
        <ConnectorDown active={selectedId !== null} />
      </div>

      {/* ── Trend chart (bottom) — restarts its animation when activePoints changes ── */}
      <div data-testid="interactive-race-trend-section">
        <p style={trendLabel}>{trendTitle}</p>
        <Trend
          points={activePoints}
          data-testid="interactive-race-trend"
        />
      </div>

      {/* ── Selection status bar ── */}
      <div
        data-testid="interactive-race-selection-bar"
        style={{
          ...selectionBar,
          borderLeftColor: accentColor,
          background: selectedContractor
            ? `${accentColor}10`
            : 'rgba(34,36,42,0.4)',
        }}
      >
        <div
          style={{
            ...selectionDot,
            background: accentColor,
            boxShadow: `0 0 6px ${accentColor}80`,
          }}
        />
        <span style={selectionLabel}>
          {selectedContractor
            ? `${selectedContractor.name} · ${selectedContractor.percentage ?? 0}% committed`
            : `Portfolio · ${contractors.length} contractors`}
        </span>
        <span style={selectionSublabel}>
          {`${totalSubmissions} submissions · ${activePoints.length} weeks`}
        </span>
      </div>
    </div>
  );
}
