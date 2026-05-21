import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize } from '../constants/theme';

const PRESET_MINUTES = [15, 25, 30, 45, 60];

interface PresetButtonsProps {
  selectedSeconds: number;
  onSelect: (seconds: number) => void;
  disabled: boolean;
}

export function PresetButtons({ selectedSeconds, onSelect, disabled }: PresetButtonsProps) {
  return (
    <View style={styles.container}>
      {PRESET_MINUTES.map((minutes) => {
        const seconds = minutes * 60;
        const isSelected = selectedSeconds === seconds;
        return (
          <TouchableOpacity
            key={minutes}
            style={[styles.button, isSelected && styles.selectedButton]}
            onPress={() => !disabled && onSelect(seconds)}
            activeOpacity={disabled ? 1 : 0.7}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {minutes}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedButton: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  selectedLabel: {
    color: Colors.accent,
  },
});
