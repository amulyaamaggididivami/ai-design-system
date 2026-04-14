/**
 * Shared canvas drawing utilities and color helpers.
 * Ported from enterprise-brain/src/canvas/utils.js + theme/tokens.js
 */

// --- Color tokens ---

export const CC = {
  bg:     '#0C0E12',
  bgL:    '#0C1420',
  sf:     '#13161B',
  bd:     '#22262F',
  blue:   '#2970FF',
  cyan:   '#36BFFA',
  orange: '#EF6820',
  red:    '#EF6820',
  green:  '#71B941',
  purple: '#7A5AF8',
  amber:  '#FAC515',
  t1:     '#F7F7F7',
  t2:     '#C2C2C2',
  t3:     '#94979C',
  t4:     '#334155',
} as const;

export const PALETTE = [CC.blue, CC.cyan, CC.amber, CC.purple, CC.green, CC.red];


// --- Typography tokens ---

/**
 * Axis label style — applied to all x-axis and y-axis tick labels, titles, and legends.
 * Change once here to update every chart.
 *   color:       #94979C  (CC.t2)
 *   font-family: Satoshi Variable, DM Sans (SANS fallback)
 *   font-size:   12px
 *   font-weight: 400
 *   line-height: 18px (informational — not applicable in canvas ctx.font)
 */
export const AXIS_LABEL = {
  font:  "400 14px 'Satoshi Variable', 'DM Sans', sans-serif",
  color: '#C2C2C2',   // #94979C
} as const;

/**
 * Legend label style — applied to all chart legend items (swatches, keys, footers).
 * Change once here to update every chart legend.
 *   color:       #94979C  (CC.t2)
 *   font-family: Satoshi Variable, DM Sans (SANS fallback)
 *   font-size:   12px
 *   font-weight: 400
 *   line-height: 18px (informational — not applicable in canvas ctx.font)
 *   text-align:  center  (set ctx.textAlign = 'center' at the draw call site)
 */
export const LEGEND_LABEL = {
  font:  "400 14px 'Satoshi Variable', 'DM Sans', sans-serif",
  color: '#C2C2C2',   // #94979C
} as const;

// --- Color helpers ---

/** Convert hex + alpha to rgba string */
export function rgb(hex: string, alpha = 1): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Linear interpolation between two values */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Linear interpolation between two hex colors */
export function lerpC(hex1: string, hex2: string, t: number): string {
  const parse = (h: string): [number, number, number] => {
    const clean = h.replace('#', '');
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return [clamp(lerp(r1, r2, t)), clamp(lerp(g1, g2, t)), clamp(lerp(b1, b2, t))]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('').replace(/^/, '#');
}

// --- Canvas setup ---

/** Setup canvas with DPR scaling, returns context */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  dpr = 2,
): CanvasRenderingContext2D {
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.scale(dpr, dpr);
  return ctx;
}

// --- Drawing primitives ---

/** Draw a radial gradient glow (cheaper than ctx.shadowBlur) */
export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha = 0.3,
): void {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, rgb(color, alpha));
  grad.addColorStop(1, rgb(color, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw ambient floating dust particles */
export function drawDust(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  T: number,
  count = 50,
  color = rgb(CC.blue, 0.05),
): void {
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(
      (Math.sin(T * 0.001 + i * 23) * 0.5 + 0.5) * w,
      (Math.cos(T * 0.0008 + i * 37) * 0.5 + 0.5) * h,
      0.6,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = color;
    ctx.fill();
  }
}

/** Draw subtle horizontal scanlines for cinematic feel */
export function drawScanline(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  T: number,
  alpha = 0.015,
): void {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  const offset = (T * 0.5) % 6;
  for (let y = offset; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
}

/** Draw a vertical dashed crosshair line */
export function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  bottom: number,
  color = rgb(CC.t1, 0.08),
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.stroke();
  ctx.setLineDash([]);
}
