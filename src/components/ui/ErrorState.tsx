import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center gap-sm rounded-xl bg-canvas-soft p-xxl">
      <View className="mb-xs h-14 w-14 items-center justify-center rounded-full bg-canvas-softer">
        <MaterialCommunityIcons name="alert-octagon" size={26} color={colors.ink} />
      </View>
      <AppText variant="bodyMd" color="body" className="text-center">
        {message}
      </AppText>
      <View className="mt-sm w-[220px]">
        <AppButton title="Retry" onPress={onRetry} accessibilityLabel="Retry" />
      </View>
    </View>
  );
}
