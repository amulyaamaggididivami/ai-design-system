import type { ContractorRow } from '../../types';

export interface ProgressRaceChartProps {
  items: ContractorRow[];
  colorOffset?: number;
  'data-testid'?: string;
}
