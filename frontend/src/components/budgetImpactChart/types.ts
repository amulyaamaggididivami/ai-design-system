export interface BudgetImpactData {
  value: string;
  detail: string;
  withoutAction: number;
  withAction: number;
  unit: string;
  savingsLabel: string;
}

export interface BudgetImpactChartProps {
  impact: BudgetImpactData;
  /** Width in CSS pixels. Defaults to 680. */
  width?: number;
  'data-testid'?: string;
}
