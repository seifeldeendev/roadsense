import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, rounded, spacing, type HazardIconName } from '@/theme/tokens';

type EmptyStateProps = {
  icon: HazardIconName;
  title: string;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
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
    backgroundColor: colors.canvasSoft,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: rounded.full,
    backgroundColor: colors.canvasSofter,
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
