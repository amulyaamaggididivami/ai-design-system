import type React from 'react';

import { CC, CANVAS_SANS } from '../../canvas/canvasUtils';

const SANS = CANVAS_SANS;

const LABEL: React.CSSProperties = {
  color:      '#C2C2C2',
  fontFamily: SANS,
  fontSize:   18,
  fontWeight: 400,
  lineHeight: 1.65,
};

export function Takeaway({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '8px 0px',
        border: 'transparent',
        borderRadius: 5,
        background: 'transparent',
      }}
    >
      <span
        style={{
          fontSize: 18, fontWeight: 500, color: CC.t1,
          fontFamily: SANS, lineHeight: 1.65,
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
