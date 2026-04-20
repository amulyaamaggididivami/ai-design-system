import { motion } from 'framer-motion';

import type { ProcurementBeat3DayRunwayProps } from './types';
import * as S from './styles';

const EASE = [0.16, 1, 0.3, 1] as const;

type Urgency = 'critical' | 'soon' | 'safe';

function glyphForMaterial(name: string, size: number) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' } as const;
  const lower = name.toLowerCase();

  if (lower.includes('brick')) {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="7" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="5" width="10" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.4" />
        <rect x="3" y="10" width="11" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.4" />
        <rect x="15" y="10" width="6" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.4" />
        <rect x="3" y="15" width="7" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="15" width="10" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (lower.includes('plate')) {
    return (
      <svg {...common}>
        <rect x="3" y="8" width="18" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="6" cy="12" r="0.8" fill="currentColor" />
        <circle cx="18" cy="12" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  if (lower.includes('mortar')) {
    return (
      <svg {...common}>
        <path d="M6 9 L18 9 L16.5 19 L7.5 19 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M13 4 L17 8 L14 9 L12 7 Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (lower.includes('seal')) {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
      </svg>
    );
  }
  if (lower.includes('belt')) {
    return (
      <svg {...common}>
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="6" cy="12" r="1.8" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="18" cy="12" r="1.8" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    );
  }
  if (lower.includes('pipe') || lower.includes('pvc')) {
    return (
      <svg {...common}>
        <rect x="5" y="9" width="14" height="6" stroke="currentColor" strokeWidth="1.4" />
        <rect x="3" y="7" width="3" height="10" stroke="currentColor" strokeWidth="1.2" />
        <rect x="18" y="7" width="3" height="10" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <polygon points="12,3 20,8 20,16 12,21 4,16 4,8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function urgencyFor(daysLeft: number): Urgency {
  if (daysLeft <= 2) return 'critical';
  if (daysLeft <= 7) return 'soon';
  return 'safe';
}

function iconSizeFor(urgency: Urgency): number {
  if (urgency === 'critical') return 26;
  if (urgency === 'soon') return 22;
  return 18;
}

function countdownLabel(daysLeft: number): string {
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d late`;
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return '1 day';
  return `${daysLeft} days`;
}

export function ProcurementBeat3DayRunway({
  title = 'When to order each',
  deadlineHighlight = 'Order-by countdown',
  materials,
  deadlineDay,
  maxDay,
  'data-testid': testId,
}: ProcurementBeat3DayRunwayProps) {
  // Enrich every material with daysLeft and urgency
  const enriched = materials.map((m) => {
    const daysLeft = deadlineDay - m.day;
    return { material: m, daysLeft, urgency: urgencyFor(daysLeft) };
  });

  // X-axis domain: minDaysLeft (could be negative for "already late") → max buffer
  const allDaysLeft = enriched.map((e) => e.daysLeft);
  const minDaysLeft = Math.min(...allDaysLeft, 0);
  const maxDaysLeft = Math.max(...allDaysLeft, maxDay - deadlineDay);
  const range = Math.max(1, maxDaysLeft - minDaysLeft);

  // Position: 0% = leftmost (most urgent), 100% = rightmost (most buffer)
  const pctFor = (daysLeft: number) => ((daysLeft - minDaysLeft) / range) * 100;

  // Sort urgent-first for staggered animation
  const sorted = [...enriched].sort((a, b) => a.daysLeft - b.daysLeft);

  // Axis ticks: Today, 3d, 7d, 10d+
  const tickDays = [0, 3, 7, Math.max(10, maxDaysLeft)];
  const tickLabels = ['Today', '3 days', '7 days', '10+ days'];

  return (
    <section style={S.container} data-testid={testId}>
      <motion.h2
        style={S.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {title} · <em style={S.highlight}>{deadlineHighlight}</em>
      </motion.h2>

      <div style={S.roadmap}>
        <div style={S.road}>
          <div style={S.urgentBand} />
          <div style={S.safeBand} />

          <motion.div
            style={S.zoneLabel('left')}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.9, ease: EASE }}
          >
            <span style={S.zoneLabelDot('left')} />
            <span>Order today</span>
          </motion.div>
          <motion.div
            style={S.zoneLabel('right')}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.95, ease: EASE }}
          >
            <span style={S.zoneLabelDot('right')} />
            <span>Plenty of time</span>
          </motion.div>

          <motion.div
            style={S.roadTrack}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          />
          <div style={S.roadTrackDashes} />

          {tickDays.map((day, idx) => {
            const pct = pctFor(day);
            const tone = urgencyFor(day);
            return (
              <motion.div
                key={`tick-${day}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.75 + idx * 0.05 }}
                style={{ pointerEvents: 'none' }}
              >
                <div style={S.tickMark(pct)} />
                <div style={S.tickLabel(pct, tone)}>{tickLabels[idx]}</div>
              </motion.div>
            );
          })}

          {sorted.map(({ material, daysLeft, urgency }, index) => {
            const leftPct = Math.max(2, Math.min(98, pctFor(daysLeft)));
            const above = index % 2 === 0;
            const iconSize = iconSizeFor(urgency);

            return (
              <motion.div
                key={material.id}
                style={S.station(leftPct, above)}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.5 + index * 0.09, ease: EASE }}
              >
                {above ? (
                  <>
                    <div style={S.stationName(urgency)}>{material.name}</div>
                    <div style={S.stationCost(urgency, material.color)}>{material.cost}</div>
                    <div style={{ position: 'relative' }}>
                      {urgency === 'critical' ? (
                        <motion.div
                          style={S.stationPulse(urgency)}
                          animate={{ scale: [1, 1.4], opacity: [0.55, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                        />
                      ) : null}
                      <div style={S.stationIcon(urgency, material.color)}>
                        {glyphForMaterial(material.name, iconSize)}
                      </div>
                    </div>
                    <div style={S.stationStem(urgency, above)} />
                  </>
                ) : (
                  <>
                    <div style={S.stationStem(urgency, above)} />
                    <div style={{ position: 'relative', marginTop: 18 }}>
                      {urgency === 'critical' ? (
                        <motion.div
                          style={S.stationPulse(urgency)}
                          animate={{ scale: [1, 1.4], opacity: [0.55, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                        />
                      ) : null}
                      <div style={S.stationIcon(urgency, material.color)}>
                        {glyphForMaterial(material.name, iconSize)}
                      </div>
                    </div>
                    <div style={S.stationCost(urgency, material.color)}>{material.cost}</div>
                    <div style={S.stationName(urgency)}>{material.name}</div>
                  </>
                )}
                <div style={S.stationCountdown(urgency)}>{countdownLabel(daysLeft)}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
