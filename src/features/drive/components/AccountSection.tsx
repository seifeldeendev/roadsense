import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppText, SectionHeader } from '@/components/ui';
import { rounded, spacing, touch } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type AccountSectionProps = {
  name: string;
  email: string;
  signingOut: boolean;
  onSignOut: () => void;
};

export function AccountSection({
  name,
  email,
  signingOut,
  onSignOut,
}: AccountSectionProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <SectionHeader title="Account" />
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.canvasSoft }]}>
          <MaterialCommunityIcons name="account" size={24} color={colors.ink} />
        </View>
        <View style={styles.details}>
          <AppText variant="bodyMdStrong">{name}</AppText>
          <AppText variant="bodySm" color="body">
            {email}
          </AppText>
        </View>
        <AppButton
          title="Sign out"
          variant="secondary"
          onPress={onSignOut}
          loading={signingOut}
          disabled={signingOut}
          accessibilityLabel="Sign out"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    width: touch.min,
    height: touch.min,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
});
