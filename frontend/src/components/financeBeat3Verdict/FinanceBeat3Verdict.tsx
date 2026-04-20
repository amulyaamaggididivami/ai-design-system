import { motion } from 'framer-motion';

import { CC } from '../../canvas/canvasUtils';
import type { FinanceBeat3VerdictProps, VerdictSide } from './types';
import * as S from './styles';

const EASE = [0.16, 1, 0.3, 1] as const;

function SideBlock({
  side,
  accent,
  includeRecover,
  baseDelay,
}: {
  side: VerdictSide;
  accent: string;
  includeRecover: boolean;
  baseDelay: number;
}) {
  return (
    <motion.div
      style={S.side(accent)}
      initial={{ opacity: 0, y: 28, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: baseDelay, ease: EASE }}
    >
      <motion.div
        style={S.halo(accent)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: baseDelay + 0.3 }}
      />
      <motion.div
        style={S.stamp(accent)}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: baseDelay + 0.5, ease: EASE }}
      >
        <span style={S.stampIcon}>{side.stampIcon}</span>
        <span>{side.stampLabel}</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: baseDelay + 0.75, ease: EASE }}
      >
        <span style={S.verdictNum(accent)}>{side.amount}</span>
        <span style={S.verdictUnit}>{side.unit}</span>
      </motion.div>
      <motion.div
        style={S.reason}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: baseDelay + 1.0, ease: EASE }}
      >
        {side.reason}
      </motion.div>
      <motion.div
        style={S.divider}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: baseDelay + 1.15, ease: EASE }}
      />
      <motion.div
        style={S.payLabel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: baseDelay + 1.3 }}
      >
        {side.payLabel}
      </motion.div>
      <div style={S.list}>
        {side.rows.map((r, i) => (
          <motion.div
            key={r.name}
            style={S.row}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: baseDelay + 1.45 + i * 0.12, ease: EASE }}
          >
            {r.logoUrl ? (
              <img src={r.logoUrl} alt={r.name} style={S.rowLogo} />
            ) : (
              <span style={S.dot(r.color)} />
            )}
            <span style={{ ...S.nameCol, color: r.color }}>{r.name}</span>
            <span style={{ ...S.amtCol, color: r.color }}>{r.amount}</span>
          </motion.div>
        ))}
      </div>
      {includeRecover && side.recover ? (
        <motion.div
          style={S.recover(accent)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: baseDelay + 1.45 + side.rows.length * 0.12 + 0.25, ease: EASE }}
        >
          Expected recovery · <span style={S.recoverValue(accent)}>{side.recover}</span>
        </motion.div>
      ) : null}
    </motion.div>
  );
}

export function FinanceBeat3Verdict({
  title = 'Book',
  bookHighlight = '£5.7M',
  negotiateHighlight = '£1.1M',
  book,
  negotiate,
  'data-testid': testId,
}: FinanceBeat3VerdictProps) {
  return (
    <section style={S.container} data-testid={testId}>
      <motion.h2
        style={S.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {title} <em style={S.greenHighlight}>{bookHighlight}</em> · Negotiate{' '}
        <em style={S.orangeHighlight}>{negotiateHighlight}</em>
      </motion.h2>

      <div style={S.wrap}>
        <SideBlock side={book} accent={CC.green} includeRecover={false} baseDelay={0.2} />
        <motion.div
          style={S.verdictDividerV}
          initial={{ opacity: 0, scaleY: 0.4 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
        >
          <div style={S.vdvLine} />
          <div style={S.vdvPlus}>+</div>
          <div style={S.vdvLine} />
        </motion.div>
        <SideBlock side={negotiate} accent={CC.orange} includeRecover baseDelay={0.4} />
      </div>
    </section>
  );
}
