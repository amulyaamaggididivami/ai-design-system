import { useRef, useEffect, useState, useMemo } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle, registerHitRect } from '../../canvas/useCanvasInteraction';
import { easeOutCubic } from '../../canvas/easing';
import { CC, CHART_PALETTE, AXIS_LABEL, CHART_VALUE, rgb, drawGlow, drawDust, drawScanline, setupCanvas } from '../../canvas/canvasUtils';
import { ChartEmptyState } from '../common/ChartEmptyState';
import { ToggleButton } from '../common/ToggleButton';
import type { ContractorRow } from '../../types';
import type { ProgressRaceChartProps } from './types';

const W          = 660;
const TRACK_H    = 6;
const TRACK_GAP  = 30;
const PAD_T      = 24;
const PAD_B      = 24;
const MAX_ITEMS  = 8;


function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
  return t + '…';
}


export function ProgressRaceChart({ items: rawItems = [], colorOffset = 0, 'data-testid': testId }: ProgressRaceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef(0);
  const hoverMap  = useRef<Map<string, number>>(new Map());
  const [showAll, setShowAll] = useState(false);

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

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;

    const padL   = 150;
    const padR   = 80;
    const trackW = W - padL - padR;

    const color = CHART_PALETTE[colorOffset % CHART_PALETTE.length];
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
        const hp     = hoverMap.current.get(contractor.id) ?? 0;
        const trackY = PAD_T + i * (TRACK_H + TRACK_GAP);

        // Track background
        ctx.fillStyle = rgb(CC.t4, 0.5 + hp * 0.1);
        ctx.beginPath();
        ctx.roundRect(padL, trackY, trackW, TRACK_H, TRACK_H / 2);
        ctx.fill();

        // Runner animation
        const trackProgress = (contractor.percentage ?? 0) / 100;
        const animProg = Math.min(trackProgress, trackProgress * easeOutCubic(Math.min(1, T * 0.005)));
        const runnerX  = padL + trackW * animProg;

        // Gradient fill bar
        if (runnerX > padL + 2) {
          const trailGrad = ctx.createLinearGradient(padL, 0, runnerX, 0);
          trailGrad.addColorStop(0, rgb(color, 0.55));
          trailGrad.addColorStop(1, rgb(color, 0.90));
          ctx.fillStyle = trailGrad;
          ctx.beginPath();
          ctx.roundRect(padL, trackY, runnerX - padL, TRACK_H, TRACK_H / 2);
          ctx.fill();
        }

        // Subtle glow at bar tip on hover
        if (hp > 0) {
          drawGlow(ctx, runnerX, trackY + TRACK_H / 2, 12 * hp, color, 0.35 * hp);
        }

        const hitData = {
          label: contractor.name,
          value: `${contractor.percentage ?? 0}%`,
          sublabel: contractor.totalLabel ?? (contractor.total != null ? String(contractor.total) : undefined),
          color,
        };
        registerHitRect(
          hitZonesRef.current,
          contractor.id,
          0,
          trackY - TRACK_GAP / 2,
          padL + trackW,
          TRACK_H + TRACK_GAP,
          hitData,
        );
        registerHitCircle(
          hitZonesRef.current,
          contractor.id,
          runnerX,
          trackY + TRACK_H / 2,
          10,
          hitData,
        );

        // Percentage label — fixed at right edge
        ctx.font         = CHART_VALUE.font;
        ctx.fillStyle    = hp > 0 ? rgb(color, 1) : rgb(CC.t1, 0.85);
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${contractor.percentage ?? 0}%`, padL + trackW + 32, trackY + TRACK_H / 2);

        // Left label: contractor name
        ctx.font      = AXIS_LABEL.font;
        ctx.fillStyle = hp > 0 ? rgb(color, 1) : AXIS_LABEL.color;
        ctx.textAlign = 'right';
        ctx.fillText(truncate(ctx, contractor.name ?? contractor.abbreviation ?? '', padL - 16), padL - 8, trackY + TRACK_H / 2);
      });

drawScanline(ctx, W, H, T, 0.015);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [visible, H, colorOffset]);

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
