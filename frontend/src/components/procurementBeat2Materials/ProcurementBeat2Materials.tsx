import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type { Material, ProcurementBeat2MaterialsProps } from './types';
import * as S from './styles';

const EASE = [0.16, 1, 0.3, 1] as const;

function glyphForMaterial(name: string) {
  const common = { width: 44, height: 44, viewBox: '0 0 24 24', fill: 'none' } as const;
  const lower = name.toLowerCase();

  if (lower.includes('brick')) {
    // Stacked bricks — rows offset like masonry
    return (
      <svg {...common}>
        <rect x="3" y="5" width="7" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="11" y="5" width="10" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="3" y="10" width="11" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="15" y="10" width="6" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="3" y="15" width="7" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="11" y="15" width="10" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  }

  if (lower.includes('plate')) {
    // Steel plate — flat rect with bolt dots
    return (
      <svg {...common}>
        <rect x="3" y="8" width="18" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="6" cy="12" r="0.7" fill="currentColor" />
        <circle cx="18" cy="12" r="0.7" fill="currentColor" />
        <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1 1.5" />
      </svg>
    );
  }

  if (lower.includes('mortar')) {
    // Mortar bucket with trowel
    return (
      <svg {...common}>
        <path d="M6 9 L18 9 L16.5 19 L7.5 19 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M5 9 L19 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M13 4 L17 8 L14 9 L12 7 Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    );
  }

  if (lower.includes('seal')) {
    // Ceramic seal — concentric rings with gasket notches
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="12" cy="12" r="1.8" fill="currentColor" opacity="0.7" />
        <line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" strokeWidth="1.1" />
        <line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" strokeWidth="1.1" />
        <line x1="2" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1.1" />
        <line x1="20" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    );
  }

  if (lower.includes('belt')) {
    // Conveyor belt — ellipse with rollers
    return (
      <svg {...common}>
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="18" cy="12" r="2" stroke="currentColor" strokeWidth="1.1" />
        <line x1="6" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.2 1.2" />
      </svg>
    );
  }

  if (lower.includes('pipe') || lower.includes('pvc')) {
    // Pipe section with flanges
    return (
      <svg {...common}>
        <rect x="5" y="9" width="14" height="6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="3" y="7" width="3" height="10" stroke="currentColor" strokeWidth="1.2" />
        <rect x="18" y="7" width="3" height="10" stroke="currentColor" strokeWidth="1.2" />
        <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1 1.5" />
      </svg>
    );
  }

  if (lower.includes('nut') || lower.includes('bolt') || lower.includes('fastener')) {
    // Hex nut + bolt
    return (
      <svg {...common}>
        <polygon points="7,5 13,5 16,9 13,13 7,13 4,9" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <circle cx="10" cy="9" r="2" stroke="currentColor" strokeWidth="1.1" />
        <line x1="10" y1="13" x2="10" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="15" x2="12" y2="15" stroke="currentColor" strokeWidth="0.9" />
        <line x1="8" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="0.9" />
        <line x1="8" y1="19" x2="12" y2="19" stroke="currentColor" strokeWidth="0.9" />
      </svg>
    );
  }

  // Fallback — hex module
  return (
    <svg {...common}>
      <polygon points="12,3 20,8 20,16 12,21 4,16 4,8" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function renderStats(material: Material) {
  return [
    { key: 'Qty', value: material.qty },
    { key: 'Lead', value: `${material.days} days` },
    { key: 'Supplier', value: material.supplier },
  ];
}

export function ProcurementBeat2Materials({
  title = 'Materials to purchase',
  totalAmount = '£40,900',
  hint = 'Hover any material for full details',
  materials,
  'data-testid': testId,
}: ProcurementBeat2MaterialsProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <section style={S.container} data-testid={testId}>
      <motion.h2
        style={S.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {title} · <em style={S.highlight}>{totalAmount}</em>
      </motion.h2>

      <motion.div
        style={S.hint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        {hint}
      </motion.div>

      <div style={S.row}>
        {materials.map((material, index) => {
          const isActive = hoverId === material.id;
          const showDim = hoverId !== null && !isActive;
          const stats = renderStats(material);

          return (
            <motion.div
              key={material.id}
              style={S.tile(material.color, material.critical, isActive, showDim)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showDim ? 0.35 : 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32 + index * 0.08, ease: EASE }}
              onMouseEnter={() => setHoverId(material.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              <div style={S.tileGlow(material.color, isActive)} />

              <div style={S.core}>
                <div style={S.iconWrap(material.color, isActive)}>{glyphForMaterial(material.name)}</div>
                <div style={S.name}>{material.name}</div>
                <div style={S.coreCost(material.color)}>{material.cost}</div>
                <div style={S.coreQty}>{material.qty}</div>
              </div>

              <AnimatePresence>
                {isActive ? (
                  <motion.div
                    style={S.expand(material.color)}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: EASE }}
                  >
                    <div style={S.expandTag(material.color)}>{material.id} · {material.contractor}</div>
                    <div style={S.expandCost(material.color)}>{material.cost}</div>
                    <div style={S.stats}>
                      {stats.map((stat) => (
                        <div key={stat.key} style={S.statBlock}>
                          <div style={S.statKey}>{stat.key}</div>
                          <div style={S.statValue}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={S.deadline(material.color)}>{material.deadline}</div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
