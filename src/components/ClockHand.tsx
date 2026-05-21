import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import { G, Line, Circle } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

interface ClockHandProps {
  remainingRatio: number; // 0.0 (done) → 1.0 (full)
  cx: number;
  cy: number;
  length: number;
}

export function ClockHand({ remainingRatio, cx, cy, length }: ClockHandProps) {
  const rotation = useSharedValue(remainingRatio * 360);

  useEffect(() => {
    rotation.value = withTiming(remainingRatio * 360, { duration: 500 });
  }, [remainingRatio]);

  const animatedProps = useAnimatedProps(() => ({
    rotation: rotation.value,
    originX: cx,
    originY: cy,
  }));

  return (
    <AnimatedG animatedProps={animatedProps}>
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
    </AnimatedG>
  );
}
