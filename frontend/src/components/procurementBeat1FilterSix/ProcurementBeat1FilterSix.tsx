import { Fragment } from 'react';
import { motion } from 'framer-motion';

import type { FilterNce, ProcurementBeat1FilterSixProps } from './types';
import * as S from './styles';

const EASE = [0.16, 1, 0.3, 1] as const;

function getBadgeGlyph(index: number) {
  const common = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' } as const;

  switch (index) {
    case 0:
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          <line x1="10" y1="7" x2="10" y2="17" stroke="currentColor" strokeWidth="1.2" />
          <line x1="14" y1="7" x2="14" y2="17" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 1:
      return (
        <svg {...common}>
          <path d="M6 5h12l2 3v11H4V8z" stroke="currentColor" strokeWidth="1.6" />
          <line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3.3" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 3:
      return (
        <svg {...common}>
          <path d="M5 8c3-4 6-4 9 0m-9 6c3-4 6-4 9 0m-9 6c3-4 6-4 9 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 4:
      return (
        <svg {...common}>
          <line x1="5" y1="19" x2="17" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18.5" cy="5.5" r="2" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <polygon points="12,4 19,8 19,16 12,20 5,16 5,8" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
  }
}

function formatNceLabel(id: string, fallbackIndex: number) {
  const match = id.match(/(\d+)/);
  return `NCE-${(match?.[1] ?? String(fallbackIndex + 1)).padStart(2, '0')}`;
}

function renderLeftCard(nce: FilterNce, index: number, highlightIndex: number) {
  const isHighlighted = highlightIndex >= 0;
  const label = formatNceLabel(nce.id, index);

  return (
    <motion.div
      key={nce.id}
      style={S.leftCard(isHighlighted, nce.color)}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.025, ease: EASE }}
    >
      <div style={S.leftCardGlow(isHighlighted, nce.color)} />
      {isHighlighted ? (
        <motion.div
          style={S.badge(nce.color)}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1.0 + highlightIndex * 0.08, ease: EASE }}
        >
          {getBadgeGlyph(highlightIndex)}
        </motion.div>
      ) : null}
      <div style={S.leftCardLabel(isHighlighted, nce.color)}>{label}</div>
      <div style={S.leftCardDot(isHighlighted, nce.color)} />
    </motion.div>
  );
}

export function ProcurementBeat1FilterSix({
  title = 'NCEs need a material purchase',
  highlightCount = '6',
  amount,
  amountLabel,
  allNces,
  sixNces,
  meta,
  'data-testid': testId,
}: ProcurementBeat1FilterSixProps) {
  let highlightIndex = -1;

  return (
    <section style={S.container} data-testid={testId}>
      <motion.h2
        style={S.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <em style={S.highlight}>{highlightCount}</em> {title}
      </motion.h2>

      <div style={S.wrap}>
        <motion.div
          style={S.leftFrame}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        >
          <div style={S.leftGrid}>
            {allNces.map((nce, index) => {
              const currentHighlightIndex = nce.needsMaterial ? ++highlightIndex : -1;
              const enrichedNce = currentHighlightIndex >= 0
                ? { ...nce, color: sixNces[currentHighlightIndex]?.color ?? nce.color }
                : nce;
              return renderLeftCard(enrichedNce, index, currentHighlightIndex);
            })}
          </div>
        </motion.div>

        <motion.div
          style={S.arrow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 1.15 }}
        >
          <svg viewBox="0 0 60 20" width="60" height="20" aria-hidden="true">
            <path d="M2 10 L56 10" stroke="rgba(245,247,251,0.4)" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
            <path d="M50 4 L58 10 L50 16" stroke="rgba(245,247,251,0.6)" strokeWidth="1.5" fill="none" />
          </svg>
        </motion.div>

        <motion.div
          style={S.right}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.35, ease: EASE }}
        >
          <div style={S.rightAura} />
          <div style={S.rightHead}>
            <div style={S.amt}>{amount}</div>
            <div style={S.amtLabel}>{amountLabel}</div>
          </div>

          <div style={S.clusterPanel}>
            <div style={S.sixCluster}>
              {sixNces.map((nce, index) => (
                <motion.span
                  key={nce.id}
                  style={S.rightDot(nce.color)}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 1.8 + index * 0.1, ease: EASE }}
                />
              ))}
            </div>
          </div>

          <motion.div
            style={S.metaRow}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.35, ease: EASE }}
          >
            {meta.map((item) => (
              <Fragment key={item.key}>
                <div style={S.metaItem}>
                  <span style={S.metaValue}>{item.value}</span>
                  <span style={S.metaKey}>{item.key}</span>
                </div>
              </Fragment>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
