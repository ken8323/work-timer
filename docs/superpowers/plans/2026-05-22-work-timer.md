# Work Timer App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** スマートフォン専用のアナログタイマーアプリをReact Native / Expoで構築する。プリセット・ポモドーロ・カスタムの3モード、音とバイブの通知付き。

**Architecture:** シングル画面構成。`useReducer`ベースのタイマーフックで全状態を管理。`AnalogClock`コンポーネントがSVGカウントダウンアークとReanimated針を描画。モード切替は画面下タブで行いサブコンポーネントを差し替える。

**Tech Stack:** React Native, Expo (managed workflow, Expo Go対応), TypeScript, react-native-svg, react-native-reanimated, expo-av, expo-haptics, @react-native-async-storage/async-storage, Jest + @testing-library/react-native

---

## File Map

| ファイル | 責務 |
|---------|------|
| `src/constants/theme.ts` | カラーパレット・スペーシング定数 |
| `src/utils/notification.ts` | 音・バイブのユーティリティ |
| `src/hooks/timerReducer.ts` | タイマー用の純粋reducer + 型定義 |
| `src/hooks/useTimer.ts` | setIntervalドライバー・dispatch配線・AsyncStorage |
| `src/components/ClockHand.tsx` | Reanimatedで回転する針 |
| `src/components/AnalogClock.tsx` | SVG時計文字盤・アーク・ClockHand統合 |
| `src/components/ModeTabBar.tsx` | プリセット/ポモドーロ/カスタム タブ |
| `src/components/PresetButtons.tsx` | 15/25/30/45/60分プリセットボタン |
| `src/components/PomodoroConfig.tsx` | ポモドーロフェーズ表示・ラウンド数・時間設定 |
| `src/components/CustomSlider.tsx` | 1〜60分スライダー |
| `src/components/StartStopButton.tsx` | スタート/一時停止/リセット(長押し)ボタン |
| `src/screens/TimerScreen.tsx` | 全コンポーネントの配線・useTimer接続 |
| `App.tsx` | SafeAreaProvider・背景色 |
| `assets/alarm.mp3` | アラーム音声ファイル（ユーザー準備） |

---

### Task 1: プロジェクトセットアップ

**Files:**
- Create: `babel.config.js` (修正)
- Create: `jest-setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Expoプロジェクトを作成**

```bash
cd /Users/kenichi/Desktop/project
npx create-expo-app work_timer --template blank-typescript
cd work_timer
```

Expected: `work_timer/` ディレクトリが作成され `App.tsx` が存在する

- [ ] **Step 2: 依存パッケージをインストール**

```bash
npx expo install react-native-svg react-native-reanimated expo-av expo-haptics
npm install @react-native-async-storage/async-storage
npm install --save-dev @testing-library/react-native @types/react-test-renderer
```

Expected: `node_modules/` に各パッケージが追加される

- [ ] **Step 3: babel.config.js にReanimatedプラグインを追加**

`babel.config.js` を以下に更新する（react-native-reanimatedはbabelプラグインが必須）:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

- [ ] **Step 4: Jestセットアップファイルを作成**

`jest-setup.ts` を作成:

```typescript
import '@testing-library/react-native/extend-expect';

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn().mockResolvedValue(undefined),
          unloadAsync: jest.fn().mockResolvedValue(undefined),
        },
      }),
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));
```

- [ ] **Step 5: package.json の Jest 設定を更新**

`package.json` の `"jest"` フィールドを以下に置き換える:

```json
"jest": {
  "preset": "jest-expo",
  "setupFilesAfterFramework": ["./jest-setup.ts"],
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|react-native-svg|react-native-reanimated)"
  ]
}
```

- [ ] **Step 6: src/ ディレクトリ構造を作成**

```bash
mkdir -p src/constants src/utils src/hooks src/components src/screens
```

- [ ] **Step 7: アラーム音声ファイルをassetsに配置**

任意の短い `.mp3` ファイル（アラーム音）を `assets/alarm.mp3` として配置する。
フリー素材サイト（freesound.org等）からダウンロードするか、既存の音声ファイルを使用すること。

- [ ] **Step 8: Jestが動作することを確認**

```bash
npm test -- --passWithNoTests
```

Expected: `Test Suites: 0 passed` など、エラーなく終了する

- [ ] **Step 9: コミット**

```bash
git init
git add .
git commit -m "feat: initialize Expo project with dependencies and Jest config"
```

---

### Task 2: テーマ定数

**Files:**
- Create: `src/constants/theme.ts`

- [ ] **Step 1: テーマファイルを作成**

```typescript
// src/constants/theme.ts
export const Colors = {
  background: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  accent: '#f97316',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textDisabled: '#475569',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FontSize = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  timer: 36,
} as const;
```

- [ ] **Step 2: コミット**

```bash
git add src/constants/theme.ts
git commit -m "feat: add theme constants"
```

---

### Task 3: 通知ユーティリティ (TDD)

**Files:**
- Create: `src/utils/notification.ts`
- Test: `src/__tests__/utils/notification.test.ts`

- [ ] **Step 1: テストディレクトリを作成しテストを書く**

```bash
mkdir -p src/__tests__/utils
```

`src/__tests__/utils/notification.test.ts`:

```typescript
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { playFinishNotification } from '../../utils/notification';

