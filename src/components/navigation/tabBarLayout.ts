import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 68;
// Space between the floating bar and the bottom safe-area edge.
export const TAB_BAR_GAP = 12;

// How much bottom space a tab screen must keep clear so nothing sits under the
// floating glass bar.
export function useTabBarSpace(): number {
  const { bottom } = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + TAB_BAR_GAP + bottom;
}
