export interface FilterNce {
  id: string;
  needsMaterial: boolean;
  color?: string;
}

export interface FilterMeta {
  value: string;
  key: string;
}

export interface ProcurementBeat1FilterSixProps {
  title?: string;
  highlightCount?: string;
  amount: string;
  amountLabel: string;
  allNces: FilterNce[];
  sixNces: FilterNce[];
  meta: FilterMeta[];
  'data-testid'?: string;
}
