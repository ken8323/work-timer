# Work Timer — Claude Code Instructions

@AGENTS.md

## Project Overview

React Native / Expo (managed workflow, Expo Go compatible) のアナログワークタイマーアプリ。
プリセット・ポモドーロ・カスタムの3モードを持つ。TypeScript で書かれている。

**リポジトリ:** https://github.com/ken8323/work-timer

## Tech Stack

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| expo | ~54.0.33 | managed workflow |
| react-native | 0.81.5 | UI フレームワーク |
| react-native-svg | 15.12.1 | アナログ時計描画 |
| react-native-reanimated | ~4.1.1 | アニメーション |
| expo-av | ~16.0.8 | アラーム音声 |
| expo-haptics | ~15.0.8 | バイブレーション |
| @react-native-async-storage/async-storage | ^3.0.3 | 設定の永続化 |
| @react-native-community/slider | ^5.2.0 | カスタムタイマースライダー |
| jest / jest-expo | 29.x / ~55.0.18 | テスト（jest@30は非互換） |

## File Structure

```
src/
  constants/theme.ts          # Colors, Spacing, FontSize
  utils/notification.ts       # playFinishNotification() — 音+バイブ
  hooks/
    timerReducer.ts           # TimerState, TimerAction, timerReducer, initialState
    useTimer.ts               # setInterval ドライバー, AsyncStorage 連携
  components/
    ClockHand.tsx             # SVG G で回転する針（react-native-svg）
    AnalogClock.tsx           # SVG アーク + ClockHand + デジタル時刻
    ModeTabBar.tsx            # プリセット/ポモドーロ/カスタム タブ
    PresetButtons.tsx         # 15/25/30/45/60分 ボタン
    PomodoroConfig.tsx        # フェーズ表示 + 時間調整 (+/-)
    CustomSlider.tsx          # 1〜60分スライダー
    StartStopButton.tsx       # スタート/一時停止/再開/もう一度（長押しリセット）
  screens/
    TimerScreen.tsx           # 全コンポーネントを配線するメイン画面
assets/
  alarm.mp3                   # アラーム音声
src/__tests__/                # テストファイル（components/, hooks/, screens/ を mirror）
```

## Key Patterns

### タイマー状態管理
```typescript
// useReducer ベース。state は useTimer.ts が管理。
type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';
type TimerMode   = 'preset' | 'pomodoro' | 'custom';
type PomodoroPhase = 'work' | 'break' | 'long_break';
```

### タイマー精度
`Date.now() - startedAt` でドリフト防止。100ms インターバルで更新。

### 時計の描画比率
`remainingRatio = remainingSeconds / 3600`（60分 = 360度の時計盤）。
totalSeconds には依存しない。

### アナログ針
`src/components/ClockHand.tsx` は react-native-svg の `G` コンポーネントの
`rotation` / `originX` / `originY` prop を直接使う（Reanimated の useAnimatedProps は使わない）。

### disabled パターン
タイマー `running` 中はコントロール類を `disabled={state.status === 'running'}` でロック。

### AsyncStorage
- キー `'lastPresetSeconds'` でプリセット選択を永続化
- `parseInt` 後は `Number.isFinite()` でガード

## Commands

```bash
npm test              # 全テスト実行（51件）
npm test -- <name>    # 特定テストのみ（例: npm test -- AnalogClock.test）
npx expo start        # 開発サーバー起動（Expo Go で QR スキャン）
```

## Testing Rules

- jest@29 必須（jest@30 は jest-expo@55 と非互換）
- `jest-setup.ts` が reanimated / expo-haptics / expo-av / AsyncStorage をモック済み
- `babel.config.js` でテスト時は reanimated プラグインを無効化
- テストは `src/__tests__/` 以下に実装と同じパス構造で配置
- TDD: テスト先行で書き、失敗を確認してから実装する

## GitHub Workflow

- Issues: https://github.com/ken8323/work-timer/issues
- 各 issue に実装計画を書いてから着手する
- ブランチ名: `feature/issue-<番号>-<kebab-case-説明>`
- コミットメッセージ: `feat:` / `fix:` / `refactor:` プレフィックス
- PR は issue に紐付けて作成（`Closes #<番号>`）
