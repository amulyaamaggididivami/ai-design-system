import type { ContractorRow, QuotationTrendPoint } from '../../types';

/** ContractorRow extended with a per-contractor weekly submission trend */
export interface ContractorWithTrend extends ContractorRow {
  trend: QuotationTrendPoint[];
}

export interface InteractiveRaceTrendWidgetProps {
  contractors: ContractorWithTrend[];
  /** Shown in the trend chart when no contractor is selected */
  portfolioTrend: QuotationTrendPoint[];
  'data-testid'?: string;
}

export interface ClickableRaceChartProps {
  contractors: ContractorWithTrend[];
  selectedId: string | null;
  onContractorClick: (id: string) => void;
  'data-testid'?: string;
}
