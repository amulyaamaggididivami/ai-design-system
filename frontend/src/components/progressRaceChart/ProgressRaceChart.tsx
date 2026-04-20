import { useRef, useEffect, useState, useMemo, useCallback } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from '../../canvas/useCanvasInteraction';
import type { TooltipContent } from '../../canvas/useCanvasInteraction';
import { easeOutCubic } from '../../canvas/easing';
import { CC, AXIS_LABEL, CHART_VALUE, rgb, drawGlow, drawDust, drawScanline, setupCanvas } from '../../canvas/canvasUtils';
import { ChartEmptyState } from '../common/ChartEmptyState';
import { ToggleButton } from '../common/ToggleButton';
import type { ContractorRow } from '../../types';
import type { ProgressRaceChartProps } from './types';

const W          = 680;
const TRACK_H    = 42;
const TRACK_GAP  = 10;
const PAD_T      = 24;
const PAD_B      = 24;
const MAX_ITEMS  = 8;

const RACE_COLORS = [CC.green, CC.blue, CC.amber, CC.red];

function fmtValue(v: number): string {
  const abs  = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}£${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}£${(abs / 1_000).toFixed(1)}K`;
  return `${sign}£${abs.toFixed(0)}`;
}

export function ProgressRaceChart({ items: rawItems = [], 'data-testid': testId, onItemClick, selectedIds }: ProgressRaceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef(0);
  const hoverMap  = useRef<Map<string, number>>(new Map());
  const selectedIdsRef = useRef<string[] | undefined>(selectedIds);
  selectedIdsRef.current = selectedIds;
  const [showAll, setShowAll] = useState(false);

  const handleClick = useCallback((id: string, data: TooltipContent | string) => {
    const label = typeof data === 'object' ? (data.label ?? id) : id;
    onItemClick?.(id, label);
  }, [onItemClick]);

  const items = useMemo(
    () => (rawItems as unknown[]).filter((c): c is ContractorRow => c != null && typeof c === 'object'),
    [rawItems],
  );
  const sorted = useMemo(
    () => [...items].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0)),
    [items],
  );
  const visible = useMemo(
    () => showAll ? sorted : sorted.slice(0, MAX_ITEMS),
    [sorted, showAll],
  );
  const n       = visible.length;
  const H       = PAD_T + PAD_B + n * TRACK_H + Math.max(0, n - 1) * TRACK_GAP;

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H, onClick: onItemClick ? handleClick : undefined });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;

    const padL   = W * 0.13;
    const padR   = W * 0.08;
    const trackW = W - padL - padR;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.letterSpacing = AXIS_LABEL.letterSpacing;
      hitZonesRef.current = [];

      // Tick hover map
      hoverMap.current.forEach((val, id) => {
        const target = id === hoveredRef.current ? 1 : 0;
        const next = val + (target - val) * 0.12;
        if (Math.abs(next - target) < 0.005) {
          if (target === 0) hoverMap.current.delete(id);
          else hoverMap.current.set(id, 1);
        } else {
          hoverMap.current.set(id, next);
        }
      });
      if (hoveredRef.current && !hoverMap.current.has(hoveredRef.current)) {
        hoverMap.current.set(hoveredRef.current, 0);
      }

      drawDust(ctx, W, H, T, 40, rgb(CC.blue, 0.04));

      visible.forEach((contractor, i) => {
        const color  = RACE_COLORS[i % RACE_COLORS.length];
        const hp     = hoverMap.current.get(contractor.id) ?? 0;
        const trackY = PAD_T + i * (TRACK_H + TRACK_GAP);
        const selIds = selectedIdsRef.current;
        const dimFactor = selIds && selIds.length > 0 && !selIds.includes(contractor.id) ? 0.18 : 1.0;

        // Lane fill
        ctx.fillStyle = rgb(color, (0.04 + hp * 0.04) * dimFactor);
        ctx.beginPath();
        ctx.roundRect(padL, trackY, trackW, TRACK_H, 3);
        ctx.fill();

        // Dashed center line
        ctx.strokeStyle = rgb(color, 0.08 * dimFactor);
        ctx.lineWidth   = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, trackY + TRACK_H / 2);
        ctx.lineTo(padL + trackW, trackY + TRACK_H / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Runner animation
        const trackProgress = (contractor.percentage ?? 0) / 100;
        const animProg = Math.min(trackProgress, trackProgress * easeOutCubic(Math.min(1, T * 0.005)));
        const runnerX  = padL + trackW * animProg;

        // Gradient trail
        if (runnerX > padL + 4) {
          const trailGrad = ctx.createLinearGradient(padL, 0, runnerX, 0);
          trailGrad.addColorStop(0, rgb(color, 0.02 * dimFactor));
          trailGrad.addColorStop(1, rgb(color, (0.25 + hp * 0.15) * dimFactor));
          ctx.fillStyle = trailGrad;
          ctx.beginPath();
          ctx.roundRect(padL, trackY + 2, runnerX - padL, TRACK_H - 4, 2);
          ctx.fill();
        }

        // Runner dot glow
        if (dimFactor > 0.5) {
          drawGlow(ctx, runnerX, trackY + TRACK_H / 2, 18 + hp * 8, color, 0.3 + hp * 0.2);
        }
        ctx.beginPath();
        ctx.arc(runnerX, trackY + TRACK_H / 2, 5 + hp * 2, 0, Math.PI * 2);
        ctx.fillStyle = rgb(color, 0.9 * dimFactor);
        ctx.fill();

        // Register hit on runner dot + percentage label text
        const hitData = {
          label   : contractor.name,
          value   : `${contractor.percentage ?? 0}% commitment`,
          sublabel: `Base: ${contractor.baseLabel ?? String(contractor.base ?? 0)} · Variations: ${contractor.variationLabel ?? String(contractor.variation ?? 0)}`,
          color,
        };
        // Register hit on runner dot
        registerHitCircle(
          hitZonesRef.current,
          contractor.id,
          runnerX,
          trackY + TRACK_H / 2,
          14,
          hitData,
        );

        // Runner percentage label
        ctx.font         = CHART_VALUE.font;
        ctx.fillStyle    = rgb(color, 0.9 + hp * 0.1);
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${contractor.percentage ?? 0}%`, runnerX + 10, trackY + TRACK_H / 2);

        // Left label: contractor abbreviation
        ctx.font      = `${hp > 0 ? 'bold ' : ''}` + AXIS_LABEL.font;
        ctx.fillStyle = hp > 0 ? rgb(color, dimFactor) : rgb(AXIS_LABEL.color, dimFactor);
        ctx.textAlign = 'right';
        ctx.fillText(contractor.abbreviation ?? contractor.name.slice(0, 6), padL - 8, trackY + TRACK_H / 2);
      });

      // Finish line
      ctx.strokeStyle = rgb(CC.t3, 0.3);
      ctx.lineWidth   = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(padL + trackW, PAD_T);
      ctx.lineTo(padL + trackW, PAD_T + (n - 1) * (TRACK_H + TRACK_GAP) + TRACK_H);
      ctx.stroke();

      drawScanline(ctx, W, H, T, 0.015);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [visible, H]);

  const isEmpty = sorted.length === 0;
  if (isEmpty) return <ChartEmptyState width={W} height={160} data-testid={testId} />;

  return (
    <div data-testid={testId} style={{ width: W }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Commitment race — contractors ranked by commitment percentage"
          style={{ width: W, height: H, display: 'block', borderRadius: 8 }}
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
