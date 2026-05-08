import { useRef, useEffect, useMemo, useCallback } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from '../../canvas/useCanvasInteraction';
import type { TooltipContent } from '../../canvas/useCanvasInteraction';
import { stagger, tickHoverProgress, easeOutCubic } from '../../canvas/easing';
import { CC, CHART_PALETTE, AXIS_LABEL, CHART_VALUE, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import { ChartEmptyState } from '../common/ChartEmptyState';
import { formatNumber } from '../../utils/numberFormat';
import type { NCEContractorRow } from '../../types';
import type { RadialFanTreeChartProps } from './types';

const DEFAULT_W = 770;
const MIN_H = 320;
const PAD_V = 60;
const MIN_LEAF_SPACING = 28;

export function RadialFanTreeChart({ total = 0, totalLabel, items: rawByContractor = [], dataByEntity, onItemClick, selectedId, width = DEFAULT_W, colorOffset = 0, 'data-testid': testId }: RadialFanTreeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);
  const selectedIdRef  = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const handleClick = useCallback((id: string, data: TooltipContent | string) => {
    if (id === '__root__') return;
    const label = typeof data === 'object' ? (data.label ?? id) : id;
    onItemClick?.(id, label);
  }, [onItemClick]);

  const isDrillMode = !!(selectedId && dataByEntity?.[selectedId]);
  const drillData = isDrillMode ? dataByEntity![selectedId!] : null;
  const activeTotal      = drillData ? drillData.total      : total;
  const activeTotalLabel = drillData ? drillData.totalLabel : totalLabel;
  const activeRawItems   = drillData ? drillData.items      : rawByContractor;

  const byContractor = useMemo(
    () => (activeRawItems as unknown[]).filter((c): c is NCEContractorRow => c != null && typeof c === 'object'),
    [activeRawItems],
  );

  const fanH = useMemo(
    () => Math.max(MIN_H, PAD_V + Math.max(0, byContractor.length - 1) * MIN_LEAF_SPACING),
    [byContractor.length],
  );
  const H = fanH;

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width, height: fanH, onClick: onItemClick ? handleClick : undefined });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, width, H);
    frameRef.current = 0;
    const DURATION = 72;

    const rootX = 88;
    const rootY = fanH / 2;
    const rootR = 32;
    const leafX = width - 200;
    const leafSpacing = byContractor.length > 1 ? (fanH - 60) / (byContractor.length - 1) : 0;
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

      const color = CHART_PALETTE[colorOffset % CHART_PALETTE.length];

      // Draw branches and leaves
      byContractor.forEach((c, i) => {
        const localP = stagger(progress, i, byContractor.length, easeOutCubic);
        const lpos = leafPositions[i];
        const hp = hoverMap.current.get(c.id) ?? 0;
        const dimFactor = !isDrillMode && selectedIdRef.current && c.id !== selectedIdRef.current ? 0.15 : 1;

        if (localP < 0.01) return;

        // Bezier branch — starts at circle edge, not center
        const angle = Math.atan2(lpos.y - rootY, lpos.x - rootX);
        const bStartX = rootX + Math.cos(angle) * rootR;
        const bStartY = rootY + Math.sin(angle) * rootR;
        const cp1x = bStartX + (leafX - bStartX) * 0.4;
        const cp1y = bStartY;
        const cp2x = bStartX + (leafX - bStartX) * 0.6;
        const cp2y = lpos.y;

        const steps = 40;
        const limitT = localP;
        ctx.beginPath();
        for (let s = 0; s <= steps; s++) {
          const t = (s / steps) * limitT;
          const x = (1 - t) ** 3 * bStartX + 3 * (1 - t) ** 2 * t * cp1x + 3 * (1 - t) * t ** 2 * cp2x + t ** 3 * lpos.x;
          const y = (1 - t) ** 3 * bStartY + 3 * (1 - t) ** 2 * t * cp1y + 3 * (1 - t) * t ** 2 * cp2y + t ** 3 * lpos.y;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        // Gradient stroke: tealDark (#00818F) → teal (#69DFE9)
        const branchGrad = ctx.createLinearGradient(bStartX, bStartY, lpos.x, lpos.y);
        branchGrad.addColorStop(0, rgb(color, (hp > 0 ? 1.0 : 0.8) * dimFactor));
        branchGrad.addColorStop(1, rgb(color, (hp > 0 ? 1.0 : 0.7) * dimFactor));
        ctx.strokeStyle = branchGrad;
        ctx.lineWidth = hp > 0 ? 2 : 1.33;
        ctx.stroke();

        // Leaf node — fixed 20px radius (40×40px), solid teal
        if (localP > 0.85) {
          const leafFade = Math.min(1, (localP - 0.85) / 0.15);
          const leafR = 20;

          drawGlow(ctx, lpos.x, lpos.y, leafR * 2, color, (0.2 + hp * 0.2) * leafFade * dimFactor);
          ctx.beginPath();
          ctx.arc(lpos.x, lpos.y, leafR * leafFade, 0, Math.PI * 2);
          ctx.fillStyle = rgb(color, leafFade * dimFactor);
          ctx.fill();

          const displayVal = formatNumber(c.count ?? 0);
          registerHitCircle(hitZonesRef.current, c.id, lpos.x, lpos.y, leafR + 8, {
            label: c.name,
            value: displayVal,
            sublabel: `${Math.round(((c.count ?? 0) / (activeTotal || 1)) * 100)}% of total`,
            color,
          });

          // Labels
          ctx.globalAlpha = leafFade * dimFactor;
          ctx.font = AXIS_LABEL.font;
          ctx.textAlign = 'left';
          const nameText = c.abbreviation ?? c.name?.slice(0, 6) ?? '';
          const countText = ` ${formatNumber(c.count ?? 0)}`;
          const xLabel = lpos.x + leafR + 8;
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

      // Root node (drawn on top) — Figma spec: fill #D9D9D9 1%, inner shadow blur=19.88 #69DFE9 60%
      const rootDrawR = rootR * progress;
      ctx.beginPath();
      ctx.arc(rootX, rootY, rootDrawR, 0, Math.PI * 2);
      ctx.fillStyle = rgb('#D9D9D9', 0.01 * progress);
      ctx.fill();

      // Inner shadow: clip to circle, draw transparent stroke with teal shadow
      ctx.save();
      ctx.beginPath();
      ctx.arc(rootX, rootY, rootDrawR, 0, Math.PI * 2);
      ctx.clip();
      ctx.shadowColor = rgb(color, 0.60 * progress);
      ctx.shadowBlur = 19.88;
      ctx.strokeStyle = rgb(color, 0);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(rootX, rootY, rootDrawR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.restore();

      // Outer border: 1px teal
      ctx.beginPath();
      ctx.arc(rootX, rootY, rootDrawR, 0, Math.PI * 2);
      ctx.strokeStyle = rgb(color, 0.8 * progress);
      ctx.lineWidth = 1;
      ctx.stroke();


      if (progress > 0.4) {
        const fade = Math.min(1, (progress - 0.4) / 0.4);
        ctx.globalAlpha = fade;
        const fullValue = activeTotalLabel ?? formatNumber(activeTotal, 0);
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
        ctx.textBaseline = 'alphabetic';
        ctx.globalAlpha = 1;
      }

      registerHitCircle(hitZonesRef.current, '__root__', rootX, rootY, rootR, {
        label: activeTotalLabel ?? 'Total',
        value: formatNumber(activeTotal, 0),
        sublabel: `${byContractor.length} items`,
        color,
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [activeTotal, activeTotalLabel, byContractor, fanH, width, isDrillMode]);

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
