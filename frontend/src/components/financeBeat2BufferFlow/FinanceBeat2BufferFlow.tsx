import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { CC } from '../../canvas/canvasUtils';
import type { FinanceBeat2BufferFlowProps } from './types';
import * as S from './styles';

const EASE = [0.16, 1, 0.3, 1] as const;

// Cubic bezier eval
function bezier(p0: number[], p1: number[], p2: number[], p3: number[], t: number): [number, number] {
  const mt = 1 - t;
  const x = mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0];
  const y = mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1];
  return [x, y];
}

function useSplitCanvas(startDelay: number) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const setup = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    };

    let rect = setup();
    const ro = new ResizeObserver(() => {
      rect = setup();
    });
    ro.observe(parent);

    const t0 = performance.now();
    let raf = 0;

    const drawDashed = (
      p0: [number, number],
      p1: [number, number],
      p2: [number, number],
      p3: [number, number],
      progress: number,
      color: string,
    ) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      const steps = 60;
      const end = Math.floor(progress * steps);
      for (let i = 1; i <= end; i++) {
        const t = i / steps;
        const [x, y] = bezier(p0, p1, p2, p3, t);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      const elapsed = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Coordinates scaled to width/height. Original viewBox was 140×220.
      const scaleX = rect.width / 140;
      const scaleY = rect.height / 220;

      // Up branch (orange)
      const upP0: [number, number] = [0 * scaleX, 110 * scaleY];
      const upP1: [number, number] = [60 * scaleX, 110 * scaleY];
      const upP2: [number, number] = [80 * scaleX, 30 * scaleY];
      const upP3: [number, number] = [140 * scaleX, 30 * scaleY];

      // Down branch (green)
      const dnP0: [number, number] = [0 * scaleX, 110 * scaleY];
      const dnP1: [number, number] = [60 * scaleX, 110 * scaleY];
      const dnP2: [number, number] = [80 * scaleX, 190 * scaleY];
      const dnP3: [number, number] = [140 * scaleX, 190 * scaleY];

      const drawStart = startDelay;
      const drawDur = 1.0;
      const p = Math.max(0, Math.min(1, (elapsed - drawStart) / drawDur));

      drawDashed(upP0, upP1, upP2, upP3, p, CC.orange);
      drawDashed(dnP0, dnP1, dnP2, dnP3, p, CC.green);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [startDelay]);

  return canvasRef;
}

export function FinanceBeat2BufferFlow({
  title = 'The buffer overflows by',
  overflowAmount = '£2.6M',
  sourceAmount,
  sourceUnit,
  negotiableAmount,
  applicableAmount,
  bufferAmount,
  overflowValue,
  overflowUnit,
  footnote,
  'data-testid': testId,
}: FinanceBeat2BufferFlowProps) {
  const splitCanvasRef = useSplitCanvas(0.7);

  return (
    <section style={S.container} data-testid={testId}>
      <motion.h2
        style={S.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {title} <em style={S.highlight}>{overflowAmount}</em>
      </motion.h2>

      <div style={S.flowRow}>
        <motion.div
          style={S.sourceCol}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        >
          <div>
            <span style={S.sourceAmt}>{sourceAmount}</span>
            <span style={S.sourceUnit}>{sourceUnit}</span>
          </div>
          <div style={S.sourceSub}>All pending</div>
        </motion.div>

        <div style={S.splitCol}>
          <canvas ref={splitCanvasRef} style={S.splitCanvas} />
          <motion.div
            style={{ ...S.splitBranch, top: 30 }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4, ease: EASE }}
          >
            <div style={S.chipOrange}>{negotiableAmount} · Negotiable</div>
            <div style={S.branchNote}>held aside</div>
          </motion.div>
          <motion.div
            style={{ ...S.splitBranch, top: 190 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4, ease: EASE }}
          >
            <div style={S.chipGreen}>{applicableAmount} · Applicable</div>
            <div style={S.branchNote}>flowing to buffer</div>
          </motion.div>
        </div>

        <motion.div
          style={S.vesselCol}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.6, ease: EASE }}
        >
          <div style={S.vesselCap}>Buffer · {bufferAmount}</div>
          <div style={S.vesselBody}>
            <div style={S.vesselBrim} />
            <motion.div
              style={{ ...S.vesselFill, height: '0%' }}
              animate={{ height: '75%' }}
              transition={{ duration: 1.2, delay: 1.8, ease: EASE }}
            />
          </div>
          <div style={S.overflowZone}>
            <motion.div
              style={S.overflowWave}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 2.6, ease: EASE }}
            />
          </div>
        </motion.div>

        <motion.div
          style={S.overflowCol}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 2.8, ease: EASE }}
        >
          <div style={S.overflowTag}>◆ Overflow</div>
          <div>
            <span style={S.overflowAmt}>{overflowValue}</span>
            <span style={S.overflowUnit}>{overflowUnit}</span>
          </div>
          <div style={S.overflowSub}>beyond buffer</div>
          <div style={S.overflowFootnote}>{footnote}</div>
        </motion.div>
      </div>
    </section>
  );
}
