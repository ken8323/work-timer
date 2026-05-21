import { renderHook, act } from '@testing-library/react-native';
import { useTimer } from '../../hooks/useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('初期状態はidleでremainingSecondsはtotalSecondsと同じ', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.remainingSeconds).toBe(result.current.state.totalSeconds);
  });

  it('setTotalSecondsでtotalSecondsとremainingSecondsが更新される', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(1800));
    expect(result.current.state.totalSeconds).toBe(1800);
    expect(result.current.state.remainingSeconds).toBe(1800);
  });

  it('startでstatusがrunningになる', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(60));
    act(() => result.current.start());
    expect(result.current.state.status).toBe('running');
  });

  it('1秒経過後にremainingSecondsが1減る', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(60));
    act(() => result.current.start());
    act(() => {
      jest.setSystemTime(1000);
      jest.advanceTimersByTime(100);
    });
    expect(result.current.state.remainingSeconds).toBe(59);
  });

  it('pauseでstatusがpausedになる', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(60));
    act(() => result.current.start());
    act(() => result.current.pause());
    expect(result.current.state.status).toBe('paused');
  });

  it('resetでstatusがidleに戻りremainingSecondsが復元される', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(60));
    act(() => result.current.start());
    act(() => result.current.reset());
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.remainingSeconds).toBe(60);
  });

  it('remainingSecondsが0になるとstatusがfinishedになる', () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.setTotalSeconds(1));
    act(() => result.current.start());
    act(() => {
      jest.setSystemTime(1100);
      jest.advanceTimersByTime(200);
    });
    expect(result.current.state.status).toBe('finished');
  });
});
