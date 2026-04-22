import { useRef, useEffect, useMemo } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from '../../canvas/useCanvasInteraction';
import { stagger, tickHoverProgress, easeOutCubic } from '../../canvas/easing';
import { CC, AXIS_LABEL, CHART_VALUE, PALETTE, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import { ChartEmptyState } from '../common/ChartEmptyState';
import { formatNumber } from '../../utils/numberFormat';
import type { NCEContractorRow } from '../../types';
import type { RadialFanTreeChartProps } from './types';

const DEFAULT_W = 770;
const MIN_H = 320;
const PAD_V = 60;
const MIN_LEAF_SPACING = 28;

export function RadialFanTreeChart({ total = 0, totalLabel, items: rawByContractor = [], width = DEFAULT_W, 'data-testid': testId }: RadialFanTreeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);

  const byContractor = useMemo(
    () => (rawByContractor as unknown[]).filter((c): c is NCEContractorRow => c != null && typeof c === 'object'),
    [rawByContractor],
  );

  const H = useMemo(
    () => Math.max(MIN_H, PAD_V + Math.max(0, byContractor.length - 1) * MIN_LEAF_SPACING),
    [byContractor.length],
  );

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, width, H);
    frameRef.current = 0;
    const DURATION = 72;

    const rootX = 88;
    const rootY = H / 2;
    const rootR = 32;
    const leafX = width - 200;
    const maxCount = Math.max(...byContractor.map(c => c.count ?? 0), 1);
    const leafSpacing = byContractor.length > 1 ? (H - 60) / (byContractor.length - 1) : 0;
    const leafStartY = 30;

    const leafPositions = byContractor.map((_, i) => ({
      x: leafX,
      y: leafStartY + i * leafSpacing,
    }));

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, width, H);
      ctx.letterSpacing = AXIS_LABEL.letterSpacing;

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      // Root glow
      drawGlow(ctx, rootX, rootY, 48 * progress, CC.blue, 0.15 * progress);

      // Draw branches and leaves
      byContractor.forEach((c, i) => {
        const color = PALETTE[i % PALETTE.length];
        const localP = stagger(progress, i, byContractor.length, easeOutCubic);
        const lpos = leafPositions[i];
        const hp = hoverMap.current.get(c.id) ?? 0;
        const branchThickness = Math.max(1.5, ((c.count ?? 0) / maxCount) * 6);

        if (localP < 0.01) return;

        // Bezier branch
        const cp1x = rootX + (leafX - rootX) * 0.4;
        const cp1y = rootY;
        const cp2x = rootX + (leafX - rootX) * 0.6;
        const cp2y = lpos.y;

        // Trace the branch up to localP
        // Approximate by sampling the bezier
        const steps = 40;
        const limitT = localP;

        ctx.beginPath();
        for (let s = 0; s <= steps; s++) {
          const t = (s / steps) * limitT;
          const x = (1 - t) ** 3 * rootX + 3 * (1 - t) ** 2 * t * cp1x + 3 * (1 - t) * t ** 2 * cp2x + t ** 3 * lpos.x;
          const y = (1 - t) ** 3 * rootY + 3 * (1 - t) ** 2 * t * cp1y + 3 * (1 - t) * t ** 2 * cp2y + t ** 3 * lpos.y;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgb(color, hp > 0 ? 0.8 : 0.45);
        ctx.lineWidth = branchThickness * (hp > 0 ? 1.3 : 1);
        ctx.stroke();

        // Leaf node
        if (localP > 0.85) {
          const leafFade = Math.min(1, (localP - 0.85) / 0.15);
          const leafR = 4 + ((c.count ?? 0) / maxCount) * 12;

          drawGlow(ctx, lpos.x, lpos.y, leafR * 2.5, color, (0.25 + hp * 0.2) * leafFade);
          ctx.beginPath();
          ctx.arc(lpos.x, lpos.y, leafR * leafFade, 0, Math.PI * 2);
          ctx.fillStyle = rgb(color, (0.7 + hp * 0.2) * leafFade);
          ctx.fill();

          const displayVal = formatNumber(c.count ?? 0);
          registerHitCircle(hitZonesRef.current, c.id, lpos.x, lpos.y, leafR + 8, {
            label: c.name,
            value: displayVal,
            sublabel: `${Math.round(((c.count ?? 0) / (total || 1)) * 100)}% of total`,
            color,
          });

          // Name and count labels — single line to avoid vertical collision
          ctx.globalAlpha = leafFade;
          ctx.font = AXIS_LABEL.font;
          ctx.textAlign = 'left';
          const nameText = c.abbreviation ?? c.name?.slice(0, 6) ?? '';
          const countText = ` ${formatNumber(c.count ?? 0)}`;
          const xLabel = lpos.x + leafR + 6;
          const yLabel = lpos.y + 4;
          ctx.fillStyle = hp > 0 ? color : rgb(CC.t2, 0.85);
          ctx.fillText(nameText, xLabel, yLabel);
          const nameW = ctx.measureText(nameText).width;
          ctx.font = CHART_VALUE.font;
          ctx.fillStyle = hp > 0 ? color : CC.t1;
          ctx.fillText(countText, xLabel + nameW, yLabel);
          ctx.globalAlpha = 1;
        }
      });

      // Root node (drawn on top)
      ctx.beginPath();
      ctx.arc(rootX, rootY, rootR * progress, 0, Math.PI * 2);
      ctx.fillStyle = CC.bgL;
      ctx.fill();
      ctx.strokeStyle = rgb(CC.blue, 0.6 * progress);
      ctx.lineWidth = 2;
      ctx.stroke();

      if (progress > 0.4) {
        const fade = Math.min(1, (progress - 0.4) / 0.4);
        ctx.globalAlpha = fade;
        const fullValue = totalLabel ?? formatNumber(total, 0);
        const maxTextW = rootR * 1.7;
        ctx.font = `500 16px 'Satoshi Variable', 'DM Sans', sans-serif`;
        let truncated = fullValue;
        while (ctx.measureText(truncated).width > maxTextW && truncated.length > 1) {
          truncated = truncated.slice(0, -1);
        }
        if (truncated !== fullValue) truncated = truncated.slice(0, -1) + '…';
        ctx.fillStyle = CC.t1;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(truncated, rootX, rootY);
        ctx.globalAlpha = 1;
      }

      registerHitCircle(hitZonesRef.current, '__root__', rootX, rootY, rootR, {
        label: totalLabel ?? 'Total',
        value: formatNumber(total, 0),
        sublabel: `${byContractor.length} items`,
        color: CC.blue,
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [total, totalLabel, byContractor, H, width]);

  const isEmpty = byContractor.length === 0;
  if (isEmpty) return <ChartEmptyState width={width} height={MIN_H} data-testid={testId} />;

  return (
    <div data-testid={testId} style={{ position: 'relative', width, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="NCE fault tree — NCEs per contractor as branching tree"
        style={{ width, height: H, display: 'block' }}
      />
      <CanvasTooltip {...tooltip} parentW={width} parentH={H} />
    </div>
  );
}
