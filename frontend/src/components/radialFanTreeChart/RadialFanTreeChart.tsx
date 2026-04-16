import { useRef, useEffect, useMemo } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from '../../canvas/useCanvasInteraction';
import { stagger, tickHoverProgress, easeOutCubic } from '../../canvas/easing';
import { CC, AXIS_LABEL, PALETTE, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import { ChartEmptyState } from '../common/ChartEmptyState';
import type { NCEContractorRow } from '../../types';
import type { RadialFanTreeChartProps } from './types';

const W = 680;
const MIN_H = 320;
const PAD_V = 60;
const MIN_LEAF_SPACING = 28;

export function RadialFanTreeChart({ total = 0, totalLabel, items: rawByContractor = [], 'data-testid': testId }: RadialFanTreeChartProps) {
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

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 72;

    const rootX = 88;
    const rootY = H / 2;
    const rootR = 32;
    const leafX = W - 80;
    const maxCount = Math.max(...byContractor.map(c => c.count ?? 0));
    const leafSpacing = (H - 60) / (byContractor.length - 1);
    const leafStartY = 30;

    const leafPositions = byContractor.map((_, i) => ({
      x: leafX,
      y: leafStartY + i * leafSpacing,
    }));

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

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

          const displayVal = c.label ?? String(c.count ?? 0);
          registerHitCircle(hitZonesRef.current, c.id, lpos.x, lpos.y, leafR + 8, {
            label: c.name,
            value: `${displayVal} NCEs raised`,
            sublabel: `${Math.round(((c.count ?? 0) / total) * 100)}% of all NCEs`,
            color,
          });

          // Name and count labels — single line to avoid vertical collision
          ctx.globalAlpha = leafFade;
          ctx.font = AXIS_LABEL.font;
          ctx.textAlign = 'left';
          const nameText = c.abbreviation ?? c.name.slice(0, 6);
          const countText = ` ${displayVal}`;
          const xLabel = lpos.x + leafR + 6;
          const yLabel = lpos.y + 4;
          ctx.fillStyle = hp > 0 ? color : rgb(CC.t2, 0.85);
          ctx.fillText(nameText, xLabel, yLabel);
          const nameW = ctx.measureText(nameText).width;
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
        ctx.font = `500 24px 'Satoshi Variable', 'DM Sans', sans-serif`;
        ctx.fillStyle = CC.t1;
        ctx.textAlign = 'center';
        ctx.fillText(totalLabel ?? String(total), rootX, rootY + 5);
        ctx.font = AXIS_LABEL.font;
        ctx.fillStyle = AXIS_LABEL.color;
        ctx.fillText('NCEs', rootX, rootY + 18);
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [total, totalLabel, byContractor, H]);

  const isEmpty = byContractor.length === 0;
  if (isEmpty) return <ChartEmptyState width={W} height={MIN_H} data-testid={testId} />;

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="NCE fault tree — NCEs per contractor as branching tree"
        style={{ width: W, height: H, display: 'block' }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
