import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type OnboardingIllustrationProps = {
  icons: [HazardIconName, HazardIconName];
  style?: StyleProp<ViewStyle>;
};

export function OnboardingIllustration({ icons, style }: OnboardingIllustrationProps) {
  const { colors } = useTheme();
  const [primary, secondary] = icons;

  return (
    <View className="aspect-[4/3] items-center justify-center rounded-xl bg-canvas-soft" style={style}>
      <View className="flex-row items-center gap-xl">
        <View className="h-[108px] w-[108px] items-center justify-center rounded-full bg-canvas">
          <MaterialCommunityIcons name={primary} size={44} color={colors.ink} />
        </View>
        <View className="mt-xxl h-[88px] w-[88px] items-center justify-center rounded-full bg-canvas">
          <MaterialCommunityIcons name={secondary} size={36} color={colors.ink} />
        </View>
      </View>
    </View>
  );
}