describe('playFinishNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hapticを呼び出す', async () => {
    await playFinishNotification();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });

  it('音声を再生する', async () => {
    await playFinishNotification();
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
  });

  it('音声ファイルロード失敗時もクラッシュしない', async () => {
    (Audio.Sound.createAsync as jest.Mock).mockRejectedValueOnce(
      new Error('file not found')
    );
    await expect(playFinishNotification()).resolves.not.toThrow();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- notification.test
```

Expected: FAIL — `Cannot find module '../../utils/notification'`

- [ ] **Step 3: 実装を作成**

`src/utils/notification.ts`:

```typescript
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

export async function playFinishNotification(): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/alarm.mp3')
    );
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync(), 5000);
  } catch {
    // 音声ファイルが存在しない場合でもバイブのみ動作させる
  }
}
```

- [ ] **Step 4: テストがパスすることを確認**

```bash
npm test -- notification.test
```

Expected: PASS (3 tests)

- [ ] **Step 5: コミット**

```bash
git add src/utils/notification.ts src/__tests__/utils/notification.test.ts
git commit -m "feat: add finish notification utility"
```

---

### Task 4: タイマーReducer (TDD)

**Files:**
- Create: `src/hooks/timerReducer.ts`
- Test: `src/__tests__/hooks/timerReducer.test.ts`

- [ ] **Step 1: テストを書く**

```bash
mkdir -p src/__tests__/hooks
```

`src/__tests__/hooks/timerReducer.test.ts`:

```typescript
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
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- timerReducer.test
```

Expected: FAIL — `Cannot find module '../../hooks/timerReducer'`

- [ ] **Step 3: 実装を作成**

`src/hooks/timerReducer.ts`:

```typescript
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
    case 'SET_MODE':
      return { ...state, mode: action.mode, status: 'idle' };

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
      return { ...state, pomodoroWorkSeconds: action.seconds };

    case 'SET_POMODORO_BREAK':
      return { ...state, pomodoroBreakSeconds: action.seconds };

    case 'SET_POMODORO_LONG_BREAK':
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
```

- [ ] **Step 4: テストがパスすることを確認**

```bash
npm test -- timerReducer.test
```

Expected: PASS (12 tests)

- [ ] **Step 5: コミット**

```bash
git add src/hooks/timerReducer.ts src/__tests__/hooks/timerReducer.test.ts
git commit -m "feat: add timer reducer with all state transitions"
```

---

### Task 5: useTimer フック

**Files:**
- Create: `src/hooks/useTimer.ts`
- Test: `src/__tests__/hooks/useTimer.test.ts`

- [ ] **Step 1: テストを書く**

`src/__tests__/hooks/useTimer.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useTimer } from '../../hooks/useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('初期状態はidleでremainingSecondsはtotalSecondsと同じ', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.remainingSeconds).toBe(result.current.state.totalSeconds);
  });

  it('setTotalSecondsでtotalSecondsとremainingSecondsが更新される', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(1800));
    expect(result.current.state.totalSeconds).toBe(1800);
    expect(result.current.state.remainingSeconds).toBe(1800);
  });

  it('startでstatusがrunningになる', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(60));
    act(() => result.current.start());
    expect(result.current.state.status).toBe('running');
  });

  it('1秒経過後にremainingSecondsが1減る', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(60));
    act(() => result.current.start());
    act(() => {
      jest.setSystemTime(1000);
      jest.advanceTimersByTime(100);
    });
    expect(result.current.state.remainingSeconds).toBe(59);
  });

  it('pauseでstatusがpausedになる', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(60));
    act(() => result.current.start());
    act(() => result.current.pause());
    expect(result.current.state.status).toBe('paused');
  });

  it('resetでstatusがidleに戻りremainingSecondsが復元される', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(60));
    act(() => result.current.start());
    act(() => result.current.reset());
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.remainingSeconds).toBe(60);
  });

  it('remainingSecondsが0になるとstatusがfinishedになる', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(1));
    act(() => result.current.start());
    act(() => {
      jest.setSystemTime(1100);
      jest.advanceTimersByTime(200);
    });
    expect(result.current.state.status).toBe('finished');
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- useTimer.test
```

Expected: FAIL — `Cannot find module '../../hooks/useTimer'`

- [ ] **Step 3: 実装を作成**

`src/hooks/useTimer.ts`:

```typescript
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
```

- [ ] **Step 4: テストがパスすることを確認**

```bash
npm test -- useTimer.test
```

Expected: PASS (7 tests)

- [ ] **Step 5: コミット**

```bash
git add src/hooks/useTimer.ts src/__tests__/hooks/useTimer.test.ts
git commit -m "feat: add useTimer hook with interval driver and AsyncStorage"
```

---

### Task 6: AnalogClock コンポーネント

**Files:**
- Create: `src/components/ClockHand.tsx`
- Create: `src/components/AnalogClock.tsx`
- Test: `src/__tests__/components/AnalogClock.test.tsx`

- [ ] **Step 1: テストを書く**

```bash
mkdir -p src/__tests__/components
```

`src/__tests__/components/AnalogClock.test.tsx`:

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { AnalogClock } from '../../components/AnalogClock';

describe('AnalogClock', () => {
  it('残り時間テキストを表示する', () => {
    const { getByText } = render(
      <AnalogClock totalSeconds={1500} remainingSeconds={750} />
    );
    expect(getByText('12:30')).toBeTruthy();
  });

  it('0秒のとき00:00を表示する', () => {
    const { getByText } = render(
      <AnalogClock totalSeconds={1500} remainingSeconds={0} />
    );
    expect(getByText('00:00')).toBeTruthy();
  });

  it('59秒のとき00:59を表示する', () => {
    const { getByText } = render(
      <AnalogClock totalSeconds={60} remainingSeconds={59} />
    );
    expect(getByText('00:59')).toBeTruthy();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- AnalogClock.test
```

