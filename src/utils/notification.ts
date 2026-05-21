import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

export async function playFinishNotification(): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/alarm.mp3')
    );
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync(), 5000);
  } catch {
    // 音声ファイルが存在しない場合でもバイブのみ動作させる
  }
}
