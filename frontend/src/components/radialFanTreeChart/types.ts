import type { NCEContractorRow } from '../../types';

export interface RadialFanTreeChartProps {
  total: number;
  totalLabel?: string;
  items: NCEContractorRow[];
  width?: number;
  'data-testid'?: string;
}
