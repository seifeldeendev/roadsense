import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/tokens';

type EmptyStateProps = {
  icon: string;
  title: string;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon} accessibilityLabel={title}>
        {icon}
      </Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action !== undefined && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  icon: {
    fontSize: typography.size.heading,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.title,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.size.body,
    color: colors.muted,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.sm,
    minWidth: 220,
    borderRadius: radius.md,
  },
});
