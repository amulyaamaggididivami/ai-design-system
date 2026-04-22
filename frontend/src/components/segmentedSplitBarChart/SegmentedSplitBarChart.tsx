import { useRef, useEffect, useState, useMemo } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { stagger, tickHoverProgress, easeOutQuart } from '../../canvas/easing';
import { CC, LEGEND_LABEL, CHART_VALUE, rgb, drawGlow, setupCanvas, AXIS_LABEL } from '../../canvas/canvasUtils';
import { ChartEmptyState } from '../common/ChartEmptyState';
import { ToggleButton } from '../common/ToggleButton';
import { formatNumber } from '../../utils/numberFormat';
import type { VariationRow } from '../../types';
import type { SegmentedSplitBarChartProps } from './types';

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
  return t + '…';
}

const W         = 680;
const MAX_ITEMS = 8;
const BAR_H     = 26;
const GAP       = 14;
const PAD_T     = 16;
const PAD_B     = 32;

export function SegmentedSplitBarChart({ items: rawItems = [], 'data-testid': testId }: SegmentedSplitBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(
    () => (rawItems as unknown[]).filter((c): c is VariationRow => c != null && typeof c === 'object'),
    [rawItems],
  );
  const visible = useMemo(
    () => showAll ? items : items.slice(0, MAX_ITEMS),
    [items, showAll],
  );

  const H = PAD_T + PAD_B + visible.length * (BAR_H + GAP) - GAP;

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 60;

    const padL = 150;
    const padR = 28;
    const padT = PAD_T;
    const padB = PAD_B;
    const barH = BAR_H;
    const gap = GAP;
    const trackW = W - padL - padR;
    const maxTotal = Math.max(...visible.map(c => (c.implemented ?? 0) + (c.unimplemented ?? 0)), 1);
    const totalH = visible.length * (barH + gap) - gap;
    const startY = padT + (H - padT - padB - totalH) / 2;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutQuart(rawP);

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      visible.forEach((c, i) => {
        const localP = stagger(progress, i, visible.length, easeOutQuart);
        const y = startY + i * (barH + gap);
        const total = (c.implemented ?? 0) + (c.unimplemented ?? 0);
        const implW = ((c.implemented ?? 0) / maxTotal) * trackW * localP;
        const unimplW = ((c.unimplemented ?? 0) / maxTotal) * trackW * localP;
        const implId = `${c.id}-impl`;
        const unimplId = `${c.id}-un`;
        const hpImpl = hoverMap.current.get(implId) ?? 0;
        const hpUn = hoverMap.current.get(unimplId) ?? 0;

        registerHitRect(hitZonesRef.current, implId, padL, y, implW || 1, barH, {
          label: `${c.name} — Implemented`,
          value: `${formatNumber(c.implemented ?? 0)} variations`,
          sublabel: `${Math.round(((c.implemented ?? 0) / (total || 1)) * 100)}% complete`,
          color: CC.green,
        });
        registerHitRect(hitZonesRef.current, unimplId, padL + implW, y, unimplW || 1, barH, {
          label: `${c.name} — Unimplemented`,
          value: `${formatNumber(c.unimplemented ?? 0)} variations`,
          sublabel: `${Math.round(((c.unimplemented ?? 0) / (total || 1)) * 100)}% pending`,
          color: CC.amber,
        });

        // Contractor name
        ctx.font = AXIS_LABEL.font;
        ctx.fillStyle = CC.t2;
        ctx.textAlign = 'right';
        ctx.fillText(truncate(ctx, c.abbreviation ?? c.name ?? '', padL - 16), padL - 8, y + barH / 2 + 4);

        // Track
        ctx.fillStyle = rgb(CC.bd, 0.15);
        ctx.beginPath();
        ctx.roundRect(padL, y, (total / maxTotal) * trackW, barH, 4);
        ctx.fill();

        // Implemented (green) segment
        if (implW > 0) {
          if (hpImpl > 0) drawGlow(ctx, padL + implW / 2, y + barH / 2, implW * 0.3, CC.green, 0.12 * hpImpl);
          ctx.fillStyle = rgb(CC.green, 0.6 + hpImpl * 0.2);
          ctx.beginPath();
          ctx.roundRect(padL, y, implW, barH, [4, 0, 0, 4]);
          ctx.fill();

          // Implemented count
          if (implW > 28 && localP > 0.5) {
            ctx.font = CHART_VALUE.font;
            ctx.fillStyle = hpImpl > 0 ? CC.green : CC.t2;
            ctx.textAlign = 'center';
            ctx.fillText(formatNumber(c.implemented ?? 0), padL + implW / 2, y + barH / 2 + 4);
          }
        }

        // Unimplemented (grey/amber) segment
        if (unimplW > 0) {
          if (hpUn > 0) drawGlow(ctx, padL + implW + unimplW / 2, y + barH / 2, unimplW * 0.3, CC.amber, 0.12 * hpUn);
          ctx.fillStyle = rgb(CC.amber, 0.18 + hpUn * 0.18);
          ctx.strokeStyle = rgb(CC.amber, 0.3 + hpUn * 0.3);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(padL + implW, y, unimplW, barH, [0, 4, 4, 0]);
          ctx.fill();
          ctx.stroke();

          // Unimplemented count
          if (unimplW > 28 && localP > 0.5) {
            ctx.font = CHART_VALUE.font;
            ctx.fillStyle = hpUn > 0 ? CC.amber : CC.t2;
            ctx.textAlign = 'center';
            ctx.fillText(formatNumber(c.unimplemented ?? 0), padL + implW + unimplW / 2, y + barH / 2 + 4);
          }
        }

        // Split divider
        if (implW > 0 && unimplW > 0) {
          ctx.strokeStyle = rgb(CC.bg, 0.7);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(padL + implW, y);
          ctx.lineTo(padL + implW, y + barH);
          ctx.stroke();
        }
      });

      // Legend below bars — centered over track
      const legendY = startY + totalH + 24;
      const trackCX = padL + trackW / 2;
      ctx.font = LEGEND_LABEL.font;
      ctx.textAlign = 'right';
      ctx.fillStyle = CC.green;
      ctx.fillText('■ Implemented', trackCX - 10, legendY);
      ctx.textAlign = 'left';
      ctx.fillStyle = LEGEND_LABEL.color;
      ctx.fillText('■ Unimplemented', trackCX + 10, legendY);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [visible, H]);

  const isEmpty = items.length === 0;
  if (isEmpty) return <ChartEmptyState width={W} height={160} data-testid={testId} />;

  return (
    <div data-testid={testId} style={{ width: W }}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Implemented vs unimplemented variations per contractor — split bar"
          style={{ width: W, height: H, display: 'block' }}
        />
        <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
      </div>
      {items.length > MAX_ITEMS && (
        <div style={{ marginTop: 8 }}>
          <ToggleButton expanded={showAll} onToggle={() => setShowAll(prev => !prev)} />
        </div>
      )}
    </div>
  );
}
