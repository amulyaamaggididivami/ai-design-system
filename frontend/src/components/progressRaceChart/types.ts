import type { ContractorRow } from '../../types';

export interface ProgressRaceChartProps {
  items: ContractorRow[];
  itemsByEntity?: Record<string, ContractorRow[]>;
  onItemClick?: (id: string, label: string) => void;
  selectedId?: string;
  colorOffset?: number;
  'data-testid'?: string;
}
