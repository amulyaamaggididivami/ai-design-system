import { useRef, useEffect } from 'react';

import { setupCanvas, CHART_PALETTE } from '../../canvas/canvasUtils';
import { CC, AXIS_LABEL, LEGEND_LABEL, rgb, drawGlow } from '../../canvas/canvasUtils';
import { easeOutBack, easeOutCubic } from '../../canvas/easing';
import type { SemiCircularGaugeChartProps } from './types';

const W = 480;
const H = 310;
const LINE_H = 18;

// Dark companion for each CHART_PALETTE entry — used as gradient start / sector fill
const CHART_PALETTE_DARK = ['#00818F', '#5C42B8', '#C87B0A', '#2563EB', '#166534'] as const;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function SemiCircularGaugeChart({ confirmed, total, label, colorOffset = 0, 'data-testid': testId }: SemiCircularGaugeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;

    const idx = colorOffset % CHART_PALETTE.length;
    const color = CHART_PALETTE[idx];
    const colorDark = CHART_PALETTE_DARK[idx];

    const DURATION = 80;
    const NEEDLE_DURATION = 72;

    const cx = W / 2;
    const cy = 175;
    const TRACK_R = 148; // outer dim track arc
    const ARC_R   = 133; // inner colored arc — ~5px gap between them
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const totalSpan = Math.PI; // semicircle

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.letterSpacing = AXIS_LABEL.letterSpacing;

      const rawP    = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);
      const needleP  = easeOutBack(Math.min(T / NEEDLE_DURATION, 1));

      const safeValue = Math.round(((confirmed ?? 0) / (total || 1)) * 100);
      const fillAngle = startAngle + (safeValue / 100) * totalSpan * progress;

      // ── Track arc — full semicircle, dim ────────────────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, TRACK_R, startAngle, endAngle);
      ctx.strokeStyle = rgb(color, 0.28);
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt';

      // ── Filled sector (dark wedge) ──────────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, ARC_R, startAngle, fillAngle);
      ctx.closePath();
      ctx.fillStyle = rgb(colorDark, 0.35 * progress);
      ctx.fill();

      // ── Colored arc stroke on filled portion ────────────────────────────────
      const tipX = cx + Math.cos(fillAngle) * ARC_R;
      const tipY = cy + Math.sin(fillAngle) * ARC_R;
      drawGlow(ctx, tipX, tipY, 10, color, 0.3 * progress);
      const arcGrad = ctx.createLinearGradient(
        cx + Math.cos(startAngle) * ARC_R, cy + Math.sin(startAngle) * ARC_R,
        tipX, tipY,
      );
      arcGrad.addColorStop(0, rgb(colorDark, 0.9 * progress));
      arcGrad.addColorStop(1, rgb(color,     1.0 * progress));
      ctx.beginPath();
      ctx.arc(cx, cy, ARC_R, startAngle, fillAngle);
      ctx.strokeStyle = arcGrad;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt';

      // ── Needle ──────────────────────────────────────────────────────────────
      const needleAngle = startAngle + (safeValue / 100) * totalSpan * needleP;
      const nx = cx + Math.cos(needleAngle) * ARC_R;
      const ny = cy + Math.sin(needleAngle) * ARC_R;

      ctx.strokeStyle = rgb(CC.t1, 0.9 * needleP);
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      ctx.lineCap = 'butt';

      // ── Pivot dot ───────────────────────────────────────────────────────────
      drawGlow(ctx, cx, cy, 14, color, 0.2 * needleP);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = CC.t1;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.strokeStyle = rgb(color, 0.7 * needleP);
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── 0% / 50% / 100% labels only ────────────────────────────────────────
      [[0, '0%'], [0.5, '50%'], [1, '100%']].forEach(([frac, lbl]) => {
        const a   = startAngle + (frac as number) * totalSpan;
        const offset = frac === 1 ? TRACK_R + 36 : TRACK_R + 20;
        const lx  = cx + Math.cos(a) * offset;
        const ly  = cy + Math.sin(a) * offset;
        ctx.font      = AXIS_LABEL.font;
        ctx.fillStyle = AXIS_LABEL.color;
        ctx.textAlign = 'center';
        ctx.fillText(lbl as string, lx, ly + 4);
      });

      // ── Percentage — below center ────────────────────────────────────────────
      if (progress > 0.4) {
        const fade = Math.min(1, (progress - 0.4) / 0.4);
        ctx.globalAlpha = fade;
        ctx.font      = `700 32px 'Satoshi Variable', 'DM Sans', sans-serif`;
        ctx.fillStyle = CC.t1;
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(safeValue * needleP)}%`, cx, cy + 54);
        ctx.globalAlpha = 1;
      }

      // ── Stats text ───────────────────────────────────────────────────────────
      if (progress > 0.7 && label) {
        const fade = Math.min(1, (progress - 0.7) / 0.3);
        ctx.globalAlpha = fade;
        ctx.font      = LEGEND_LABEL.font;
        ctx.fillStyle = LEGEND_LABEL.color;
        ctx.textAlign = 'center';
        const statsText = `${confirmed ?? 0} of ${total ?? 0} ${label}`;
        wrapText(ctx, statsText, W - 40).forEach((line, i) => {
          ctx.fillText(line, cx, cy + 90 + i * LINE_H);
        });
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [confirmed, total, label, colorOffset]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Compensation event gauge — ${Math.round(((confirmed ?? 0) / (total || 1)) * 100)}% of NCEs confirmed as compensation events`}
        style={{ width: W, height: H, display: 'block' }}
      />
    </div>
  );
}
