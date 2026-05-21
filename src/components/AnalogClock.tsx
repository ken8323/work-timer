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
  const remainingRatio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const arcPath = buildArcPath(remainingRatio, CX, CY, TRACK_RADIUS);
  const arcColor = isFinished ? '#ffffff' : '#f97316';

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const isMajor = i % 3 === 0;
    const inner = isMajor ? TICK_INNER_MAJOR : TICK_INNER_MINOR;
    return {
      x1: CX + TICK_OUTER * Math.sin(angle),
      y1: CY - TICK_OUTER * Math.cos(angle),
      x2: CX + inner * Math.sin(angle),
      y2: CY - inner * Math.cos(angle),
      isMajor,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
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
            stroke={tick.isMajor ? '#475569' : '#334155'}
            strokeWidth={tick.isMajor ? 2 : 1}
          />
        ))}
        <ClockHand
          remainingRatio={remainingRatio}
          cx={CX}
          cy={CY}
          length={90}
        />
      </Svg>
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
    bottom: 55,
    color: Colors.textSecondary,
    fontSize: FontSize.xl,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
});
