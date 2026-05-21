# Work Timer App — Design Spec

**Date:** 2026-05-22  
**Status:** Approved

---

## Overview

スマートフォン専用の仕事用タイマーアプリ。アナログ時計形式で残り時間を視覚的に表示する。プリセット・ポモドーロ・カスタムの3モードを持ち、タイマー終了時に音とバイブレーションで通知する。履歴機能は持たず、シンプルに使い捨てで使うことを前提とする。

---

## Technology Stack

| 項目 | 選定 |
|------|------|
| フレームワーク | React Native + Expo (managed workflow) |
| 開発環境 | Expo Go 対応（Development Build 不要） |
| アナログ描画 | react-native-svg |
| アニメーション | react-native-reanimated |
| 音声 | expo-av |
| バイブレーション | expo-haptics |
| 永続化 | AsyncStorage（前回プリセット選択の記憶のみ） |

---

## Visual Design

- **スタイル:** ボールド・モダン
- **カラーパレット:**
  - 背景: `#0f172a`（ダークネイビー）
  - トラック: `#1e293b`
  - アクセント: `#f97316`（オレンジ）
  - テキスト: `#94a3b8` / `#f8fafc`
  - ボーダー: `#334155`
- **レイアウト:** 時計上部、プリセットボタン中段、スタートボタン、モードタブ下部

---

## Screen Layout

```
┌─────────────────────────┐
│    ┌───────────────┐    │
│    │  アナログ時計  │    │  ← SVG時計（オレンジアーク＋針）
│    │    30:00      │    │
│    └───────────────┘    │
│                         │
│  [15] [25] [30] [45] [60]  ← プリセットボタン（モード別に切替）
│                         │
│     [▶ スタート]        │  ← スタート/一時停止/リセット
│                         │
│  [プリセット|ポモドーロ|カスタム]  ← モードタブ（下部）
└─────────────────────────┘
```

---

## Component Structure

```
App
└── TimerScreen
    ├── ModeTabBar
    ├── AnalogClock
    │   └── ClockHand (Reanimated)
    ├── PresetButtons        (mode === 'preset' のみ表示)
    ├── PomodoroConfig       (mode === 'pomodoro' のみ表示)
    ├── CustomSlider         (mode === 'custom' のみ表示)
    └── StartStopButton
```

---

## State

```typescript
type TimerMode = 'preset' | 'pomodoro' | 'custom';
type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';
type PomodoroPhase = 'work' | 'break' | 'long_break';

interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  totalSeconds: number;        // セット時間（秒）
  remainingSeconds: number;    // 残り秒数
  startedAt: number | null;    // Date.now() の値（時刻ズレ補正用）
  pomodoroPhase: PomodoroPhase;
  pomodoroRound: number;       // 現在の作業サイクル数（1〜4）
  pomodoroWorkSeconds: number;      // ポモドーロ設定: 作業時間
  pomodoroBreakSeconds: number;     // ポモドーロ設定: 休憩時間
  pomodoroLongBreakSeconds: number; // ポモドーロ設定: 長休憩時間（4サイクル後）
}
```

---

## Timer Logic

- `setInterval`（100ms間隔）で残り秒数を更新
- 実際の経過時間は `Date.now() - startedAt` で計算（バックグラウンド移行時のズレ防止）
- 針の角度: `(remainingSeconds / totalSeconds) * 360` 度
- アニメーション: `useSharedValue` + `withTiming(angle, { duration: 800 })` で滑らか回転
- `remainingSeconds === 0` 到達時:
  1. `expo-haptics.notificationAsync(NotificationFeedbackType.Success)` 実行
  2. `expo-av` でアラーム音再生
  3. ポモドーロモードの場合は次フェーズへ自動移行

---

## Mode Behavior

### プリセットモード（デフォルト）
- 15 / 25 / 30 / 45 / 60分のボタンを表示
- タップで即セット、前回選択を `AsyncStorage` で記憶
- アプリ起動時に前回の選択を復元

### ポモドーロモード
- デフォルト: 作業25分 / 休憩5分 / 長休憩15分
- タップで数値を変更可能（1〜60分の範囲）
- サイクル進行: 作業→休憩→作業→休憩→作業→休憩→作業→長休憩
- フェーズ切替時に通知（音＋バイブ）
- ラウンド数を画面上に表示（例: 「2 / 4」）

### カスタムモード
- 1〜60分をスライダーで設定
- 目盛りは5分刻み
- セット後はプリセットと同じ操作感

---

## UX Rules

| ルール | 詳細 |
|--------|------|
| 操作ロック | タイマー動作中はモード切替・プリセット変更を無効化 |
| 一時停止 | スタートボタンと同じ位置に「⏸ 一時停止」を表示 |
| リセット | スタートボタンを長押し（500ms）でリセット確認なしにリセット |
| フィニッシュ表示 | `status === 'finished'` 時、アークを白またはパルスアニメーションで強調 |

---

## File Structure

```
work_timer/
├── app.json
├── App.tsx
├── src/
│   ├── components/
│   │   ├── AnalogClock.tsx
│   │   ├── ClockHand.tsx
│   │   ├── ModeTabBar.tsx
│   │   ├── PresetButtons.tsx
│   │   ├── PomodoroConfig.tsx
│   │   ├── CustomSlider.tsx
│   │   └── StartStopButton.tsx
│   ├── screens/
│   │   └── TimerScreen.tsx
│   ├── hooks/
│   │   └── useTimer.ts       # タイマーロジック全体
│   ├── utils/
│   │   └── notification.ts   # 音・バイブのユーティリティ
│   └── constants/
│       └── theme.ts          # カラーパレット・スタイル定数
└── docs/
    └── superpowers/specs/
        └── 2026-05-22-work-timer-design.md
```

---

## Future Extension Points

将来の機能追加を想定し、以下の点を拡張しやすい設計にしておく:

- **テーマ切替:** `theme.ts` を差し替えるだけで対応できる構造
- **新モード追加:** `ModeTabBar` にタブを追加し、対応する Config コンポーネントを差し込む形
- **通知カスタマイズ:** `notification.ts` を差し替えることで音やバイブパターンを変更可能
- **設定画面:** `AsyncStorage` のキーを増やすだけで設定項目を追加できる

---

## Out of Scope（今回対象外）

- 作業履歴・ログの保存
- プッシュ通知（バックグラウンド通知）
- ウィジェット
- Apple Watch / Wear OS 対応
- ダークモード切替（常時ダークモード）
