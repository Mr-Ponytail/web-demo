export type AlertPreferenceLevel = 'proactive' | 'standard' | 'essential';

export type AlertPreferenceOption = {
  id: AlertPreferenceLevel;
  title: string;
  description: string;
  badge?: { label: string; tone: 'green' | 'blue' | 'red' };
  thresholds: { label: string; value: string }[];
  footerNote?: {
    text: string;
    tone: 'green' | 'red';
    showWarningIcon?: boolean;
  };
};

export const ALERT_PREFERENCE_OPTIONS: AlertPreferenceOption[] = [
  {
    id: 'proactive',
    title: 'Proactive',
    description: 'Alerts on small changes and early signs.',
    badge: { label: 'Safety-first', tone: 'green' },
    thresholds: [
      { label: 'Pressure', value: '≤ 105 psi' },
      { label: 'Load', value: '≥ 4,200 lbs' },
      { label: 'Align', value: '≥ 0.15°' },
      { label: 'Temperature', value: '≥ 140 °F' },
      { label: 'Nut torque', value: '≤ 85%' },
    ],
    footerNote: {
      text: 'Also watches for early trends in pressure, temperature, align, and nut torque.',
      tone: 'green',
      showWarningIcon: true,
    },
  },
  {
    id: 'standard',
    title: 'Standard',
    description: 'Alerts at standard warning thresholds.',
    badge: { label: 'Balanced', tone: 'blue' },
    thresholds: [
      { label: 'Pressure', value: '≤ 100 psi' },
      { label: 'Load', value: '≥ 4,500 lbs' },
      { label: 'Align', value: '≥ 0.20°' },
      { label: 'Temperature', value: '≥ 150 °F' },
      { label: 'Nut torque', value: '≤ 80%' },
    ],
  },
  {
    id: 'essential',
    title: 'Essential',
    description: 'Fewest alerts, reserved for real risk.',
    badge: { label: 'Least protective', tone: 'red' },
    thresholds: [
      { label: 'Pressure', value: '≤ 90 psi' },
      { label: 'Load', value: '≥ 5,000 lbs' },
      { label: 'Align', value: '≥ 0.30°' },
      { label: 'Temperature', value: '≥ 160 °F' },
      { label: 'Nut torque', value: '≤ 70%' },
    ],
    footerNote: {
      text: "These are already critical levels. You'll only be alerted once a signal reaches this stage.",
      tone: 'red',
      showWarningIcon: true,
    },
  },
];
