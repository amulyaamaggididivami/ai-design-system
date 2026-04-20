import { useEffect, useRef, useState } from 'react';

import { CC } from '../../canvas/canvasUtils';
import { FinanceBeat1HiddenLeakage } from '../financeBeat1HiddenLeakage';
import { FinanceBeat2BufferFlow } from '../financeBeat2BufferFlow';
import { FinanceBeat3Verdict } from '../financeBeat3Verdict';
import { ProcurementBeat1FilterSix } from '../procurementBeat1FilterSix';
import { ProcurementBeat2Materials } from '../procurementBeat2Materials';
import { ProcurementBeat3DayRunway } from '../procurementBeat3DayRunway';
import type { NCEQuotationStoryProps } from './types';
import * as S from './styles';

type Perspective = 'finance' | 'procurement';

interface BeatMountProps {
  children: React.ReactNode;
  eager?: boolean;
  minHeight?: number;
}

/**
 * Mounts children only when the slot enters the viewport. This lets each
 * beat's internal entry animations play fresh on scroll.
 */
function BeatMount({ children, eager = false, minHeight = 520 }: BeatMountProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(eager);

  useEffect(() => {
    if (eager) {
      setMounted(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -180px 0px' },
    );
    const raf = requestAnimationFrame(() => io.observe(el));
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [eager]);

  return (
    <div ref={ref} style={{ minHeight: mounted ? undefined : minHeight }}>
      {mounted ? children : null}
    </div>
  );
}

export function NCEQuotationStory({
  finance,
  procurement,
  defaultPerspective = 'finance',
  'data-testid': testId,
}: NCEQuotationStoryProps) {
  const [perspective, setPerspective] = useState<Perspective>(defaultPerspective);

  const financeAccent = CC.red;
  const procurementAccent = CC.orange;

  return (
    <div style={S.container} data-testid={testId ?? 'nce-quotation-story'}>
      <div style={S.switcher}>
        <button
          type="button"
          style={S.switchBtn(perspective === 'finance', financeAccent)}
          onClick={() => setPerspective('finance')}
          data-testid="nce-quotation-story-finance-btn"
        >
          Finance
        </button>
        <button
          type="button"
          style={S.switchBtn(perspective === 'procurement', procurementAccent)}
          onClick={() => setPerspective('procurement')}
          data-testid="nce-quotation-story-procurement-btn"
        >
          Procurement
        </button>
      </div>

      <div style={S.stage} key={perspective}>
        {perspective === 'finance' ? (
          <>
            <BeatMount eager>
              <FinanceBeat1HiddenLeakage {...finance.beat1} />
            </BeatMount>
            <BeatMount minHeight={420}>
              <FinanceBeat2BufferFlow {...finance.beat2} />
            </BeatMount>
            <BeatMount minHeight={520}>
              <FinanceBeat3Verdict {...finance.beat3} />
            </BeatMount>
          </>
        ) : (
          <>
            <BeatMount eager>
              <ProcurementBeat1FilterSix {...procurement.beat1} />
            </BeatMount>
            <BeatMount minHeight={420}>
              <ProcurementBeat2Materials {...procurement.beat2} />
            </BeatMount>
            <BeatMount minHeight={420}>
              <ProcurementBeat3DayRunway {...procurement.beat3} />
            </BeatMount>
          </>
        )}
      </div>
    </div>
  );
}
