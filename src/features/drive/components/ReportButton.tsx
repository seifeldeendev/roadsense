import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, rounded, spacing, touch, typography, type HazardIconName } from '@/theme/tokens';

type ReportButtonProps = {
  icon: HazardIconName;
  label: string;
  onPress: () => void;
};

export function ReportButton({ icon, label, onPress }: ReportButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Report ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.ink} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexBasis: '46%',
    flexGrow: 1,
    minHeight: touch.large,
    borderRadius: rounded.xl,
    backgroundColor: colors.canvasSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  iconWrap: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.bodySmStrong,
    color: colors.ink,
  },
});
