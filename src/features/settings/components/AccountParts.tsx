import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { rounded, spacing, touch, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const AVATAR_SIZE = 64;

// Large name on the left, round avatar on the right.
export function AccountHeader({ name, email, initials }: { name: string; email: string; initials: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <AppText variant="displayXl" numberOfLines={1}>
          {name}
        </AppText>
        {email.length > 0 ? (
          <AppText variant="bodyMd" color="body" numberOfLines={1}>
            {email}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.avatar, { backgroundColor: colors.canvasSoft }]}>
        <AppText variant="displaySm">{initials}</AppText>
      </View>
    </View>
  );
}

type QuickTileProps = { icon: HazardIconName; label: string; onPress: () => void };

// Grey square-ish shortcut tile, three in a row.
export function QuickTile({ icon, label, onPress }: QuickTileProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: pressed ? colors.surfacePressed : colors.canvasSoft }]}
    >
      <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />
      <AppText variant="bodySmStrong">{label}</AppText>
    </Pressable>
  );
}

type SettingsRowProps = { icon: HazardIconName; label: string; detail?: string; onPress: () => void };

// Plain list row: icon, label and an optional current value, no card chrome.
export function SettingsRow({ icon, label, detail, onPress }: SettingsRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.canvasSoft }]}
    >
      <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />
      <AppText variant="bodyLg" style={styles.rowLabel}>
        {label}
      </AppText>
      {detail !== undefined ? (
        <AppText variant="bodySm" color="body">
          {detail}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  headerText: { flex: 1, gap: spacing.xxs },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    flex: 1,
    minHeight: 88,
    borderRadius: rounded.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: touch.large,
    paddingVertical: spacing.lg,
  },
  rowLabel: { flex: 1 },
});
