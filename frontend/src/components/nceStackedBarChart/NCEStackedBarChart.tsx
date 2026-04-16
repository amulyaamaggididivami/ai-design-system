import { useRef } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { easeOutCubic, easeOutQuart, stagger, tickHoverProgress } from '../../canvas/easing';
import { CC, AXIS_LABEL, rgb, drawGlow, drawDust, drawScanline } from '../../canvas/canvasUtils';
import { useCanvasLoop } from '../../canvas/useCanvasLoop';
import { ChartEmptyState } from '../common/ChartEmptyState';
import type { NCEStackedBarChartProps } from './types';

const LEFT_PAD = 110;
const RIGHT_PAD = 80;
const TOP_PAD = 16;
const BOTTOM_PAD = 16;
const BAR_H = 28;
const GAP = 14;

const RED = '#F06060';
const ORANGE = '#F0813A';
const AMBER = '#FBBF24';

function getVariationColor(pct: number): string {
  if (pct > 20) return RED;
  if (pct > 12) return ORANGE;
  return AMBER;
}

export function NCEStackedBarChart({
  contractors,
  width: W = 680,
  activeKey = null,
  dimOthers = false,
  onVizHover,
  onVizClick,
  'data-testid': testId,
}: NCEStackedBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef<Map<string, number>>(new Map());
  const activeKeyRef = useRef(activeKey);
  const dimRef = useRef(dimOthers);
  const onVizHoverRef = useRef(onVizHover);
  const onVizClickRef = useRef(onVizClick);
  activeKeyRef.current = activeKey;
  dimRef.current = dimOthers;
  onVizHoverRef.current = onVizHover;
  onVizClickRef.current = onVizClick;

  const n = contractors.length;
  const totalH = n * (BAR_H + GAP) - GAP;
  const H = TOP_PAD + BOTTOM_PAD + totalH;
  const chartW = W - LEFT_PAD - RIGHT_PAD;
  const maxVal = Math.max(...contractors.map(c => c.originalValue + c.nceVariation), 1);

  const isEmpty = contractors.length === 0;

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, {
    width: W,
    height: H,
    onClick: (id) => {
      if (onVizClickRef.current) onVizClickRef.current(id === activeKeyRef.current ? null : id);
    },
  });

  useCanvasLoop(
    canvasRef,
    W,
    H,
    (ctx, progress, frame) => {
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      const ak = activeKeyRef.current;
      const dim = dimRef.current;

      contractors.forEach((c, i) => {
        const s = stagger(progress, i, n, easeOutCubic);
        const y = TOP_PAD + i * (BAR_H + GAP);
        const hp = hoverMap.current.get(c.name) ?? 0;
        const isLinked = ak === c.name;
        const rowDim = dim && !isLinked ? 0.3 : 1;

        // Original contract bar
        const origW = (c.originalValue / maxVal) * chartW * easeOutCubic(s);
        ctx.globalAlpha = s * rowDim * (hp > 0 || isLinked ? 0.7 : 0.4);
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.roundRect(LEFT_PAD, y, origW, BAR_H, 6);
        ctx.fill();

        // NCE variation segment (stacked)
        const nceW = (c.nceVariation / maxVal) * chartW * easeOutCubic(s);
        const nceX = LEFT_PAD + origW;
        const pct = (c.nceVariation / c.originalValue) * 100;
        const nceColor = getVariationColor(pct);

        ctx.globalAlpha = s * rowDim * (hp > 0 || isLinked ? 0.95 : 0.75);
        ctx.fillStyle = nceColor;
        ctx.beginPath();
        ctx.roundRect(nceX, y, nceW, BAR_H, [0, 6, 6, 0]);
        ctx.fill();

        // Glow for high-variation
        if (pct > 20) {
          const pulse = 0.3 + 0.2 * Math.sin(frame * 0.07 + i);
          drawGlow(ctx, nceX + nceW / 2, y + BAR_H / 2, nceW * 0.6, RED, 0.08 * pulse * s * rowDim);
        }

        // Highlight border on hover/linked
        if (hp > 0 || isLinked) {
          ctx.strokeStyle = isLinked ? '#fff' : rgb('#fff', 0.4);
          ctx.lineWidth = isLinked ? 2 : 1.5;
          ctx.globalAlpha = s * 0.7;
          ctx.beginPath();
          ctx.roundRect(LEFT_PAD, y, origW + nceW, BAR_H, 6);
          ctx.stroke();
        }

        // Contractor name (left)
        ctx.globalAlpha = s * rowDim;
        ctx.font = `${isLinked ? 700 : 600} 11px 'Satoshi Variable', 'DM Sans', sans-serif`;
        ctx.fillStyle = isLinked ? '#fff' : AXIS_LABEL.color;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.name, LEFT_PAD - 8, y + BAR_H / 2);

        // Values inside bars
        if (origW > 50 && s > 0.5) {
          ctx.globalAlpha = s * rowDim * 0.8;
          ctx.font = "700 10px 'Satoshi Variable', 'DM Sans', sans-serif";
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(`\u00A3${c.originalValue.toFixed(1)}M`, LEFT_PAD + origW / 2, y + BAR_H / 2);
        }

        if (nceW > 30 && s > 0.5) {
          ctx.globalAlpha = s * rowDim;
          ctx.font = "700 9px 'Satoshi Variable', 'DM Sans', sans-serif";
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(`+\u00A3${c.nceVariation.toFixed(1)}M`, nceX + nceW / 2, y + BAR_H / 2);
        }

        // Percentage label (right side)
        ctx.globalAlpha = s * rowDim;
        ctx.font = "700 11px 'SFMono-Regular', Consolas, monospace";
        ctx.fillStyle = nceColor;
        ctx.textAlign = 'left';
        ctx.fillText(`${pct.toFixed(1)}%`, LEFT_PAD + origW + nceW + 8, y + BAR_H / 2 - 2);

        // NCE count badge
        ctx.font = "500 9px 'Satoshi Variable', 'DM Sans', sans-serif";
        ctx.fillStyle = CC.t3;
        ctx.fillText(`${c.nceCount} NCEs`, LEFT_PAD + origW + nceW + 8, y + BAR_H / 2 + 10);

        ctx.globalAlpha = 1;

        // Hit area
        registerHitRect(hitZonesRef.current, c.name, LEFT_PAD, y, origW + nceW, BAR_H, {
          label: c.name,
          value: `\u00A3${c.originalValue.toFixed(1)}M + \u00A3${c.nceVariation.toFixed(1)}M NCE`,
          sublabel: `${pct.toFixed(1)}% variation \u00B7 ${c.nceCount} NCEs`,
          color: c.color,
        });
      });

      // Ambient effects
      ctx.globalAlpha = 1;
      drawDust(ctx, W, H, frame * 16, 15, rgb(CC.blue, 0.03));
      drawScanline(ctx, W, H, frame * 16, 0.008);

      // Emit hover via ref to avoid stale closure
      if (onVizHoverRef.current) {
        onVizHoverRef.current(hoveredRef.current);
      }
    },
    true,
    { easing: easeOutQuart },
  );

  if (isEmpty) {
    return <ChartEmptyState width={W} height={200} message="No contractor data available" data-testid={testId} />;
  }

  return (
    <div data-testid={testId} style={{ width: W }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Contract value plus NCE variation by contractor — stacked horizontal bar chart"
          style={{ width: W, height: H, display: 'block', borderRadius: 8, cursor: 'crosshair' }}
        />
        <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
      </div>
    </div>
  );
}
