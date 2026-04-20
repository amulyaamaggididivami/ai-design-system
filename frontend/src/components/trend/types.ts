import type { QuotationTrendPoint } from '../../types';

export interface TrendProps {
  points: QuotationTrendPoint[];
  selectedId?: string;
  seriesByEntity?: Record<string, QuotationTrendPoint[]>;
  'data-testid'?: string;
}
