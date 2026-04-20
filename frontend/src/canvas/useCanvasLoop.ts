import { useEffect, useRef } from 'react';
import { easeOutCubic } from './easing';

type DrawFn = (ctx: CanvasRenderingContext2D, progress: number, frame: number) => void;
type EasingFn = (t: number) => number;

interface CanvasLoopOptions {
  easing?: EasingFn;
  durationFrames?: number;
}

/**
 * Canvas animation loop hook with DPR scaling and eased entrance progress.
 * Ported from enterprise-brain/src/hooks/useCanvasLoop.js
 *
 * @param canvasRef   - ref to the <canvas> element
 * @param width       - logical canvas width (CSS pixels)
 * @param height      - logical canvas height (CSS pixels)
 * @param drawFn      - (ctx, progress 0–1, frameNumber) => void
 * @param animate     - when true, plays entrance animation from progress 0→1
 * @param opts        - { easing, durationFrames }
 */
export function useCanvasLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number,
  drawFn: DrawFn,
  animate = true,
  opts: CanvasLoopOptions = {},
): void {
  const frameRef = useRef(0);
  const { easing = easeOutCubic, durationFrames = 48 } = opts;

  // Always keep a ref to the latest drawFn — the effect reads from the ref so
  // it never needs drawFn in its dependency array.  This mirrors the onClickRef
  // pattern in useCanvasInteraction: the loop is long-lived and must never be
  // torn down just because the caller's closure changed identity.
  const drawFnRef = useRef(drawFn);
  drawFnRef.current = drawFn;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let raf: number;
    frameRef.current = 0;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, width, height);
      const rawProgress = animate ? Math.min(T / durationFrames, 1) : 1;
      const progress = easing(rawProgress);

      drawFnRef.current(ctx, progress, T);

      if (rawProgress < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        const drawStatic = () => {
          frameRef.current++;
          ctx.clearRect(0, 0, width, height);
          drawFnRef.current(ctx, 1, frameRef.current);
          raf = requestAnimationFrame(drawStatic);
        };
        raf = requestAnimationFrame(drawStatic);
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
    // drawFn intentionally omitted — it is read via drawFnRef so the loop
    // never restarts just because the caller's closure changed identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, width, height, animate]);
}
