export type TireKey = 'FL' | 'FR' | 'LI' | 'RI' | 'LO' | 'RO';
export type TireStatus = 'normal' | 'caution' | 'danger' | 'offline';

export type TireMock = {
  status: TireStatus;
  pressure: number;
  temp: number;
  label: string;
};

export const TIRE_ORDER: TireKey[] = ['FL', 'FR', 'LI', 'RI', 'LO', 'RO'];

/** Tires with an active Bluetooth sensor in the home-screen demo. */
export const DEMO_CONNECTED_TIRES: ReadonlySet<TireKey> = new Set([
  'FL',
  'FR',
  'LI',
  'LO',
]);

export const MOCK_BY_TIRE: Record<TireKey, TireMock> = {
  FL: { status: 'danger', pressure: 300, temp: 85, label: 'Front Left' },
  FR: { status: 'danger', pressure: 300, temp: 85, label: 'Front Right' },
  LI: { status: 'normal', pressure: 200, temp: 35, label: 'Left Inner' },
  RI: { status: 'caution', pressure: 130, temp: 62, label: 'Right Inner' },
  LO: { status: 'danger', pressure: 300, temp: 85, label: 'Left Outer' },
  RO: { status: 'danger', pressure: 300, temp: 85, label: 'Right Outer' },
};

export const STATUS_LABEL: Record<TireStatus, string> = {
  normal: 'Good',
  caution: 'Caution',
  danger: 'Danger',
  offline: 'Offline',
};
