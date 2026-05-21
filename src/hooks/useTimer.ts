import { useReducer, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { timerReducer, initialState, TimerMode } from './timerReducer';
import { playFinishNotification } from '../utils/notification';

const STORAGE_KEY = 'lastPresetSeconds';

export function useTimer() {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifiedRef = useRef(false);

  // タイマードライバー
  useEffect(() => {
    if (state.status === 'running' && state.startedAt !== null) {
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - state.startedAt!;
        const remaining = Math.max(
          0,
          state.remainingAtStart - Math.floor(elapsed / 1000)
        );
        if (remaining === 0) {
          dispatch({ type: 'FINISH' });
        } else {
          dispatch({ type: 'TICK', remainingSeconds: remaining });
        }
      }, 100);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.status, state.startedAt, state.remainingAtStart]);

  // タイマー終了: 通知 + ポモドーロ自動フェーズ移行
  useEffect(() => {
    if (state.status === 'finished' && !notifiedRef.current) {
      notifiedRef.current = true;
      playFinishNotification();
      if (state.mode === 'pomodoro') {
        // 3秒待ってから次フェーズへ自動移行
        const timer = setTimeout(() => {
          dispatch({ type: 'NEXT_POMODORO_PHASE' });
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
    if (state.status !== 'finished') {
      notifiedRef.current = false;
    }
  }, [state.status, state.mode]);

  // 起動時に前回のプリセット選択を復元
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) dispatch({ type: 'SET_TOTAL_SECONDS', seconds: parseInt(val, 10) });
    });
  }, []);

  const start = useCallback(() => {
    dispatch({ type: 'START', now: Date.now() });
  }, []);

  const pause = useCallback(() => {
    const elapsed = state.startedAt ? Date.now() - state.startedAt : 0;
    const remaining = Math.max(
      0,
      state.remainingAtStart - Math.floor(elapsed / 1000)
    );
    dispatch({ type: 'PAUSE', remainingSeconds: remaining });
  }, [state.startedAt, state.remainingAtStart]);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME', now: Date.now() });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setTotalSeconds = useCallback((seconds: number) => {
    dispatch({ type: 'SET_TOTAL_SECONDS', seconds });
  }, []);

  const setMode = useCallback((mode: TimerMode) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const savePreset = useCallback((seconds: number) => {
    AsyncStorage.setItem(STORAGE_KEY, String(seconds));
    dispatch({ type: 'SET_TOTAL_SECONDS', seconds });
  }, []);

  const setPomodoroWork = useCallback((seconds: number) => {
    dispatch({ type: 'SET_POMODORO_WORK', seconds });
  }, []);

  const setPomodoroBreak = useCallback((seconds: number) => {
    dispatch({ type: 'SET_POMODORO_BREAK', seconds });
  }, []);

  const setPomodoroLongBreak = useCallback((seconds: number) => {
    dispatch({ type: 'SET_POMODORO_LONG_BREAK', seconds });
  }, []);

  const nextPomodoroPhase = useCallback(() => {
    dispatch({ type: 'NEXT_POMODORO_PHASE' });
  }, []);

  return {
    state,
    start,
    pause,
    resume,
    reset,
    setTotalSeconds,
    setMode,
    savePreset,
    setPomodoroWork,
    setPomodoroBreak,
    setPomodoroLongBreak,
    nextPomodoroPhase,
  };
}
