import { HAZARD_DEMO_GEO_OFFSET } from '../hazard/constants';
import {
  HAZARD_MARKER_COLORS,
  type HazardMapMarker,
  type HazardMarkerIconKey,
} from './hazardLocationMocks';
import {
  formatAmPmFromIso,
  formatShinhanEventTitle,
  shinhanEventTagLabel,
  dateKeyFromIso,
} from './mapShinhanSessions';
import { SHINHAN_SESSIONS_ALL } from './shinhan/sessionsPayload';
import type { ApiDriveEvent, ApiDriveSession } from './shinhan/types';

const MARKER_ICON_KEYS: HazardMarkerIconKey[] = [
  'marker-1',
  'marker-2',
  'marker-3',
  'marker-4',
  'marker-5',
];

export type HazardMapQuery = {
  /** YYYY-MM — month banner "View on map" */
  month?: string | null;
  /** YYYY-MM-DD — day hazard chip */
  date?: string | null;
  /** Optional session id when opening from a specific drive */
  sessionId?: string | null;
};

export type HazardMapView = {
  markers: HazardMapMarker[];
  locationLabel: string;
  center: [number, number];
};

function eventKey(event: ApiDriveEvent): string {
  return `${event.ts}|${event.wheelPosition}|${event.type}|${event.location.lat}|${event.location.lng}`;
}

function dedupeEvents(events: ApiDriveEvent[]): ApiDriveEvent[] {
  const seen = new Set<string>();
  const out: ApiDriveEvent[] = [];
  for (const event of events) {
    const key = eventKey(event);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(event);
  }
  return out;
}

export function eventsToHazardMarkers(
  events: ApiDriveEvent[],
  idPrefix = 'hazard',
): HazardMapMarker[] {
  return dedupeEvents(events).map((event, index) => ({
    id: `${idPrefix}-${index}`,
    iconKey: MARKER_ICON_KEYS[index % MARKER_ICON_KEYS.length],
    pinNumber: index + 1,
    longitude: event.location.lng + HAZARD_DEMO_GEO_OFFSET[0],
    latitude: event.location.lat + HAZARD_DEMO_GEO_OFFSET[1],
    color: HAZARD_MARKER_COLORS[index % HAZARD_MARKER_COLORS.length],
    date: dateKeyFromIso(event.ts),
    events: [
      {
        id: `${idPrefix}-${index}-0`,
        time: formatAmPmFromIso(event.ts),
        tagLabel: shinhanEventTagLabel(event.type),
        severity: event.severity,
        title: formatShinhanEventTitle(event),
        position: event.wheelPosition,
      },
    ],
  }));
}

function sessionsInMonth(month: string): ApiDriveSession[] {
  return SHINHAN_SESSIONS_ALL.filter(session =>
    session.startAt.startsWith(month),
  );
}

function sessionById(sessionId: string): ApiDriveSession | undefined {
  return SHINHAN_SESSIONS_ALL.find(session => session.id === sessionId);
}

function sessionsOnDate(date: string): ApiDriveSession[] {
  return SHINHAN_SESSIONS_ALL.filter(
    session => dateKeyFromIso(session.startAt) === date,
  );
}

/**
 * Map pins for a drive day.
 * Sessions with a recurring hazard zone use that cluster only (tight map),
 * progressive up to `date`. Other sessions show their own geotagged events.
 */
function collectDayEvents(sessions: ApiDriveSession[], date: string): ApiDriveEvent[] {
  const events: ApiDriveEvent[] = [];

  for (const session of sessions) {
    if (session.repeatedGroups.length > 0) {
      for (const group of session.repeatedGroups) {
        for (const event of group.events) {
          if (dateKeyFromIso(event.ts) <= date) {
            events.push(event);
          }
        }
      }
      continue;
    }

    events.push(...session.events);
  }

  return events;
}

function mapEventCountForSession(session: ApiDriveSession): number {
  const day = dateKeyFromIso(session.startAt);
  return dedupeEvents(collectDayEvents([session], day)).length;
}

