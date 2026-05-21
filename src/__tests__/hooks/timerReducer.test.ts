import { timerReducer, initialState, TimerState } from '../../hooks/timerReducer';

describe('timerReducer', () => {
  describe('SET_MODE', () => {
    it('モードを切り替える', () => {
      const state = timerReducer(initialState, { type: 'SET_MODE', mode: 'pomodoro' });
      expect(state.mode).toBe('pomodoro');
    });

    it('モード切替時にstatusをidleにリセットする', () => {
      const running: TimerState = { ...initialState, status: 'running' };
      const state = timerReducer(running, { type: 'SET_MODE', mode: 'custom' });
      expect(state.status).toBe('idle');
    });
  });

  describe('SET_TOTAL_SECONDS', () => {
    it('totalSecondsとremainingSecondsを更新する', () => {
      const state = timerReducer(initialState, { type: 'SET_TOTAL_SECONDS', seconds: 1800 });
      expect(state.totalSeconds).toBe(1800);
      expect(state.remainingSeconds).toBe(1800);
    });
  });

  describe('START', () => {
    it('statusをrunningにしstartedAtを設定する', () => {
      const withTime = timerReducer(initialState, { type: 'SET_TOTAL_SECONDS', seconds: 1500 });
      const state = timerReducer(withTime, { type: 'START', now: 1000000 });
      expect(state.status).toBe('running');
      expect(state.startedAt).toBe(1000000);
      expect(state.remainingAtStart).toBe(1500);
    });
  });

  describe('PAUSE', () => {
    it('statusをpausedにしremainingSecondsを保存する', () => {
      const running: TimerState = {
        ...initialState,
        status: 'running',
        totalSeconds: 1500,
        remainingSeconds: 900,
        startedAt: 1000000,
      };
      const state = timerReducer(running, { type: 'PAUSE', remainingSeconds: 880 });
      expect(state.status).toBe('paused');
      expect(state.remainingSeconds).toBe(880);
      expect(state.startedAt).toBeNull();
    });
  });

  describe('RESUME', () => {
    it('statusをrunningに戻しstartedAtをリセットする', () => {
      const paused: TimerState = {
        ...initialState,
        status: 'paused',
        remainingSeconds: 880,
      };
      const state = timerReducer(paused, { type: 'RESUME', now: 2000000 });
      expect(state.status).toBe('running');
      expect(state.startedAt).toBe(2000000);
      expect(state.remainingAtStart).toBe(880);
    });
  });

  describe('TICK', () => {
    it('remainingSecondsを更新する', () => {
      const running: TimerState = { ...initialState, status: 'running', remainingSeconds: 100 };
      const state = timerReducer(running, { type: 'TICK', remainingSeconds: 99 });
      expect(state.remainingSeconds).toBe(99);
    });
  });

  describe('FINISH', () => {
    it('statusをfinishedにする', () => {
      const state = timerReducer(initialState, { type: 'FINISH' });
      expect(state.status).toBe('finished');
      expect(state.remainingSeconds).toBe(0);
    });
  });

  describe('RESET', () => {
    it('remainingSecondsをtotalSecondsに戻しstatusをidleにする', () => {
      const finished: TimerState = {
        ...initialState,
        status: 'finished',
        totalSeconds: 1500,
        remainingSeconds: 0,
      };
      const state = timerReducer(finished, { type: 'RESET' });
      expect(state.status).toBe('idle');
      expect(state.remainingSeconds).toBe(1500);
      expect(state.startedAt).toBeNull();
    });
  });

  describe('NEXT_POMODORO_PHASE', () => {
    it('workからbreakに進む', () => {
      const workState: TimerState = {
        ...initialState,
        mode: 'pomodoro',
        pomodoroPhase: 'work',
        pomodoroRound: 1,
        pomodoroWorkSeconds: 1500,
        pomodoroBreakSeconds: 300,
        pomodoroLongBreakSeconds: 900,
      };
      const state = timerReducer(workState, { type: 'NEXT_POMODORO_PHASE' });
      expect(state.pomodoroPhase).toBe('break');
      expect(state.totalSeconds).toBe(300);
      expect(state.remainingSeconds).toBe(300);
    });

    it('4回目のworkの後にlong_breakに進む', () => {
      const workState: TimerState = {
        ...initialState,
        mode: 'pomodoro',
        pomodoroPhase: 'work',
        pomodoroRound: 4,
        pomodoroWorkSeconds: 1500,
        pomodoroBreakSeconds: 300,
        pomodoroLongBreakSeconds: 900,
      };
      const state = timerReducer(workState, { type: 'NEXT_POMODORO_PHASE' });
      expect(state.pomodoroPhase).toBe('long_break');
      expect(state.totalSeconds).toBe(900);
    });

    it('breakからworkに進みroundを増やす', () => {
      const breakState: TimerState = {
        ...initialState,
        mode: 'pomodoro',
        pomodoroPhase: 'break',
        pomodoroRound: 2,
        pomodoroWorkSeconds: 1500,
        pomodoroBreakSeconds: 300,
        pomodoroLongBreakSeconds: 900,
      };
      const state = timerReducer(breakState, { type: 'NEXT_POMODORO_PHASE' });
      expect(state.pomodoroPhase).toBe('work');
      expect(state.pomodoroRound).toBe(3);
      expect(state.totalSeconds).toBe(1500);
    });

    it('long_breakからworkに進みroundを1にリセットする', () => {
      const longBreakState: TimerState = {
        ...initialState,
        mode: 'pomodoro',
        pomodoroPhase: 'long_break',
        pomodoroRound: 4,
        pomodoroWorkSeconds: 1500,
        pomodoroBreakSeconds: 300,
        pomodoroLongBreakSeconds: 900,
      };
      const state = timerReducer(longBreakState, { type: 'NEXT_POMODORO_PHASE' });
      expect(state.pomodoroPhase).toBe('work');
      expect(state.pomodoroRound).toBe(1);
    });
  });
});
