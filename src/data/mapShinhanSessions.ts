import type {
  HazardDetailEvent,
} from './hazardLocationMocks';
import {
  ELKTON_REPEATED_GROUP,
  SHINHAN_SESSIONS_ALL,
} from './shinhan/sessionsPayload';
import type {
  ApiDriveEvent,
  ApiDriveSession,
  ApiEventType,
  ApiEventSeverity,
} from './shinhan/types';
import type {
  EventCategory,
  EventSeverity,
  TireLogDayGroup,
  TireLogSession,
  TireLogTag,
} from './tireLogTypes';

const EVENT_TYPE_TO_CATEGORY: Record<ApiEventType, EventCategory> = {
  IMPACT: 'Impact',
  LOW_PRESSURE: 'Pressure',
  SLOW_LEAK: 'Leak',
  HIGH_TEMP: 'Temp',
  ABNORMAL_HEAT: 'Temp',
  UNEVEN_WEAR: 'Wear',
  OVERLOAD: 'Load',
  LUGNUT_LOOSE: 'Nut',
};

const EVENT_TAG_LABEL: Record<ApiEventType, string> = {
  IMPACT: 'Impact',
  LOW_PRESSURE: 'Low Pressure',
  SLOW_LEAK: 'Slow Leak',
  HIGH_TEMP: 'High Temp',
  ABNORMAL_HEAT: 'Abnormal Heat',
  UNEVEN_WEAR: 'Uneven Wear',
  OVERLOAD: 'Overload',
  LUGNUT_LOOSE: 'Lug Nut Loose',
};

const SEVERITY_RANK: Record<ApiEventSeverity, number> = {
  good: 0,
  caution: 1,
  danger: 2,
};

export function formatAmPmFromIso(iso: string): string {
  const date = new Date(iso);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const suffix = hours < 12 ? 'AM' : 'PM';
  hours = hours % 12 || 12;
  return `${suffix} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function dateKeyFromIso(iso: string): string {
  return iso.slice(0, 10);
}

export function formatShinhanEventTitle(event: ApiDriveEvent): string {
  switch (event.type) {
    case 'IMPACT':
      return `${event.value.toFixed(1)}G impact`;
    case 'LOW_PRESSURE':
      return `${event.value.toFixed(1)} PSI low`;
    case 'SLOW_LEAK':
      return `Slow leak · ${event.value.toFixed(1)} PSI`;
    case 'HIGH_TEMP':
    case 'ABNORMAL_HEAT':
      return `${event.value.toFixed(1)}°C`;
    case 'UNEVEN_WEAR':
      return `Uneven wear · ${event.value.toFixed(1)}`;
    case 'OVERLOAD':
      return `Overload · ${Math.round(event.value)} kg`;
    case 'LUGNUT_LOOSE':
      return `Nut torque · ${event.value.toFixed(0)}%`;
    default:
      return EVENT_TAG_LABEL[event.type];
  }
}

export function shinhanEventTagLabel(type: ApiEventType): string {
  return EVENT_TAG_LABEL[type];
}

function maxSeverity(events: ApiDriveEvent[]): EventSeverity {
  if (events.length === 0) return 'good';
  return events.reduce<ApiEventSeverity>((best, event) => {
    return SEVERITY_RANK[event.severity] > SEVERITY_RANK[best]
      ? event.severity
      : best;
  }, 'good');
}

function mapEventToDetail(
  event: ApiDriveEvent,
  sessionId: string,
  index: number,
): HazardDetailEvent {
  return {
    id: `${sessionId}-detail-${index}`,
    time: formatAmPmFromIso(event.ts),
    tagLabel: EVENT_TAG_LABEL[event.type],
    severity: event.severity,
    title: formatShinhanEventTitle(event),
    position: event.wheelPosition,
  };
}

function tagsFromEvents(events: ApiDriveEvent[]): TireLogTag[] {
  const seen = new Set<EventCategory>();
  const tags: TireLogTag[] = [];
  for (const event of events) {
    const category = EVENT_TYPE_TO_CATEGORY[event.type];
    if (seen.has(category)) continue;
    seen.add(category);
    tags.push({ category, severity: event.severity });
  }
  return tags;
}

function mapSession(session: ApiDriveSession): TireLogSession {
  const severity = maxSeverity(session.events);
  const hasRepeated = session.repeatedGroups.length > 0;
  const group = session.repeatedGroups[0];

  return {
    id: session.id,
    time: formatAmPmFromIso(session.startAt),
    location: session.locationLabel,
    severity,
    tags: tagsFromEvents(session.events),
    hazardSummary: hasRepeated
      ? `${group.count} impacts near Elkton, MD in 24 days`
      : undefined,
    accentColor: hasRepeated ? '#28D6B9' : undefined,
    detailEvents: session.events.map((event, index) =>
      mapEventToDetail(event, session.id, index),
    ),
  };
}

/** Group API sessions into Tire Log day rows (UTC date of startAt, newest first). */
export function mapSessionsToDayGroups(
  sessions: ApiDriveSession[] = SHINHAN_SESSIONS_ALL,
): TireLogDayGroup[] {
  const byDate = new Map<string, TireLogSession[]>();

  for (const session of sessions) {
    const key = dateKeyFromIso(session.startAt);
    const list = byDate.get(key) ?? [];
    list.push(mapSession(session));
    byDate.set(key, list);
  }

  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, daySessions]) => ({ date, sessions: daySessions }));
}

export const SHINHAN_TIRE_LOG_DAY_GROUPS = mapSessionsToDayGroups();

export const SHINHAN_HAZARD_BANNER =
  'Same I-95 Elkton impact zone hit 7 times in 24 days';

export const SHINHAN_HAZARD_LOCATION_LABEL = 'I-95 · Elkton, MD';

export { ELKTON_REPEATED_GROUP };
