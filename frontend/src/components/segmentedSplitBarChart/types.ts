import type { VariationRow } from '../../types';

export interface SegmentedSplitBarChartProps {
  items: VariationRow[];
  itemsByEntity?: Record<string, VariationRow[]>;
  onItemClick?: (id: string, label: string) => void;
  selectedId?: string;
  labelA?: string;
  labelB?: string;
  unit?: string;
  'data-testid'?: string;
}