Expected: FAIL

- [ ] **Step 3: ClockHand コンポーネントを作成**

`src/components/ClockHand.tsx`:

```typescript
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
```

- [ ] **Step 4: AnalogClock コンポーネントを作成**

`src/components/AnalogClock.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { ClockHand } from './ClockHand';
import { Colors, FontSize } from '../constants/theme';

const CX = 150;
const CY = 150;
const TRACK_RADIUS = 110;
const TICK_OUTER = 140;
const TICK_INNER_MAJOR = 128;
const TICK_INNER_MINOR = 133;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function buildArcPath(remainingRatio: number, cx: number, cy: number, r: number): string {
  if (remainingRatio <= 0) return '';
  if (remainingRatio >= 0.9999) {
    // SVGは完全な円をパスで表せないため2つの半円で表現
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
  }
  const angle = remainingRatio * 2 * Math.PI;
  const endX = cx + r * Math.sin(angle);
  const endY = cy - r * Math.cos(angle);
  const largeArc = angle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`;
}

interface AnalogClockProps {
  totalSeconds: number;
  remainingSeconds: number;
  isFinished?: boolean;
  size?: number;
}

export function AnalogClock({ totalSeconds, remainingSeconds, isFinished = false, size = 300 }: AnalogClockProps) {
  const remainingRatio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const arcPath = buildArcPath(remainingRatio, CX, CY, TRACK_RADIUS);
  const arcColor = isFinished ? '#ffffff' : '#f97316';

  // 12分割の目盛り(5分ごと)
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const isMajor = i % 3 === 0;
    const inner = isMajor ? TICK_INNER_MAJOR : TICK_INNER_MINOR;
    return {
      x1: CX + TICK_OUTER * Math.sin(angle),
      y1: CY - TICK_OUTER * Math.cos(angle),
      x2: CX + inner * Math.sin(angle),
      y2: CY - inner * Math.cos(angle),
      isMajor,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 300 300">
        {/* 背景サークル */}
        <Circle cx={CX} cy={CY} r={148} fill="#0f172a" stroke="#334155" strokeWidth={1} />
        {/* トラック */}
        <Circle cx={CX} cy={CY} r={TRACK_RADIUS} fill="none" stroke="#1e293b" strokeWidth={14} />
        {/* 残り時間アーク（finished時は白色） */}
        {arcPath ? (
          <Path
            d={arcPath}
            fill="none"
            stroke={arcColor}
            strokeWidth={14}
            strokeLinecap="round"
          />
        ) : null}
        {/* 目盛り */}
        {ticks.map((tick, i) => (
          <Line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.isMajor ? '#475569' : '#334155'}
            strokeWidth={tick.isMajor ? 2 : 1}
          />
        ))}
        {/* 針 */}
        <ClockHand
          remainingRatio={remainingRatio}
          cx={CX}
          cy={CY}
          length={90}
        />
      </Svg>
      {/* 残り時間テキスト */}
      <Text style={styles.timeText}>{formatTime(remainingSeconds)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    position: 'absolute',
    bottom: 55,
    color: Colors.textSecondary,
    fontSize: FontSize.xl,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
});
```

- [ ] **Step 5: テストがパスすることを確認**

```bash
npm test -- AnalogClock.test
```

Expected: PASS (3 tests)

- [ ] **Step 6: コミット**

```bash
git add src/components/ClockHand.tsx src/components/AnalogClock.tsx src/__tests__/components/AnalogClock.test.tsx
git commit -m "feat: add AnalogClock with animated needle and countdown arc"
```

---

### Task 7: ModeTabBar コンポーネント

**Files:**
- Create: `src/components/ModeTabBar.tsx`
- Test: `src/__tests__/components/ModeTabBar.test.tsx`

- [ ] **Step 1: テストを書く**

`src/__tests__/components/ModeTabBar.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ModeTabBar } from '../../components/ModeTabBar';

