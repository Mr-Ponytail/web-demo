import type { TireKey, TireStatus } from './tireMocks';

export type TireMetrics = {
  pressure: { value: number; unit: string; target: number; min: number; max: number };
  heat: { value: number; unit: string; max: number };
  load: { value: number; unit: string; max: number };
  align: { value: number; unit: string; max: number };
  nut: { value: number; unit: string; max: number };
};

export type TireMockEntry = { status: TireStatus } & TireMetrics;

const PRESSURE_BASE = { unit: 'psi', target: 200, min: 30, max: 370 };

export const NORMAL_METRICS: TireMetrics = {
  pressure: { value: 200, ...PRESSURE_BASE },
  heat: { value: 35, unit: '°C', max: 100 },
  load: { value: 150, unit: 'kg', max: 500 },
  align: { value: 0.5, unit: '°', max: 10 },
  nut: { value: 35, unit: '%', max: 100 },
};

export const DANGER_METRICS: TireMetrics = {
  pressure: { value: 300, ...PRESSURE_BASE },
  heat: { value: 85, unit: '°C', max: 100 },
  load: { value: 420, unit: 'kg', max: 500 },
  align: { value: 8, unit: '°', max: 10 },
  nut: { value: 82, unit: '%', max: 100 },
};

export const CAUTION_METRICS: TireMetrics = {
  pressure: { value: 130, ...PRESSURE_BASE },
  heat: { value: 62, unit: '°C', max: 100 },
  load: { value: 280, unit: 'kg', max: 500 },
  align: { value: 5.5, unit: '°', max: 10 },
  nut: { value: 65, unit: '%', max: 100 },
};

export const DETAIL_MOCK_BY_TIRE: Record<TireKey, TireMockEntry> = {
  FL: { status: 'danger', ...DANGER_METRICS },
  FR: { status: 'danger', ...DANGER_METRICS },
  LO: { status: 'danger', ...DANGER_METRICS },
  LI: { status: 'normal', ...NORMAL_METRICS },
  RI: { status: 'caution', ...CAUTION_METRICS },
  RO: { status: 'danger', ...DANGER_METRICS },
};
