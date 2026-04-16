import { useRef, useCallback } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { easeOutCubic, easeOutQuart, stagger } from '../../canvas/easing';
import { CC, rgb, drawGlow } from '../../canvas/canvasUtils';
import { useCanvasLoop } from '../../canvas/useCanvasLoop';
import { ChartEmptyState } from '../common/ChartEmptyState';
import type { NCEDetailBreakdownProps, NCEClause } from './types';

const TREEMAP_COLORS = ['#e05555', '#d4893a', '#c9a832', '#5c83ff', '#a67bdb', '#3bb88a'];
const MONTHS = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'];

// ─── Squarified treemap layout ───

interface TreemapItem {
  clause: string;
  count: number;
  value: number;
  trend: number[];
  color: string;
  idx: number;
}

interface TreemapRect {
  item: TreemapItem;
  x: number;
  y: number;
  w: number;
  h: number;
}

function worstAspect(items: TreemapItem[], totalVal: number, stripSize: number, otherDim: number): number {
  if (stripSize <= 0 || otherDim <= 0) return Infinity;
  let worst = 0;
  for (const item of items) {
    const frac = item.value / totalVal;
    const size = otherDim * frac;
    const aspect = Math.max(stripSize / size, size / stripSize);
    if (aspect > worst) worst = aspect;
  }
  return worst;
}

function layoutStrip(
  items: TreemapItem[], totalVal: number,
  x: number, y: number, w: number, h: number,
  gap: number, rects: TreemapRect[],
): void {
  if (items.length === 0) return;
  if (items.length === 1) {
    rects.push({ item: items[0], x: x + gap / 2, y: y + gap / 2, w: w - gap, h: h - gap });
    return;
  }

  const isWide = w >= h;
  const stripItems = [items[0]];
  let stripVal = items[0].value;

  for (let i = 1; i < items.length; i++) {
    const testVal = stripVal + items[i].value;
    const stripFrac = testVal / totalVal;
    const stripSize = isWide ? w * stripFrac : h * stripFrac;
    const worst = worstAspect([...stripItems, items[i]], testVal, stripSize, isWide ? h : w);
    const current = worstAspect(stripItems, stripVal, isWide ? w * (stripVal / totalVal) : h * (stripVal / totalVal), isWide ? h : w);
    if (worst <= current) {
      stripItems.push(items[i]);
      stripVal = testVal;
    } else {
      break;
    }
  }

  const stripFrac = stripVal / totalVal;
  const stripSize = isWide ? w * stripFrac : h * stripFrac;
  let offset = 0;

  for (const item of stripItems) {
    const itemFrac = item.value / stripVal;
    const itemSize = (isWide ? h : w) * itemFrac;
    if (isWide) {
      rects.push({ item, x: x + gap / 2, y: y + offset + gap / 2, w: stripSize - gap, h: itemSize - gap });
    } else {
      rects.push({ item, x: x + offset + gap / 2, y: y + gap / 2, w: itemSize - gap, h: stripSize - gap });
    }
    offset += itemSize;
  }

  const remaining = items.slice(stripItems.length);
  const remainingVal = totalVal - stripVal;
  if (isWide) {
    layoutStrip(remaining, remainingVal, x + stripSize, y, w - stripSize, h, gap, rects);
  } else {
    layoutStrip(remaining, remainingVal, x, y + stripSize, w, h - stripSize, gap, rects);
  }
}

function squarify(items: TreemapItem[], totalVal: number, x: number, y: number, w: number, h: number, gap: number): TreemapRect[] {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const rects: TreemapRect[] = [];
  layoutStrip(sorted, totalVal, x, y, w, h, gap, rects);
  return rects;
}

