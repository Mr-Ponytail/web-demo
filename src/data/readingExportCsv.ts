export type ReadingExportItem = {
  ts: string;
  wheelPosition: string;
  pressure: number;
  temperature: number;
  load: number;
  toe: number;
  lugnut: number;
  accRms: number;
  accPeak: number;
  batVolt: number;
  p33v: number;
  gpsLat: number;
  gpsLng: number;
  gpsSpeed: number;
  gpsAlt: number;
  index: number;
};

const READING_EXPORT_CSV_HEADERS = [
  'ts',
  'wheelPosition',
  'pressure',
  'temperature',
  'load',
  'toe',
  'lugnut',
  'accRms',
  'accPeak',
  'batVolt',
  'p33v',
  'gpsLat',
  'gpsLng',
  'gpsSpeed',
  'gpsAlt',
  'index',
] as const;

function escapeCsvCell(value: string | number): string {
  const raw = String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function utf8ByteLength(text: string): number {
  return encodeURIComponent(text).replace(/%[A-F\d]{2}/g, 'U').length;
}

export function readingExportItemsToCsv(items: ReadingExportItem[]): {
  csv: string;
  rowCount: number;
  byteSize: number;
} {
  const lines = [
    READING_EXPORT_CSV_HEADERS.join(','),
    ...items.map(item =>
      READING_EXPORT_CSV_HEADERS.map(key => escapeCsvCell(item[key])).join(','),
    ),
  ];
  const csv = `${lines.join('\n')}\n`;
  return { csv, rowCount: items.length, byteSize: utf8ByteLength(csv) };
}

export function formatCsvByteSize(byteSize: number): string {
  if (byteSize < 1024) return `${byteSize} bytes`;
  return `${Math.round(byteSize / 1024)} KB`;
}

export function sanitizeSensorId(sensorId: string): string {
  return sensorId.replace(/:/g, '-');
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toYyyyMmDd(date: Date): string {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

export function formatExportDateKey(start: Date, end: Date): string {
  const a = toYyyyMmDd(start);
  const b = toYyyyMmDd(end);
  return a === b ? a : `${a}-${b}`;
}

export function buildReadingExportFileName(
  sensorId: string,
  start: Date,
  end: Date,
): string {
  return `${sanitizeSensorId(sensorId)}_${formatExportDateKey(start, end)}.csv`;
}