describe('ModeTabBar', () => {
  it('3つのタブを表示する', () => {
    const { getByText } = render(
      <ModeTabBar activeMode="preset" onModeChange={jest.fn()} disabled={false} />
    );
    expect(getByText('プリセット')).toBeTruthy();
    expect(getByText('ポモドーロ')).toBeTruthy();
    expect(getByText('カスタム')).toBeTruthy();
  });

  it('タブをタップするとonModeChangeが呼ばれる', () => {
    const onModeChange = jest.fn();
    const { getByText } = render(
      <ModeTabBar activeMode="preset" onModeChange={onModeChange} disabled={false} />
    );
    fireEvent.press(getByText('ポモドーロ'));
    expect(onModeChange).toHaveBeenCalledWith('pomodoro');
  });

  it('disabled=trueのときタップしても反応しない', () => {
    const onModeChange = jest.fn();
    const { getByText } = render(
      <ModeTabBar activeMode="preset" onModeChange={onModeChange} disabled={true} />
    );
    fireEvent.press(getByText('ポモドーロ'));
    expect(onModeChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- ModeTabBar.test
```

Expected: FAIL

- [ ] **Step 3: 実装を作成**

`src/components/ModeTabBar.tsx`:

```typescript
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
```

- [ ] **Step 4: テストがパスすることを確認**

```bash
npm test -- ModeTabBar.test
```

Expected: PASS (3 tests)

- [ ] **Step 5: コミット**

```bash
git add src/components/ModeTabBar.tsx src/__tests__/components/ModeTabBar.test.tsx
git commit -m "feat: add ModeTabBar component"
```

---

### Task 8: PresetButtons コンポーネント

**Files:**
- Create: `src/components/PresetButtons.tsx`
- Test: `src/__tests__/components/PresetButtons.test.tsx`

- [ ] **Step 1: テストを書く**

`src/__tests__/components/PresetButtons.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PresetButtons } from '../../components/PresetButtons';

describe('PresetButtons', () => {
  const PRESETS = [15, 25, 30, 45, 60];

  it('5つのプリセットボタンを表示する', () => {
    const { getByText } = render(
      <PresetButtons selectedSeconds={1500} onSelect={jest.fn()} disabled={false} />
    );
    PRESETS.forEach((m) => expect(getByText(String(m))).toBeTruthy());
  });

  it('選択中のプリセットにはアクセントスタイルが適用される（30分 = 1800秒）', () => {
    const { getByText } = render(
      <PresetButtons selectedSeconds={1800} onSelect={jest.fn()} disabled={false} />
    );
    // 30ボタンが存在する
    expect(getByText('30')).toBeTruthy();
  });

  it('ボタンをタップするとonSelectが分×60で呼ばれる', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <PresetButtons selectedSeconds={1500} onSelect={onSelect} disabled={false} />
    );
    fireEvent.press(getByText('30'));
    expect(onSelect).toHaveBeenCalledWith(1800);
  });

  it('disabled=trueのとき選択できない', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <PresetButtons selectedSeconds={1500} onSelect={onSelect} disabled={true} />
    );
    fireEvent.press(getByText('30'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- PresetButtons.test
```

Expected: FAIL

- [ ] **Step 3: 実装を作成**

`src/components/PresetButtons.tsx`:

```typescript
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
```

- [ ] **Step 4: テストがパスすることを確認**

```bash
npm test -- PresetButtons.test
```

Expected: PASS (4 tests)

- [ ] **Step 5: コミット**

```bash
git add src/components/PresetButtons.tsx src/__tests__/components/PresetButtons.test.tsx
git commit -m "feat: add PresetButtons component"
```

---

### Task 9: PomodoroConfig コンポーネント

**Files:**
- Create: `src/components/PomodoroConfig.tsx`
- Test: `src/__tests__/components/PomodoroConfig.test.tsx`

- [ ] **Step 1: テストを書く**

`src/__tests__/components/PomodoroConfig.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PomodoroConfig } from '../../components/PomodoroConfig';

const defaultProps = {
  phase: 'work' as const,
  round: 2,
  workSeconds: 1500,
  breakSeconds: 300,
  longBreakSeconds: 900,
  onWorkChange: jest.fn(),
  onBreakChange: jest.fn(),
  onLongBreakChange: jest.fn(),
  disabled: false,
};

describe('PomodoroConfig', () => {
  it('現在のフェーズを表示する', () => {
    const { getByText } = render(<PomodoroConfig {...defaultProps} />);
    expect(getByText('作業')).toBeTruthy();
  });

  it('ラウンド数を表示する（2/4）', () => {
    const { getByText } = render(<PomodoroConfig {...defaultProps} />);
    expect(getByText('2 / 4')).toBeTruthy();
  });

  it('作業時間を分単位で表示する（1500秒 = 25分）', () => {
    const { getAllByText } = render(<PomodoroConfig {...defaultProps} />);
    expect(getAllByText('25').length).toBeGreaterThan(0);
  });

  it('作業時間の+ボタンでonWorkChangeが呼ばれる', () => {
    const onWorkChange = jest.fn();
    const { getAllByText } = render(
      <PomodoroConfig {...defaultProps} onWorkChange={onWorkChange} />
    );
    // 最初の+ボタンが作業時間の+
    fireEvent.press(getAllByText('+')[0]);
    expect(onWorkChange).toHaveBeenCalledWith(1560); // 1500 + 60
  });

  it('disabled=trueのとき変更できない', () => {
    const onWorkChange = jest.fn();
    const { getAllByText } = render(
      <PomodoroConfig {...defaultProps} onWorkChange={onWorkChange} disabled={true} />
    );
    fireEvent.press(getAllByText('+')[0]);
    expect(onWorkChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- PomodoroConfig.test
```

Expected: FAIL

- [ ] **Step 3: 実装を作成**

`src/components/PomodoroConfig.tsx`:

```typescript
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
          label="作業"
          seconds={workSeconds}
          onIncrease={() => onWorkChange(Math.min(workSeconds + 60, 3600))}
          onDecrease={() => onWorkChange(Math.max(workSeconds - 60, 60))}
          disabled={disabled}
        />
        <TimeAdjuster
          label="休憩"
          seconds={breakSeconds}
          onIncrease={() => onBreakChange(Math.min(breakSeconds + 60, 3600))}
          onDecrease={() => onBreakChange(Math.max(breakSeconds - 60, 60))}
          disabled={disabled}
        />
        <TimeAdjuster
          label="長休憩"
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  phaseText: {
    color: Colors.accent,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  roundText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  adjusters: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
});

const adjStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.xs },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  btn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  btnText: { color: Colors.textPrimary, fontSize: FontSize.lg },
  value: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'center',
  },
});
```

- [ ] **Step 4: テストがパスすることを確認**

```bash
npm test -- PomodoroConfig.test
```

Expected: PASS (5 tests)

- [ ] **Step 5: コミット**

```bash
git add src/components/PomodoroConfig.tsx src/__tests__/components/PomodoroConfig.test.tsx
git commit -m "feat: add PomodoroConfig component"
```

---

### Task 10: CustomSlider コンポーネント

**Files:**
- Create: `src/components/CustomSlider.tsx`
- Test: `src/__tests__/components/CustomSlider.test.tsx`

- [ ] **Step 1: テストを書く**

`src/__tests__/components/CustomSlider.test.tsx`:

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { CustomSlider } from '../../components/CustomSlider';

describe('CustomSlider', () => {
  it('現在の分数を表示する（1800秒 = 30分）', () => {
    const { getByText } = render(
      <CustomSlider seconds={1800} onChange={jest.fn()} disabled={false} />
    );
    expect(getByText('30 分')).toBeTruthy();
  });

  it('1秒のとき1分と表示する（切り上げ）', () => {
    const { getByText } = render(
      <CustomSlider seconds={60} onChange={jest.fn()} disabled={false} />
    );
    expect(getByText('1 分')).toBeTruthy();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- CustomSlider.test
```

Expected: FAIL

- [ ] **Step 3: 実装を作成**

```bash
npx expo install @react-native-community/slider
```

`src/components/CustomSlider.tsx`:

```typescript
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
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  valueText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  limitLabel: {
    color: Colors.textDisabled,
    fontSize: FontSize.sm,
  },
});
```

- [ ] **Step 4: テストがパスすることを確認**

```bash
npm test -- CustomSlider.test
```

Expected: PASS (2 tests)

- [ ] **Step 5: コミット**

```bash
git add src/components/CustomSlider.tsx src/__tests__/components/CustomSlider.test.tsx
git commit -m "feat: add CustomSlider component"
```

---

### Task 11: StartStopButton コンポーネント

**Files:**
- Create: `src/components/StartStopButton.tsx`
- Test: `src/__tests__/components/StartStopButton.test.tsx`

- [ ] **Step 1: テストを書く**

`src/__tests__/components/StartStopButton.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StartStopButton } from '../../components/StartStopButton';

describe('StartStopButton', () => {
  it('idle状態でスタートテキストを表示する', () => {
    const { getByText } = render(
      <StartStopButton status="idle" onStart={jest.fn()} onPause={jest.fn()} onResume={jest.fn()} onReset={jest.fn()} />
    );
    expect(getByText('スタート')).toBeTruthy();
  });

  it('running状態で一時停止テキストを表示する', () => {
    const { getByText } = render(
      <StartStopButton status="running" onStart={jest.fn()} onPause={jest.fn()} onResume={jest.fn()} onReset={jest.fn()} />
    );
    expect(getByText('一時停止')).toBeTruthy();
  });

  it('paused状態で再開テキストを表示する', () => {
    const { getByText } = render(
      <StartStopButton status="paused" onStart={jest.fn()} onPause={jest.fn()} onResume={jest.fn()} onReset={jest.fn()} />
    );
    expect(getByText('再開')).toBeTruthy();
  });

  it('finished状態でもう一度テキストを表示する', () => {
    const { getByText } = render(
      <StartStopButton status="finished" onStart={jest.fn()} onPause={jest.fn()} onResume={jest.fn()} onReset={jest.fn()} />
    );
    expect(getByText('もう一度')).toBeTruthy();
  });

  it('idle時にタップするとonStartが呼ばれる', () => {
    const onStart = jest.fn();
    const { getByText } = render(
      <StartStopButton status="idle" onStart={onStart} onPause={jest.fn()} onResume={jest.fn()} onReset={jest.fn()} />
    );
    fireEvent.press(getByText('スタート'));
    expect(onStart).toHaveBeenCalled();
  });

  it('running時にタップするとonPauseが呼ばれる', () => {
    const onPause = jest.fn();
    const { getByText } = render(
      <StartStopButton status="running" onStart={jest.fn()} onPause={onPause} onResume={jest.fn()} onReset={jest.fn()} />
    );
    fireEvent.press(getByText('一時停止'));
    expect(onPause).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- StartStopButton.test
```

Expected: FAIL

- [ ] **Step 3: 実装を作成**

`src/components/StartStopButton.tsx`:

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
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
      case 'running': return { label: '一時停止', action: onPause };
      case 'paused':  return { label: '再開',     action: onResume };
      case 'finished':return { label: 'もう一度', action: onReset };
      default:        return { label: 'スタート', action: onStart };
    }
  })();

  const isPrimary = status === 'idle' || status === 'paused' || status === 'finished';

  return (
    <TouchableOpacity
      style={[styles.button, isPrimary ? styles.primaryButton : styles.secondaryButton]}
      onPress={config.action}
      onLongPress={onReset}
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
    width: 200,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.accent,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  primaryLabel: {
    color: Colors.textPrimary,
  },
  secondaryLabel: {
    color: Colors.textSecondary,
  },
});
```

- [ ] **Step 4: テストがパスすることを確認**

```bash
npm test -- StartStopButton.test
```

Expected: PASS (6 tests)

- [ ] **Step 5: コミット**

```bash
git add src/components/StartStopButton.tsx src/__tests__/components/StartStopButton.test.tsx
git commit -m "feat: add StartStopButton with long-press reset"
```

---

### Task 12: TimerScreen — 全体の配線

**Files:**
- Create: `src/screens/TimerScreen.tsx`
- Test: `src/__tests__/screens/TimerScreen.test.tsx`

- [ ] **Step 1: テストを書く**

```bash
mkdir -p src/__tests__/screens
```

`src/__tests__/screens/TimerScreen.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimerScreen } from '../../screens/TimerScreen';

