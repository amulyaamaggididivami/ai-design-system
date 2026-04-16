export interface NCEClause {
  clause: string;
  count: number;
  value: number;
  trend: number[];
}

export interface NCEBreakdownContractor {
  name: string;
  originalValue: number;
  nceVariation: number;
  nceCount: number;
  color: string;
  ncesByClause: NCEClause[];
}

export interface NCEBreakdownTotals {
  portfolioValue: number;
  totalNCE: number;
  avgPct: number;
}

export interface NCEBreakdownData {
  contractors: NCEBreakdownContractor[];
  totals: NCEBreakdownTotals;
}

export interface NCEDetailBreakdownProps {
  data: NCEBreakdownData;
  /** Width in CSS pixels (responsive) */
  width?: number;
  /** Height in CSS pixels */
  height?: number;
  /** Key of the currently active contractor (for cross-chart linking) */
  activeKey?: string | null;
  /** When true, non-active elements render at reduced opacity */
  dimOthers?: boolean;
  'data-testid'?: string;
}
