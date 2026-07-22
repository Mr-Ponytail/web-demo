import type { ApiDriveEvent, ApiDriveSession, ApiRepeatedGroup } from './types';

export const SHINHAN_VEHICLE_ID = '6a45ef1da3ddbd4f721b4186';

/** I-95 Elkton (MD) pothole cluster — same payload across sessions that include it. */
export const ELKTON_REPEATED_GROUP: ApiRepeatedGroup = {
  count: 7,
  location: { lat: 39.642928, lng: -75.825603 },
  summary: '7 impacts near I-95 S · Newark, NJ → Washington, DC in 24 days',
  events: [
    {
      ts: '2026-06-25T11:13:04Z',
      wheelPosition: 'FR',
      type: 'IMPACT',
      value: 2.6,
      severity: 'caution',
      location: { lat: 39.642849, lng: -75.826032 },
    },
    {
      ts: '2026-06-29T10:59:12Z',
      wheelPosition: 'FL',
      type: 'IMPACT',
      value: 3.1,
      severity: 'caution',
      location: { lat: 39.642918, lng: -75.82565 },
    },
    {
      ts: '2026-07-03T10:39:48Z',
      wheelPosition: 'FR',
      type: 'IMPACT',
      value: 2.8,
      severity: 'caution',
      location: { lat: 39.642873, lng: -75.825808 },
    },
    {
      ts: '2026-07-07T11:11:29Z',
      wheelPosition: 'FL',
      type: 'IMPACT',
      value: 3.4,
      severity: 'caution',
      location: { lat: 39.643047, lng: -75.825861 },
    },
    {
      ts: '2026-07-11T11:06:55Z',
      wheelPosition: 'FR',
      type: 'IMPACT',
      value: 2.9,
      severity: 'caution',
      location: { lat: 39.642947, lng: -75.825593 },
    },
    {
      ts: '2026-07-16T10:14:24Z',
      wheelPosition: 'FL',
      type: 'IMPACT',
      value: 3.8,
      severity: 'danger',
      location: { lat: 39.64307, lng: -75.825835 },
    },
    {
      ts: '2026-07-20T10:41:12Z',
      wheelPosition: 'FR',
      type: 'IMPACT',
      value: 3.2,
      severity: 'caution',
      location: { lat: 39.642928, lng: -75.825603 },
    },
  ],
};

const NORTH = 'I-95 N · Washington, DC → Newark, NJ';
const SOUTH = 'I-95 S · Newark, NJ → Washington, DC';

type SessionSeed = {
  day: string; // YYYYMMDD
  startAt: string;
  endAt: string;
  distanceKm: number;
  durationSec: number;
  direction: 'N' | 'S';
  events?: ApiDriveEvent[];
  includeElkton?: boolean;
  tags?: string[];
};

function sessionFromSeed(seed: SessionSeed): ApiDriveSession {
  const events = seed.events ?? [];
  return {
    id: `drive-shinhan-${seed.day}`,
    vehicleId: SHINHAN_VEHICLE_ID,
    startAt: seed.startAt,
    endAt: seed.endAt,
    distanceKm: seed.distanceKm,
    durationSec: seed.durationSec,
    locationLabel: seed.direction === 'N' ? NORTH : SOUTH,
    tags: seed.tags ?? [],
    events,
    eventCount: events.length,
    repeatedGroups: seed.includeElkton ? [ELKTON_REPEATED_GROUP] : [],
  };
}

