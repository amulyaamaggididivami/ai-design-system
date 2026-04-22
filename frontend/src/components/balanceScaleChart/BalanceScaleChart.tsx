import { useRef, useEffect } from 'react';

import { CC, AXIS_LABEL, CHART_VALUE, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import { easeOutBack, easeOutCubic } from '../../canvas/easing';
import type { BalanceScaleChartProps } from './types';

const W = 500;
const H = 210;

export function BalanceScaleChart({ left, right, 'data-testid': testId }: BalanceScaleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 80;

    const cx = W / 2;
    const pivotY = 20;
    const maxVal = Math.max(left.value ?? 0, right.value ?? 0, 1);
    const tilt = ((left.value - right.value) / maxVal) * 14; // degrees

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.letterSpacing = AXIS_LABEL.letterSpacing;

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);
      const tiltP = easeOutBack(Math.min(T / DURATION, 1));

      const currentTilt = tilt * tiltP;
      const tiltRad = (currentTilt * Math.PI) / 180;

      // Pivot post
      ctx.strokeStyle = rgb(CC.bd, 0.5 * progress);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, pivotY);
      ctx.lineTo(cx, pivotY + 130);
      ctx.stroke();

      // Pivot dot
      ctx.beginPath();
      ctx.arc(cx, pivotY, 5 * progress, 0, Math.PI * 2);
      ctx.fillStyle = CC.t2;
      ctx.fill();

      // Beam
      const beamLen = 160;
      const leftEnd = {
        x: cx - Math.cos(tiltRad) * beamLen,
        y: pivotY + Math.sin(-tiltRad) * beamLen,
      };
      const rightEnd = {
        x: cx + Math.cos(tiltRad) * beamLen,
        y: pivotY + Math.sin(tiltRad) * beamLen,
      };

      ctx.strokeStyle = rgb(CC.t2, 0.5 * progress);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftEnd.x, leftEnd.y);
      ctx.lineTo(rightEnd.x, rightEnd.y);
      ctx.stroke();

      // --- Left pan: Accepted ---
      const leftPanH = Math.max(20, (left.value / maxVal) * 100 * progress);
      const leftPanY = leftEnd.y + 18;
      const panW = 90;

      drawGlow(ctx, leftEnd.x, leftPanY + leftPanH / 2, panW * 0.5, CC.green, 0.18 * progress);

      // Pan fill
      ctx.fillStyle = rgb(CC.green, 0.5 * progress);
      ctx.beginPath();
      ctx.roundRect(leftEnd.x - panW / 2, leftPanY, panW, leftPanH, [0, 0, 6, 6]);
      ctx.fill();
      ctx.strokeStyle = rgb(CC.green, 0.7 * progress);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pan strings
      ctx.strokeStyle = rgb(CC.t2, 0.35 * progress);
      ctx.lineWidth = 1;
      [-panW / 3, panW / 3].forEach(dx => {
        ctx.beginPath();
        ctx.moveTo(leftEnd.x + dx, leftEnd.y + 4);
        ctx.lineTo(leftEnd.x + dx, leftPanY);
        ctx.stroke();
      });

      // Left labels
      if (progress > 0.5) {
        const fade = Math.min(1, (progress - 0.5) / 0.5);
        ctx.globalAlpha = fade;
        ctx.font = CHART_VALUE.font;
        ctx.fillStyle = CC.green;
        ctx.textAlign = 'center';
        ctx.fillText(left.label, leftEnd.x, leftPanY + leftPanH + 18);
        ctx.font = AXIS_LABEL.font;
        ctx.fillStyle = AXIS_LABEL.color;
        ctx.fillText('Accepted', leftEnd.x, leftPanY + leftPanH + 38);
        ctx.fillText(`${left.count} quotations`, leftEnd.x, leftPanY + leftPanH + 58);
        ctx.globalAlpha = 1;
      }

      // --- Right pan: Submitted ---
      const rightPanH = Math.max(20, (right.value / maxVal) * 100 * progress);
      const rightPanY = rightEnd.y + 18;

      // Pan fill
      ctx.fillStyle = rgb(CC.amber, 0.3 * progress);
      ctx.strokeStyle = rgb(CC.amber, 0.5 * progress);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightEnd.x - panW / 2, rightPanY, panW, rightPanH, [0, 0, 6, 6]);
      ctx.fill();
      ctx.stroke();

      // Pan strings
      ctx.strokeStyle = rgb(CC.t2, 0.35 * progress);
      ctx.lineWidth = 1;
      [-panW / 3, panW / 3].forEach(dx => {
        ctx.beginPath();
        ctx.moveTo(rightEnd.x + dx, rightEnd.y + 4);
        ctx.lineTo(rightEnd.x + dx, rightPanY);
        ctx.stroke();
      });

      // Right labels
      if (progress > 0.5) {
        const fade = Math.min(1, (progress - 0.5) / 0.5);
        ctx.globalAlpha = fade;
        ctx.font = CHART_VALUE.font;
        ctx.fillStyle = CC.amber;
        ctx.textAlign = 'center';
        ctx.fillText(right.label, rightEnd.x, rightPanY + rightPanH + 18);
        ctx.font = AXIS_LABEL.font;
        ctx.fillStyle = AXIS_LABEL.color;
        ctx.fillText('Submitted', rightEnd.x, rightPanY + rightPanH + 38);
        ctx.fillText(`${right.count} quotations`, rightEnd.x, rightPanY + rightPanH + 58);
        ctx.globalAlpha = 1;
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
        style={{ width: W, height: H, display: 'block' }}
      />
    </div>
  );
}
