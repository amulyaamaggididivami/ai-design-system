import type { NCEContractorRow } from '../../types';

export interface RadialFanTreeChartProps {
  total: number;
  totalLabel?: string;
  items: NCEContractorRow[];
  'data-testid'?: string;
}
