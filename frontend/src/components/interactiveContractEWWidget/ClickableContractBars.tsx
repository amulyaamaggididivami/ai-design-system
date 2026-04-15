import { useRef, useState, useEffect, useCallback } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { easeOutQuart, stagger, tickHoverProgress } from '../../canvas/easing';
import { CC, AXIS_LABEL, LEGEND_LABEL, rgb, drawGlow } from '../../canvas/canvasUtils';
import { useCanvasLoop } from '../../canvas/useCanvasLoop';
import { ToggleButton } from '../common/ToggleButton';
import type { ClickableContractBarsProps } from './types';

const W         = 620;
const MIN_H     = 220;
const MAX_ITEMS = 8;
const COLORS    = [CC.blue, CC.cyan, CC.amber, CC.purple, CC.green];
const PAD       = { left: 8, right: 80, top: 16, bottom: 38 };
const NAME_W    = 88;
const BAR_H     = 18;

function fmtValue(v: number): string {
  const abs  = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}£${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}£${(abs / 1_000).toFixed(1)}K`;
  return `${sign}£${abs.toFixed(0)}`;
}

export function ClickableContractBars({
  contractors,
  totals,
  selectedId,
  onBarClick,
  'data-testid': testId,
}: ClickableContractBarsProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const hoverMap   = useRef<Map<string, number>>(new Map());
  const selectedRef = useRef<string | null>(selectedId);
  const [showAll, setShowAll] = useState(false);

  // Keep selectedRef in sync with prop without restarting the canvas loop
  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  const sorted   = [...contractors].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  const visible  = showAll ? sorted : sorted.slice(0, MAX_ITEMS);
  const n        = visible.length;
  const maxVal   = Math.max(...sorted.map(c => Math.abs(c.total ?? 0)), 1);
  const dynamicH = Math.max(MIN_H, PAD.top + PAD.bottom + n * BAR_H + Math.max(0, n - 1) * 8);
  const barArea  = W - PAD.left - NAME_W - PAD.right;
  const gap      = n > 1 ? (dynamicH - PAD.top - PAD.bottom - n * BAR_H) / (n - 1) : 0;

  const handleClick = useCallback(
    (id: string) => { onBarClick(id); },
    [onBarClick],
  );

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(
    canvasRef,
    { width: W, height: dynamicH, onClick: handleClick },
  );

  useCanvasLoop(
    canvasRef,
    W,
    dynamicH,
    (ctx, progress) => {
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];
      const sel = selectedRef.current;
      const hasSelection = sel !== null;

      visible.forEach((con, i) => {
        const color   = COLORS[i % COLORS.length];
        const localP  = stagger(progress, i, n, easeOutQuart);
        const y       = PAD.top + i * (BAR_H + gap);
        const x0      = PAD.left + NAME_W;
        const hp      = hoverMap.current.get(con.id) ?? 0;
        const isSelected = con.id === sel;
        // Dim unselected bars when a selection is active
        const dimAlpha = hasSelection && !isSelected ? 0.35 : 1;

        const absBase  = Math.max(con.base ?? 0, 0);
        const absTotal = Math.max(con.total ?? 0, 0);
        const baseW    = (absBase  / maxVal) * barArea * localP;
        const totalW   = (absTotal / maxVal) * barArea * localP;
        const varW     = totalW - baseW;

        ctx.globalAlpha = dimAlpha;

        // Contractor name
        ctx.font         = '500 14px \'Satoshi Variable\', \'DM Sans\', sans-serif';
        ctx.fillStyle    = hp > 0 || isSelected ? color : AXIS_LABEL.color;
        ctx.textAlign    = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(con.abbreviation ?? con.name.slice(0, 6), x0 - 8, y + BAR_H / 2);

        // Background track
        ctx.fillStyle = rgb(CC.bd, 0.25);
        ctx.beginPath();
        ctx.roundRect(x0, y, barArea, BAR_H, 4);
        ctx.fill();

        // Base segment
        if (baseW > 0) {
          if (hp > 0 || isSelected) drawGlow(ctx, x0 + baseW / 2, y + BAR_H / 2, baseW * 0.3, color, 0.1 + (isSelected ? 0.08 : 0) + hp * 0.07);
          ctx.fillStyle = rgb(color, 0.5 + (isSelected ? 0.15 : 0) + hp * 0.1);
          ctx.beginPath();
          ctx.roundRect(x0, y, baseW, BAR_H, 4);
          ctx.fill();
        }

        // Variation segment
        if (varW > 2) {
          ctx.fillStyle = rgb(color, 0.22 + (isSelected ? 0.08 : 0) + hp * 0.06);
          ctx.beginPath();
          ctx.roundRect(x0 + baseW, y, varW, BAR_H, [0, 4, 4, 0]);
          ctx.fill();
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = rgb(color, 0.55);
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.moveTo(x0 + baseW, y + 3);
          ctx.lineTo(x0 + baseW, y + BAR_H - 3);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Selected ring — pulsing outer border
        if (isSelected && totalW > 0) {
          ctx.strokeStyle = rgb(color, 0.85);
          ctx.lineWidth   = 1.5;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.roundRect(x0 - 1, y - 1, totalW + 2, BAR_H + 2, 5);
          ctx.stroke();
        }

        // Hover border (when not selected)
        if (!isSelected && hp > 0 && totalW > 0) {
          ctx.strokeStyle = rgb(color, 0.5 * hp);
          ctx.lineWidth   = 1;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.roundRect(x0, y, totalW, BAR_H, 4);
          ctx.stroke();
        }

        // Value label after animation in
        if (localP > 0.35) {
          const fade = Math.min(1, (localP - 0.35) / 0.4);
          ctx.globalAlpha = dimAlpha * fade;
          ctx.font        = '500 14px \'Satoshi Variable\', \'DM Sans\', sans-serif';
          ctx.fillStyle   = hp > 0 || isSelected ? color : CC.t1;
          ctx.textAlign   = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(fmtValue(con.total ?? 0), x0 + totalW + 6, y + BAR_H / 2);
        }

        ctx.globalAlpha = 1;

        registerHitRect(hitZonesRef.current, con.id, x0, y, Math.max(totalW, barArea), BAR_H, {
          label   : con.name,
          value   : `${fmtValue(con.total ?? 0)} total`,
          sublabel: `Base ${fmtValue(con.base ?? 0)} + Var ${fmtValue(con.variation ?? 0)} · ${con.percentage ?? 0}% committed — click to filter EW status`,
          color,
        });
      });

      // Legend row
      const ly = dynamicH - 14;
      ctx.textBaseline = 'middle';
      ctx.font         = LEGEND_LABEL.font;
      ctx.textAlign    = 'left';

      ctx.fillStyle = rgb(CC.cyan, 0.5);
      ctx.beginPath();
      ctx.roundRect(PAD.left + NAME_W, ly - 3, 14, 6, 2);
      ctx.fill();
      ctx.fillStyle = LEGEND_LABEL.color;
      ctx.fillText('base value', PAD.left + NAME_W + 18, ly);

      ctx.fillStyle = rgb(CC.cyan, 0.22);
      ctx.beginPath();
      ctx.roundRect(PAD.left + NAME_W + 94, ly - 3, 14, 6, 2);
      ctx.fill();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = rgb(CC.cyan, 0.5);
      ctx.lineWidth   = 0.5;
      ctx.beginPath();
      ctx.moveTo(PAD.left + NAME_W + 101, ly - 3);
      ctx.lineTo(PAD.left + NAME_W + 101, ly + 3);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = LEGEND_LABEL.color;
      ctx.fillText('approved variations', PAD.left + NAME_W + 112, ly);

      ctx.font      = LEGEND_LABEL.font;
      ctx.textAlign = 'right';
      ctx.fillStyle = LEGEND_LABEL.color;
      ctx.fillText(`Portfolio: ${fmtValue(totals?.total ?? 0)}`, W - 8, ly);
    },
    true,
    { easing: easeOutQuart },
  );

  return (
    <div data-testid={testId} style={{ width: W, transition: 'all 0.25s ease' }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Total contract value per contractor — click a bar to filter EW status"
          style={{ width: W, height: dynamicH, display: 'block', borderRadius: 8, cursor: 'pointer' }}
        />
        <CanvasTooltip {...tooltip} parentW={W} parentH={dynamicH} />
      </div>
      {contractors.length > MAX_ITEMS && (
        <div style={{ marginTop: 8 }}>
          <ToggleButton expanded={showAll} onToggle={() => setShowAll(prev => !prev)} />
        </div>
      )}
    </div>
  );
}
