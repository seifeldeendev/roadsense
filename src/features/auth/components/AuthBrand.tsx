import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export function AuthBrand() {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-sm self-center">
      <View className="h-touch w-touch items-center justify-center rounded-full bg-canvas-soft">
        <MaterialCommunityIcons name="speedometer" size={24} color={colors.ink} />
      </View>
      <AppText variant="bodyMdStrong">RoadSense</AppText>
    </View>
  );
}

type AuthLinkProps = {
  prompt: string;
  label: string;
  onPress: () => void;
};

export function AuthLink({ prompt, label, onPress }: AuthLinkProps) {
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-xs">
      <AppText variant="bodyMd" color="body">
        {prompt}
      </AppText>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={label}
        onPress={onPress}
        hitSlop={8}
        className="active:opacity-50"
      >
        <AppText variant="bodyMdStrong" className="underline">
          {label}
        </AppText>
      </Pressable>
    </View>
  );
}
