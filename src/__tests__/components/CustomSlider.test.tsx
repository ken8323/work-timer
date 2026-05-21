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
