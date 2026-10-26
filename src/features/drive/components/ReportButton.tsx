import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import type { HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type ReportButtonProps = {
  icon: HazardIconName;
  label: string;
  onPress: () => void;
};

// Two per row in the report sheet.
export function ReportButton({ icon, label, onPress }: ReportButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Report ${label}`}
      onPress={onPress}
      className="min-h-touch-lg grow basis-[46%] items-center justify-center gap-xs rounded-xl bg-canvas-soft px-sm active:bg-surface-pressed"
    >
      <View className="h-xxxl w-xxxl items-center justify-center rounded-full bg-canvas">
        <MaterialCommunityIcons name={icon} size={20} color={colors.ink} />
      </View>
      <AppText variant="bodyMdStrong">{label}</AppText>
    </Pressable>
  );
}
