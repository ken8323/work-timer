import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTimer } from '../hooks/useTimer';
import { AnalogClock } from '../components/AnalogClock';
import { ModeTabBar } from '../components/ModeTabBar';
import { PresetButtons } from '../components/PresetButtons';
import { PomodoroConfig } from '../components/PomodoroConfig';
import { CustomSlider } from '../components/CustomSlider';
import { StartStopButton } from '../components/StartStopButton';
import { Colors, Spacing } from '../constants/theme';

export function TimerScreen() {
  const {
    state,
    start,
    pause,
    resume,
    reset,
    setMode,
    savePreset,
    setTotalSeconds,
    setPomodoroWork,
    setPomodoroBreak,
    setPomodoroLongBreak,
  } = useTimer();

  const isLocked = state.status === 'running';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.container}>
        <View style={styles.clockSection}>
          <AnalogClock
            totalSeconds={state.totalSeconds}
            remainingSeconds={state.remainingSeconds}
            isFinished={state.status === 'finished'}
            size={300}
          />
        </View>

        <View style={styles.controlSection}>
          {state.mode === 'preset' && (
            <PresetButtons
              selectedSeconds={state.totalSeconds}
              onSelect={savePreset}
              disabled={isLocked}
            />
          )}
          {state.mode === 'pomodoro' && (
            <PomodoroConfig
              phase={state.pomodoroPhase}
              round={state.pomodoroRound}
              workSeconds={state.pomodoroWorkSeconds}
              breakSeconds={state.pomodoroBreakSeconds}
              longBreakSeconds={state.pomodoroLongBreakSeconds}
              onWorkChange={setPomodoroWork}
              onBreakChange={setPomodoroBreak}
              onLongBreakChange={setPomodoroLongBreak}
              disabled={isLocked}
            />
          )}
          {state.mode === 'custom' && (
            <CustomSlider
              seconds={state.totalSeconds}
              onChange={setTotalSeconds}
              disabled={isLocked}
            />
          )}
        </View>

        <View style={styles.buttonSection}>
          <StartStopButton
            status={state.status}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
          />
        </View>

        <View style={styles.tabSection}>
          <ModeTabBar
            activeMode={state.mode}
            onModeChange={setMode}
            disabled={isLocked}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  clockSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlSection: {
    width: '100%',
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  buttonSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  tabSection: {
    width: '100%',
  },
});
