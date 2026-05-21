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
