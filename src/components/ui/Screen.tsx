import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
};

export function Screen({ children, scroll = false, padded = true }: ScreenProps) {
  const { colors } = useTheme();
  const gutter = padded ? 'px-lg' : 'px-0';
  // SafeAreaView is a third-party view, so its fill stays a style.
  const fill = { flex: 1, backgroundColor: colors.canvas };
  if (!scroll) {
    return (
      <SafeAreaView style={fill}>
        <View className={`flex-1 bg-canvas ${gutter}`}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={fill}>
      <ScrollView className="flex-1 bg-canvas" contentContainerClassName={`pb-xl ${gutter}`} alwaysBounceVertical>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
