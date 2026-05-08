import type { NCEContractorRow } from '../../types';

export interface RadialFanEntityData {
  total: number;
  totalLabel?: string;
  items: NCEContractorRow[];
}

export interface RadialFanTreeChartProps {
  total: number;
  totalLabel?: string;
  items: NCEContractorRow[];
  dataByEntity?: Record<string, RadialFanEntityData>;
  onItemClick?: (id: string, label: string) => void;
  selectedId?: string;
  width?: number;
  colorOffset?: number;
  'data-testid'?: string;
}
