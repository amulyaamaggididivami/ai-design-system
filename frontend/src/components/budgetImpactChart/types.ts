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
  'data-testid'?: string;
}
