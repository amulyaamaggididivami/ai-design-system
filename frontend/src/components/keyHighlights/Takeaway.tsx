import type React from 'react';

import { CC } from '../../canvas/canvasUtils';

const SANS = "'Satoshi Variable', 'DM Sans', sans-serif";

const LABEL: React.CSSProperties = {
  color:      '#C2C2C2',
  fontFamily: SANS,
  fontSize:   16,
  fontWeight: 400,
  lineHeight: '20px',
};

export function Takeaway({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '8px 12px',
        border: 'transparent',
        borderRadius: 5,
        background: 'transparent',
      }}
    >
      <span
        style={{
          fontSize: 16, fontWeight: 500, color: CC.t1,
          fontFamily: SANS, lineHeight: '20px',
          marginRight: 8,
        }}
      >
        Takeaway
      </span>
      <span style={{ ...LABEL }}>
        {text}
      </span>
    </div>
  );
}
