import type { DualSegmentBarRow } from '../../types';

export interface MultiSegmentHorizontalBarChartProps {
  rows: DualSegmentBarRow[];
  valuePrefix?: string;
  'data-testid'?: string;
}
