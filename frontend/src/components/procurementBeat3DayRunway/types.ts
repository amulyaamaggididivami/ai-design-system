export interface RunwayMaterial {
  id: string;
  name: string;
  cost: string;
  day: number;
  color: string;
  zone: 'safe' | 'danger';
}

export interface RunwayZoneChip {
  tag: string;
  amount: string;
  sub: string;
  zone: 'safe' | 'danger';
}

export interface RunwayAxis {
  label: string;
  percent: number;
  danger?: boolean;
}

export interface ProcurementBeat3DayRunwayProps {
  title?: string;
  deadlineHighlight?: string;
  deadlineLabel: string;
  zoneChips: RunwayZoneChip[];
  axis: RunwayAxis[];
  materials: RunwayMaterial[];
  /** Day value (e.g. 14) representing the deadline position on the track */
  deadlineDay: number;
  /** Max day shown on axis (e.g. 21) */
  maxDay: number;
  'data-testid'?: string;
}
