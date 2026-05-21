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
