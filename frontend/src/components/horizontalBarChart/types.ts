export type HorizontalBarRow = {
  id: string;
  name: string;
  value: number;
  valueLabel?: string;
};

export type HorizontalBarChartProps = {
  rows: HorizontalBarRow[];
  valuePrefix?: string;
  'data-testid'?: string;
};
