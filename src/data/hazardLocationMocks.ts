import { HAZARD_DEMO_GEO_OFFSET } from '../hazard/constants';

export type HazardMarkerIconKey =
  | 'marker-1'
  | 'marker-2'
  | 'marker-3'
  | 'marker-4'
  | 'marker-5';

export type HazardDetailEvent = {
  id: string;
  time: string;
  tagLabel: string;
  severity: 'danger' | 'caution' | 'good';
  title: string;
  position: string;
};

export type HazardDetailSheetContent = {
  date: string;
  location: string;
  events: HazardDetailEvent[];
  accentColor: string;
};

export type HazardMapMarker = {
  id: string;
  iconKey: HazardMarkerIconKey;
  pinNumber: number;
  longitude: number;
  latitude: number;
  color: string;
  date: string;
  events: HazardDetailEvent[];
};

export function markerToDetailSheetContent(
  marker: HazardMapMarker,
  location: string,
): HazardDetailSheetContent {
  return {
    date: marker.date,
    location,
    events: marker.events,
    accentColor: marker.color,
  };
}

export const HAZARD_MAP_STYLE =
  'https://tiles.openfreemap.org/styles/liberty';

export const HAZARD_CLUSTER_MAX_ZOOM = 16;
export const HAZARD_CLUSTER_RADIUS = 50;
export const HAZARD_PIN_MIN_ZOOM = HAZARD_CLUSTER_MAX_ZOOM + 0.001;
export const HAZARD_DEFAULT_MAP_ZOOM = 17.5;
export const HAZARD_MARKER_FOCUS_ZOOM = 18.4;
/** Scale reference kept below default zoom so pins grow with the initial map zoom. */
export const HAZARD_MARKER_BASE_ZOOM = 18;
export const HAZARD_MARKER_ZOOM_SCALE_FACTOR = 0.85;
export const HAZARD_MARKER_MIN_SCALE = 0.72;
export const HAZARD_MARKER_MAX_SCALE = 1.85;
export const HAZARD_MAP_DIM_OPACITY = 0.42;
export const HAZARD_ZONE_FILL_OPACITY = 0.1;
export const HAZARD_ZONE_LINE_OPACITY = 0.5;
export const HAZARD_ZONE_RADIUS_PADDING_METERS = 8;
export const HAZARD_ZONE_MIN_RADIUS_METERS = 18;
export const HAZARD_ZONE_CIRCLE_SEGMENTS = 64;

export const HAZARD_MARKER_COLORS = [
  '#28D6B9',
  '#FF3EC6',
  '#7839EE',
  '#06AED4',
  '#77DF00',
] as const;

/** Tight cluster around one intersection — keeps hazard zone circle small like RN. */
export const HAZARD_DEMO_CENTER: [number, number] = [
  127.0286 + HAZARD_DEMO_GEO_OFFSET[0],
  37.4979 + HAZARD_DEMO_GEO_OFFSET[1],
];

const DEMO_HAZARD_MARKERS_BASE: HazardMapMarker[] = [
  {
    id: 'hazard-event-0',
    iconKey: 'marker-1',
    pinNumber: 1,
    longitude: 127.02858,
    latitude: 37.49793,
    color: HAZARD_MARKER_COLORS[0],
    date: '2026-07-19',
    events: [
      {
        id: 'hazard-event-0-0',
        time: 'AM 08:24',
        tagLabel: 'Impact',
        severity: 'danger',
        title: 'Sharp impact detected',
        position: 'FL',
      },
      {
        id: 'hazard-event-0-1',
        time: 'AM 08:24',
        tagLabel: 'Pressure',
        severity: 'caution',
        title: 'Pressure drop after impact',
        position: 'FL',
      },
    ],
  },
  {
    id: 'hazard-event-1',
    iconKey: 'marker-2',
    pinNumber: 2,
    longitude: 127.02863,
    latitude: 37.49788,
    color: HAZARD_MARKER_COLORS[1],
    date: '2026-07-12',
    events: [
      {
        id: 'hazard-event-1-0',
        time: 'PM 06:10',
        tagLabel: 'Impact',
        severity: 'danger',
        title: 'Repeated impact in same zone',
        position: 'FR',
      },
    ],
  },
  {
    id: 'hazard-event-2',
    iconKey: 'marker-3',
    pinNumber: 3,
    longitude: 127.02855,
    latitude: 37.49786,
    color: HAZARD_MARKER_COLORS[2],
    date: '2026-07-05',
    events: [
      {
        id: 'hazard-event-2-0',
        time: 'AM 07:40',
        tagLabel: 'Impact',
        severity: 'caution',
        title: 'Moderate road impact',
        position: 'LO',
      },
    ],
  },
];

export const DEMO_HAZARD_MARKERS: HazardMapMarker[] = DEMO_HAZARD_MARKERS_BASE.map(
  marker => ({
    ...marker,
    longitude: marker.longitude + HAZARD_DEMO_GEO_OFFSET[0],
    latitude: marker.latitude + HAZARD_DEMO_GEO_OFFSET[1],
  }),
);

