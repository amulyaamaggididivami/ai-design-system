import type { ContractData } from '../../types';

export interface StackedHorizontalBarChartProps {
  data: ContractData;
  dataByEntity?: Record<string, ContractData>;
  onItemClick?: (id: string, label: string) => void;
  selectedId?: string;
  'data-testid'?: string;
}
