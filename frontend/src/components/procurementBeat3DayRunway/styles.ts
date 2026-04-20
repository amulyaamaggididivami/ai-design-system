import type { CSSProperties } from 'react';
import { CC } from '../../canvas/canvasUtils';

export const container: CSSProperties = {
  width: '100%',
  color: CC.t1,
  fontFamily: 'Inter, system-ui, sans-serif',
};

export const title: CSSProperties = {
  fontSize: 28,
  fontWeight: 300,
  letterSpacing: '-0.01em',
  textAlign: 'center',
  marginBottom: 44,
};

export const highlight: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontWeight: 500,
  color: CC.red,
  fontStyle: 'normal',
  letterSpacing: '-0.02em',
};

export const roadmap: CSSProperties = {
  position: 'relative',
  maxWidth: 1200,
  margin: '0 auto',
  padding: '0 72px',
};

export const road: CSSProperties = {
  position: 'relative',
  height: 200,
  marginTop: 32,
  marginBottom: 24,
};

// Red (urgent, left) → Amber → Green (safe, right)
export const roadTrack: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  height: 4,
  transform: 'translateY(-50%)',
  background: `linear-gradient(90deg, ${CC.red} 0%, ${CC.red}aa 15%, ${CC.orange}cc 50%, ${CC.green}cc 82%, ${CC.green} 100%)`,
  borderRadius: 999,
  boxShadow: `0 0 18px ${CC.orange}22`,
};

export const roadTrackDashes: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  height: 1,
  transform: 'translateY(-50%)',
  backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 6px, transparent 6px 14px)',
  pointerEvents: 'none',
};

// Left-zone wash: "Order today" danger band
export const urgentBand: CSSProperties = {
  position: 'absolute',
  top: -24,
  bottom: -24,
  left: 0,
  width: '18%',
  background: `linear-gradient(90deg, ${CC.red}22, transparent)`,
  borderRadius: 12,
  pointerEvents: 'none',
};

// Right-zone wash: "Plenty of time" safe band
export const safeBand: CSSProperties = {
  position: 'absolute',
  top: -24,
  bottom: -24,
  right: 0,
  width: '32%',
  background: `linear-gradient(270deg, ${CC.green}14, transparent)`,
  borderRadius: 12,
  pointerEvents: 'none',
};

// End-zone labels
export const zoneLabel = (side: 'left' | 'right'): CSSProperties => ({
  position: 'absolute',
  top: -18,
  [side]: side === 'left' ? 12 : 12,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 10px',
  borderRadius: 999,
  background: side === 'left' ? `${CC.red}18` : `${CC.green}15`,
  border: `1px solid ${side === 'left' ? CC.red : CC.green}66`,
  color: side === 'left' ? CC.red : CC.green,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
});

export const zoneLabelDot = (side: 'left' | 'right'): CSSProperties => ({
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: side === 'left' ? CC.red : CC.green,
  boxShadow: `0 0 8px ${side === 'left' ? CC.red : CC.green}`,
});

// Axis ticks on the road (e.g. "Today · 3d · 7d · 10d+")
export const tickMark = (leftPct: number): CSSProperties => ({
  position: 'absolute',
  top: '50%',
  left: `${leftPct}%`,
  transform: 'translate(-50%, -50%)',
  width: 2,
  height: 14,
  background: 'rgba(255,255,255,0.18)',
  borderRadius: 1,
});

export const tickLabel = (leftPct: number, tone: 'critical' | 'soon' | 'safe'): CSSProperties => ({
  position: 'absolute',
  top: 'calc(50% + 12px)',
  left: `${leftPct}%`,
  transform: 'translateX(-50%)',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: tone === 'critical' ? `${CC.red}cc` : tone === 'soon' ? `${CC.orange}cc` : `${CC.green}cc`,
  whiteSpace: 'nowrap',
});

export const station = (leftPct: number, above: boolean): CSSProperties => ({
  position: 'absolute',
  top: above ? 0 : '50%',
  left: `${leftPct}%`,
  transform: above ? 'translate(-50%, 0)' : 'translate(-50%, 8px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
  zIndex: 3,
});

export const stationStem = (urgency: 'critical' | 'soon' | 'safe', above: boolean): CSSProperties => {
  const color = urgency === 'critical' ? CC.red : urgency === 'soon' ? CC.orange : CC.green;
  return {
    position: 'absolute',
    left: '50%',
    top: above ? 'auto' : 0,
    bottom: above ? 0 : 'auto',
    transform: 'translateX(-50%)',
    width: 1,
    height: 18,
    background: `linear-gradient(${above ? '180deg' : '0deg'}, transparent, ${color})`,
  };
};

export const stationIcon = (urgency: 'critical' | 'soon' | 'safe', color: string): CSSProperties => {
  const size = urgency === 'critical' ? 54 : urgency === 'soon' ? 44 : 36;
  const toneColor = urgency === 'critical' ? CC.red : urgency === 'soon' ? CC.orange : CC.green;
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: urgency === 'safe' ? 'rgba(255,255,255,0.7)' : color,
    background: 'linear-gradient(180deg, rgba(12,20,32,0.96), rgba(9,16,26,0.98))',
    border: `1.5px solid ${urgency === 'safe' ? `${toneColor}99` : toneColor}`,
    boxShadow:
      urgency === 'critical'
        ? `0 0 28px ${toneColor}66, 0 0 0 4px ${toneColor}18`
        : urgency === 'soon'
          ? `0 0 16px ${toneColor}35`
          : `0 0 8px ${toneColor}20`,
  };
};

export const stationPulse = (urgency: 'critical' | 'soon' | 'safe'): CSSProperties => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: urgency === 'critical' ? 68 : 0,
  height: urgency === 'critical' ? 68 : 0,
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  border: urgency === 'critical' ? `1px solid ${CC.red}` : 'none',
  opacity: 0,
  pointerEvents: 'none',
});

export const stationName = (urgency: 'critical' | 'soon' | 'safe'): CSSProperties => ({
  fontSize: 11,
  fontWeight: 500,
  color: urgency === 'safe' ? 'rgba(255,255,255,0.55)' : CC.t1,
  textAlign: 'center',
  maxWidth: 94,
  lineHeight: 1.15,
  letterSpacing: '-0.005em',
});

export const stationCost = (urgency: 'critical' | 'soon' | 'safe', color: string): CSSProperties => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11,
  fontWeight: 600,
  color: urgency === 'critical' ? CC.red : urgency === 'soon' ? color : 'rgba(255,255,255,0.65)',
  letterSpacing: '-0.02em',
  lineHeight: 1,
});

// "0d" / "−7d" / "4d" — days remaining to order
export const stationCountdown = (urgency: 'critical' | 'soon' | 'safe'): CSSProperties => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: urgency === 'critical' ? CC.red : urgency === 'soon' ? `${CC.orange}cc` : `${CC.green}cc`,
});
