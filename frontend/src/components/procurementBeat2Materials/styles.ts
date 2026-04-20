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
  marginBottom: 10,
};

export const highlight: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontWeight: 600,
  color: CC.orange,
  fontStyle: 'normal',
};

export const hint: CSSProperties = {
  textAlign: 'center',
  fontSize: 11,
  color: CC.t3,
  letterSpacing: '0.08em',
  marginBottom: 40,
};

export const row: CSSProperties = {
  display: 'flex',
  gap: 28,
  alignItems: 'flex-start',
  justifyContent: 'center',
  flexWrap: 'wrap',
  maxWidth: 1440,
  margin: '0 auto',
  padding: '20px 24px 40px',
  overflow: 'visible',
};

export const tile = (
  color: string,
  _critical: boolean,
  active: boolean,
  dimmed: boolean,
): CSSProperties => ({
  position: 'relative',
  width: 148,
  padding: '8px 6px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 10,
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  cursor: 'default',
  opacity: dimmed ? 0.35 : 1,
  transition: 'opacity 200ms ease',
  color,
  transform: active ? 'translateY(-4px)' : 'translateY(0)',
});

export const tileGlow = (color: string, active: boolean): CSSProperties => ({
  position: 'absolute',
  top: -14,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 130,
  height: 130,
  background: active ? `radial-gradient(circle, ${color}30, transparent 65%)` : `radial-gradient(circle, ${color}10, transparent 70%)`,
  filter: 'blur(20px)',
  pointerEvents: 'none',
  transition: 'background 200ms ease',
});

export const badgeDot = (_color: string, _active: boolean): CSSProperties => ({
  display: 'none',
});

export const core: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  textAlign: 'center',
};

export const iconWrap = (color: string, active: boolean): CSSProperties => ({
  width: 76,
  height: 76,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  color,
  background: active ? `${color}18` : `${color}08`,
  border: `1.5px solid ${active ? color : `${color}55`}`,
  boxShadow: active ? `0 0 32px ${color}55, inset 0 0 18px ${color}15` : `0 0 14px ${color}18`,
  flexShrink: 0,
  transition: 'all 220ms ease',
});

export const name: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.25,
  color: CC.t1,
  marginTop: 2,
};

export const coreCost = (color: string): CSSProperties => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 16,
  fontWeight: 600,
  color,
  letterSpacing: '-0.02em',
  lineHeight: 1,
});

export const coreQty: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 10,
  fontWeight: 500,
  color: CC.t3,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

export const expand = (color: string): CSSProperties => ({
  position: 'absolute',
  top: 'calc(100% + 12px)',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20,
  minWidth: 230,
  padding: '14px 16px',
  borderRadius: 14,
  background: 'linear-gradient(180deg, rgba(12,20,32,0.98), rgba(10,16,26,0.99))',
  border: `1px solid ${color}`,
  boxShadow: `0 14px 42px rgba(0,0,0,0.55), 0 0 28px ${color}33`,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  pointerEvents: 'none',
});

export const expandTag = (color: string): CSSProperties => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 9,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color,
});

export const expandCost = (color: string): CSSProperties => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 22,
  fontWeight: 600,
  letterSpacing: '-0.03em',
  color,
  lineHeight: 1,
});

export const stats: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 8,
  marginTop: 2,
};

export const statBlock: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  padding: '8px 10px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.04)',
  minWidth: 0,
};

export const statKey: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 8,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: CC.t3,
};

export const statValue: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: CC.t1,
  lineHeight: 1.25,
};

export const deadline = (color: string): CSSProperties => ({
  fontSize: 11,
  fontWeight: 600,
  color,
  marginTop: 2,
});
