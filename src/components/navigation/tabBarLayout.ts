import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Standard iOS tab bar height; the native bar cannot be measured from JS.
const IOS_TAB_BAR_HEIGHT = 49;

// How far bottom-anchored overlays must sit from the screen bottom to stay
// above the native tab bar. On iOS the bar floats over the content; on Android
// the content already ends above the bar, so nothing extra is needed.
export function useTabBarSpace(): number {
  const { bottom } = useSafeAreaInsets();
  return Platform.OS === 'ios' ? IOS_TAB_BAR_HEIGHT + bottom : 0;
}
