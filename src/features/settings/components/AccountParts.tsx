import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, Avatar } from '@/components/ui';
import type { HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type AccountHeaderProps = { name: string; email: string; initials: string; avatarUri: string | undefined; onPress: () => void };

// Large name on the left, round photo on the right; opens the Profile screen.
export function AccountHeader({ name, email, initials, avatarUri, onPress }: AccountHeaderProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Edit profile, ${name}`}
      onPress={onPress}
      className="flex-row items-center gap-lg active:opacity-70"
    >
      <View className="flex-1 gap-xxs">
        <AppText variant="displayXl" numberOfLines={1}>
          {name}
        </AppText>
        {email.length > 0 ? (
          <AppText variant="bodyMd" color="body" numberOfLines={1}>
            {email}
          </AppText>
        ) : null}
      </View>
      <Avatar initials={initials} uri={avatarUri} size={64} />
    </Pressable>
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
      className="min-h-[88px] flex-1 items-center justify-center gap-sm rounded-xl bg-canvas-soft p-md active:bg-surface-pressed"
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
      className="min-h-touch-lg flex-row items-center gap-lg py-lg active:bg-canvas-soft"
    >
      <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />
      <AppText variant="bodyLg" className="flex-1">
        {label}
      </AppText>
      {detail !== undefined ? (
        <AppText variant="bodySm" color="body">
          {detail}
        </AppText>
      ) : null}
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mute} />
    </Pressable>
  );
}
