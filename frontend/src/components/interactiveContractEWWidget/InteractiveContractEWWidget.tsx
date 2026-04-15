import { useState, useMemo } from 'react';

import { HubAndSpokeRadialChart } from '../hubAndSpokeRadialChart/HubAndSpokeRadialChart';
import { ClickableContractBars } from './ClickableContractBars';
import {
  widgetRoot,
  widgetHeader,
  widgetTitle,
  widgetSubtitle,
  resetButton,
  chartsRow,
  connectorArea,
  selectionBar,
  selectionDot,
  selectionLabel,
  selectionSublabel,
} from './styles';
import type { InteractiveContractEWWidgetProps } from './types';

const STATUS_COLORS: Record<string, string> = {
  Open:      '#D92D20',
  Submitted: '#FAC515',
  Closed:    '#16B364',
};

/** Animated SVG arrow connecting the two charts */
function ConnectorArrow({ active }: { active: boolean }) {
  return (
    <svg
      width={40}
      height={48}
      viewBox="0 0 40 48"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, opacity: active ? 1 : 0.3, transition: 'opacity 0.3s ease' }}
    >
      {/* Horizontal dashed line */}
      <line
        x1={0}
        y1={24}
        x2={28}
        y2={24}
        stroke={active ? '#2970FF' : '#94979C'}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      {/* Arrow head */}
      <polyline
        points="22,17 32,24 22,31"
        stroke={active ? '#2970FF' : '#94979C'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Pulse dot on the line when active */}
      {active && (
        <circle cx={14} cy={24} r={3} fill="#2970FF" opacity={0.8}>
          <animate attributeName="cx" values="2;28;2" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.9;0" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

export function InteractiveContractEWWidget({
  contractors,
  totals,
  portfolioEWStatus,
  'data-testid': testId,
}: InteractiveContractEWWidgetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedContractor = useMemo(
    () => contractors.find(c => c.id === selectedId) ?? null,
    [contractors, selectedId],
  );

  const activeSegments = useMemo(
    () => selectedContractor ? selectedContractor.ewStatus : portfolioEWStatus,
    [selectedContractor, portfolioEWStatus],
  );

  const totalEWs = useMemo(
    () => activeSegments.reduce((sum, s) => sum + s.count, 0),
    [activeSegments],
  );

  const handleBarClick = (id: string) => {
    // Toggle: clicking the already-selected bar deselects
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleReset = () => setSelectedId(null);

  const radialTitle = selectedContractor
    ? `${selectedContractor.name} — EW Status`
    : 'Portfolio EW Status';

  // Derive dominant status color for the selection bar accent
  const dominantStatus = activeSegments.reduce(
    (max, s) => (s.count > max.count ? s : max),
    activeSegments[0] ?? { status: 'Open', count: 0 },
  );
  const accentColor = STATUS_COLORS[dominantStatus.status] ?? '#2970FF';

  return (
    <div data-testid={testId ?? 'interactive-contract-ew-widget'} style={widgetRoot}>
      {/* Header */}
      <div style={widgetHeader}>
        <div>
          <p style={widgetTitle}>Contract Value × EW Status</p>
          <p style={widgetSubtitle}>
            {selectedContractor
              ? `Showing EW status for ${selectedContractor.name}`
              : 'Click any bar to drill into that contractor\'s EW status breakdown'}
          </p>
        </div>
        {selectedId !== null && (
          <button
            style={resetButton}
            onClick={handleReset}
            aria-label="Reset to portfolio view"
            data-testid="interactive-ew-reset-button"
          >
            ← Portfolio view
          </button>
        )}
      </div>

      {/* Charts side by side */}
      <div
        data-testid="interactive-ew-charts-row"
        style={chartsRow}
      >
        {/* Left: Clickable bar chart */}
        <div data-testid="interactive-ew-bar-chart">
          <ClickableContractBars
            contractors={contractors}
            totals={totals}
            selectedId={selectedId}
            onBarClick={handleBarClick}
            data-testid="interactive-ew-clickable-bars"
          />
        </div>

        {/* Connector arrow */}
        <div style={connectorArea} aria-hidden="true">
          <ConnectorArrow active={selectedId !== null} />
        </div>

        {/* Right: Radial chart — updates reactively */}
        <div data-testid="interactive-ew-radial-chart">
          <HubAndSpokeRadialChart
            segments={activeSegments}
            title={radialTitle}
            data-testid="interactive-ew-hub-spoke"
          />
        </div>
      </div>

      {/* Selection status bar */}
      <div
        data-testid="interactive-ew-selection-bar"
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
            ? `${selectedContractor.name} · ${totalEWs} EW${totalEWs !== 1 ? 's' : ''}`
            : `Portfolio · ${totalEWs} total EWs`}
        </span>
        <span style={selectionSublabel}>
          {activeSegments.map(s => `${s.count} ${s.status}`).join(' · ')}
        </span>
      </div>
    </div>
  );
}
