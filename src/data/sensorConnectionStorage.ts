import {
  DEMO_BLE_DEVICE_POOL,
  DEMO_INITIAL_TIRE_DEVICE_MAP,
} from './bleMocks';
import { TIRE_ORDER, type TireKey } from './tireMocks';
import { DEMO_STORAGE_KEYS } from './vehicleMock';

const VALID_TIRE_KEYS = new Set<TireKey>(TIRE_ORDER);
const VALID_DEVICE_IDS = new Set(DEMO_BLE_DEVICE_POOL.map(device => device.id));

function sanitizeTireDeviceMap(
  map: unknown,
): Partial<Record<TireKey, string>> {
  if (!map || typeof map !== 'object') {
    return { ...DEMO_INITIAL_TIRE_DEVICE_MAP };
  }

  const next: Partial<Record<TireKey, string>> = {};
  for (const [key, deviceId] of Object.entries(map)) {
    if (
      VALID_TIRE_KEYS.has(key as TireKey) &&
      typeof deviceId === 'string' &&
      VALID_DEVICE_IDS.has(deviceId)
    ) {
      next[key as TireKey] = deviceId;
    }
  }

  return Object.keys(next).length > 0
    ? next
    : { ...DEMO_INITIAL_TIRE_DEVICE_MAP };
}

export function loadTireDeviceMap(): Partial<Record<TireKey, string>> {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEYS.sensorConnection);
    if (!raw) {
      return { ...DEMO_INITIAL_TIRE_DEVICE_MAP };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEMO_INITIAL_TIRE_DEVICE_MAP };
    }
    const record = parsed as { tireDeviceMap?: unknown };
    return sanitizeTireDeviceMap(record.tireDeviceMap);
  } catch {
    return { ...DEMO_INITIAL_TIRE_DEVICE_MAP };
  }
}

export function saveTireDeviceMap(
  tireDeviceMap: Partial<Record<TireKey, string>>,
): void {
  localStorage.setItem(
    DEMO_STORAGE_KEYS.sensorConnection,
    JSON.stringify({ tireDeviceMap }),
  );
}

export function connectedTiresFromMap(
  tireDeviceMap: Partial<Record<TireKey, string>>,
): Set<TireKey> {
  return new Set(Object.keys(tireDeviceMap) as TireKey[]);
}

export function connectedDeviceIdsFromMap(
  tireDeviceMap: Partial<Record<TireKey, string>>,
): string[] {
  return [...new Set(Object.values(tireDeviceMap).filter(Boolean))] as string[];
}
