import { useRef, useEffect, useMemo } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { tickHoverProgress, easeOutQuart } from '../../canvas/easing';
import { CC, CHART_PALETTE, AXIS_LABEL, CHART_VALUE, rgb, setupCanvas } from '../../canvas/canvasUtils';
import { formatNumber } from '../../utils/numberFormat';
import { ChartEmptyState } from '../common/ChartEmptyState';
import type { EWSeverityRow } from '../../types';
import type { ProportionalBandChartProps } from './types';

const MAX_W = 680;
const H = 240;
const PAD_SIDE = 28;
// Minimum canvas allocation per band so labels stay readable; capped at MAX_W
const MIN_BAND_W = 156;

function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

export function ProportionalBandChart({ severities: rawSeverities = [], colorOffset = 0, 'data-testid': testId }: ProportionalBandChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);

  const severities = useMemo(
    () => (rawSeverities as unknown[]).filter((s): s is EWSeverityRow => s != null && typeof s === 'object'),
    [rawSeverities],
  );

  const dynamicW = severities.length > 0
    ? Math.min(MAX_W, 2 * PAD_SIDE + severities.length * MIN_BAND_W)
    : MAX_W;

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: dynamicW, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, dynamicW, H);
    frameRef.current = 0;
    const DURATION = 60;

    const total = severities.reduce((s, s2) => s + (s2.count ?? 0), 0);
    const padL = PAD_SIDE;
    const padR = PAD_SIDE;
    const padT = 50;
    const padB = 52;
    const trackW = dynamicW - padL - padR;
    const bandH = H - padT - padB;

    // Prism: narrower at top, wider at bottom per severity band
    const segWidths = severities.map(s => ((s.count ?? 0) / (total || 1)) * trackW);
    const color = CHART_PALETTE[colorOffset % CHART_PALETTE.length];
    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, dynamicW, H);
      ctx.letterSpacing = AXIS_LABEL.letterSpacing;

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutQuart(rawP);

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      let runX = padL;

      severities.forEach((sev, i) => {
        const fullW = segWidths[i];
        const hp = hoverMap.current.get(sev.severity) ?? 0;

        const taper = 0.15;
        const midX = runX + fullW / 2;
        const topW = fullW * (1 - taper);

        const drawnFullW = fullW * progress;
        const drawnTopW  = topW * progress;
        const drawnTopX  = midX - drawnTopW / 2;

        if (drawnFullW > 0) {
          const trapPath = (): void => {
            ctx.beginPath();
            ctx.moveTo(drawnTopX,             padT);
            ctx.lineTo(drawnTopX + drawnTopW, padT);
            ctx.lineTo(runX + drawnFullW,     padT + bandH);
            ctx.lineTo(runX,                  padT + bandH);
            ctx.closePath();
          };

          // 1 — Fill: #69DFE9 at 10%
          trapPath();
          ctx.fillStyle = rgb(color, 0.10 + hp * 0.05);
          ctx.fill();

          // 2 — Inner shadow: clip → thin stroke + high shadowBlur for soft edge glow
          ctx.save();
          trapPath();
          ctx.clip();
          ctx.shadowColor = rgb(color, 0.6 * progress);
          ctx.shadowBlur  = 55;
          ctx.strokeStyle = rgb(color, 0.0);
          ctx.lineWidth   = 1;
          trapPath();
          ctx.stroke();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur  = 0;
          ctx.restore();

          // 3 — Border: 1px solid #69DFE9 all sides
          trapPath();
          ctx.strokeStyle = rgb(color, progress);
          ctx.lineWidth   = 1;
          ctx.stroke();
        }

        registerHitRect(hitZonesRef.current, sev.severity, runX, padT, fullW, bandH, {
          label: sev.severity,
          value: formatNumber(sev.count ?? 0),
          sublabel: `${Math.round(((sev.count ?? 0) / (total || 1)) * 100)}%`,
          color,
        });

        if (progress > 0.5) {
          const fade = Math.min(1, (progress - 0.5) / 0.5);
          const cx = runX + fullW / 2;
          ctx.globalAlpha = fade;

          // Label above band
          ctx.font      = AXIS_LABEL.font;
          ctx.fillStyle = hp > 0 ? color : rgb(color, 0.75);
          ctx.textAlign = 'center';
          ctx.fillText(truncateToWidth(ctx, sev.severity, fullW - 12), cx, padT - 12);

          // Value inside band
          ctx.font      = CHART_VALUE.font;
          ctx.fillStyle = rgb(CC.t1, 0.9 + hp * 0.1);
          ctx.fillText(formatNumber(sev.count ?? 0), cx, padT + bandH / 2 + 6);

          // Pct below band
          ctx.font      = AXIS_LABEL.font;
          ctx.fillStyle = hp > 0 ? color : AXIS_LABEL.color;
          ctx.fillText(`${Math.round(((sev.count ?? 0) / (total || 1)) * 100)}%`, cx, padT + bandH + 18);
          ctx.globalAlpha = 1;
        }

        runX += fullW;
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [severities, dynamicW, colorOffset]);

  const isEmpty = severities.length === 0;
  if (isEmpty) return <ChartEmptyState width={dynamicW} height={H} data-testid={testId} />;

  return (
    <div data-testid={testId} style={{ position: 'relative', width: dynamicW, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Early Warning severity distribution — prism spectrum bands"
        style={{ width: dynamicW, height: H, display: 'block' }}
      />
      <CanvasTooltip {...tooltip} parentW={dynamicW} parentH={H} />
    </div>
  );
}
