export type PullOverLocale = 'en' | 'ko';

export const PULL_OVER_COPY = {
  en: {
    title: 'Pull Over - Check RLO Wheel',
    metricLabel: 'Nut torque',
    impactLabel: 'At Impact',
    nowLabel: 'Now',
    advice:
      'Nut torque is down to 54% and still falling. Pull over now to prevent damage. You should check your navigation app for the nearest service center.',
    openMap: 'Open Map',
    gotIt: 'Got it',
  },
  ko: {
    title: '정차 후 RLO 휠을 점검하세요',
    metricLabel: '너트 토크',
    impactLabel: '충격 시',
    nowLabel: '현재',
    advice:
      '너트 토크가 54%까지 떨어졌고 계속 감소 중입니다. 손상을 막기 위해 지금 정차하세요. 가장 가까운 정비소를 찾으려면 내비게이션 앱을 확인하세요.',
    openMap: '지도 열기',
    gotIt: '확인',
  },
} as const satisfies Record<
  PullOverLocale,
  {
    title: string;
    metricLabel: string;
    impactLabel: string;
    nowLabel: string;
    advice: string;
    openMap: string;
    gotIt: string;
  }
>;
