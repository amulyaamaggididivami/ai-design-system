import type { StatusSegment } from '../hubAndSpokeRadialChart/types';

/** A contractor row enriched with per-contractor EW status breakdown */
export interface ContractorWithEW {
  id: string;
  name: string;
  abbreviation?: string;
  base?: number;
  variation?: number;
  total?: number;
  percentage?: number;
  /** EW status breakdown for this contractor (Open / Submitted / Closed) */
  ewStatus: StatusSegment[];
}

export interface InteractiveContractEWWidgetProps {
  contractors: ContractorWithEW[];
  totals?: { base?: number; variation?: number; total?: number } | null;
  /** Portfolio-level EW status (shown when nothing is selected) */
  portfolioEWStatus: StatusSegment[];
  'data-testid'?: string;
}

export interface ClickableContractBarsProps {
  contractors: ContractorWithEW[];
  totals?: { base?: number; variation?: number; total?: number } | null;
  selectedId: string | null;
  onBarClick: (id: string) => void;
  'data-testid'?: string;
}