/**
 * Prefer the drive day with the most map pins in the month.
 * Ties go to the newer session so July leans to the richest late-month story.
 */
export function richestSessionInMonth(
  month: string,
): ApiDriveSession | undefined {
  const sessions = sessionsInMonth(month);
  if (sessions.length === 0) return undefined;

  return sessions.reduce((best, session) => {
    const bestCount = mapEventCountForSession(best);
    const nextCount = mapEventCountForSession(session);
    if (nextCount > bestCount) return session;
    if (nextCount < bestCount) return best;
    return session.startAt > best.startAt ? session : best;
  });
}

function computeCenter(markers: HazardMapMarker[]): [number, number] {
  if (markers.length === 0) {
    return [-75.825603 + HAZARD_DEMO_GEO_OFFSET[0], 39.642928 + HAZARD_DEMO_GEO_OFFSET[1]];
  }
  const lng =
    markers.reduce((sum, marker) => sum + marker.longitude, 0) / markers.length;
  const lat =
    markers.reduce((sum, marker) => sum + marker.latitude, 0) / markers.length;
  return [lng, lat];
}

function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const name = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][m - 1];
  return `I-95 corridor · ${name} ${y}`;
}

function resolveDayView(
  sessions: ApiDriveSession[],
  date: string,
): HazardMapView {
  const events = collectDayEvents(sessions, date);
  const markers = eventsToHazardMarkers(events, `day-${date}`);

  // Prefer the recurring-zone label when this day is an Elkton-style cluster.
  const repeatedLabel =
    sessions.find(s => s.repeatedGroups.length > 0) != null
      ? 'I-95 · Elkton, MD'
      : null;
  const label =
    repeatedLabel ??
    sessions[0]?.locationLabel ??
    `Drive · ${date}`;

  return {
    markers,
    locationLabel: label,
    center: computeCenter(markers),
  };
}

/**
 * Resolve hazard map markers from Tire Log navigation context.
 * - month only → day with the most events in that month (banner "View on map")
 * - date / sessionId → that day's session events (+ progressive repeated impacts)
 */
export function resolveHazardMapView(query: HazardMapQuery): HazardMapView {
  const month = query.month?.trim() || null;
  const date = query.date?.trim() || null;
  const sessionId = query.sessionId?.trim() || null;

  if (date || sessionId) {
    const sessions = sessionId
      ? ([sessionById(sessionId)].filter(Boolean) as ApiDriveSession[])
      : sessionsOnDate(date!);
    const day = date ?? (sessions[0] ? dateKeyFromIso(sessions[0].startAt) : null);
    if (!day) {
      return {
        markers: [],
        locationLabel: 'I-95 corridor',
        center: computeCenter([]),
      };
    }
    return resolveDayView(sessions, day);
  }

  const monthKey = month ?? '2026-07';
  const richest = richestSessionInMonth(monthKey);
  if (!richest) {
    return {
      markers: [],
      locationLabel: formatMonthLabel(monthKey),
      center: computeCenter([]),
    };
  }

  const day = dateKeyFromIso(richest.startAt);
  return resolveDayView([richest], day);
}

export function buildHazardMapPath(query: HazardMapQuery): string {
  const params = new URLSearchParams();
  if (query.month) params.set('month', query.month);
  if (query.date) params.set('date', query.date);
  if (query.sessionId) params.set('sessionId', query.sessionId);
  const qs = params.toString();
  return qs
    ? `/app/tire-log/hazard-map?${qs}`
    : '/app/tire-log/hazard-map';
}

/** Banner shortcut: open map for the day with the most events in the selected month. */
export function buildRichestDayHazardMapPath(month: string): string {
  const richest = richestSessionInMonth(month);
  if (!richest) {
    return buildHazardMapPath({ month });
  }
  return buildHazardMapPath({
    month,
    date: dateKeyFromIso(richest.startAt),
    sessionId: richest.id,
  });
}

/** @deprecated Use buildRichestDayHazardMapPath */
export function buildLatestDayHazardMapPath(month: string): string {
  return buildRichestDayHazardMapPath(month);
}
