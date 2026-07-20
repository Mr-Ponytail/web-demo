import type { TireStatus } from '../data/tireMocks';

/** iOS values from `theme/colorMaps.ts` tireStatusColors */
export const tireStatusColors = {
  label: {
    normal: '#0F0F10',
    caution: '#F48200',
    danger: '#FF6363',
    offline: '#878A93',
  } as Record<TireStatus, string>,
  cardBorder: {
    normal: '#C2C4C8',
    caution: '#FFB5B5',
    danger: '#FFB5B5',
    offline: '#C2C4C8',
  } as Record<TireStatus, string>,
  cardBg: {
    normal: 'rgba(152, 155, 162, 0.1)',
    caution: 'rgba(255, 159, 10, 0.1)',
    danger: 'rgba(255, 99, 99, 0.1)',
    offline: 'rgba(152, 155, 162, 0.1)',
  } as Record<TireStatus, string>,
  detailCardBorder: {
    normal: '#E1E2E4',
    caution: '#FFD49C',
    danger: '#FFB5B5',
    offline: '#E1E2E4',
  } as Record<TireStatus, string>,
  detailCardBg: {
    normal: 'rgba(225, 226, 228, 0.12)',
    caution: 'rgba(255, 212, 156, 0.12)',
    danger: 'rgba(255, 181, 181, 0.12)',
    offline: 'rgba(225, 226, 228, 0.12)',
  } as Record<TireStatus, string>,
  unconnectedCardBg: 'rgba(201, 222, 254, 0.15)',
};

export const STATUS_VALUE_COLOR: Record<TireStatus, string> = {
  normal: '#0F0F10',
  caution: '#F48200',
  danger: '#E52222',
  offline: '#0F0F10',
};

export const STATUS_DOT_COLOR: Partial<Record<TireStatus, string>> = {
  caution: '#F48200',
  danger: '#E52222',
};
