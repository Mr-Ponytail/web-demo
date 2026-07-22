import type { HazardDetailEvent } from './hazardLocationMocks';

export type EventSeverity = 'danger' | 'caution' | 'good';
export type EventCategory =
  | 'Impact'
  | 'Pressure'
  | 'Leak'
  | 'Nut'
  | 'Wear'
  | 'Temp'
  | 'Load';

export type TireLogTag = {
  category: EventCategory;
  severity: EventSeverity;
};

export type TireLogSession = {
  id: string;
  time: string;
  location: string;
  severity: EventSeverity;
  tags: TireLogTag[];
  hazardSummary?: string;
  detailEvents?: HazardDetailEvent[];
  accentColor?: string;
};

export type TireLogDayGroup = {
  date: string;
  sessions: TireLogSession[];
};