describe('TimerScreen', () => {
  it('初期表示でスタートボタンが表示される', () => {
    const { getByText } = render(<TimerScreen />);
    expect(getByText('スタート')).toBeTruthy();
  });

  it('モードタブが3つ表示される', () => {
    const { getByText } = render(<TimerScreen />);
    expect(getByText('プリセット')).toBeTruthy();
    expect(getByText('ポモドーロ')).toBeTruthy();
    expect(getByText('カスタム')).toBeTruthy();
  });

  it('スタートボタンをタップすると一時停止ボタンに変わる', () => {
    const { getByText } = render(<TimerScreen />);
    fireEvent.press(getByText('スタート'));
    expect(getByText('一時停止')).toBeTruthy();
  });

  it('ポモドーロタブに切り替えるとPomodoroConfigが表示される', () => {
    const { getByText } = render(<TimerScreen />);
    fireEvent.press(getByText('ポモドーロ'));
    expect(getByText('作業')).toBeTruthy();
  });

  it('カスタムタブに切り替えるとスライダーが表示される', () => {
    const { getByText } = render(<TimerScreen />);
    fireEvent.press(getByText('カスタム'));
    expect(getByText(/分/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- TimerScreen.test
```

Expected: FAIL

- [ ] **Step 3: 実装を作成**

`src/screens/TimerScreen.tsx`:

```typescript
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
        {/* アナログ時計 */}
        <View style={styles.clockSection}>
          <AnalogClock
            totalSeconds={state.totalSeconds}
            remainingSeconds={state.remainingSeconds}
            isFinished={state.status === 'finished'}
            size={300}
          />
        </View>

        {/* モード別コントロール */}
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

        {/* スタート/停止ボタン */}
        <View style={styles.buttonSection}>
          <StartStopButton
            status={state.status}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
          />
        </View>

        {/* モードタブ（下部固定） */}
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
```

- [ ] **Step 4: テストがパスすることを確認**

```bash
npm test -- TimerScreen.test
```

Expected: PASS (5 tests)

- [ ] **Step 5: コミット**

```bash
git add src/screens/TimerScreen.tsx src/__tests__/screens/TimerScreen.test.tsx
git commit -m "feat: add TimerScreen wiring all components together"
```

---

### Task 13: App.tsx の更新

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: App.tsx を更新**

```typescript
// App.tsx
import React from 'react';
import { TimerScreen } from './src/screens/TimerScreen';

export default function App() {
  return <TimerScreen />;
}
```

- [ ] **Step 2: 全テストがパスすることを確認**

```bash
npm test
```

Expected: 全テストがPASS（30件以上）

- [ ] **Step 3: Expo Goで動作確認**

```bash
npx expo start
```

Expo GoアプリでQRコードをスキャンして以下を確認:
- アナログ時計が表示される
- プリセットボタンをタップして時間が変わる
- スタートボタンで針が動く
- タイマー終了時に音とバイブが鳴る
- ポモドーロ・カスタムモードに切り替えられる
- 長押しでリセットできる

- [ ] **Step 4: 最終コミット**

```bash
git add App.tsx
git commit -m "feat: complete work timer app"
```
