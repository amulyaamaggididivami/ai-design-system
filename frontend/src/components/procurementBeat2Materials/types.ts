export interface Material {
  id: string;
  contractor: string;
  project: string;
  name: string;
  qty: string;
  cost: string;
  days: number;
  deadline: string;
  supplier: string;
  color: string;
  critical: boolean;
  logoUrl?: string;
}

export interface ProcurementBeat2MaterialsProps {
  title?: string;
  totalAmount?: string;
  hint?: string;
  materials: Material[];
  'data-testid'?: string;
}
