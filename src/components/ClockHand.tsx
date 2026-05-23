import React from 'react';
import { G, Line, Circle } from 'react-native-svg';

interface ClockHandProps {
  remainingRatio: number;
  cx: number;
  cy: number;
  length: number;
}

export function ClockHand({ remainingRatio, cx, cy, length }: ClockHandProps) {
  const angle = remainingRatio * 360;

  return (
    <G rotation={angle} originX={cx} originY={cy}>
      <Line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - length}
        stroke="#f8fafc"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Circle cx={cx} cy={cy} r={7} fill="#f97316" />
    </G>
  );
}
