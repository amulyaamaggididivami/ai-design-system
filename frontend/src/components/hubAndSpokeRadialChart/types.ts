export interface StatusSegment {
  status: string;
  count: number;
}

export interface HubAndSpokeRadialChartProps {
  segments: StatusSegment[];
  title?: string;
  'data-testid'?: string;
  onItemClick?: (id: string, label: string) => void;
  selectedIds?: string[];
}
