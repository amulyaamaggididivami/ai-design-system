import type { QuotationSide, QuotationSummary } from '../../types';

export interface BalanceScaleChartProps {
  left: QuotationSide;
  right: QuotationSide;
  leftTitle?: string;
  rightTitle?: string;
  unit?: string;
  selectedId?: string;
  dataByEntity?: Record<string, QuotationSummary>;
  testID?: string;
}
