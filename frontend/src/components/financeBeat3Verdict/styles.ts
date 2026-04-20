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
  marginBottom: 40,
};

export const greenHighlight: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontWeight: 700,
  color: CC.green,
  fontStyle: 'normal',
};

export const orangeHighlight: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontWeight: 700,
  color: CC.orange,
  fontStyle: 'normal',
};

export const wrap: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 60px 1fr',
  gap: 16,
  alignItems: 'stretch',
  maxWidth: 980,
  margin: '0 auto',
};

export const side = (accent: string): CSSProperties => ({
  position: 'relative',
  padding: '24px 22px',
  background: CC.sf,
  border: `1px solid ${accent}`,
  borderRadius: 14,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const halo = (accent: string): CSSProperties => ({
  position: 'absolute',
  inset: -1,
  borderRadius: 14,
  boxShadow: `0 0 24px ${accent}33`,
  pointerEvents: 'none',
});

export const stamp = (accent: string): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 10px',
  background: `${accent}1F`,
  border: `1px solid ${accent}`,
  borderRadius: 999,
  alignSelf: 'flex-start',
  color: accent,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});

export const stampIcon: CSSProperties = {
  fontWeight: 700,
};

export const verdictNum = (accent: string): CSSProperties => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 44,
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: accent,
  lineHeight: 1,
});

export const verdictUnit: CSSProperties = {
  fontSize: 22,
  marginLeft: 2,
};

export const reason: CSSProperties = {
  fontSize: 12,
  color: CC.t2,
};

export const divider: CSSProperties = {
  height: 1,
  background: CC.bd,
  margin: '6px 0',
};

export const payLabel: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: CC.t3,
};

export const list: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export const row: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '22px 1fr auto',
  alignItems: 'center',
  gap: 8,
  fontSize: 12,
};

export const rowLogo: CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: '50%',
  background: '#F7F9FA',
  padding: 2,
  objectFit: 'contain',
};

export const dot = (color: string): CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: color,
  justifySelf: 'center',
});

export const nameCol: CSSProperties = {
  color: CC.t1,
};

export const amtCol: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontWeight: 600,
};

export const verdictDividerV: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  color: CC.t3,
};

export const vdvLine: CSSProperties = {
  width: 1,
  flex: 1,
  background: CC.bd,
};

export const vdvPlus: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 18,
};

export const recover = (accent: string): CSSProperties => ({
  marginTop: 8,
  padding: '8px 12px',
  background: `${accent}14`,
  border: `1px solid ${accent}40`,
  borderRadius: 8,
  fontSize: 11,
  color: CC.t2,
  textAlign: 'center',
});

export const recoverValue = (accent: string): CSSProperties => ({
  color: accent,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontWeight: 700,
});
