import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TimerMode } from '../hooks/timerReducer';
import { Colors, Spacing, FontSize } from '../constants/theme';

const TABS: { mode: TimerMode; label: string }[] = [
  { mode: 'preset', label: 'プリセット' },
  { mode: 'pomodoro', label: 'ポモドーロ' },
  { mode: 'custom', label: 'カスタム' },
];

interface ModeTabBarProps {
  activeMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  disabled: boolean;
}

export function ModeTabBar({ activeMode, onModeChange, disabled }: ModeTabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map(({ mode, label }) => (
        <TouchableOpacity
          key={mode}
          style={[styles.tab, activeMode === mode && styles.activeTab]}
          onPress={() => !disabled && onModeChange(mode)}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Text
            style={[
              styles.label,
              activeMode === mode ? styles.activeLabel : styles.inactiveLabel,
              disabled && styles.disabledLabel,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.border,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  activeLabel: {
    color: Colors.textPrimary,
  },
  inactiveLabel: {
    color: Colors.textSecondary,
  },
  disabledLabel: {
    color: Colors.textDisabled,
  },
});
