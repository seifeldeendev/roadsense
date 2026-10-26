import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center gap-md p-lg">
      <ActivityIndicator size="large" color={colors.ink} />
      {label !== undefined && (
        <AppText variant="bodyMd" color="body" className="text-center">
          {label}
        </AppText>
      )}
    </View>
  );
}
