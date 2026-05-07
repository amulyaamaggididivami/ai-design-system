import { useRef, useEffect } from 'react';

import { CC, AXIS_LABEL, CHART_VALUE, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import { easeOutBack, easeOutCubic } from '../../canvas/easing';
import type { BalanceScaleChartProps } from './types';

const W = 780;
const H = 420;

export function BalanceScaleChart({ left, right, leftTitle = 'Accepted', rightTitle = 'Submitted', unit = 'quotations', 'data-testid': testId }: BalanceScaleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 80;

    const cx      = W / 2;
    const pivotY  = 100;
    const beamLen = 240;
    const panW    = 99;
    const strLen  = 30;

    const absLeft  = Math.abs(left.value  ?? 0);
    const absRight = Math.abs(right.value ?? 0);
    const maxVal   = Math.max(absLeft, absRight, 1);
    const rawTilt  = ((left.value - right.value) / (2 * maxVal)) * 14;
    const tilt     = Math.max(-14, Math.min(14, rawTilt));

    const drawPan = (
      color: string,
      anchorX: number,
      anchorY: number,
      panH: number,
      prog: number,
    ) => {
      const panX = anchorX - panW / 2;
      const panY = anchorY + strLen;
      const r    = [0, 0, 10, 10] as [number, number, number, number];

      // Solid dark base fill
      ctx.beginPath();
      ctx.roundRect(panX, panY, panW, panH, r);
      ctx.fillStyle = rgb(CC.t4, 0.92 * prog);
      ctx.fill();

      // Inner shadow — 0px 0px 30px 0px color@70% inset
      // Replicated via 4 linear gradient fills from each edge, clipped to shape
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(panX, panY, panW, panH, r);
      ctx.clip();
      const gs = 30; // glow size = CSS blur radius
      const c0 = rgb(color, 0.7 * prog);
      const c1 = rgb(color, 0);
      // Bottom
      const lgB = ctx.createLinearGradient(0, panY + panH, 0, panY + panH - gs);
      lgB.addColorStop(0, c0); lgB.addColorStop(1, c1);
      ctx.fillStyle = lgB;
      ctx.fillRect(panX, panY + panH - gs, panW, gs);
      // Top
      const lgT = ctx.createLinearGradient(0, panY, 0, panY + gs);
      lgT.addColorStop(0, c0); lgT.addColorStop(1, c1);
      ctx.fillStyle = lgT;
      ctx.fillRect(panX, panY, panW, gs);
      // Left
      const lgL = ctx.createLinearGradient(panX, 0, panX + gs, 0);
      lgL.addColorStop(0, c0); lgL.addColorStop(1, c1);
      ctx.fillStyle = lgL;
      ctx.fillRect(panX, panY, gs, panH);
      // Right
      const lgR = ctx.createLinearGradient(panX + panW, 0, panX + panW - gs, 0);
      lgR.addColorStop(0, c0); lgR.addColorStop(1, c1);
      ctx.fillStyle = lgR;
      ctx.fillRect(panX + panW - gs, panY, gs, panH);
      ctx.restore();

      // Border: 1px solid color, all sides — Figma spec
      ctx.beginPath();
      ctx.roundRect(panX, panY, panW, panH, r);
      ctx.strokeStyle = rgb(color, 1.0 * prog);
      ctx.lineWidth   = 1;
      ctx.stroke();

      // Single thread down, splits into small V only at the last ~10px before pan
      const panCX   = panX + panW / 2;
      const splitY  = panY - 5;
      ctx.strokeStyle = rgb(CC.t2, 0.5 * prog);
      ctx.lineWidth   = 1;
      // Main vertical thread
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY + 4);
      ctx.lineTo(panCX, splitY);
      ctx.stroke();
      // Tiny V split at the bottom
      ctx.beginPath();
      ctx.moveTo(panCX, splitY);
      ctx.lineTo(panCX - 10, panY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(panCX, splitY);
      ctx.lineTo(panCX + 10, panY);
      ctx.stroke();

      // Anchor dot
      ctx.beginPath();
      ctx.arc(anchorX, anchorY, 3, 0, Math.PI * 2);
      ctx.fillStyle = rgb(CC.t2, 0.7 * prog);
      ctx.fill();
    };

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.letterSpacing = AXIS_LABEL.letterSpacing;

      const rawP     = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);
      const tiltP    = easeOutBack(Math.min(T / DURATION, 1));

      const currentTilt = tilt * tiltP;
      const tiltRad     = (currentTilt * Math.PI) / 180;

      const leftEnd  = { x: cx - Math.cos(tiltRad) * beamLen, y: pivotY + Math.sin(-tiltRad) * beamLen };
      const rightEnd = { x: cx + Math.cos(tiltRad) * beamLen, y: pivotY + Math.sin(tiltRad)  * beamLen };

      // Beam
      ctx.strokeStyle = rgb(CC.t2, 0.55 * progress);
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftEnd.x, leftEnd.y);
      ctx.lineTo(rightEnd.x, rightEnd.y);
      ctx.stroke();

      // Pivot dot (large, on beam)
      drawGlow(ctx, cx, pivotY, 18, CC.t2, 0.14 * progress);
      ctx.beginPath();
      ctx.arc(cx, pivotY, 9 * progress, 0, Math.PI * 2);
      ctx.fillStyle = rgb(CC.t2, 0.85 * progress);
      ctx.fill();

      // Pans
      const leftPanH  = Math.max(20, (absLeft  / maxVal) * 95 * progress);
      const rightPanH = Math.max(20, (absRight / maxVal) * 95 * progress);

      drawPan(CC.green, leftEnd.x,  leftEnd.y,  leftPanH,  progress);
      drawPan(CC.amber, rightEnd.x, rightEnd.y, rightPanH, progress);

      // Labels
      if (progress > 0.5) {
        const fade  = Math.min(1, (progress - 0.5) / 0.5);
        ctx.globalAlpha  = fade;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'top';

        const leftPanBottom  = leftEnd.y  + strLen + leftPanH  + 14;
        const rightPanBottom = rightEnd.y + strLen + rightPanH + 14;

        // Left value
        ctx.font      = `700 34px 'Satoshi Variable', 'DM Sans', sans-serif`;
        ctx.fillStyle = CC.t1;
        ctx.fillText(left.label, leftEnd.x, leftPanBottom);

        // Left sub-label
        ctx.font      = AXIS_LABEL.font;
        ctx.fillStyle = AXIS_LABEL.color;
        ctx.fillText(`${leftTitle} ${left.count} ${unit}`, leftEnd.x, leftPanBottom + 42);

        // Right value
        ctx.font      = `700 34px 'Satoshi Variable', 'DM Sans', sans-serif`;
        ctx.fillStyle = CC.t1;
        ctx.fillText(right.label, rightEnd.x, rightPanBottom);

        // Right sub-label
        ctx.font      = AXIS_LABEL.font;
        ctx.fillStyle = AXIS_LABEL.color;
        ctx.fillText(`${rightTitle} ${right.count} ${unit}`, rightEnd.x, rightPanBottom + 42);

        ctx.globalAlpha  = 1;
        ctx.textBaseline = 'alphabetic';
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [left, right]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Quotation balance — accepted vs submitted quotation value"
        style={{ width: W, height: H, display: 'block', borderRadius: 8 }}
      />
    </div>
  );
}