export type HazardSummaryCardData = {
  id: string;
  order: string;
  tire: string;
  time: string;
  alerts: string[];
  accentColor: string;
  badgeColor: string;
};

export function formatDetailDateFromKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function computeHazardMapCenter(
  markers: HazardMapMarker[],
): [number, number] {
  if (markers.length === 0) {
    return HAZARD_DEMO_CENTER;
  }
  const longitude =
    markers.reduce((sum, marker) => sum + marker.longitude, 0) / markers.length;
  const latitude =
    markers.reduce((sum, marker) => sum + marker.latitude, 0) / markers.length;
  return [longitude, latitude];
}

export function buildHazardSummaryCards(
  markers: HazardMapMarker[],
): HazardSummaryCardData[] {
  return markers.map((marker, index) => ({
    id: marker.id,
    order: String(index + 1),
    tire: marker.events[0]?.position ?? '-',
    time: formatCardTime(marker.date, marker.events[0]?.time ?? ''),
    alerts: marker.events.map(event => event.tagLabel),
    accentColor: marker.color,
    badgeColor: marker.color,
  }));
}

function formatCardTime(dateKey: string, timeLabel: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const months = [
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
  ];
  return `${months[date.getMonth()]} ${date.getDate()} | ${timeLabel}`;
}

type GeoJSONFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id?: string;
    properties: Record<string, unknown>;
    geometry: {
      type: string;
      coordinates: unknown;
    };
  }>;
};

export const HAZARD_MAP_DIM_GEOJSON: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'hazard-map-dim',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-180, -85],
            [180, -85],
            [180, 85],
            [-180, 85],
            [-180, -85],
          ],
        ],
      },
    },
  ],
};

export function buildHazardMarkersGeoJSON(
  markers: HazardMapMarker[],
): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: markers.map(marker => ({
      type: 'Feature',
      id: marker.id,
      properties: { id: marker.id },
      geometry: {
        type: 'Point',
        coordinates: [marker.longitude, marker.latitude],
      },
    })),
  };
}

const EARTH_RADIUS_METERS = 6_371_000;

function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createCircleRing(
  centerLng: number,
  centerLat: number,
  radiusMeters: number,
  segments = HAZARD_ZONE_CIRCLE_SEGMENTS,
): number[][] {
  const coordinates: number[][] = [];
  const latitudeRadians = (centerLat * Math.PI) / 180;
  const metersPerDegreeLng =
    ((Math.PI * EARTH_RADIUS_METERS) / 180) * Math.cos(latitudeRadians);
  const metersPerDegreeLat = (Math.PI * EARTH_RADIUS_METERS) / 180;

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const eastMeters = radiusMeters * Math.cos(angle);
    const northMeters = radiusMeters * Math.sin(angle);

    coordinates.push([
      centerLng + eastMeters / metersPerDegreeLng,
      centerLat + northMeters / metersPerDegreeLat,
    ]);
  }

  return coordinates;
}

function computeHazardZoneCircle(markers: HazardMapMarker[]) {
  if (markers.length === 0) {
    return null;
  }

  const centerLng =
    markers.reduce((sum, marker) => sum + marker.longitude, 0) / markers.length;
  const centerLat =
    markers.reduce((sum, marker) => sum + marker.latitude, 0) / markers.length;

  let maxDistanceMeters = 0;
  for (const marker of markers) {
    const distanceMeters = haversineDistanceMeters(
      centerLat,
      centerLng,
      marker.latitude,
      marker.longitude,
    );
    maxDistanceMeters = Math.max(maxDistanceMeters, distanceMeters);
  }

  const radiusMeters = Math.max(
    maxDistanceMeters + HAZARD_ZONE_RADIUS_PADDING_METERS,
    HAZARD_ZONE_MIN_RADIUS_METERS,
  );

  return { centerLng, centerLat, radiusMeters };
}

export function buildHazardZoneCircleGeoJSON(
  markers: HazardMapMarker[],
): GeoJSONFeatureCollection {
  const circle = computeHazardZoneCircle(markers);
  if (!circle) {
    return { type: 'FeatureCollection', features: [] };
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'hazard-zone-circle',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            createCircleRing(
              circle.centerLng,
              circle.centerLat,
              circle.radiusMeters,
            ),
          ],
        },
      },
    ],
  };
}

export function getMarkerZoomScale(mapZoom: number): number {
  const zoomDelta = mapZoom - HAZARD_MARKER_BASE_ZOOM;
  const raw = Math.pow(2, zoomDelta * HAZARD_MARKER_ZOOM_SCALE_FACTOR);
  return Math.min(
    HAZARD_MARKER_MAX_SCALE,
    Math.max(HAZARD_MARKER_MIN_SCALE, raw),
  );
}
