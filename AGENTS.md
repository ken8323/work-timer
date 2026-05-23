# AI Agent Instructions

## Expo ドキュメント

Expo API を使うコードを書く前に必ず公式ドキュメントを確認すること。
バージョンは **v54.0.0** を参照: https://docs.expo.dev/versions/v54.0.0/

## 実装の原則

### やること
- TDD: テストを先に書き、失敗を確認してから実装する
- `npm test -- <テスト名>` で単体確認、最後に `npm test` で全件確認
- コミットは小さく、意味のある単位で行う（feat/fix/refactor プレフィックス）
- 型は明示的に書く（`any` 禁止）

### やらないこと
- `any` 型の使用
- コメントで「何をしているか」を説明する（コードが自明であること）
- テストなしの実装
- `jest@30` へのアップグレード（jest-expo@55 と非互換）
- Reanimated の `useAnimatedProps` を react-native-svg コンポーネントに使う
  （動作しない。svg コンポーネントには直接 prop を渡すこと）

## 新機能を実装するときの手順

1. 対象 issue を GitHub で確認する
2. 実装するファイルを特定する（CLAUDE.md の File Structure を参照）
3. テストを `src/__tests__/` 以下に書く
4. `npm test -- <テスト名>` で FAIL を確認
5. 実装する
6. `npm test -- <テスト名>` で PASS を確認
7. `npm test` で全件グリーンを確認
8. コミット → PR 作成（`Closes #<issue番号>` を本文に含める）

## コンポーネントを追加するときの規約

```typescript
// Named export を使う（default export 禁止）
export function MyComponent({ prop }: MyComponentProps) { ... }

// Props 型はコンポーネントファイル内に定義
interface MyComponentProps {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}

// スタイルは StyleSheet.create でまとめる
const styles = StyleSheet.create({ ... });
```

## 状態変更を加えるときの規約

`timerReducer.ts` に action を追加 → `useTimer.ts` に callback を追加 → `TimerScreen.tsx` に配線。
この順番を崩さない。

## よくあるミスと対処法

| 問題 | 原因 | 対処 |
|------|------|------|
| テストで reanimated エラー | モック未設定 | jest-setup.ts 確認 |
| SVG の針が動かない | useAnimatedProps 使用 | G の rotation prop を直接使う |
| タイマーが一時停止後ずれる | startedAt の更新漏れ | RESUME action で remainingAtStart を更新 |
| ポモドーロ設定変更がクロックに反映されない | SET_POMODORO_* が totalSeconds を更新していない | idleかつ対応フェーズの場合は totalSeconds/remainingSeconds も更新する |
