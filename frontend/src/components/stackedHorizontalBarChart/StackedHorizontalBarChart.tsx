import { useRef, useState } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { easeOutQuart, stagger, tickHoverProgress } from '../../canvas/easing';
import { CC, AXIS_LABEL, CHART_VALUE, LEGEND_LABEL, rgb, drawGlow } from '../../canvas/canvasUtils';
import { useCanvasLoop } from '../../canvas/useCanvasLoop';
import { ChartEmptyState } from '../common/ChartEmptyState';
import { ToggleButton } from '../common/ToggleButton';
import type { ContractorRow } from '../../types';
import type { StackedHorizontalBarChartProps } from './types';

const W        = 680;
const MIN_H    = 220;
const MAX_ITEMS = 8;
const COLORS   = [CC.teal];
const PAD      = { left: 8, right: 100, top: 16, bottom: 38 };
const NAME_W   = 150;
const BAR_H    = 6;

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
  return t + '…';
}

function fmtValue(v: number): string {
  const abs  = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}£${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}£${(abs / 1_000).toFixed(1)}K`;
  return `${sign}£${abs.toFixed(0)}`;
}

export function StackedHorizontalBarChart({ data, 'data-testid': testId }: StackedHorizontalBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap  = useRef<Map<string, number>>(new Map());
  const [showAll, setShowAll] = useState(false);

  const { items: items = [], totals } = data;
  const validItems   = items.filter((c): c is ContractorRow => c != null && typeof c === 'object');
  const sortedItems  = [...validItems].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  const visibleItems = showAll ? sortedItems : sortedItems.slice(0, MAX_ITEMS);
  const n             = visibleItems.length;
  const maxCommitment = Math.max(...sortedItems.map(c => Math.abs(c.total ?? 0)), 1);
  const BAR_GAP       = 24;
  const contentH      = n * BAR_H + Math.max(0, n - 1) * BAR_GAP;
  const dynamicH      = PAD.top + PAD.bottom + contentH;
  const barArea       = W - PAD.left - NAME_W - PAD.right;

  const isEmpty = validItems.length === 0;

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: dynamicH });

  useCanvasLoop(
    canvasRef,
    W,
    dynamicH,
    (ctx, progress) => {
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      visibleItems.forEach((con, i) => {
        const color  = COLORS[i % COLORS.length];
        const localP = stagger(progress, i, n, easeOutQuart);
        const y      = PAD.top + i * (BAR_H + BAR_GAP);
        const x0     = PAD.left + NAME_W;
        const hp     = hoverMap.current.get(con.id) ?? 0;
        // clamp to 0 so negative-total bars don't render leftward
        const absBase  = Math.max(con.base ?? 0, 0);
        const absTotal = Math.max(con.total ?? 0, 0);
        const baseW  = (absBase  / maxCommitment) * barArea * localP;
        const totalW = (absTotal / maxCommitment) * barArea * localP;
        const varW   = totalW - baseW;

        // Contractor name  y-axis
        ctx.font         = AXIS_LABEL.font;
        ctx.fillStyle    = hp > 0 ? color : AXIS_LABEL.color;
        ctx.textAlign    = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(truncate(ctx, con.name ?? '', NAME_W - 16), x0 - 8, y + BAR_H / 2);

        // Register hit on label area — same id as bar so hover effect + tooltip both trigger
        registerHitRect(hitZonesRef.current, con.id, 0, y, x0, BAR_H, {
          label   : con.name,
          value   : `${con.totalLabel ?? fmtValue(con.total ?? 0)} total`,
          sublabel: `Base ${con.baseLabel ?? fmtValue(con.base ?? 0)} + Var ${con.variationLabel ?? fmtValue(con.variation ?? 0)}`,
          color,
        });

        // Teal gradient bar (earned/obtained portion)
        if (totalW > 0) {
          if (hp > 0) drawGlow(ctx, x0 + totalW / 2, y + BAR_H / 2, totalW * 0.15, CC.teal, 0.12 * hp);
          const grad = ctx.createLinearGradient(x0, 0, x0 + totalW, 0);
          grad.addColorStop(0, rgb(CC.tealDark, 0.85));
          grad.addColorStop(1, rgb(CC.teal, 1.0));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x0, y, totalW, BAR_H, BAR_H / 2);
          ctx.fill();
        }

        // Unobtained area — faint teal gradient continuation
        const unfilledW = barArea - totalW * localP;
        if (unfilledW > 2) {
          const unfilledX = x0 + totalW * localP;
          const unGrad = ctx.createLinearGradient(unfilledX, 0, x0 + barArea, 0);
          unGrad.addColorStop(0, rgb(CC.tealDark, 0.35));
          unGrad.addColorStop(1, rgb(CC.tealDark, 0.08));
          ctx.fillStyle = unGrad;
          ctx.beginPath();
          ctx.roundRect(unfilledX, y, unfilledW, BAR_H, [0, BAR_H / 2, BAR_H / 2, 0]);
          ctx.fill();
        }

        // Triangle ▲ — tip touches bar bottom edge, body below
        if (totalW > 4) {
          const triX   = x0 + totalW * localP;
          const tipY   = y + BAR_H;
          ctx.fillStyle = rgb(CC.t1, localP);
          ctx.beginPath();
          ctx.moveTo(triX,     tipY);       // tip on bar bottom
          ctx.lineTo(triX - 5, tipY + 9);  // bottom-left
          ctx.lineTo(triX + 5, tipY + 9);  // bottom-right
          ctx.closePath();
          ctx.fill();
        }

        // £ value label that appears after bar animates in
        if (localP > 0.35) {
          const fade = Math.min(1, (localP - 0.35) / 0.4);
          ctx.globalAlpha  = fade;
          ctx.font         = CHART_VALUE.font;
          ctx.fillStyle    = hp > 0 ? color : CHART_VALUE.color;
          ctx.textAlign    = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(con.totalLabel ?? fmtValue(con.total ?? 0), x0 + barArea + 28, y + BAR_H / 2);
          ctx.globalAlpha = 1;
        }

        registerHitRect(hitZonesRef.current, con.id, x0, y, Math.max(totalW, 1), BAR_H, {
          label   : con.name,
          value   : con.totalLabel ?? fmtValue(con.total ?? 0),
          sublabel: `${con.baseLabel ?? fmtValue(con.base ?? 0)} + ${con.variationLabel ?? fmtValue(con.variation ?? 0)}`,
          color,
        });
      });

      // Legend row
      const ly = dynamicH - 14;
      ctx.textBaseline = 'middle';
      ctx.font         = LEGEND_LABEL.font;
      ctx.textAlign    = 'left';

      // Base swatch
      const swatchGrad = ctx.createLinearGradient(PAD.left + NAME_W, 0, PAD.left + NAME_W + 14, 0);
      swatchGrad.addColorStop(0, rgb(CC.tealDark, 0.85));
      swatchGrad.addColorStop(1, rgb(CC.teal, 1.0));
      ctx.fillStyle = swatchGrad;
      ctx.beginPath();
      ctx.roundRect(PAD.left + NAME_W, ly - 3, 14, 6, 2);
      ctx.fill();
      ctx.fillStyle = LEGEND_LABEL.color;
      ctx.fillText('base value', PAD.left + NAME_W + 18, ly);

      // Variation swatch
      ctx.fillStyle = rgb(CC.teal, 0.35);
      ctx.beginPath();
      ctx.roundRect(PAD.left + NAME_W + 160, ly - 3, 14, 6, 2);
      ctx.fill();
      ctx.fillStyle = LEGEND_LABEL.color;
      ctx.fillText('approved variations', PAD.left + NAME_W + 178, ly);

      // Portfolio total right-aligned
      ctx.font      = LEGEND_LABEL.font;
      ctx.textAlign = 'right';
      ctx.fillStyle = LEGEND_LABEL.color;
      ctx.fillText(`Portfolio: ${fmtValue(totals?.total ?? 0)}`, W - 8, ly);
    },
    true,
    { easing: easeOutQuart },
  );

  if (isEmpty) {
    return <ChartEmptyState width={W} height={MIN_H} message="No contract data available" data-testid={testId} />;
  }

  return (
    <div data-testid={testId} style={{ width: W, transition: 'all 0.25s ease' }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Total contract value per contractor — horizontal bar chart"
          style={{ width: W, height: dynamicH, display: 'block', borderRadius: 8 }}
        />
        <CanvasTooltip {...tooltip} parentW={W} parentH={dynamicH} />
      </div>
      {validItems.length > MAX_ITEMS && (
        <div style={{ marginTop: 8 }}>
          <ToggleButton expanded={showAll} onToggle={() => setShowAll(prev => !prev)} />
        </div>
      )}
    </div>
  );
}
