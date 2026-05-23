import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
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

  it('スタート時に ImpactFeedbackStyle.Medium のハプティクスが発火する', () => {
    const { getByText } = render(
      <StartStopButton status="idle" onStart={jest.fn()} onPause={jest.fn()} onResume={jest.fn()} onReset={jest.fn()} />
    );
    fireEvent.press(getByText('スタート'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it('一時停止時に ImpactFeedbackStyle.Light のハプティクスが発火する', () => {
    const { getByText } = render(
      <StartStopButton status="running" onStart={jest.fn()} onPause={jest.fn()} onResume={jest.fn()} onReset={jest.fn()} />
    );
    fireEvent.press(getByText('一時停止'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('再開時に ImpactFeedbackStyle.Medium のハプティクスが発火する', () => {
    const { getByText } = render(
      <StartStopButton status="paused" onStart={jest.fn()} onPause={jest.fn()} onResume={jest.fn()} onReset={jest.fn()} />
    );
    fireEvent.press(getByText('再開'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it('長押しリセット時に NotificationFeedbackType.Warning のハプティクスが発火する', () => {
    const { getByText } = render(
      <StartStopButton status="running" onStart={jest.fn()} onPause={jest.fn()} onResume={jest.fn()} onReset={jest.fn()} />
    );
    fireEvent(getByText('一時停止'), 'longPress');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Warning);
  });
});
