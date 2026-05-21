import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, FontSize } from '../constants/theme';

interface CustomSliderProps {
  seconds: number;
  onChange: (seconds: number) => void;
  disabled: boolean;
}

export function CustomSlider({ seconds, onChange, disabled }: CustomSliderProps) {
  const minutes = Math.round(seconds / 60);

  return (
    <View style={styles.container}>
      <Text style={styles.valueText}>{minutes} 分</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={60}
        step={1}
        value={minutes}
        onValueChange={(v) => !disabled && onChange(v * 60)}
        minimumTrackTintColor={Colors.accent}
        maximumTrackTintColor={Colors.border}
        thumbTintColor={Colors.accent}
        disabled={disabled}
      />
      <View style={styles.labels}>
        <Text style={styles.limitLabel}>1分</Text>
        <Text style={styles.limitLabel}>60分</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg,
  },
  valueText: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '700' },
  slider: { width: '100%', height: 40 },
  labels: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  limitLabel: { color: Colors.textDisabled, fontSize: FontSize.sm },
});
