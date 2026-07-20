import type { TireKey } from './tireMocks';

export type BleDevice = {
  id: string;
  name: string;
  rssi: number;
};

export const TIRE_SLOT_POSITION_LABELS: Record<TireKey, string> = {
  FL: 'FRONT LEFT',
  FR: 'FRONT RIGHT',
  LI: 'LEFT INNER',
  RI: 'RIGHT INNER',
  LO: 'LEFT OUTER',
  RO: 'RIGHT OUTER',
};

export const DEMO_BLE_DEVICE_POOL: BleDevice[] = [
  { id: 'AA:BB:CC:DD:EE:01', name: 'iSensor', rssi: -58 },
  { id: 'AA:BB:CC:DD:EE:02', name: 'iSensor', rssi: -62 },
  { id: 'AA:BB:CC:DD:EE:03', name: 'iSensor', rssi: -71 },
  { id: 'AA:BB:CC:DD:EE:04', name: 'iSensor', rssi: -65 },
  { id: 'AA:BB:CC:DD:EE:05', name: 'iSensor', rssi: -54 },
  { id: 'AA:BB:CC:DD:EE:06', name: 'iSensor', rssi: -68 },
];

/** Pre-mapped sensors for tires that start connected on the home screen. */
export const DEMO_INITIAL_TIRE_DEVICE_MAP: Partial<Record<TireKey, string>> = {
  FL: 'AA:BB:CC:DD:EE:01',
  FR: 'AA:BB:CC:DD:EE:02',
  LI: 'AA:BB:CC:DD:EE:03',
  LO: 'AA:BB:CC:DD:EE:04',
};

export const DEMO_INITIAL_CONNECTED_DEVICE_IDS = Object.values(
  DEMO_INITIAL_TIRE_DEVICE_MAP,
) as string[];
