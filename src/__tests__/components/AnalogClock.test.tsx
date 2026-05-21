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
