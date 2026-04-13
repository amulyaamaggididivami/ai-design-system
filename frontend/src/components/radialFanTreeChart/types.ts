import type { NCEContractorRow } from '../../types';

export interface RadialFanTreeChartProps {
  total: number;
  items: NCEContractorRow[];
  'data-testid'?: string;
}
