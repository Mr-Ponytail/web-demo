const PIN_COLORS = ['#28D6B9', '#FF3EC6', '#7839EE', '#06AED4', '#77DF00'];
const PIN_DIM_COLORS = ['#5CB5A3', '#B57DA4', '#7E6EB5', '#5BA8BC', '#6BA85B'];
const PIN_DIM_TEXT_COLORS = ['#1B7A6A', '#8A1E6B', '#4A2B8A', '#057A94', '#3D7A00'];

const PIN_PATH =
  'M20.0518 36.6386C23.3067 33.7478 33 24.3877 33 15.4002C33 11.581 31.525 7.91827 28.8995 5.21772C26.274 2.51716 22.713 1 19 1C15.287 1 11.726 2.51716 9.10051 5.21772C6.475 7.91827 5 11.581 5 15.4002C5 24.3877 14.6933 33.7478 17.9482 36.6386C18.2515 36.8732 18.6206 37 19 37C19.3794 37 19.7485 36.8732 20.0518 36.6386Z';

type NumberedMarkerGraphicProps = {
  pinNumber: number;
  colorIndex: number;
  width?: number;
  height?: number;
  isDimmed?: boolean;
};

export function NumberedMarkerGraphic({
  pinNumber,
  colorIndex,
  width = 35,
  height = 45,
  isDimmed = false,
}: NumberedMarkerGraphicProps) {
  const ci =
    ((colorIndex % PIN_COLORS.length) + PIN_COLORS.length) % PIN_COLORS.length;
  const pinColor = isDimmed ? PIN_DIM_COLORS[ci] : PIN_COLORS[ci];
  const circleColor = isDimmed ? '#C2C4C8' : '#FFFFFF';
  const textColor = isDimmed ? PIN_DIM_TEXT_COLORS[ci] : PIN_COLORS[ci];
  const fontSize = pinNumber >= 10 ? 9.5 : 11.5;

  return (
    <svg width={width} height={height} viewBox="5 1 28 36" fill="none">
      <path d={PIN_PATH} fill={pinColor} />
      <circle cx={19} cy={14.9043} r={9.5} fill={circleColor} />
      <text
        x={19}
        y={15.4}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="700"
        fill={textColor}
      >
        {pinNumber}
      </text>
    </svg>
  );
}

export function iconKeyToColorIndex(iconKey: string): number {
  const match = iconKey.match(/(\d+)$/);
  return match ? Number(match[1]) - 1 : 0;
}
