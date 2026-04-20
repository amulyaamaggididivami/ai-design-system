import type { ContractorRow } from '../../types';

export interface ProgressRaceChartProps {
  items: ContractorRow[];
  'data-testid'?: string;
  onItemClick?: (id: string, label: string) => void;
  selectedIds?: string[];
}
