import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TimerStatus } from '../hooks/timerReducer';
import { Colors, Spacing, FontSize } from '../constants/theme';

interface StartStopButtonProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

type ButtonConfig = { label: string; action: () => void };

export function StartStopButton({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
}: StartStopButtonProps) {
  const config: ButtonConfig = (() => {
    switch (status) {
      case 'running': return {
        label: '一時停止',
        action: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPause(); },
      };
      case 'paused': return {
        label: '再開',
        action: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onResume(); },
      };
      case 'finished': return { label: 'もう一度', action: onReset };
      default: return {
        label: 'スタート',
        action: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onStart(); },
      };
    }
  })();

  const isPrimary = status === 'idle' || status === 'paused' || status === 'finished';

  return (
    <TouchableOpacity
      style={[styles.button, isPrimary ? styles.primaryButton : styles.secondaryButton]}
      onPress={config.action}
      onLongPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); onReset(); }}
      delayLongPress={500}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 200, paddingVertical: Spacing.md, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryButton: { backgroundColor: Colors.accent },
  secondaryButton: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  label: { fontSize: FontSize.lg, fontWeight: '700' },
  primaryLabel: { color: Colors.textPrimary },
  secondaryLabel: { color: Colors.textSecondary },
});
