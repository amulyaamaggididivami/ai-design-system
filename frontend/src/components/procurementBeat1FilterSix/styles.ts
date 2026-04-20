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
  marginBottom: 22,
};

export const highlight: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontWeight: 600,
  color: CC.orange,
  fontStyle: 'normal',
  letterSpacing: '-0.02em',
};

export const wrap: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.9fr) auto minmax(320px, 0.85fr)',
  gap: 28,
  alignItems: 'center',
  maxWidth: 1180,
  margin: '0 auto',
};

export const leftFrame: CSSProperties = {
  position: 'relative',
  padding: '18px 14px',
  borderRadius: 22,
  border: '1px dashed rgba(255,255,255,0.07)',
  background: 'linear-gradient(180deg, rgba(6,14,26,0.55), rgba(7,16,28,0.28))',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
};

export const leftGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, minmax(56px, 1fr))',
  gap: 10,
  alignItems: 'center',
  justifyItems: 'center',
};

export const hexRow = (_offset: boolean): CSSProperties => ({
  display: 'contents',
});

export const leftCard = (highlighted: boolean, color?: string): CSSProperties => ({
  position: 'relative',
  width: '100%',
  maxWidth: 56,
  aspectRatio: '1 / 1',
  borderRadius: 10,
  padding: '8px 6px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'linear-gradient(180deg, rgba(11,20,34,0.92), rgba(10,18,29,0.98))',
  border: highlighted ? `1px solid ${color ?? CC.orange}` : '1px solid rgba(255,255,255,0.05)',
  boxShadow: highlighted
    ? `0 0 18px ${color ?? CC.orange}35, inset 0 0 0 1px ${color ?? CC.orange}22`
    : 'inset 0 0 0 1px rgba(255,255,255,0.015)',
  overflow: 'visible',
});

export const leftCardGlow = (highlighted: boolean, color?: string): CSSProperties => ({
  position: 'absolute',
  inset: highlighted ? -6 : 0,
  borderRadius: 14,
  background: highlighted ? `radial-gradient(circle, ${color ?? CC.orange}28, transparent 68%)` : 'transparent',
  filter: 'blur(10px)',
  opacity: highlighted ? 0.85 : 0,
  pointerEvents: 'none',
});

export const badge = (color?: string): CSSProperties => ({
  position: 'absolute',
  top: -7,
  right: -7,
  width: 18,
  height: 18,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  color: color ?? CC.orange,
  background: '#081120',
  border: `1.5px solid ${color ?? CC.orange}`,
  boxShadow: `0 0 12px ${color ?? CC.orange}44`,
});

export const leftCardLabel = (highlighted: boolean, color?: string): CSSProperties => ({
  marginTop: 6,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: highlighted ? 8 : 7.5,
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: highlighted ? (color ?? CC.orange) : 'rgba(255,255,255,0.18)',
  whiteSpace: 'nowrap',
});

export const leftCardDot = (highlighted: boolean, color?: string): CSSProperties => ({
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: highlighted ? (color ?? CC.orange) : 'rgba(255,255,255,0.12)',
  boxShadow: highlighted ? `0 0 10px ${color ?? CC.orange}` : 'none',
});

export const arrow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const right: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  padding: '24px 28px 20px',
  minHeight: 300,
  borderRadius: 22,
  background: 'linear-gradient(135deg, rgba(40,24,22,0.55), rgba(18,15,22,0.75) 48%, rgba(62,38,24,0.48) 100%)',
  border: `1px solid ${CC.orange}35`,
  boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.025)`,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
};

export const rightAura: CSSProperties = {
  position: 'absolute',
  inset: '-18% -10% auto auto',
  width: 200,
  height: 200,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${CC.orange}14, transparent 70%)`,
  filter: 'blur(26px)',
  pointerEvents: 'none',
};

export const rightHead: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export const amt: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 40,
  lineHeight: 1,
  fontWeight: 500,
  letterSpacing: '-0.035em',
  color: CC.orange,
};

export const amtLabel: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.5)',
};

export const clusterPanel: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  minHeight: 132,
  borderRadius: 18,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
  border: '1px solid rgba(255,255,255,0.04)',
  display: 'grid',
  placeItems: 'center',
};

export const sixCluster: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
};

export const rightDot = (color?: string): CSSProperties => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  background: color ?? CC.orange,
  boxShadow: `0 0 20px ${color ?? CC.orange}66`,
});

export const metaRow: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 18,
  paddingTop: 16,
  borderTop: '1px solid rgba(255,255,255,0.08)',
};

export const metaItem: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  alignItems: 'flex-start',
};

export const metaValue: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 15,
  fontWeight: 500,
  color: CC.t1,
  letterSpacing: '-0.02em',
};

export const metaKey: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 10,
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
};
