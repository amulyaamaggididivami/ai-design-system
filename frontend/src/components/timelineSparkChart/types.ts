export interface TimelineImpactData {
  value: string;
  detail: string;
  monthlyRisk: number[];
  months: string[];
  label: string;
}

export interface TimelineSparkChartProps {
  impact: TimelineImpactData;
  'data-testid'?: string;
}
