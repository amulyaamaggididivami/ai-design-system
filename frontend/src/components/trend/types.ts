import type { QuotationTrendPoint } from '../../types';

export interface TrendProps {
  points: QuotationTrendPoint[];
  selectedId?: string;
  seriesByEntity?: Record<string, QuotationTrendPoint[]>;
  colorOffset?: number;
  'data-testid'?: string;
}
