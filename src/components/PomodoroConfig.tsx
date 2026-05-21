import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PomodoroPhase } from '../hooks/timerReducer';
import { Colors, Spacing, FontSize } from '../constants/theme';

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  work: '作業',
  break: '休憩',
  long_break: '長休憩',
};

interface TimeAdjusterProps {
  label: string;
  seconds: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled: boolean;
}

function TimeAdjuster({ label, seconds, onIncrease, onDecrease, disabled }: TimeAdjusterProps) {
  const minutes = Math.floor(seconds / 60);
  return (
    <View style={adjStyles.container}>
      <Text style={adjStyles.label}>{label}</Text>
      <View style={adjStyles.row}>
        <TouchableOpacity
          onPress={() => !disabled && onDecrease()}
          activeOpacity={disabled ? 1 : 0.7}
          style={adjStyles.btn}
        >
          <Text style={adjStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={adjStyles.value}>{minutes}</Text>
        <TouchableOpacity
          onPress={() => !disabled && onIncrease()}
          activeOpacity={disabled ? 1 : 0.7}
          style={adjStyles.btn}
        >
          <Text style={adjStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface PomodoroConfigProps {
  phase: PomodoroPhase;
  round: number;
  workSeconds: number;
  breakSeconds: number;
  longBreakSeconds: number;
  onWorkChange: (seconds: number) => void;
  onBreakChange: (seconds: number) => void;
  onLongBreakChange: (seconds: number) => void;
  disabled: boolean;
}

export function PomodoroConfig({
  phase,
  round,
  workSeconds,
  breakSeconds,
  longBreakSeconds,
  onWorkChange,
  onBreakChange,
  onLongBreakChange,
  disabled,
}: PomodoroConfigProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Text style={styles.phaseText}>{PHASE_LABELS[phase]}</Text>
        <Text style={styles.roundText}>{round} / 4</Text>
      </View>
      <View style={styles.adjusters}>
        <TimeAdjuster
          label="作業時間"
          seconds={workSeconds}
          onIncrease={() => onWorkChange(Math.min(workSeconds + 60, 3600))}
          onDecrease={() => onWorkChange(Math.max(workSeconds - 60, 60))}
          disabled={disabled}
        />
        <TimeAdjuster
          label="休憩時間"
          seconds={breakSeconds}
          onIncrease={() => onBreakChange(Math.min(breakSeconds + 60, 3600))}
          onDecrease={() => onBreakChange(Math.max(breakSeconds - 60, 60))}
          disabled={disabled}
        />
        <TimeAdjuster
          label="長休憩時間"
          seconds={longBreakSeconds}
          onIncrease={() => onLongBreakChange(Math.min(longBreakSeconds + 60, 3600))}
          onDecrease={() => onLongBreakChange(Math.max(longBreakSeconds - 60, 60))}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  phaseText: { color: Colors.accent, fontSize: FontSize.lg, fontWeight: '700' },
  roundText: { color: Colors.textSecondary, fontSize: FontSize.md },
  adjusters: { flexDirection: 'row', gap: Spacing.xl },
});

const adjStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.xs },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  btn: {
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, borderRadius: 16,
  },
  btnText: { color: Colors.textPrimary, fontSize: FontSize.lg },
  value: {
    color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '600',
    minWidth: 28, textAlign: 'center',
  },
});
