import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import type { FinanceBeat1HiddenLeakageProps } from './types';
import * as S from './styles';

const COL_X = { contractor: 13, project: 30, nce: 48, amount: 65, total: 82 } as const;
const EASE = [0.16, 1, 0.3, 1] as const;

interface NodeBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

interface Segment {
  start: { x: number; y: number };
  end: { x: number; y: number };
  color: string;
  drawStartAt: number; // seconds from component mount
  drawDuration: number;
  particleDelay: number; // staggered start of first particle loop
  particleDuration: number;
}

function emptyBox(): NodeBox {
  return { left: 0, right: 0, top: 0, bottom: 0, centerX: 0, centerY: 0 };
}

function readBox(
  el: HTMLElement | null,
  gridBox: DOMRect,
): NodeBox | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    left: r.left - gridBox.left,
    right: r.right - gridBox.left,
    top: r.top - gridBox.top,
    bottom: r.bottom - gridBox.top,
    centerX: r.left + r.width / 2 - gridBox.left,
    centerY: r.top + r.height / 2 - gridBox.top,
  };
}

// Evaluate a cubic bezier at t
function bezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number,
) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
  };
}

export function FinanceBeat1HiddenLeakage({
  title = 'The hidden',
  highlightAmount = '£6.8M',
  contractors,
  totals,
  'data-testid': testId,
}: FinanceBeat1HiddenLeakageProps) {
  const layout = useMemo(() => {
    const count = contractors.length;
    const vPad = 12;
    const vStep = count > 1 ? (100 - vPad * 2) / (count - 1) : 0;

    const contractorNodes = contractors.map((c, i) => ({
      c,
      i,
      x: COL_X.contractor,
      y: vPad + i * vStep,
    }));

    const projectNodes = contractors.flatMap((c, i) => {
      const cy = vPad + i * vStep;
      const pCount = c.projects.length;
      return c.projects.map((p, pi) => ({
        p,
        pi,
        contractorIdx: i,
        color: c.color,
        x: COL_X.project,
        y: pCount === 1 ? cy : cy - 3 + pi * 6,
      }));
    });

    const amountNodes = contractors.map((c, i) => ({
      c,
      x: COL_X.amount,
      y: vPad + i * vStep,
    }));

    return { contractorNodes, projectNodes, amountNodes };
  }, [contractors]);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contractorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const amountRefs = useRef<(HTMLDivElement | null)[]>([]);
  const totalRef = useRef<HTMLDivElement | null>(null);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // Measure all nodes and compute segment endpoints in pixel coords
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const compute = () => {
      const gb = grid.getBoundingClientRect();
      if (gb.width === 0 || gb.height === 0) return;

      const headerOffset = 32; // matches canvasLayer top inset
      const canvasH = gb.height - headerOffset;
      setCanvasSize({ w: gb.width, h: canvasH });

      const toLocal = (box: NodeBox): NodeBox => ({
        left: box.left,
        right: box.right,
        top: box.top - headerOffset,
        bottom: box.bottom - headerOffset,
        centerX: box.centerX,
        centerY: box.centerY - headerOffset,
      });

      const contractorBoxes = contractorRefs.current.map((el) => {
        const b = readBox(el, gb);
        return b ? toLocal(b) : emptyBox();
      });
      const projectBoxes = projectRefs.current.map((el) => {
        const b = readBox(el, gb);
        return b ? toLocal(b) : emptyBox();
      });
      const nceBoxes = nceRefs.current.map((el) => {
        const b = readBox(el, gb);
        return b ? toLocal(b) : emptyBox();
      });
      const amountBoxes = amountRefs.current.map((el) => {
        const b = readBox(el, gb);
        return b ? toLocal(b) : emptyBox();
      });
      const totalB = totalRef.current ? readBox(totalRef.current, gb) : null;
      const totalLocal = totalB ? toLocal(totalB) : null;

      const segs: Segment[] = [];

      layout.projectNodes.forEach((p, idx) => {
        const c = layout.contractorNodes[p.contractorIdx];
        const cb = contractorBoxes[p.contractorIdx];
        const pb = projectBoxes[idx];
        const nb = nceBoxes[idx];
        const ab = amountBoxes[p.contractorIdx];

        // contractor → project
        segs.push({
          start: { x: cb.right, y: cb.centerY },
          end: { x: pb.left, y: pb.centerY },
          color: c.c.color,
          drawStartAt: 0.3 + p.contractorIdx * 0.08,
          drawDuration: 0.7,
          particleDelay: 1.8 + p.contractorIdx * 0.15 + p.pi * 0.1,
          particleDuration: 2.8,
        });

        // project → nce
        segs.push({
          start: { x: pb.right, y: pb.centerY },
          end: { x: nb.left, y: nb.centerY },
          color: c.c.color,
          drawStartAt: 0.55 + p.contractorIdx * 0.08,
          drawDuration: 0.5,
          particleDelay: 2.1 + p.contractorIdx * 0.15 + p.pi * 0.1,
          particleDuration: 2.2,
        });

        // nce → amount
        segs.push({
          start: { x: nb.right, y: nb.centerY },
          end: { x: ab.left, y: ab.centerY },
          color: c.c.color,
          drawStartAt: 0.8 + p.contractorIdx * 0.08,
          drawDuration: 0.7,
          particleDelay: 2.4 + p.contractorIdx * 0.15 + p.pi * 0.1,
          particleDuration: 2.6,
        });
      });

      // amount → total (vertical center of total box)
      if (totalLocal) {
        layout.amountNodes.forEach((a, i) => {
          const ab = amountBoxes[i];
          segs.push({
            start: { x: ab.right, y: ab.centerY },
            end: { x: totalLocal.left, y: totalLocal.centerY },
            color: a.c.color,
            drawStartAt: 1.1 + i * 0.08,
            drawDuration: 0.8,
            particleDelay: 2.8 + i * 0.18,
            particleDuration: 3.2,
          });
        });
      }

      setSegments(segs);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [layout]);

  // Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    canvas.style.width = `${canvasSize.w}px`;
    canvas.style.height = `${canvasSize.h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const t0 = performance.now();
    let raf = 0;

    const draw = () => {
      const now = performance.now();
      const elapsed = (now - t0) / 1000;

      ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

      segments.forEach((seg) => {
        const p0 = seg.start;
        const p3 = seg.end;
        // Control points: pull horizontally toward the middle to get an S-curve feel
        const midX = (p0.x + p3.x) / 2;
        const p1 = { x: midX, y: p0.y };
        const p2 = { x: midX, y: p3.y };

        // Drawing progress 0..1
        const drawT = Math.max(0, Math.min(1, (elapsed - seg.drawStartAt) / seg.drawDuration));
        if (drawT <= 0) return;

        // Draw path up to drawT using many small segments
        ctx.strokeStyle = seg.color;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        const steps = 60;
        const endStep = Math.floor(drawT * steps);
        for (let i = 1; i <= endStep; i++) {
          const t = i / steps;
          const pt = bezierPoint(p0, p1, p2, p3, t);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Particles: only start once drawing is complete
        if (drawT >= 1) {
          const since = elapsed - seg.drawStartAt - seg.drawDuration;
          if (since >= 0) {
            // particle moves from t=0 to t=1 in particleDuration seconds, looping with particleDelay offset
            const offset = (since + seg.particleDelay) % seg.particleDuration;
            const pt = offset / seg.particleDuration;
            const pos = bezierPoint(p0, p1, p2, p3, pt);

            // fade in/out at ends
            let alpha = 1;
            if (pt < 0.1) alpha = pt / 0.1;
            else if (pt > 0.9) alpha = (1 - pt) / 0.1;

            ctx.save();
            ctx.globalAlpha = alpha;
            // glow
            ctx.fillStyle = seg.color;
            ctx.shadowColor = seg.color;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [segments, canvasSize]);

  return (
    <section style={S.container} data-testid={testId}>
      <motion.h2
        style={S.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {title} <em style={S.titleHighlight}>{highlightAmount}</em>
      </motion.h2>

      <div style={S.flowGrid} ref={gridRef}>
        <motion.div
          style={S.colLabelsRow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div style={S.colLabel(COL_X.contractor)}>Contractors</div>
          <div style={S.colLabel(COL_X.project)}>Projects</div>
          <div style={S.colLabel(COL_X.nce)}>NCEs</div>
          <div style={S.colLabel(COL_X.amount)}>Amount</div>
          <div style={S.colLabel(COL_X.total)}>Total</div>
        </motion.div>

        <canvas ref={canvasRef} style={S.canvasLayer} />

        <div style={S.nodesLayer}>
          {layout.contractorNodes.map(({ c, i, x, y }) => (
            <motion.div
              key={`c-${i}`}
              ref={(el) => { contractorRefs.current[i] = el; }}
              style={{ ...S.node, left: `${x}%`, top: `${y}%`, color: c.color }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: EASE }}
            >
              {c.logoUrl ? (
                <img src={c.logoUrl} alt={c.contractor} style={S.contractorLogo} />
              ) : (
                <span style={S.contractorDot} />
              )}
              <span>{c.contractor}</span>
            </motion.div>
          ))}

          {layout.projectNodes.map(({ p, pi, contractorIdx, color, x, y }, idx) => (
            <motion.div
              key={`p-${contractorIdx}-${pi}`}
              ref={(el) => { projectRefs.current[idx] = el; }}
              style={{ ...S.node, left: `${x}%`, top: `${y}%`, color }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.5 + contractorIdx * 0.08 + pi * 0.06, ease: EASE }}
            >
              <div style={S.projectCard}>
                <span style={{ ...S.projectCode, color }}>{p.code}</span>
                <span style={S.projectName}>{p.name}</span>
              </div>
            </motion.div>
          ))}

          {layout.projectNodes.map(({ p, pi, contractorIdx, color, y }, idx) => (
            <motion.div
              key={`n-${contractorIdx}-${pi}`}
              ref={(el) => { nceRefs.current[idx] = el; }}
              style={{ ...S.node, left: `${COL_X.nce}%`, top: `${y}%`, color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + contractorIdx * 0.08 + pi * 0.06 }}
            >
              <div style={S.nceCluster}>
                <div style={S.nceDotsRow}>
                  {Array.from({ length: p.nces }).map((_, di) => (
                    <motion.span
                      key={di}
                      style={S.nceDot}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: 1.0 + contractorIdx * 0.08 + pi * 0.06 + di * 0.06,
                        ease: EASE,
                      }}
                    />
                  ))}
                </div>
                <span style={S.nceCount}>{p.nces}</span>
              </div>
            </motion.div>
          ))}

          {layout.amountNodes.map(({ c, x, y }, i) => (
            <motion.div
              key={`a-${i}`}
              ref={(el) => { amountRefs.current[i] = el; }}
              style={{ ...S.node, left: `${x}%`, top: `${y}%`, color: c.color }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.2 + i * 0.08, ease: EASE }}
            >
              <div>
                <div style={S.amountValue}>{c.amount}</div>
                <div style={S.amountKey}>{c.contractor.split(' ')[0]}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          ref={totalRef}
          style={S.totalBox}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.6, ease: EASE }}
        >
          <div style={S.invisibleTag}>Invisible in forecast</div>
          <div>
            <span style={S.totalBig}>{totals.amount}</span>
            <span style={S.totalUnit}>{totals.unit}</span>
          </div>
          <div style={S.metaRow}>
            <div style={S.metaLine}>
              <span style={S.metaValue}>{totals.nces}</span>
              <span>NCEs</span>
            </div>
            <div style={S.metaLine}>
              <span style={S.metaValue}>{totals.contractors}</span>
              <span>Contractors</span>
            </div>
            <div style={S.metaLine}>
              <span style={S.metaValue}>{totals.forecast}</span>
              <span>in forecast</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
