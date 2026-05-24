import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { ClockHand } from './ClockHand';
import { Colors, FontSize } from '../constants/theme';

const CX = 150;
const CY = 150;
const TRACK_RADIUS = 110;
const TICK_OUTER = 140;
const TICK_INNER_MAJOR = 128;
const TICK_INNER_MINOR = 133;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function buildArcPath(remainingRatio: number, cx: number, cy: number, r: number): string {
  if (remainingRatio <= 0) return '';
  if (remainingRatio >= 0.9999) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
  }
  const angle = remainingRatio * 2 * Math.PI;
  const endX = cx + r * Math.sin(angle);
  const endY = cy - r * Math.cos(angle);
  const largeArc = angle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`;
}

interface AnalogClockProps {
  totalSeconds: number;
  remainingSeconds: number;
  isFinished?: boolean;
  size?: number;
}

export function AnalogClock({ totalSeconds, remainingSeconds, isFinished = false, size = 300 }: AnalogClockProps) {
  const remainingRatio = Math.min(1, remainingSeconds / 3600);
  const arcPath = buildArcPath(remainingRatio, CX, CY, TRACK_RADIUS);
  const isWarning = totalSeconds > 0 && remainingSeconds > 0 && remainingSeconds / totalSeconds < 0.1;
  const arcColor = isFinished ? '#ffffff' : isWarning ? '#ef4444' : '#f97316';

  // 12/3/6/9時位置（isMajor）は数字ラベルで代替するため目盛りを描画しない
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI;
    if (i % 3 === 0) return null;
    return {
      x1: CX + TICK_OUTER * Math.sin(angle),
      y1: CY - TICK_OUTER * Math.cos(angle),
      x2: CX + TICK_INNER_MINOR * Math.sin(angle),
      y2: CY - TICK_INNER_MINOR * Math.cos(angle),
    };
  }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[];

  return (
    <View testID={isWarning ? 'clock-warning' : 'clock-normal'} style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 300 300">
        <Circle cx={CX} cy={CY} r={148} fill="#0f172a" stroke="#334155" strokeWidth={1} />
        <Circle cx={CX} cy={CY} r={TRACK_RADIUS} fill="none" stroke="#1e293b" strokeWidth={14} />
        {arcPath ? (
          <Path
            d={arcPath}
            fill="none"
            stroke={arcColor}
            strokeWidth={14}
            strokeLinecap="round"
          />
        ) : null}
        {ticks.map((tick, i) => (
          <Line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="#334155"
            strokeWidth={1}
          />
        ))}
        <ClockHand
          remainingRatio={remainingRatio}
          cx={CX}
          cy={CY}
          length={90}
        />
      </Svg>
      <Text style={styles.labelTop}>60</Text>
      <Text style={styles.labelRight}>15</Text>
      <Text style={styles.labelBottom}>30</Text>
      <Text style={styles.labelLeft}>45</Text>
      <Text style={styles.timeText}>{formatTime(remainingSeconds)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    position: 'absolute',
    bottom: 75,
    color: Colors.textSecondary,
    fontSize: FontSize.xl,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  labelTop:    { position: 'absolute', top: 9,   left: 0, right: 0, textAlign: 'center', color: Colors.textDisabled, fontSize: 11 },
  labelRight:  { position: 'absolute', top: 143, right: 7,            color: Colors.textDisabled, fontSize: 11 },
  labelBottom: { position: 'absolute', bottom: 9, left: 0, right: 0, textAlign: 'center', color: Colors.textDisabled, fontSize: 11 },
  labelLeft:   { position: 'absolute', top: 143, left: 7,             color: Colors.textDisabled, fontSize: 11 },
});
