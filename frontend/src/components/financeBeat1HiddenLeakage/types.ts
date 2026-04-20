export interface LeakageProject {
  code: string;
  name: string;
  nces: number;
}

export interface LeakageContractor {
  contractor: string;
  color: string;
  amount: string;
  projects: LeakageProject[];
  logoUrl?: string;
}

export interface LeakageTotals {
  amount: string;
  unit: string;
  nces: number;
  contractors: number;
  forecast: string;
}

export interface FinanceBeat1HiddenLeakageProps {
  title?: string;
  highlightAmount?: string;
  contractors: LeakageContractor[];
  totals: LeakageTotals;
  'data-testid'?: string;
}
