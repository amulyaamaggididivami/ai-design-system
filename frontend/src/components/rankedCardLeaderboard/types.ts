import type { EWOpenContractorRow } from '../../types';

export interface RankedCardLeaderboardProps {
  items: EWOpenContractorRow[];
  'data-testid'?: string;
  onItemClick?: (id: string, label: string) => void;
  selectedIds?: string[];
}
