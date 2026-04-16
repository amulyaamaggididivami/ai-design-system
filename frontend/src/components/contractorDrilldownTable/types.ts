export interface DrilldownContractor {
  name: string;
  ews: number;
  nces: number;
  rate: number | null;
  status: 'critical' | 'alert' | 'elevated' | 'normal' | 'silent';
  flag?: string;
}

export interface ContractorDrilldownTableProps {
  contractors?: DrilldownContractor[];
  'data-testid'?: string;
}
