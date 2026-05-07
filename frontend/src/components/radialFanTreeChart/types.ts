import type { NCEContractorRow } from '../../types';

export interface RadialFanTreeChartProps {
  total: number;
  totalLabel?: string;
  items: NCEContractorRow[];
  width?: number;
  colorOffset?: number;
  'data-testid'?: string;
}
