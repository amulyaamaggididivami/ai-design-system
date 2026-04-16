import { useRef } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { easeOutCubic, easeOutQuart } from '../../canvas/easing';
import { CC, rgb, drawGlow } from '../../canvas/canvasUtils';
import { useCanvasLoop } from '../../canvas/useCanvasLoop';
import type { TimelineSparkChartProps } from './types';

const W = 680;
const H = 120;
const AMBER = '#FBBF24';
const FONT_SANS = "'Satoshi Variable', 'DM Sans', sans-serif";
const FONT_MONO = "'SFMono-Regular', Consolas, monospace";

function formatVal(v: number): string {
  if (v >= 1000) return `\u00A3${(v / 1000).toFixed(1)}M`;
  return `\u00A3${v}K`;
}

export function TimelineSparkChart({ impact, 'data-testid': testId }: TimelineSparkChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useCanvasLoop(
    canvasRef,
    W,
    H,
    (ctx, progress) => {
      hitZonesRef.current = [];

      const p = easeOutCubic(progress);
      const { monthlyRisk, months } = impact;
      const maxVal = Math.max(...monthlyRisk, 1);
      const padT = 4;
      const padB = 16;
      const padL = 12;
      const padR = 12;
      const chartH = H - padT - padB;
      const chartW = W - padL - padR;
      const n = monthlyRisk.length;
      const stepW = chartW / n;

      // Area fill
      ctx.beginPath();
      ctx.moveTo(padL, padT + chartH);
      monthlyRisk.forEach((val, i) => {
        const x = padL + i * stepW + stepW / 2;
        const y = padT + chartH - (val / maxVal) * chartH * p;
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = padL + (i - 1) * stepW + stepW / 2;
          const cpX = (prevX + x) / 2;
          const prevY = padT + chartH - (monthlyRisk[i - 1] / maxVal) * chartH * p;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.lineTo(padL + chartW, padT + chartH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      grad.addColorStop(0, rgb(AMBER, 0.2 * p));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      monthlyRisk.forEach((val, i) => {
        const x = padL + i * stepW + stepW / 2;
        const y = padT + chartH - (val / maxVal) * chartH * p;
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevX = padL + (i - 1) * stepW + stepW / 2;
          const cpX = (prevX + x) / 2;
          const prevY = padT + chartH - (monthlyRisk[i - 1] / maxVal) * chartH * p;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8 * p;
      ctx.stroke();

      // Data points + hovered highlight
      const hovered = hoveredRef.current;
      monthlyRisk.forEach((val, i) => {
        const x = padL + i * stepW + stepW / 2;
        const y = padT + chartH - (val / maxVal) * chartH * p;
        const isH = hovered === `point-${i}`;

        if (isH) {
          drawGlow(ctx, x, y, 12, AMBER, 0.3);
          ctx.globalAlpha = 1;
          ctx.fillStyle = AMBER;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Vertical guide
          ctx.globalAlpha = 0.2;
          ctx.strokeStyle = AMBER;
          ctx.lineWidth = 0.5;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(x, y + 4);
          ctx.lineTo(x, padT + chartH);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (val > 0 && months[i]) {
          ctx.globalAlpha = 0.4 * p;
          ctx.fillStyle = AMBER;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hit zone for each point
        if (months[i]) {
          registerHitRect(hitZonesRef.current, `point-${i}`, x - stepW / 2, padT, stepW, chartH, {
            label: months[i],
            value: formatVal(monthlyRisk[i]),
            color: AMBER,
          });
        }
      });

      // X-axis labels
      ctx.globalAlpha = 0.5 * p;
      ctx.font = `500 8px ${FONT_SANS}`;
      ctx.fillStyle = CC.t3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      months.forEach((m, i) => {
        if (m) ctx.fillText(m, padL + i * stepW + stepW / 2, H - 2);
      });

      ctx.globalAlpha = 1;
    },
    true,
    { easing: easeOutQuart },
  );

  return (
    <div
      data-testid={testId}
      style={{
        padding: '14px 16px',
        borderRadius: 18,
        border: `1px solid ${rgb(CC.t3, 0.12)}`,
        background: `linear-gradient(180deg, ${rgb(CC.sf, 0.96)}, ${rgb(CC.bgL, 0.96)})`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600,
          color: AMBER, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          Timeline Impact
        </div>
        <div style={{
          fontFamily: FONT_SANS, fontSize: 18, fontWeight: 700, color: AMBER,
        }}>
          {impact.value}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Timeline impact risk accumulation sparkline"
          style={{ width: W, height: H, display: 'block', cursor: 'crosshair' }}
        />
        <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
      </div>
      {impact.label && (
        <div style={{
          fontFamily: FONT_MONO, fontSize: 9, fontWeight: 500,
          color: CC.t3, marginTop: 4, letterSpacing: '0.02em',
        }}>
          {impact.label}
        </div>
      )}
    </div>
  );
}