/** July 2026 sessions (newest first) — matches seeded GET /sessions?month=2026-07 */
const JULY_SEEDS: SessionSeed[] = [
  {
    day: '20260721',
    startAt: '2026-07-21T08:43:00Z',
    endAt: '2026-07-21T12:19:00Z',
    distanceKm: 346,
    durationSec: 12960,
    direction: 'N',
    tags: ['편마모'],
    events: [
      {
        ts: '2026-07-21T11:46:36Z',
        wheelPosition: 'FR',
        type: 'UNEVEN_WEAR',
        value: 3.2,
        severity: 'caution',
        location: { lat: 39.207051, lng: -76.687699 },
      },
    ],
  },
  {
    day: '20260720',
    startAt: '2026-07-20T09:16:00Z',
    endAt: '2026-07-20T12:49:00Z',
    distanceKm: 340,
    durationSec: 12780,
    direction: 'S',
    tags: ['공기압 이상', '충격'],
    includeElkton: true,
    events: [
      {
        ts: '2026-07-20T10:02:52Z',
        wheelPosition: 'RR',
        type: 'SLOW_LEAK',
        value: 19.5,
        severity: 'danger',
        location: { lat: 40.112652, lng: -74.713973 },
      },
      {
        ts: '2026-07-20T10:41:12Z',
        wheelPosition: 'FR',
        type: 'IMPACT',
        value: 3.2,
        severity: 'caution',
        location: { lat: 39.642928, lng: -75.825603 },
      },
    ],
  },
  {
    day: '20260719',
    startAt: '2026-07-19T09:09:00Z',
    endAt: '2026-07-19T12:39:00Z',
    distanceKm: 358,
    durationSec: 12600,
    direction: 'N',
  },
  {
    day: '20260718',
    startAt: '2026-07-18T09:02:00Z',
    endAt: '2026-07-18T12:29:00Z',
    distanceKm: 352,
    durationSec: 12420,
    direction: 'S',
    tags: ['이상 온도', '공기압 이상'],
    events: [
      {
        ts: '2026-07-18T11:47:36Z',
        wheelPosition: 'RL',
        type: 'ABNORMAL_HEAT',
        value: 112.3,
        severity: 'danger',
        location: { lat: 39.243967, lng: -76.578121 },
      },
      {
        ts: '2026-07-18T11:51:44Z',
        wheelPosition: 'RR',
        type: 'SLOW_LEAK',
        value: 21.8,
        severity: 'caution',
        location: { lat: 39.229419, lng: -76.635616 },
      },
    ],
  },
  {
    day: '20260717',
    startAt: '2026-07-17T08:55:00Z',
    endAt: '2026-07-17T12:19:00Z',
    distanceKm: 346,
    durationSec: 12240,
    direction: 'N',
  },
  {
    day: '20260716',
    startAt: '2026-07-16T08:48:00Z',
    endAt: '2026-07-16T12:24:00Z',
    distanceKm: 340,
    durationSec: 12960,
    direction: 'S',
    tags: ['충격', '공기압 이상'],
    includeElkton: true,
    events: [
      {
        ts: '2026-07-16T10:14:24Z',
        wheelPosition: 'FL',
        type: 'IMPACT',
        value: 3.8,
        severity: 'danger',
        location: { lat: 39.64307, lng: -75.825835 },
      },
      {
        ts: '2026-07-16T10:40:19Z',
        wheelPosition: 'RR',
        type: 'SLOW_LEAK',
        value: 24.0,
        severity: 'caution',
        location: { lat: 39.696774, lng: -75.54947 },
      },
    ],
  },
  {
    day: '20260715',
    startAt: '2026-07-15T08:41:00Z',
    endAt: '2026-07-15T12:14:00Z',
    distanceKm: 358,
    durationSec: 12780,
    direction: 'N',
  },
  {
    day: '20260714',
    startAt: '2026-07-14T09:14:00Z',
    endAt: '2026-07-14T12:44:00Z',
    distanceKm: 352,
    durationSec: 12600,
    direction: 'S',
    tags: ['공기압 이상'],
    events: [
      {
        ts: '2026-07-14T10:42:12Z',
        wheelPosition: 'RR',
        type: 'SLOW_LEAK',
        value: 26.5,
        severity: 'caution',
        location: { lat: 39.876493, lng: -75.011506 },
      },
    ],
  },
  {
    day: '20260713',
    startAt: '2026-07-13T09:07:00Z',
    endAt: '2026-07-13T12:34:00Z',
    distanceKm: 346,
    durationSec: 12420,
    direction: 'N',
    tags: ['이상 온도'],
    events: [
      {
        ts: '2026-07-13T11:11:12Z',
        wheelPosition: 'RL',
        type: 'HIGH_TEMP',
        value: 99.5,
        severity: 'caution',
        location: { lat: 39.335248, lng: -76.517505 },
      },
    ],
  },
  {
    day: '20260712',
    startAt: '2026-07-12T09:00:00Z',
    endAt: '2026-07-12T12:24:00Z',
    distanceKm: 340,
    durationSec: 12240,
    direction: 'S',
  },
  {
    day: '20260711',
    startAt: '2026-07-11T08:53:00Z',
    endAt: '2026-07-11T12:29:00Z',
    distanceKm: 358,
    durationSec: 12960,
    direction: 'N',
    tags: ['충격'],
    includeElkton: true,
    events: [
      {
        ts: '2026-07-11T11:06:55Z',
        wheelPosition: 'FR',
        type: 'IMPACT',
        value: 2.9,
        severity: 'caution',
        location: { lat: 39.642947, lng: -75.825593 },
      },
    ],
  },
  {
    day: '20260710',
    startAt: '2026-07-10T08:46:00Z',
    endAt: '2026-07-10T12:19:00Z',
    distanceKm: 352,
    durationSec: 12780,
    direction: 'S',
  },
  {
    day: '20260709',
    startAt: '2026-07-09T09:19:00Z',
    endAt: '2026-07-09T12:49:00Z',
    distanceKm: 346,
    durationSec: 12600,
    direction: 'N',
  },
  {
    day: '20260708',
    startAt: '2026-07-08T09:12:00Z',
    endAt: '2026-07-08T12:39:00Z',
    distanceKm: 340,
    durationSec: 12420,
    direction: 'S',
  },
  {
    day: '20260707',
    startAt: '2026-07-07T09:05:00Z',
    endAt: '2026-07-07T12:29:00Z',
    distanceKm: 358,
    durationSec: 12240,
    direction: 'N',
    tags: ['충격'],
    includeElkton: true,
    events: [
      {
        ts: '2026-07-07T11:11:29Z',
        wheelPosition: 'FL',
        type: 'IMPACT',
        value: 3.4,
        severity: 'caution',
        location: { lat: 39.643047, lng: -75.825861 },
      },
    ],
  },
  {
    day: '20260706',
    startAt: '2026-07-06T08:58:00Z',
    endAt: '2026-07-06T12:34:00Z',
    distanceKm: 352,
    durationSec: 12960,
    direction: 'S',
  },
  {
    day: '20260705',
    startAt: '2026-07-05T08:51:00Z',
    endAt: '2026-07-05T12:24:00Z',
    distanceKm: 346,
    durationSec: 12780,
    direction: 'N',
    tags: ['충격'],
    events: [
      {
        ts: '2026-07-05T10:48:09Z',
        wheelPosition: 'FR',
        type: 'IMPACT',
        value: 2.6,
        severity: 'caution',
        location: { lat: 39.290819, lng: -76.553761 },
      },
    ],
  },
  {
    day: '20260704',
    startAt: '2026-07-04T08:44:00Z',
    endAt: '2026-07-04T12:14:00Z',
    distanceKm: 340,
    durationSec: 12600,
    direction: 'S',
  },
  {
    day: '20260703',
    startAt: '2026-07-03T09:17:00Z',
    endAt: '2026-07-03T12:44:00Z',
    distanceKm: 358,
    durationSec: 12420,
    direction: 'N',
    tags: ['충격'],
    includeElkton: true,
    events: [
      {
        ts: '2026-07-03T10:39:48Z',
        wheelPosition: 'FR',
        type: 'IMPACT',
        value: 2.8,
        severity: 'caution',
        location: { lat: 39.642873, lng: -75.825808 },
      },
    ],
  },
  {
    day: '20260702',
    startAt: '2026-07-02T09:10:00Z',
    endAt: '2026-07-02T12:34:00Z',
    distanceKm: 352,
    durationSec: 12240,
    direction: 'S',
  },
  {
    day: '20260701',
    startAt: '2026-07-01T09:03:00Z',
    endAt: '2026-07-01T12:39:00Z',
    distanceKm: 346,
    durationSec: 12960,
    direction: 'N',
    tags: ['공기압 이상'],
    events: [
      {
        ts: '2026-07-01T09:20:17Z',
        wheelPosition: 'FL',
        type: 'LOW_PRESSURE',
        value: 25.4,
        severity: 'caution',
        location: { lat: 40.549519, lng: -74.277422 },
      },
    ],
  },
];

