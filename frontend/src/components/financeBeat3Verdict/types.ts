export interface VerdictRow {
  name: string;
  amount: string;
  color: string;
  logoUrl?: string;
}

export interface VerdictSide {
  stampIcon: string;
  stampLabel: string;
  amount: string;
  unit: string;
  reason: string;
  payLabel: string;
  rows: VerdictRow[];
  recover?: string;
}

export interface FinanceBeat3VerdictProps {
  title?: string;
  bookHighlight?: string;
  negotiateHighlight?: string;
  book: VerdictSide;
  negotiate: VerdictSide;
  'data-testid'?: string;
}
