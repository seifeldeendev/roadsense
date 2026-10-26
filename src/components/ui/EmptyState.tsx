import type { ReactNode } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import type { HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type EmptyStateProps = {
  icon: HazardIconName;
  title: string;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center gap-sm rounded-xl bg-canvas-soft p-xxl">
      <View className="mb-xs h-14 w-14 items-center justify-center rounded-full bg-canvas-softer">
        <MaterialCommunityIcons name={icon} size={26} color={colors.ink} />
      </View>
      <AppText variant="displaySm" className="text-center">
        {title}
      </AppText>
      <AppText variant="bodyMd" color="body" className="text-center">
        {message}
      </AppText>
      {action !== undefined && <View className="mt-sm min-w-[220px]">{action}</View>}
    </View>
  );
}
