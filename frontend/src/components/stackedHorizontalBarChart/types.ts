import type { ContractData } from '../../types';

export interface StackedHorizontalBarChartProps {
  data: ContractData;
  onItemClick?: (id: string, label: string) => void;
  'data-testid'?: string;
}
