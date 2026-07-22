/** API-shaped types from Cloud Run (Shinhan demo seed). */

export type ApiWheelPosition = 'FL' | 'FR' | 'RL' | 'RR';

export type ApiDailyPoint = {
  date: string;
  avg: number | null;
  min: number | null;
  max: number | null;
};

export type ApiSignalMessage = {
  code: string;
  params: Record<string, number>;
};

export type ApiSignal = {
  currentAvg: number;
  previousAvg: number;
  deltaPct: number;
  currentDaily: ApiDailyPoint[];
  previousDaily: ApiDailyPoint[];
  message: ApiSignalMessage | null;
};

export type ApiTireLife = {
  cumulativeKm: number;
  expectedTireLifeKm: number;
  runningLowKm: number;
  nearLimitKm: number;
  tireAgeMonths: number | null;
  ageLimitMonths: number;
  ageRunningLowMonths: number;
  ageNearLimitMonths: number;
  state: 'GOOD_TO_GO' | 'RUNNING_LOW' | 'NEAR_LIMIT';
};

export type ApiTireInsights = {
  wheelPosition: ApiWheelPosition;
  damageLevel: number;
  damageLevelDeltaPct: number;
  tireLife: ApiTireLife;
  alertCount: number;
  alertCountDelta: number;
  recommendedReplaceDate: string | null;
  signals: {
    pressure: ApiSignal;
    temperature: ApiSignal;
    load: ApiSignal;
    toe: ApiSignal;
    lugnut: ApiSignal;
  };
};

export type ApiInsightsPayload = {
  range: { from: string; to: string };
  previousRange: { from: string; to: string };
  wheelCount: number;
  tires: ApiTireInsights[];
};

export type ApiEventSeverity = 'danger' | 'caution' | 'good';

export type ApiEventType =
  | 'IMPACT'
  | 'LOW_PRESSURE'
  | 'SLOW_LEAK'
  | 'HIGH_TEMP'
  | 'ABNORMAL_HEAT'
  | 'UNEVEN_WEAR'
  | 'OVERLOAD'
  | 'LUGNUT_LOOSE';

export type ApiDriveEvent = {
  ts: string;
  wheelPosition: ApiWheelPosition;
  type: ApiEventType;
  value: number;
  severity: ApiEventSeverity;
  location: { lat: number; lng: number };
};

export type ApiRepeatedGroup = {
  count: number;
  location: { lat: number; lng: number };
  summary: string;
  events: ApiDriveEvent[];
};

export type ApiDriveSession = {
  id: string;
  vehicleId: string;
  startAt: string;
  endAt: string;
  distanceKm: number;
  durationSec: number;
  locationLabel: string;
  tags: string[];
  events: ApiDriveEvent[];
  eventCount: number;
  repeatedGroups: ApiRepeatedGroup[];
};
