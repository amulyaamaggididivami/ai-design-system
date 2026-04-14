import { useRef, useEffect, useMemo } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from '../../canvas/useCanvasInteraction';
import { easeOutCubic } from '../../canvas/easing';
import { CC, AXIS_LABEL, rgb, setupCanvas } from '../../canvas/canvasUtils';
import { ChartEmptyState } from '../common/ChartEmptyState';
import type { QuotationTrendPoint } from '../../types';
import type { TrendProps } from './types';
import './trend.css';

const MIN_W = 680;
const H = 280;
const PAD_L = 54;
const PAD_R = 28;
const MIN_STEP = 64;
const LABEL_FONT = `500 14px 'Satoshi Variable', 'DM Sans', sans-serif`;
const LABEL_PAD = 12;

export function Trend({ points: rawPoints = [], 'data-testid': testId }: TrendProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const yAxisRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  const points = useMemo(
    () => (rawPoints as unknown[]).filter((p): p is QuotationTrendPoint => p != null && typeof p === 'object'),
    [rawPoints],
  );

  const minStep = useMemo(() => {
    if (points.length <= 1) return MIN_STEP;
    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    if (!tmpCtx) return MIN_STEP;
    tmpCtx.font = LABEL_FONT;
    const maxLabelW = Math.max(...points.map(p => tmpCtx.measureText(p.week).width));
    return Math.max(MIN_STEP, maxLabelW + LABEL_PAD);
  }, [points]);

  // chartCanvasW excludes the Y-axis panel — scroll starts right after the Y-axis
  const chartCanvasW = Math.max(MIN_W - PAD_L, PAD_R + Math.max(0, points.length - 1) * minStep);

  const { tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: chartCanvasW, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, chartCanvasW, H);
    const yCtx = yAxisRef.current ? setupCanvas(yAxisRef.current, PAD_L, H) : null;
    frameRef.current = 0;
    const DURATION = 72;

    const padR = PAD_R;
    const padT = 30;
    const padB = 54;
    // Chart canvas starts at x=0 — Y-axis lives on its own fixed canvas to the left
    const chartW = chartCanvasW - padR;
    const chartH = H - padT - padB;
    const maxCount = Math.max(...points.map(p => p.count), 1);
    const n = points.length;
    const stepX = n > 1 ? Math.max(chartW / (n - 1), minStep) : chartW;

    const pts = points.map((p, i) => ({
      x: i * stepX,
      y: padT + chartH - (p.count / maxCount) * chartH,
      point: p,
    }));

    // Draw Y-axis once — it never changes
    if (yCtx) {
      yCtx.clearRect(0, 0, PAD_L, H);
      yCtx.fillStyle = CC.bg;
      yCtx.fillRect(0, 0, PAD_L, H);
      [0.25, 0.5, 0.75, 1.0].forEach(frac => {
        const y = padT + chartH - frac * chartH;
        yCtx.font = AXIS_LABEL.font;
        yCtx.fillStyle = AXIS_LABEL.color;
        yCtx.textAlign = 'right';
        yCtx.fillText(String(Math.round(maxCount * frac)), PAD_L - 6, y + 3);
      });
      yCtx.save();
      yCtx.translate(12, padT + chartH / 2);
      yCtx.rotate(-Math.PI / 2);
      yCtx.font = AXIS_LABEL.font;
      yCtx.fillStyle = AXIS_LABEL.color;
      yCtx.textAlign = 'center';
      yCtx.fillText('Count', 0, 0);
      yCtx.restore();
    }

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const rawP = Math.min(frameRef.current / DURATION, 1);
      const progress = easeOutCubic(rawP);

      ctx.clearRect(0, 0, chartCanvasW, H);

      // Grid lines — start at x=0 (Y-axis is on separate fixed canvas)
      [0.25, 0.5, 0.75, 1.0].forEach(frac => {
        const y = padT + chartH - frac * chartH;
        ctx.strokeStyle = rgb(CC.bd, 0.18);
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartW, y);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // X-axis label
      ctx.font = AXIS_LABEL.font;
      ctx.fillStyle = AXIS_LABEL.color;
      ctx.textAlign = 'center';
      ctx.fillText('Period', chartW / 2, H - 6);

      // X-axis baseline
      ctx.strokeStyle = rgb(CC.bd, 0.3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, padT + chartH);
      ctx.lineTo(chartW, padT + chartH);
      ctx.stroke();

      const drawUpTo = progress * (n - 1);
      const drawN = Math.floor(drawUpTo) + 1;

      // Area fill
      if (drawN >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, padT + chartH);
        ctx.lineTo(pts[0].x, pts[0].y);
        for (let i = 1; i < drawN; i++) {
          const t = drawUpTo - Math.floor(drawUpTo);
          const isLast = i === drawN - 1 && i === Math.ceil(drawUpTo) && t > 0;
          const px = isLast ? pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t : pts[i].x;
          const py = isLast ? pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t : pts[i].y;
          ctx.lineTo(px, py);
        }
        ctx.lineTo(pts[drawN - 1].x, padT + chartH);
        ctx.closePath();
        const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
        areaGrad.addColorStop(0, rgb(CC.cyan, 0.22));
        areaGrad.addColorStop(1, rgb(CC.cyan, 0.02));
        ctx.fillStyle = areaGrad;
        ctx.fill();
      }

      // Line stroke
      ctx.beginPath();
      for (let i = 0; i < drawN; i++) {
        const t = drawUpTo - Math.floor(drawUpTo);
        const isLast = i === drawN - 1 && i > 0 && i === Math.ceil(drawUpTo) && t > 0;
        const px = isLast ? pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t : pts[i].x;
        const py = isLast ? pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t : pts[i].y;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = rgb(CC.cyan, 0.85);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dots, labels, hit zones
      hitZonesRef.current = [];
      pts.forEach((pt, i) => {
        if (i >= drawN) return;

        registerHitCircle(hitZonesRef.current, `pt-${i}`, pt.x, pt.y, 10, {
          label: pt.point.week,
          value: `${pt.point.count} submissions`,
          sublabel: `£${pt.point.value}M value`,
          color: CC.cyan,
        });

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = rgb(CC.cyan, 0.8);
        ctx.fill();

        ctx.font = LABEL_FONT;
        ctx.fillStyle = AXIS_LABEL.color;
        ctx.textAlign = i === 0 ? 'left' : i === pts.length - 1 ? 'right' : 'center';
        ctx.fillText(pt.point.week, pt.x, H - padB + 14);
      });

      if (rawP < 1) {
        raf = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [points, chartCanvasW, minStep, hitZonesRef]);

  const isEmpty = points.length < 2;
  if (isEmpty) return <ChartEmptyState width={MIN_W} height={H} data-testid={testId} />;

  return (
    <div data-testid={testId} style={{ position: 'relative', width: '100%', display: 'flex' }}>
      <canvas
        ref={yAxisRef}
        aria-hidden="true"
        style={{ width: PAD_L, height: H, display: 'block', flexShrink: 0 }}
      />
      <div
        className="trend-scroll"
        style={{ flex: 1, overflowX: 'auto' }}
      >
        <div style={{ position: 'relative', width: chartCanvasW, height: H }}>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Trend chart — count over time"
            style={{ width: chartCanvasW, height: H, display: 'block' }}
          />
          <CanvasTooltip {...tooltip} parentW={chartCanvasW} parentH={H} />
        </div>
      </div>
    </div>
  );
}
