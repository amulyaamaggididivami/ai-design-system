import type { EWSeverityRow } from '../../types';

export interface ProportionalBandChartProps {
  severities: EWSeverityRow[];
  colorOffset?: number;
  'data-testid'?: string;
}
