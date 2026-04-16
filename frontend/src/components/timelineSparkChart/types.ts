export interface TimelineImpactData {
  value: string;
  detail: string;
  monthlyRisk: number[];
  months: string[];
  label: string;
}

export interface TimelineSparkChartProps {
  impact: TimelineImpactData;
  /** Width in CSS pixels. Defaults to 680. */
  width?: number;
  'data-testid'?: string;
}
