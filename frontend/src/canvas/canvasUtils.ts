/**
 * Shared canvas drawing utilities and color helpers.
 * Color tokens and typography tokens are re-exported from theme.ts — edit
 * theme.ts to change any visual value; this file only adds canvas utilities.
 */

import {
  CC, PALETTE, AXIS_LABEL, CHART_VALUE, LEGEND_LABEL,
  MONO_SM, MONO_SM_BOLD, MONO_MD, MONO_MD_BOLD, MONO_LG_BOLD,
  DISPLAY_MD, SANS_SM, SANS_LG, CANVAS_SANS, CANVAS_MONO,
  statusColors,
} from '../theme';
export {
  CC, PALETTE, AXIS_LABEL, CHART_VALUE, LEGEND_LABEL,
  MONO_SM, MONO_SM_BOLD, MONO_MD, MONO_MD_BOLD, MONO_LG_BOLD,
  DISPLAY_MD, SANS_SM, SANS_LG, CANVAS_SANS, CANVAS_MONO,
  statusColors,
};

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
