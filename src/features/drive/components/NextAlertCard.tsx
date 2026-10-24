import { StyleSheet, Text, View } from 'react-native';
import type { UpcomingAlert } from '@/domain/entities';
import { Card } from '@/components/ui';
import { formatDistance } from '@/shared/format';
import { colors, hazardMeta, spacing } from '@/theme/tokens';
import { LimitBadge } from './LimitBadge';

type NextAlertCardProps = {
  alert: UpcomingAlert | null;
};

export function NextAlertCard({ alert }: NextAlertCardProps) {
  if (alert === null) {
    return (
      <Card>
        <Text style={styles.empty}>No alerts ahead</Text>
      </Card>
    );
  }

  const icon =
    alert.kind === 'camera'
      ? hazardMeta.camera.icon
      : alert.hazard !== undefined
        ? hazardMeta[alert.hazard.type].icon
        : '⚠️';

  return (
    <Card>
      <View style={styles.row}>
        <Text style={styles.icon} accessibilityLabel={alert.title}>
          {icon}
        </Text>
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {alert.title}
          </Text>
          <Text style={styles.detail} numberOfLines={1}>
            {formatDistance(alert.distanceM)}
            {alert.roadName !== undefined ? ` · ${alert.roadName}` : ''}
          </Text>
        </View>
        {alert.kind === 'camera' && alert.speedLimitKmh !== undefined && (
          <LimitBadge limitKmh={alert.speedLimitKmh} size="sm" />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  detail: {
    fontSize: 12,
    color: colors.muted,
  },
});
