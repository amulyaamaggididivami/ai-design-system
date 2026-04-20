import type { CSSProperties } from 'react';
import { CC } from '../../canvas/canvasUtils';

export const container: CSSProperties = {
  position: 'relative',
  width: '100%',
  color: CC.t1,
  fontFamily: 'Inter, system-ui, sans-serif',
};

export const title: CSSProperties = {
  fontSize: 28,
  fontWeight: 300,
  letterSpacing: '-0.01em',
  textAlign: 'center',
  color: CC.t1,
  marginBottom: 40,
};

export const highlight: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontWeight: 700,
  color: CC.red,
  fontStyle: 'normal',
};

export const flowRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '200px 160px 240px 220px',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  maxWidth: 960,
  margin: '0 auto',
};

export const sourceCol: CSSProperties = {
  textAlign: 'center',
  padding: '20px 16px',
  background: CC.sf,
  border: `1px solid ${CC.bd}`,
  borderRadius: 12,
};

export const sourceAmt: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: CC.red,
  lineHeight: 1,
};

export const sourceUnit: CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginLeft: 2,
};

export const sourceSub: CSSProperties = {
  marginTop: 8,
  fontSize: 11,
  color: CC.t3,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

export const splitCol: CSSProperties = {
  position: 'relative',
  height: 220,
};

export const splitCanvas: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
};

export const splitBranch: CSSProperties = {
  position: 'absolute',
  right: 0,
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 4,
};

export const chipOrange: CSSProperties = {
  padding: '4px 10px',
  background: `${CC.orange}1F`,
  border: `1px solid ${CC.orange}`,
  borderRadius: 999,
  color: CC.orange,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
};

export const chipGreen: CSSProperties = {
  padding: '4px 10px',
  background: `${CC.green}1F`,
  border: `1px solid ${CC.green}`,
  borderRadius: 999,
  color: CC.green,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
};

export const branchNote: CSSProperties = {
  fontSize: 10,
  color: CC.t3,
};

export const vesselCol: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: '12px 16px',
};

export const vesselCap: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: CC.green,
};

export const vesselBody: CSSProperties = {
  position: 'relative',
  width: 140,
  height: 110,
  borderRadius: '0 0 12px 12px',
  border: `1px solid ${CC.green}`,
  borderTop: 'none',
  background: `linear-gradient(to top, ${CC.green}26, ${CC.green}08)`,
  overflow: 'hidden',
};

export const vesselBrim: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: -6,
  right: -6,
  height: 4,
  background: CC.green,
  borderRadius: 2,
};

export const vesselFill: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '75%',
  background: `linear-gradient(to top, ${CC.green}, ${CC.green}55)`,
};

export const overflowZone: CSSProperties = {
  width: '100%',
  height: 26,
  position: 'relative',
};

export const overflowWave: CSSProperties = {
  width: '100%',
  height: '100%',
  background: `${CC.red}2A`,
  border: `1px solid ${CC.red}`,
  borderTop: 'none',
  // Wavy top edge created with clip-path polygon
  clipPath:
    'polygon(0% 25%, 5% 10%, 10% 30%, 15% 12%, 20% 30%, 25% 10%, 30% 30%, 35% 14%, 40% 30%, 45% 10%, 50% 30%, 55% 12%, 60% 30%, 65% 10%, 70% 30%, 75% 14%, 80% 30%, 85% 10%, 90% 30%, 95% 12%, 100% 25%, 100% 100%, 0% 100%)',
};

export const overflowCol: CSSProperties = {
  textAlign: 'center',
  padding: '18px 16px',
  background: `${CC.red}12`,
  border: `1px solid ${CC.red}`,
  borderRadius: 12,
};

export const overflowTag: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: CC.red,
  marginBottom: 8,
};

export const overflowAmt: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 40,
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: CC.red,
  lineHeight: 1,
};

export const overflowUnit: CSSProperties = {
  fontSize: 20,
  marginLeft: 2,
};

export const overflowSub: CSSProperties = {
  marginTop: 6,
  fontSize: 11,
  color: CC.t3,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

export const overflowFootnote: CSSProperties = {
  marginTop: 10,
  fontSize: 11,
  color: CC.t2,
};
