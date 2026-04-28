import type { VariationRow } from '../../types';

export interface SegmentedSplitBarChartProps {
  items: VariationRow[];
  labelA?: string;
  labelB?: string;
  unit?: string;
  'data-testid'?: string;
}
