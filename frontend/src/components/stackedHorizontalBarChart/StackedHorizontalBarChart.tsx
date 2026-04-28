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
const COLORS   = [CC.blue, CC.amber, CC.purple, CC.green];
const PAD      = { left: 8, right: 80, top: 16, bottom: 38 };
const NAME_W   = 150;
const BAR_H    = 18;

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
  const BAR_GAP       = 8;
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

        // Background track
        ctx.fillStyle = rgb(CC.bd, 0.25);
        ctx.beginPath();
        ctx.roundRect(x0, y, barArea, BAR_H, 4);
        ctx.fill();

        // Base value segment (solid, brighter)
        if (baseW > 0) {
          if (hp > 0) drawGlow(ctx, x0 + baseW / 2, y + BAR_H / 2, baseW * 0.3, color, 0.1 * hp);
          ctx.fillStyle = rgb(color, 0.5 + hp * 0.15);
          ctx.beginPath();
          ctx.roundRect(x0, y, baseW, BAR_H, 4);
          ctx.fill();
        }

        // Variation segment (lighter fill, dashed divider)
        if (varW > 2) {
          ctx.fillStyle = rgb(color, 0.22 + hp * 0.08);
          ctx.beginPath();
          ctx.roundRect(x0 + baseW, y, varW, BAR_H, [0, 4, 4, 0]);
          ctx.fill();
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = rgb(color, 0.55);
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.moveTo(x0 + baseW, y + 3);
          ctx.lineTo(x0 + baseW, y + BAR_H - 3);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Hover border
        if (hp > 0 && totalW > 0) {
          ctx.strokeStyle = rgb(color, 0.5 * hp);
          ctx.lineWidth   = 1;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.roundRect(x0, y, totalW, BAR_H, 4);
          ctx.stroke();
        }

        // £ value label that appears after bar animates in
        if (localP > 0.35) {
          const fade = Math.min(1, (localP - 0.35) / 0.4);
          ctx.globalAlpha  = fade;
          ctx.font         = CHART_VALUE.font;
          ctx.fillStyle    = hp > 0 ? color : CHART_VALUE.color;
          ctx.textAlign    = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(con.totalLabel ?? fmtValue(con.total ?? 0), x0 + totalW + 6, y + BAR_H / 2);
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
      ctx.fillStyle = rgb(CC.blue, 0.5);
      ctx.beginPath();
      ctx.roundRect(PAD.left + NAME_W, ly - 3, 14, 6, 2);
      ctx.fill();
      ctx.fillStyle = LEGEND_LABEL.color;
      ctx.fillText('base value', PAD.left + NAME_W + 18, ly);

      // Variation swatch
      ctx.fillStyle = rgb(CC.blue, 0.22);
      ctx.beginPath();
      ctx.roundRect(PAD.left + NAME_W + 94, ly - 3, 14, 6, 2);
      ctx.fill();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = rgb(CC.blue, 0.5);
      ctx.lineWidth   = 0.5;
      ctx.beginPath();
      ctx.moveTo(PAD.left + NAME_W + 101, ly - 3);
      ctx.lineTo(PAD.left + NAME_W + 101, ly + 3);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = LEGEND_LABEL.color;
      ctx.fillText('approved variations', PAD.left + NAME_W + 112, ly);

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
