import type { CSSProperties } from 'react';
import { CC } from '../../canvas/canvasUtils';

export const container: CSSProperties = {
  position: 'relative',
  width: '100%',
  color: CC.t1,
  fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
};

export const title: CSSProperties = {
  fontSize: 28,
  fontWeight: 300,
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
  textAlign: 'center',
  color: CC.t1,
  margin: '0 0 32px 0',
};

export const titleHighlight: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: CC.red,
  fontStyle: 'normal',
};

export const flowGrid: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 520,
  maxWidth: 1240,
  margin: '0 auto',
};

export const colLabelsRow: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 24,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: CC.t3,
};

export const colLabel = (leftPct: number): CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: `${leftPct}%`,
  transform: 'translateX(-50%)',
  whiteSpace: 'nowrap',
});

export const canvasLayer: CSSProperties = {
  position: 'absolute',
  inset: '32px 0 0 0',
  width: '100%',
  height: 'calc(100% - 32px)',
  pointerEvents: 'none',
};

export const nodesLayer: CSSProperties = {
  position: 'absolute',
  inset: '32px 0 0 0',
  width: '100%',
  height: 'calc(100% - 32px)',
};

export const node: CSSProperties = {
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

export const contractorDot: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: 'currentColor',
  boxShadow: '0 0 0 3px rgba(255,255,255,0.04)',
};

export const contractorLogo: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: '#F7F9FA',
  padding: 2,
  objectFit: 'contain',
  flexShrink: 0,
};

export const projectCard: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '6px 10px',
  background: CC.sf,
  border: `1px solid ${CC.bd}`,
  borderRadius: 6,
};

export const projectCode: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11,
  fontWeight: 600,
};

export const projectName: CSSProperties = {
  fontSize: 11,
  color: CC.t3,
};

export const nceCluster: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
};

export const nceDotsRow: CSSProperties = {
  display: 'flex',
  gap: 3,
  flexWrap: 'wrap',
  justifyContent: 'center',
  maxWidth: 80,
};

export const nceDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: 'currentColor',
};

export const nceCount: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 10,
  color: CC.t3,
};

export const amountValue: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 17,
  fontWeight: 700,
  letterSpacing: '-0.02em',
};

export const amountKey: CSSProperties = {
  fontSize: 10,
  color: CC.t3,
  letterSpacing: '0.04em',
};

export const totalBox: CSSProperties = {
  position: 'absolute',
  left: '88%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 180,
  padding: '18px 16px',
  background: CC.sf,
  border: `1px solid ${CC.bd}`,
  borderRadius: 10,
  textAlign: 'center',
};

export const invisibleTag: CSSProperties = {
  display: 'inline-block',
  padding: '3px 8px',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: CC.red,
  border: `1px solid ${CC.red}`,
  borderRadius: 4,
  marginBottom: 10,
};

export const totalBig: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 40,
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: CC.red,
  lineHeight: 1,
};

export const totalUnit: CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  marginLeft: 2,
};

export const metaRow: CSSProperties = {
  marginTop: 14,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 11,
  color: CC.t2,
};

export const metaLine: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 4,
};

export const metaValue: CSSProperties = {
  color: CC.t1,
  fontWeight: 600,
};
