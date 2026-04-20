import type { CSSProperties } from 'react';
import { CC } from '../../canvas/canvasUtils';

export const container: CSSProperties = {
  position: 'relative',
  width: '100%',
  color: CC.t1,
};

export const switcher: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 3,
  display: 'inline-flex',
  background: CC.sf,
  border: `1px solid ${CC.bd}`,
  borderRadius: 999,
  padding: 3,
  gap: 3,
};

export const switchBtn = (active: boolean, accent: string): CSSProperties => ({
  padding: '6px 14px',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.02em',
  borderRadius: 999,
  cursor: 'pointer',
  border: 'none',
  background: active ? `${accent}1F` : 'transparent',
  color: active ? accent : CC.t2,
  transition: 'background 0.2s ease, color 0.2s ease',
});

export const stage: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: 200,
  paddingTop: 48,
  paddingBottom: 120,
};
