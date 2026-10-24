import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { rounded, spacing, type HazardIconName } from '@/theme/tokens';
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
    <View style={[styles.card, { backgroundColor: colors.canvasSoft }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.canvasSofter }]}>
        <MaterialCommunityIcons name={icon} size={26} color={colors.ink} />
      </View>
      <AppText variant="displaySm" style={styles.centered}>
        {title}
      </AppText>
      <AppText variant="bodyMd" color="body" style={styles.centered}>
        {message}
      </AppText>
      {action !== undefined && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xxl,
    borderRadius: rounded.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  centered: {
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.sm,
    minWidth: 220,
  },
});
