import { useRef, useEffect } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { stagger, tickHoverProgress, easeOutQuart } from '../../canvas/easing';
import { CC, PALETTE, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import type { VariationSplitProps } from './types';

const W      = 680;
const BAR_H  = 26;
const GAP    = 14;
const PAD_T  = 16;
const PAD_B  = 48; // extra room for legend

export function VariationSplit({ contractors, 'data-testid': testId }: VariationSplitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);

  const n = contractors.length;
  const H = PAD_T + PAD_B + n * BAR_H + Math.max(0, n - 1) * GAP;

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 60;

    const padL = 60;
    const padR = 28;
    const padT = PAD_T;
    const barH = BAR_H;
    const gap = GAP;
    const trackW = W - padL - padR;
    const maxTotal = Math.max(...contractors.map(c => (c.implemented ?? 0) + (c.unimplemented ?? 0)));
    const startY = padT;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutQuart(rawP);

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      contractors.forEach((c, i) => {
        const accentColor = PALETTE[i % PALETTE.length];
        const localP = stagger(progress, i, contractors.length, easeOutQuart);
        const y = startY + i * (barH + gap);
        const total = (c.implemented ?? 0) + (c.unimplemented ?? 0);
        const implW = ((c.implemented ?? 0) / maxTotal) * trackW * localP;
        const unimplW = ((c.unimplemented ?? 0) / maxTotal) * trackW * localP;
        const implId = `${c.id}-impl`;
        const unimplId = `${c.id}-un`;
        const hpImpl = hoverMap.current.get(implId) ?? 0;
        const hpUn = hoverMap.current.get(unimplId) ?? 0;

        registerHitRect(hitZonesRef.current, implId, padL, y, implW || 1, barH, {
          label: `${c.name} — Implemented`,
          value: `${c.implemented ?? 0} variations`,
          sublabel: `${Math.round(((c.implemented ?? 0) / (total || 1)) * 100)}% complete`,
          color: CC.green,
        });
        registerHitRect(hitZonesRef.current, unimplId, padL + implW, y, unimplW || 1, barH, {
          label: `${c.name} — Unimplemented`,
          value: `${c.unimplemented ?? 0} variations`,
          sublabel: `${Math.round(((c.unimplemented ?? 0) / (total || 1)) * 100)}% pending`,
          color: CC.amber,
        });

        // Contractor name
        ctx.font = `9px 'JetBrains Mono', monospace`;
        ctx.fillStyle = rgb(accentColor, 0.85);
        ctx.textAlign = 'right';
        ctx.fillText(c.abbreviation ?? c.name.slice(0, 6), padL - 8, y + barH / 2 + 4);

        // Track
        ctx.fillStyle = rgb(CC.bd, 0.15);
        ctx.beginPath();
        ctx.roundRect(padL, y, (total / maxTotal) * trackW, barH, 4);
        ctx.fill();

        // Implemented (green) segment
        if (implW > 0) {
          if (hpImpl > 0) drawGlow(ctx, padL + implW / 2, y + barH / 2, implW * 0.3, CC.green, 0.12 * hpImpl);
          ctx.fillStyle = rgb(CC.green, 0.6 + hpImpl * 0.2);
          ctx.beginPath();
          ctx.roundRect(padL, y, implW, barH, [4, 0, 0, 4]);
          ctx.fill();

          // Implemented count
          if (implW > 28 && localP > 0.5) {
            ctx.font = `bold 10px 'JetBrains Mono', monospace`;
            ctx.fillStyle = hpImpl > 0 ? CC.green : rgb(CC.t1, 0.8);
            ctx.textAlign = 'center';
            ctx.fillText(String(c.implemented ?? 0), padL + implW / 2, y + barH / 2 + 4);
          }
        }

        // Unimplemented (grey/amber) segment
        if (unimplW > 0) {
          if (hpUn > 0) drawGlow(ctx, padL + implW + unimplW / 2, y + barH / 2, unimplW * 0.3, CC.amber, 0.12 * hpUn);
          ctx.fillStyle = rgb(CC.amber, 0.18 + hpUn * 0.18);
          ctx.strokeStyle = rgb(CC.amber, 0.3 + hpUn * 0.3);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(padL + implW, y, unimplW, barH, [0, 4, 4, 0]);
          ctx.fill();
          ctx.stroke();

          // Unimplemented count
          if (unimplW > 28 && localP > 0.5) {
            ctx.font = `${hpUn > 0 ? 'bold ' : ''}10px 'JetBrains Mono', monospace`;
            ctx.fillStyle = hpUn > 0 ? CC.amber : rgb(CC.t3, 0.8);
            ctx.textAlign = 'center';
            ctx.fillText(String(c.unimplemented ?? 0), padL + implW + unimplW / 2, y + barH / 2 + 4);
          }
        }

        // Split divider
        if (implW > 0 && unimplW > 0) {
          ctx.strokeStyle = rgb(CC.bg, 0.7);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(padL + implW, y);
          ctx.lineTo(padL + implW, y + barH);
          ctx.stroke();
        }
      });

      // Legend below bars
      const totalH = n * (barH + gap) - gap;
      const legendY = startY + totalH + 24;
      const trackCX = padL + trackW / 2;
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = 'right';
      ctx.fillStyle = CC.green;
      ctx.fillText('■ Implemented', trackCX - 10, legendY);
      ctx.textAlign = 'left';
      ctx.fillStyle = rgb(CC.t3, 0.7);
      ctx.fillText('■ Unimplemented', trackCX + 10, legendY);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [contractors, H]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Implemented vs unimplemented variations per contractor — split bar"
        style={{ width: W, height: H, display: 'block' }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
