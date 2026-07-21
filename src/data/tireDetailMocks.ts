import {
  MOCK_BY_TIRE,
  type TireKey,
  type TireStatus,
} from './tireMocks';

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

const METRICS_BY_STATUS: Record<
  Exclude<TireStatus, 'offline'>,
  TireMetrics
> = {
  normal: NORMAL_METRICS,
  caution: CAUTION_METRICS,
  danger: DANGER_METRICS,
};

function metricsForHomeStatus(status: TireStatus): TireMetrics {
  if (status === 'offline') return NORMAL_METRICS;
  return METRICS_BY_STATUS[status];
}

/** Detail metrics/status stay in sync with home-screen `MOCK_BY_TIRE`. */
export const DETAIL_MOCK_BY_TIRE: Record<TireKey, TireMockEntry> = {
  FL: {
    status: MOCK_BY_TIRE.FL.status,
    ...metricsForHomeStatus(MOCK_BY_TIRE.FL.status),
  },
  FR: {
    status: MOCK_BY_TIRE.FR.status,
    ...metricsForHomeStatus(MOCK_BY_TIRE.FR.status),
  },
  LO: {
    status: MOCK_BY_TIRE.LO.status,
    ...metricsForHomeStatus(MOCK_BY_TIRE.LO.status),
  },
  LI: {
    status: MOCK_BY_TIRE.LI.status,
    ...metricsForHomeStatus(MOCK_BY_TIRE.LI.status),
  },
  RI: {
    status: MOCK_BY_TIRE.RI.status,
    ...metricsForHomeStatus(MOCK_BY_TIRE.RI.status),
  },
  RO: {
    status: MOCK_BY_TIRE.RO.status,
    ...metricsForHomeStatus(MOCK_BY_TIRE.RO.status),
  },
};

/** Disconnected tires show as normal on the detail scene / selector. */
export function getDisconnectedDetailStatus(_key: TireKey): TireStatus {
  return 'normal';
}

export function getDisconnectedDetailEntry(_key: TireKey): TireMockEntry {
  return {
    status: 'normal',
    ...NORMAL_METRICS,
  };
}

export function buildDetailStatusMap(
  connected: ReadonlySet<TireKey>,
): Record<TireKey, TireStatus> {
  return {
    FL: connected.has('FL')
      ? DETAIL_MOCK_BY_TIRE.FL.status
      : getDisconnectedDetailStatus('FL'),
    FR: connected.has('FR')
      ? DETAIL_MOCK_BY_TIRE.FR.status
      : getDisconnectedDetailStatus('FR'),
    LI: connected.has('LI')
      ? DETAIL_MOCK_BY_TIRE.LI.status
      : getDisconnectedDetailStatus('LI'),
    RI: connected.has('RI')
      ? DETAIL_MOCK_BY_TIRE.RI.status
      : getDisconnectedDetailStatus('RI'),
    LO: connected.has('LO')
      ? DETAIL_MOCK_BY_TIRE.LO.status
      : getDisconnectedDetailStatus('LO'),
    RO: connected.has('RO')
      ? DETAIL_MOCK_BY_TIRE.RO.status
      : getDisconnectedDetailStatus('RO'),
  };
}

export function getDetailEntryForTire(
  key: TireKey,
  connected: ReadonlySet<TireKey>,
): TireMockEntry {
  if (!connected.has(key)) {
    return getDisconnectedDetailEntry(key);
  }
  return DETAIL_MOCK_BY_TIRE[key];
}
