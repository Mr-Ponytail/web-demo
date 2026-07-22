export const DEMO_VEHICLE = {
  id: '6a45ef1da3ddbd4f721b4186',
  vin: '1FDUF5GY0KDA00001',
  nickname: '신한',
  make: 'Ford',
  model: 'F-650',
  displayModel: 'Ford F-650',
  wheelCount: 6,
  axle: '6-wheel dual rear',
};

/** Pre-filled nickname on the onboarding name step. */
export const DEMO_DEFAULT_NICKNAME = '신한';

export const DEMO_STORAGE_KEYS = {
  nickname: 'web-demo-nickname',
  onboarded: 'web-demo-onboarded',
  vin: 'web-demo-vin',
  sensorConnection: 'web-demo-sensor-connection',
} as const;

const VIN_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';

/** Generate a random 17-character VIN for the web demo. */
export function generateRandomVin(): string {
  return Array.from(
    { length: 17 },
    () => VIN_CHARS[Math.floor(Math.random() * VIN_CHARS.length)],
  ).join('');
}
