import type { CSSProperties } from 'react';

export const widgetRoot: CSSProperties = {
  background: '#13161B',
  borderRadius: 16,
  padding: '20px 24px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

export const widgetHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};

export const widgetTitle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#F7F7F7',
  fontFamily: "'Satoshi Variable', 'DM Sans', sans-serif",
  margin: 0,
};

export const widgetSubtitle: CSSProperties = {
  fontSize: 12,
  fontWeight: 400,
  color: '#94979C',
  fontFamily: "'Satoshi Variable', 'DM Sans', sans-serif",
  margin: 0,
};

export const resetButton: CSSProperties = {
  background: 'rgba(41,112,255,0.12)',
  border: '1px solid rgba(41,112,255,0.35)',
  borderRadius: 6,
  color: '#2970FF',
  fontSize: 11,
  fontWeight: 500,
  fontFamily: "'Satoshi Variable', 'DM Sans', sans-serif",
  padding: '4px 10px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  flexShrink: 0,
};

export const connectorRow: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export const trendLabel: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: '#94979C',
  fontFamily: "'Satoshi Variable', 'DM Sans', sans-serif",
  margin: '0 0 6px 0',
};

export const selectionBar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 14px',
  background: 'rgba(34,36,42,0.6)',
  borderRadius: 8,
  borderLeft: '3px solid transparent',
  minHeight: 36,
  transition: 'all 0.25s ease',
};

export const selectionDot: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
};

export const selectionLabel: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: '#F7F7F7',
  fontFamily: "'Satoshi Variable', 'DM Sans', sans-serif",
};

export const selectionSublabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 400,
  color: '#94979C',
  fontFamily: "'Satoshi Variable', 'DM Sans', sans-serif",
  marginLeft: 'auto',
};
