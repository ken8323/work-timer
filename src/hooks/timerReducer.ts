export type TimerMode = 'preset' | 'pomodoro' | 'custom';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';
export type PomodoroPhase = 'work' | 'break' | 'long_break';

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  totalSeconds: number;
  remainingSeconds: number;
  startedAt: number | null;
  remainingAtStart: number;
  pomodoroPhase: PomodoroPhase;
  pomodoroRound: number;
  pomodoroWorkSeconds: number;
  pomodoroBreakSeconds: number;
  pomodoroLongBreakSeconds: number;
}

export type TimerAction =
  | { type: 'SET_MODE'; mode: TimerMode }
  | { type: 'SET_TOTAL_SECONDS'; seconds: number }
  | { type: 'START'; now: number }
  | { type: 'PAUSE'; remainingSeconds: number }
  | { type: 'RESUME'; now: number }
  | { type: 'TICK'; remainingSeconds: number }
  | { type: 'FINISH' }
  | { type: 'RESET' }
  | { type: 'SET_POMODORO_WORK'; seconds: number }
  | { type: 'SET_POMODORO_BREAK'; seconds: number }
  | { type: 'SET_POMODORO_LONG_BREAK'; seconds: number }
  | { type: 'NEXT_POMODORO_PHASE' };

export const initialState: TimerState = {
  mode: 'preset',
  status: 'idle',
  totalSeconds: 1500,
  remainingSeconds: 1500,
  startedAt: null,
  remainingAtStart: 1500,
  pomodoroPhase: 'work',
  pomodoroRound: 1,
  pomodoroWorkSeconds: 1500,
  pomodoroBreakSeconds: 300,
  pomodoroLongBreakSeconds: 900,
};

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'SET_MODE': {
      if (action.mode === 'pomodoro') {
        const phaseSeconds =
          state.pomodoroPhase === 'work' ? state.pomodoroWorkSeconds :
          state.pomodoroPhase === 'break' ? state.pomodoroBreakSeconds :
          state.pomodoroLongBreakSeconds;
        return {
          ...state,
          mode: action.mode,
          status: 'idle',
          totalSeconds: phaseSeconds,
          remainingSeconds: phaseSeconds,
        };
      }
      return { ...state, mode: action.mode, status: 'idle' };
    }

    case 'SET_TOTAL_SECONDS':
      return { ...state, totalSeconds: action.seconds, remainingSeconds: action.seconds };

    case 'START':
      return {
        ...state,
        status: 'running',
        startedAt: action.now,
        remainingAtStart: state.remainingSeconds,
      };

    case 'PAUSE':
      return {
        ...state,
        status: 'paused',
        remainingSeconds: action.remainingSeconds,
        startedAt: null,
      };

    case 'RESUME':
      return {
        ...state,
        status: 'running',
        startedAt: action.now,
        remainingAtStart: state.remainingSeconds,
      };

    case 'TICK':
      return { ...state, remainingSeconds: action.remainingSeconds };

    case 'FINISH':
      return { ...state, status: 'finished', remainingSeconds: 0 };

    case 'RESET':
      return {
        ...state,
        status: 'idle',
        remainingSeconds: state.totalSeconds,
        startedAt: null,
        remainingAtStart: state.totalSeconds,
      };

    case 'SET_POMODORO_WORK':
      if (state.pomodoroPhase === 'work' && state.status === 'idle') {
        return {
          ...state,
          pomodoroWorkSeconds: action.seconds,
          totalSeconds: action.seconds,
          remainingSeconds: action.seconds,
        };
      }
      return { ...state, pomodoroWorkSeconds: action.seconds };

    case 'SET_POMODORO_BREAK':
      if (state.pomodoroPhase === 'break' && state.status === 'idle') {
        return {
          ...state,
          pomodoroBreakSeconds: action.seconds,
          totalSeconds: action.seconds,
          remainingSeconds: action.seconds,
        };
      }
      return { ...state, pomodoroBreakSeconds: action.seconds };

    case 'SET_POMODORO_LONG_BREAK':
      if (state.pomodoroPhase === 'long_break' && state.status === 'idle') {
        return {
          ...state,
          pomodoroLongBreakSeconds: action.seconds,
          totalSeconds: action.seconds,
          remainingSeconds: action.seconds,
        };
      }
      return { ...state, pomodoroLongBreakSeconds: action.seconds };

    case 'NEXT_POMODORO_PHASE': {
      if (state.pomodoroPhase === 'work') {
        const isLongBreak = state.pomodoroRound >= 4;
        const nextPhase: PomodoroPhase = isLongBreak ? 'long_break' : 'break';
        const nextSeconds = isLongBreak
          ? state.pomodoroLongBreakSeconds
          : state.pomodoroBreakSeconds;
        return {
          ...state,
          pomodoroPhase: nextPhase,
          totalSeconds: nextSeconds,
          remainingSeconds: nextSeconds,
          remainingAtStart: nextSeconds,
          status: 'idle',
          startedAt: null,
        };
      }
      // break or long_break → work
      const nextRound =
        state.pomodoroPhase === 'long_break' ? 1 : state.pomodoroRound + 1;
      return {
        ...state,
        pomodoroPhase: 'work',
        pomodoroRound: nextRound,
        totalSeconds: state.pomodoroWorkSeconds,
        remainingSeconds: state.pomodoroWorkSeconds,
        remainingAtStart: state.pomodoroWorkSeconds,
        status: 'idle',
        startedAt: null,
      };
    }

    default:
      return state;
  }
}
