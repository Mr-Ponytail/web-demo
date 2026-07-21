import type { InsightsChipKey } from './insightsMocks';

export type TireSlotKey = 'FL' | 'FR' | 'LI' | 'LO' | 'RI' | 'RO';

export const TIRE_SLOT_GRID_LABELS: Record<TireSlotKey, string> = {
  FL: 'FL',
  FR: 'FR',
  LO: 'RLO',
  LI: 'RLI',
  RI: 'RRI',
  RO: 'RRO',
};

export const GRID_TOP_ROW: TireSlotKey[] = ['FR', 'RI', 'RO'];
export const GRID_BOTTOM_ROW: TireSlotKey[] = ['FL', 'LI', 'LO'];
export const LIST_ORDER: TireSlotKey[] = ['FR', 'FL', 'RI', 'RO', 'LO', 'LI'];

export const INSIGHTS_CHIP_TO_SLOT: Record<InsightsChipKey, TireSlotKey> = {
  FL: 'FL',
  FR: 'FR',
  RRI: 'RI',
  RRO: 'RO',
  RLI: 'LI',
  RLO: 'LO',
};

export const INSIGHTS_SLOT_TO_CHIP: Record<TireSlotKey, InsightsChipKey> = {
  FL: 'FL',
  FR: 'FR',
  RI: 'RRI',
  RO: 'RRO',
  LI: 'RLI',
  LO: 'RLO',
};
