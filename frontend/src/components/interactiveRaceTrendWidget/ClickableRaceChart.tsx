import { useRef, useState, useEffect, useCallback, useMemo } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { easeOutCubic } from '../../canvas/easing';
import { CC, AXIS_LABEL, rgb, drawGlow, drawDust, drawScanline, setupCanvas } from '../../canvas/canvasUtils';
import { ToggleButton } from '../common/ToggleButton';
import type { ClickableRaceChartProps } from './types';

const W          = 680;
const TRACK_H    = 42;
const TRACK_GAP  = 10;
const PAD_T      = 24;
const PAD_B      = 24;
const MAX_ITEMS  = 8;

const RACE_COLORS = [CC.green, CC.blue, CC.cyan, CC.amber, CC.red];

export function ClickableRaceChart({
  contractors,
  selectedId,
  onContractorClick,
  'data-testid': testId,
}: ClickableRaceChartProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const hoverMap    = useRef<Map<string, number>>(new Map());
  const selectedRef = useRef<string | null>(selectedId);
  const [showAll, setShowAll] = useState(false);

  // Keep selectedRef in sync with the prop — the draw loop reads this every frame
  // so the animation never needs to restart when selection changes.
  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  const sorted = useMemo(
    () => [...contractors].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0)),
    [contractors],
  );
  const visible = useMemo(
    () => (showAll ? sorted : sorted.slice(0, MAX_ITEMS)),
    [sorted, showAll],
  );
  const n = visible.length;
  const H = PAD_T + PAD_B + n * TRACK_H + Math.max(0, n - 1) * TRACK_GAP;

  const handleClick = useCallback(
    (id: string) => { onContractorClick(id); },
    [onContractorClick],
  );

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(
    canvasRef,
    { width: W, height: H, onClick: handleClick },
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    let frame = 0;

    const padL   = W * 0.13;
    const padR   = W * 0.08;
    const trackW = W - padL - padR;

    let raf: number;

    const draw = () => {
      frame++;
      const T = frame;
      ctx.clearRect(0, 0, W, H);
      hitZonesRef.current = [];

      const sel          = selectedRef.current;
      const hasSelection = sel !== null;

      // Tick hover map
      hoverMap.current.forEach((val, id) => {
        const target = id === hoveredRef.current ? 1 : 0;
        const next   = val + (target - val) * 0.12;
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
        const color      = RACE_COLORS[i % RACE_COLORS.length];
        const hp         = hoverMap.current.get(contractor.id) ?? 0;
        const trackY     = PAD_T + i * (TRACK_H + TRACK_GAP);
        const isSelected = contractor.id === sel;
        const dimAlpha   = hasSelection && !isSelected ? 0.35 : 1;

        ctx.globalAlpha = dimAlpha;

        // Lane fill — selected lane gets a subtler tinted background
        ctx.fillStyle = rgb(color, 0.04 + hp * 0.04 + (isSelected ? 0.06 : 0));
        ctx.beginPath();
        ctx.roundRect(padL, trackY, trackW, TRACK_H, 3);
        ctx.fill();

        // Dashed center line
        ctx.strokeStyle = rgb(color, 0.08);
        ctx.lineWidth   = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, trackY + TRACK_H / 2);
        ctx.lineTo(padL + trackW, trackY + TRACK_H / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Runner animation (progress: 0 → percentage/100 as T grows)
        const trackProgress = (contractor.percentage ?? 0) / 100;
        const animProg      = Math.min(trackProgress, trackProgress * easeOutCubic(Math.min(1, T * 0.005)));
        const runnerX       = padL + trackW * animProg;

        // Gradient trail
        if (runnerX > padL + 4) {
          const trailGrad = ctx.createLinearGradient(padL, 0, runnerX, 0);
          trailGrad.addColorStop(0, rgb(color, 0.02));
          trailGrad.addColorStop(1, rgb(color, 0.25 + hp * 0.15 + (isSelected ? 0.1 : 0)));
          ctx.fillStyle = trailGrad;
          ctx.beginPath();
          ctx.roundRect(padL, trackY + 2, runnerX - padL, TRACK_H - 4, 2);
          ctx.fill();
        }

        // Runner dot + glow
        drawGlow(
          ctx, runnerX, trackY + TRACK_H / 2,
          18 + hp * 8 + (isSelected ? 6 : 0),
          color,
          0.3 + hp * 0.2 + (isSelected ? 0.15 : 0),
        );
        ctx.beginPath();
        ctx.arc(runnerX, trackY + TRACK_H / 2, 5 + hp * 2 + (isSelected ? 1 : 0), 0, Math.PI * 2);
        ctx.fillStyle = rgb(color, 0.9);
        ctx.fill();

        // Selected lane: solid ring border
        if (isSelected) {
          ctx.strokeStyle = rgb(color, 0.7);
          ctx.lineWidth   = 1.5;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.roundRect(padL - 1, trackY - 1, trackW + 2, TRACK_H + 2, 4);
          ctx.stroke();
        }

        // Hover border (when not selected)
        if (!isSelected && hp > 0) {
          ctx.strokeStyle = rgb(color, 0.4 * hp);
          ctx.lineWidth   = 1;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.roundRect(padL, trackY, trackW, TRACK_H, 3);
          ctx.stroke();
        }

        // Percentage label right of runner dot
        ctx.font         = `bold ` + AXIS_LABEL.font;
        ctx.fillStyle    = rgb(color, 0.9 + hp * 0.1);
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${contractor.percentage ?? 0}%`, runnerX + 10, trackY + TRACK_H / 2);

        // Left label: contractor abbreviation
        ctx.font      = `${hp > 0 || isSelected ? 'bold ' : ''}` + AXIS_LABEL.font;
        ctx.fillStyle = hp > 0 || isSelected ? color : AXIS_LABEL.color;
        ctx.textAlign = 'right';
        ctx.fillText(
          contractor.abbreviation ?? contractor.name.slice(0, 6),
          padL - 8,
          trackY + TRACK_H / 2,
        );

        ctx.globalAlpha = 1;

        // Hit zone: full lane row (not just runner dot) — easier to click
        registerHitRect(
          hitZonesRef.current,
          contractor.id,
          padL,
          trackY,
          trackW,
          TRACK_H,
          {
            label   : contractor.name,
            value   : `${contractor.percentage ?? 0}% commitment`,
            sublabel: `Click to view ${contractor.abbreviation ?? contractor.name}'s submission trend`,
            color,
          },
        );
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
  }, [visible, H, hoveredRef, hitZonesRef]);

  return (
    <div data-testid={testId} style={{ width: W }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Commitment race — click a contractor lane to view their submission trend"
          style={{ width: W, height: H, display: 'block', borderRadius: 8, cursor: 'pointer' }}
        />
        <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
      </div>
      {contractors.length > MAX_ITEMS && (
        <div style={{ marginTop: 8 }}>
          <ToggleButton expanded={showAll} onToggle={() => setShowAll(prev => !prev)} />
        </div>
      )}
    </div>
  );
}
