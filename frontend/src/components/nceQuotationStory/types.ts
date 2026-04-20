import type { FinanceBeat1HiddenLeakageProps } from '../financeBeat1HiddenLeakage/types';
import type { FinanceBeat2BufferFlowProps } from '../financeBeat2BufferFlow/types';
import type { FinanceBeat3VerdictProps } from '../financeBeat3Verdict/types';
import type { ProcurementBeat1FilterSixProps } from '../procurementBeat1FilterSix/types';
import type { ProcurementBeat2MaterialsProps } from '../procurementBeat2Materials/types';
import type { ProcurementBeat3DayRunwayProps } from '../procurementBeat3DayRunway/types';

export interface FinancePerspectiveData {
  beat1: FinanceBeat1HiddenLeakageProps;
  beat2: FinanceBeat2BufferFlowProps;
  beat3: FinanceBeat3VerdictProps;
}

export interface ProcurementPerspectiveData {
  beat1: ProcurementBeat1FilterSixProps;
  beat2: ProcurementBeat2MaterialsProps;
  beat3: ProcurementBeat3DayRunwayProps;
}

export interface NCEQuotationStoryProps {
  finance: FinancePerspectiveData;
  procurement: ProcurementPerspectiveData;
  defaultPerspective?: 'finance' | 'procurement';
  'data-testid'?: string;
}