const JUNE_SEEDS: SessionSeed[] = [
  {
    day: '20260630',
    startAt: '2026-06-30T08:56:00Z',
    endAt: '2026-06-30T12:29:00Z',
    distanceKm: 340,
    durationSec: 12780,
    direction: 'S',
  },
  {
    day: '20260629',
    startAt: '2026-06-29T08:49:00Z',
    endAt: '2026-06-29T12:19:00Z',
    distanceKm: 358,
    durationSec: 12600,
    direction: 'N',
    tags: ['충격'],
    includeElkton: true,
    events: [
      {
        ts: '2026-06-29T10:59:12Z',
        wheelPosition: 'FL',
        type: 'IMPACT',
        value: 3.1,
        severity: 'caution',
        location: { lat: 39.642918, lng: -75.82565 },
      },
    ],
  },
  {
    day: '20260628',
    startAt: '2026-06-28T08:42:00Z',
    endAt: '2026-06-28T12:09:00Z',
    distanceKm: 352,
    durationSec: 12420,
    direction: 'S',
  },
  {
    day: '20260627',
    startAt: '2026-06-27T09:15:00Z',
    endAt: '2026-06-27T12:39:00Z',
    distanceKm: 346,
    durationSec: 12240,
    direction: 'N',
    tags: ['공기압 이상'],
    events: [
      {
        ts: '2026-06-27T10:40:41Z',
        wheelPosition: 'FL',
        type: 'LOW_PRESSURE',
        value: 26.1,
        severity: 'caution',
        location: { lat: 39.854379, lng: -75.100451 },
      },
    ],
  },
  {
    day: '20260626',
    startAt: '2026-06-26T09:08:00Z',
    endAt: '2026-06-26T12:44:00Z',
    distanceKm: 340,
    durationSec: 12960,
    direction: 'S',
  },
  {
    day: '20260625',
    startAt: '2026-06-25T09:01:00Z',
    endAt: '2026-06-25T12:34:00Z',
    distanceKm: 358,
    durationSec: 12780,
    direction: 'N',
    tags: ['충격'],
    includeElkton: true,
    events: [
      {
        ts: '2026-06-25T11:13:04Z',
        wheelPosition: 'FR',
        type: 'IMPACT',
        value: 2.6,
        severity: 'caution',
        location: { lat: 39.642849, lng: -75.826032 },
      },
    ],
  },
  {
    day: '20260624',
    startAt: '2026-06-24T08:54:00Z',
    endAt: '2026-06-24T12:24:00Z',
    distanceKm: 352,
    durationSec: 12600,
    direction: 'S',
    tags: ['공기압 이상'],
    events: [
      {
        ts: '2026-06-24T09:57:00Z',
        wheelPosition: 'FL',
        type: 'LOW_PRESSURE',
        value: 27.2,
        severity: 'caution',
        location: { lat: 40.152214, lng: -74.66509 },
      },
    ],
  },
  {
    day: '20260623',
    startAt: '2026-06-23T08:47:00Z',
    endAt: '2026-06-23T12:14:00Z',
    distanceKm: 346,
    durationSec: 12420,
    direction: 'N',
  },
  {
    day: '20260622',
    startAt: '2026-06-22T08:40:00Z',
    endAt: '2026-06-22T12:04:00Z',
    distanceKm: 340,
    durationSec: 12240,
    direction: 'S',
  },
];

export const SHINHAN_SESSIONS_JULY: ApiDriveSession[] =
  JULY_SEEDS.map(sessionFromSeed);

export const SHINHAN_SESSIONS_JUNE: ApiDriveSession[] =
  JUNE_SEEDS.map(sessionFromSeed);

export const SHINHAN_SESSIONS_ALL: ApiDriveSession[] = [
  ...SHINHAN_SESSIONS_JULY,
  ...SHINHAN_SESSIONS_JUNE,
];
