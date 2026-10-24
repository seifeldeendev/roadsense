import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { rounded, spacing, touch, type HazardIconName } from '@/theme/tokens';
import { useTheme, type ResolvedTheme } from '@/theme/useTheme';

type ReportButtonProps = {
  icon: HazardIconName;
  label: string;
  onPress: () => void;
};

export function ReportButton({ icon, label, onPress }: ReportButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Report ${label}`}
      onPress={onPress}
      style={({ pressed }): StyleProp<ViewStyle> => [
        buttonBase(colors),
        pressed && { backgroundColor: colors.surfacePressed },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.canvas }]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.ink} />
      </View>
      <AppText variant="bodyMdStrong">{label}</AppText>
    </Pressable>
  );
}

function buttonBase(colors: ResolvedTheme['colors']): ViewStyle {
  return {
    flexBasis: '46%',
    flexGrow: 1,
    minHeight: touch.large,
    borderRadius: rounded.xl,
    backgroundColor: colors.canvasSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  };
}

const styles = StyleSheet.create({
  iconWrap: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
