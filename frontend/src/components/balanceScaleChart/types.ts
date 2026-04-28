import type { QuotationSide } from '../../types';

export interface BalanceScaleChartProps {
  left: QuotationSide;
  right: QuotationSide;
  leftTitle?: string;
  rightTitle?: string;
  unit?: string;
  'data-testid'?: string;
}
