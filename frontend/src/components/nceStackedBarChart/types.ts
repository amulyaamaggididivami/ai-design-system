export interface NCEContractor {
  name: string;
  originalValue: number;
  nceVariation: number;
  nceCount: number;
  color: string;
}

export interface NCEStackedBarChartProps {
  contractors: NCEContractor[];
  /** Width in CSS pixels. Defaults to 680 if not provided. */
  width?: number;
  /** Key of the currently active/linked contractor (for cross-chart highlighting) */
  activeKey?: string | null;
  /** When true, non-active bars render at 30% opacity */
  dimOthers?: boolean;
  /** Called on hover with contractor name or null */
  onVizHover?: (key: string | null) => void;
  /** Called on click with contractor name or null */
  onVizClick?: (key: string | null) => void;
  'data-testid'?: string;
}
