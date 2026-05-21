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
    fireEvent.press(getAllByText('+')[0]);
    expect(onWorkChange).toHaveBeenCalledWith(1560);
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
