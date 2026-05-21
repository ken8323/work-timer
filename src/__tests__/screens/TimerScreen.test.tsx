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
    const { getByText, getAllByText } = render(<TimerScreen />);
    fireEvent.press(getByText('カスタム'));
    expect(getAllByText(/分/).length).toBeGreaterThan(0);
  });
});
