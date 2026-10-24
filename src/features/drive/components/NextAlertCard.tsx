import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { UpcomingAlert } from '@/domain/entities';
import { Card, AppText } from '@/components/ui';
import { formatDistance } from '@/shared/format';
import { colors, hazardMeta, spacing, type HazardIconName } from '@/theme/tokens';
import { LimitBadge } from './LimitBadge';

type NextAlertCardProps = {
  alert: UpcomingAlert | null;
};

export function NextAlertCard({ alert }: NextAlertCardProps) {
  if (alert === null) {
    return (
      <Card>
        <AppText variant="bodySm" color="body" style={styles.centered}>
          No alerts ahead
        </AppText>
      </Card>
    );
  }

  const icon: HazardIconName =
    alert.kind === 'camera'
      ? hazardMeta.camera.icon
      : alert.hazard !== undefined
        ? hazardMeta[alert.hazard.type].icon
        : 'alert';

  return (
    <Card>
      <View style={styles.row}>
        <MaterialCommunityIcons name={icon} size={32} color={colors.ink} />
        <View style={styles.textBlock}>
          <AppText variant="bodyMdStrong" numberOfLines={1}>
            {alert.title}
          </AppText>
          <AppText variant="bodySm" color="body" numberOfLines={1}>
            {formatDistance(alert.distanceM)}
            {alert.roadName !== undefined ? ` · ${alert.roadName}` : ''}
          </AppText>
        </View>
        {alert.kind === 'camera' && alert.speedLimitKmh !== undefined && (
          <LimitBadge limitKmh={alert.speedLimitKmh} size="sm" />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
});