export function NCEDetailBreakdown({
  data,
  width = 680,
  height = 340,
  activeKey = null,
  dimOthers = false,
  'data-testid': testId,
}: NCEDetailBreakdownProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeKeyRef = useRef(activeKey);
  const dimRef = useRef(dimOthers);
  // Use refs for mutable state that the canvas draw loop reads — avoids stale closures
  const selectedClauseRef = useRef<string | null>(null);
  const prevContractorRef = useRef<string | null>(null);

  activeKeyRef.current = activeKey;
  dimRef.current = dimOthers;

  const { tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, {
    width,
    height,
    onClick: (id) => {
      // Toggle clause selection via ref (not state) so the draw loop sees it immediately
      selectedClauseRef.current = selectedClauseRef.current === id ? null : id;
    },
  });

  const isEmpty = !data || !data.contractors || data.contractors.length === 0;

  useCanvasLoop(
    canvasRef,
    width,
    height,
    useCallback((ctx: CanvasRenderingContext2D, progress: number, frame: number) => {
      hitZonesRef.current = [];

      const contractorNames = data.contractors.map(c => c.name);
      const activeContractor = activeKeyRef.current && contractorNames.includes(activeKeyRef.current)
        ? activeKeyRef.current : null;

      // Reset clause selection when contractor changes
      if (activeContractor !== prevContractorRef.current) {
        selectedClauseRef.current = null;
        prevContractorRef.current = activeContractor;
      }

      const selectedClause = selectedClauseRef.current;

      // Build clause data: aggregate or filter
      const selected = activeContractor ? data.contractors.find(c => c.name === activeContractor) : null;
      let clauses: NCEClause[];
      let headerText: string;

      if (selected) {
        clauses = selected.ncesByClause || [];
        const pct = ((selected.nceVariation / (selected.originalValue || 1)) * 100).toFixed(1);
        headerText = `${selected.name} \u2014 \u00A3${(selected.nceVariation ?? 0).toFixed(1)}M (${pct}%)`;
      } else {
        const clauseMap: Record<string, NCEClause> = {};
        for (const c of data.contractors) {
          for (const cl of (c.ncesByClause || [])) {
            if (!clauseMap[cl.clause]) {
              clauseMap[cl.clause] = { clause: cl.clause, count: 0, value: 0, trend: cl.trend ? cl.trend.map(() => 0) : [] };
            }
            clauseMap[cl.clause].count += cl.count;
            clauseMap[cl.clause].value += cl.value;
            if (cl.trend) {
              cl.trend.forEach((v, i) => { clauseMap[cl.clause].trend[i] += v; });
            }
          }
        }
        clauses = Object.values(clauseMap).sort((a, b) => b.value - a.value);
        headerText = `All Contractors \u2014 \u00A3${(data.totals?.totalNCE ?? 0).toFixed(1)}M total NCE variation`;
      }

      const totalVal = clauses.reduce((s, c) => s + c.value, 0);
      const pad = 14;

      // Header
      ctx.globalAlpha = easeOutCubic(progress);
      ctx.font = "700 12px 'Satoshi Variable', 'DM Sans', sans-serif";
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(headerText, pad, 18);

      if (!selected) {
        ctx.font = "500 9px 'Satoshi Variable', 'DM Sans', sans-serif";
        ctx.fillStyle = CC.t3;
        ctx.fillText('Click a contractor above to filter', pad, 32);
      }

      // Layout: left = boxes, right = trend (if clause selected)
      const boxZoneW = selectedClause ? width * 0.48 - pad : width - pad * 2;
      const boxY = 42;
      const boxH = height - boxY - 12;

      // Treemap
      const items: TreemapItem[] = clauses.map((c, i) => ({
        ...c,
        color: TREEMAP_COLORS[i % TREEMAP_COLORS.length],
        idx: i,
      }));
      const rects = squarify(items, totalVal, pad, boxY, boxZoneW, boxH, 4);

      for (const r of rects) {
        const { clause, value, count, idx } = r.item;
        const s = stagger(progress, idx, clauses.length);
        const ratio = value / totalVal;
        const isSelected = selectedClause === clause;
        const isDimmed = selectedClause !== null && !isSelected;
        const bx = r.x, by = r.y, bw = r.w, bh = r.h;
        const boxColor = TREEMAP_COLORS[idx % TREEMAP_COLORS.length];

        if (bw < 2 || bh < 2) continue;

        // Box fill
        ctx.globalAlpha = s * (isDimmed ? 0.15 : (isSelected ? 1 : 0.85));
        ctx.fillStyle = boxColor;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6);
        ctx.fill();

        // Border
        ctx.globalAlpha = s * (isDimmed ? 0.1 : 0.3);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = isSelected ? 2.5 : 1;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6);
        ctx.stroke();

        // Labels
        ctx.globalAlpha = s * (isDimmed ? 0.2 : 0.95);
        ctx.textAlign = 'left';

        if (bh > 60 && bw > 90) {
          ctx.font = "700 13px 'Satoshi Variable', 'DM Sans', sans-serif";
          ctx.fillStyle = '#fff';
          ctx.fillText(clause, bx + 14, by + 24);
          ctx.font = "700 24px 'SFMono-Regular', Consolas, monospace";
          ctx.fillStyle = '#fff';
          ctx.fillText(`\u00A3${value.toFixed(1)}M`, bx + 14, by + 54);
          ctx.font = "500 11px 'Satoshi Variable', 'DM Sans', sans-serif";
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fillText(`${count} NCEs \u00B7 ${(ratio * 100).toFixed(0)}%`, bx + 14, by + 72);
        } else if (bh > 35 && bw > 70) {
          ctx.font = "600 11px 'Satoshi Variable', 'DM Sans', sans-serif";
          ctx.fillStyle = '#fff';
          ctx.fillText(clause, bx + 10, by + 18);
          ctx.font = "700 16px 'SFMono-Regular', Consolas, monospace";
          ctx.fillStyle = '#fff';
          ctx.fillText(`\u00A3${value.toFixed(1)}M`, bx + 10, by + 38);
        } else if (bw > 44 && bh > 18) {
          ctx.font = "700 11px 'SFMono-Regular', Consolas, monospace";
          ctx.fillStyle = '#fff';
          ctx.fillText(`\u00A3${value.toFixed(1)}M`, bx + 8, by + bh / 2 + 4);
        }

        ctx.globalAlpha = 1;

        registerHitRect(hitZonesRef.current, clause, bx, by, bw, bh, {
          label: clause,
          value: `\u00A3${value.toFixed(1)}M`,
          sublabel: `${count} NCEs \u00B7 ${(ratio * 100).toFixed(0)}%`,
          color: boxColor,
        });
      }

      // Trend line (right half, when clause selected)
      if (selectedClause) {
        const clauseData = clauses.find(c => c.clause === selectedClause);
        if (clauseData && clauseData.trend && clauseData.trend.length > 0) {
          const trendX = width * 0.52;
          const trendW = width - trendX - pad;
          const trendY = boxY;
          const trendH = boxH - 20;
          const maxTrend = Math.max(...clauseData.trend, 0.1);
          const clauseIdx = clauses.indexOf(clauseData);
          const color = TREEMAP_COLORS[clauseIdx % TREEMAP_COLORS.length];

          // Label
          ctx.globalAlpha = 0.6 * easeOutCubic(progress);
          ctx.font = "600 9px 'Satoshi Variable', 'DM Sans', sans-serif";
          ctx.fillStyle = CC.t3;
          ctx.textAlign = 'left';
          ctx.fillText(`NCE ACCUMULATION \u2014 ${selectedClause.toUpperCase()}`, trendX, trendY - 4);

          // Area fill
          ctx.beginPath();
          ctx.moveTo(trendX, trendY + trendH);
          clauseData.trend.forEach((v, i) => {
            const x = trendX + (i / (clauseData.trend.length - 1)) * trendW;
            const y = trendY + trendH - (v / maxTrend) * trendH * easeOutCubic(progress);
            ctx.lineTo(x, y);
          });
          ctx.lineTo(trendX + trendW, trendY + trendH);
          ctx.closePath();
          const grad = ctx.createLinearGradient(0, trendY, 0, trendY + trendH);
          grad.addColorStop(0, rgb(color, 0.25 * easeOutCubic(progress)));
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.8;
          ctx.fill();

          // Line
          ctx.beginPath();
          clauseData.trend.forEach((v, i) => {
            const x = trendX + (i / (clauseData.trend.length - 1)) * trendW;
            const y = trendY + trendH - (v / maxTrend) * trendH * easeOutCubic(progress);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = 0.9 * easeOutCubic(progress);
          ctx.stroke();

          // Data points
          clauseData.trend.forEach((v, i) => {
            if (v <= 0) return;
            const x = trendX + (i / (clauseData.trend.length - 1)) * trendW;
            const y = trendY + trendH - (v / maxTrend) * trendH * easeOutCubic(progress);
            ctx.globalAlpha = 0.7 * easeOutCubic(progress);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.fill();

            if (i === clauseData.trend.length - 1 || i === Math.floor(clauseData.trend.length / 2)) {
              ctx.globalAlpha = easeOutCubic(progress);
              ctx.font = "700 10px 'SFMono-Regular', Consolas, monospace";
              ctx.fillStyle = color;
              ctx.textAlign = 'center';
              ctx.fillText(`\u00A3${v.toFixed(1)}M`, x, y - 10);
            }
          });

          // Endpoint glow (pulsing)
          const lastV = clauseData.trend[clauseData.trend.length - 1];
          const endX = trendX + trendW;
          const endY = trendY + trendH - (lastV / maxTrend) * trendH * easeOutCubic(progress);
          const pulse = 0.6 + 0.4 * Math.sin(frame * 0.1);
          drawGlow(ctx, endX, endY, 14, color, 0.35 * pulse);
          ctx.globalAlpha = easeOutCubic(progress);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(endX, endY, 5, 0, Math.PI * 2);
          ctx.fill();

          // Month labels
          ctx.globalAlpha = 0.4 * easeOutCubic(progress);
          ctx.font = "500 9px 'Satoshi Variable', 'DM Sans', sans-serif";
          ctx.fillStyle = CC.t3;
          ctx.textAlign = 'center';
          MONTHS.forEach((m, i) => {
            ctx.fillText(m, trendX + (i / (MONTHS.length - 1)) * trendW, trendY + trendH + 16);
          });

          // Hint
          ctx.globalAlpha = 0.3 * easeOutCubic(progress);
          ctx.font = "500 8px 'Satoshi Variable', 'DM Sans', sans-serif";
          ctx.fillStyle = CC.t3;
          ctx.textAlign = 'right';
          ctx.fillText('Click box again to deselect', width - pad, height - 4);
        }
      } else {
        ctx.globalAlpha = 0.3 * easeOutCubic(progress);
        ctx.font = "500 9px 'Satoshi Variable', 'DM Sans', sans-serif";
        ctx.fillStyle = CC.t3;
        ctx.textAlign = 'right';
        ctx.fillText('Click a box to see trend \u2192', width - pad, height - 4);
      }

      ctx.globalAlpha = 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, width, height]),
    true,
    { easing: easeOutQuart },
  );

  if (isEmpty) {
    return <ChartEmptyState width={width} height={height} message="No NCE breakdown data available" data-testid={testId} />;
  }

  return (
    <div data-testid={testId} style={{ width }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="NCE variation breakdown by clause category — treemap with trend"
          style={{ width, height, display: 'block', borderRadius: 8, cursor: 'crosshair' }}
        />
        <CanvasTooltip {...tooltip} parentW={width} parentH={height} />
      </div>
    </div>
  );
}
