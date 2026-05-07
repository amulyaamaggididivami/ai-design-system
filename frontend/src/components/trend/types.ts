import type { QuotationTrendPoint } from '../../types';

export interface TrendProps {
  points: QuotationTrendPoint[];
  colorOffset?: number;
  'data-testid'?: string;
}
