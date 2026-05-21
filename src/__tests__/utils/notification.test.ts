import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { playFinishNotification } from '../../utils/notification';

describe('playFinishNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hapticを呼び出す', async () => {
    await playFinishNotification();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });

  it('音声を再生する', async () => {
    await playFinishNotification();
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
  });

  it('音声ファイルロード失敗時もクラッシュしない', async () => {
    (Audio.Sound.createAsync as jest.Mock).mockRejectedValueOnce(
      new Error('file not found')
    );
    await expect(playFinishNotification()).resolves.not.toThrow();
  });
});
