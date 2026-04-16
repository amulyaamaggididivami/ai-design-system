import { useRef } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { easeOutCubic, easeOutQuart } from '../../canvas/easing';
import { CC, rgb } from '../../canvas/canvasUtils';
import { useCanvasLoop } from '../../canvas/useCanvasLoop';
import type { BudgetImpactChartProps } from './types';

const H = 100;
const RED = '#F06060';
const GREEN = '#34D399';
const FONT_SANS = "'Satoshi Variable', 'DM Sans', sans-serif";
const FONT_MONO = "'SFMono-Regular', Consolas, monospace";

function formatVal(v: number, unit: string): string {
  if (unit === '\u00A3K' || unit === '\u00A3K/day') {
    if (v >= 1000) return `\u00A3${(v / 1000).toFixed(1)}M${unit === '\u00A3K/day' ? '/day' : ''}`;
    return `\u00A3${v}K${unit === '\u00A3K/day' ? '/day' : ''}`;
  }
  return `${v} ${unit}`;
}

export function BudgetImpactChart({ impact, width: W = 680, 'data-testid': testId }: BudgetImpactChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useCanvasLoop(
    canvasRef,
    W,
    H,
    (ctx, progress) => {
      hitZonesRef.current = [];

      const p = easeOutCubic(progress);
      const maxVal = impact.withoutAction;
      const barY = 8;
      const barH = 18;
      const fullW = W - 24;
      const pad = 12;

      // "Without action" bar (full width, dimmed)
      ctx.globalAlpha = 0.15 * p;
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.roundRect(pad, barY, fullW * p, barH, 6);
      ctx.fill();

      // "With action" bar (proportional)
      const ratio = impact.withAction / maxVal;
      ctx.globalAlpha = 0.8 * p;
      ctx.fillStyle = GREEN;
      ctx.beginPath();
      ctx.roundRect(pad, barY, fullW * ratio * p, barH, 6);
      ctx.fill();

      // Savings gap annotation
      if (p > 0.5) {
        const gapStart = pad + fullW * ratio;
        const gapEnd = pad + fullW;
        const midX = (gapStart + gapEnd) / 2;

        ctx.globalAlpha = 0.4 * p;
        ctx.strokeStyle = RED;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(gapStart * p, barY + barH / 2);
        ctx.lineTo(gapEnd * p, barY + barH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        const saved = maxVal - impact.withAction;
        ctx.globalAlpha = p;
        ctx.font = `700 10px ${FONT_SANS}`;
        ctx.fillStyle = RED;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`\u2212${formatVal(saved, impact.unit)} saved`, midX * p, barY + barH / 2);
      }

      // Labels
      ctx.globalAlpha = p * 0.7;
      ctx.font = `600 9px ${FONT_SANS}`;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.fillStyle = GREEN;
      ctx.fillText(`With action: ${formatVal(impact.withAction, impact.unit)}`, pad, barY + barH + 16);
      ctx.textAlign = 'right';
      ctx.fillStyle = CC.t3;
      ctx.fillText(`Without: ${formatVal(impact.withoutAction, impact.unit)}`, W - pad, barY + barH + 16);

      ctx.globalAlpha = 1;

      registerHitRect(hitZonesRef.current, 'with-action', pad, barY, fullW * ratio, barH, {
        label: 'With action',
        value: formatVal(impact.withAction, impact.unit),
        color: GREEN,
      });
      registerHitRect(hitZonesRef.current, 'without-action', pad + fullW * ratio, barY, fullW * (1 - ratio), barH, {
        label: 'Without action',
        value: formatVal(impact.withoutAction, impact.unit),
        color: RED,
      });
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
          color: RED, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          Budget Impact
        </div>
        <div style={{
          fontFamily: FONT_SANS, fontSize: 18, fontWeight: 700, color: RED,
        }}>
          {impact.value}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Budget impact comparison — with and without action"
          style={{ width: W, height: H, display: 'block', cursor: 'crosshair' }}
        />
        <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
      </div>
      {impact.savingsLabel && (
        <div style={{
          fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500,
          color: CC.t2, marginTop: 6, lineHeight: '1.35',
        }}>
          {impact.savingsLabel}
        </div>
      )}
    </div>
  );
}
