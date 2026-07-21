import {
  buildReadingExportFileName,
  readingExportItemsToCsv,
  type ReadingExportItem,
} from './readingExportCsv';

/** Demo sensor MAC used for CSV file naming (mirrors app mapping). */
export const DEMO_EXPORT_SENSOR_ID = 'AA:BB:CC:DD:EE:FF';

export const INSIGHTS_EXPORT_PREPARING_BANNER_MIN_MS = 2500;
export const INSIGHTS_EXPORT_ACTION_ICON_SIZE = 58;

const READINGS_PER_DAY = 4;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function round(n: number, digits = 1) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function wait(ms: number) {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, ms);
  });
}

/** Build deterministic dummy readings for the selected date range. */
export function buildDemoReadingExportItems(
  start: Date,
  end: Date,
  wheelPosition: string,
): ReadingExportItem[] {
  const from = startOfDay(start);
  const to = startOfDay(end);
  const items: ReadingExportItem[] = [];
  let index = 0;

  for (
    let cursor = new Date(from);
    cursor.getTime() <= to.getTime();
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const daySeed =
      cursor.getFullYear() * 10000 +
      (cursor.getMonth() + 1) * 100 +
      cursor.getDate();

    for (let slot = 0; slot < READINGS_PER_DAY; slot += 1) {
      const hour = 6 + slot * 4;
      const ts = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
        hour,
        15 + slot * 3,
        0,
        0,
      );
      const wobble = ((daySeed + slot * 17) % 20) - 10;
      items.push({
        ts: ts.toISOString(),
        wheelPosition,
        pressure: round(105 + wobble * 0.4),
        temperature: round(48 + wobble * 0.3),
        load: round(1420 + wobble * 8, 0),
        toe: round(0.04 + slot * 0.002, 3),
        lugnut: round(88 - slot * 1.5),
        accRms: round(0.12 + slot * 0.01, 3),
        accPeak: round(0.45 + slot * 0.02, 3),
        batVolt: round(3.72 - slot * 0.01, 2),
        p33v: 3.3,
        gpsLat: round(37.4979 + slot * 0.0001, 5),
        gpsLng: round(127.0276 + slot * 0.0001, 5),
        gpsSpeed: round(42 + wobble * 0.5, 0),
        gpsAlt: round(38 + slot, 0),
        index: index++,
      });
    }
  }

  return items;
}

export function downloadCsvFile(fileName: string, csv: string): string {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
  return fileName;
}

export function openCsvInNewTab(csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function prepareDemoCsvExport(options: {
  start: Date;
  end: Date;
  wheelPosition: string;
  sensorId: string;
}): Promise<{ csv: string; fileName: string; rowCount: number; byteSize: number }> {
  await wait(INSIGHTS_EXPORT_PREPARING_BANNER_MIN_MS);
  const items = buildDemoReadingExportItems(
    options.start,
    options.end,
    options.wheelPosition,
  );
  const { csv, rowCount, byteSize } = readingExportItemsToCsv(items);
  const fileName = buildReadingExportFileName(
    options.sensorId,
    options.start,
    options.end,
  );
  return { csv, fileName, rowCount, byteSize };
}
