import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { UpcomingAlert } from '@/domain/entities';
import { Card, AppText } from '@/components/ui';
import { formatDistance } from '@/shared/format';
import { colors, hazardMeta, rounded, spacing, touch, type HazardIconName } from '@/theme/tokens';

type NextAlertCardProps = {
  alert: UpcomingAlert | null;
};

export function NextAlertCard({ alert }: NextAlertCardProps) {
  if (alert === null) {
    return (
      <Card variant="dark">
        <AppText variant="displaySm" color="onDark">
          No alerts ahead
        </AppText>
        <AppText variant="bodyMd" color="mute">
          Nearby hazards show up here while you drive
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
    <Card variant="dark">
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />
        </View>
        <View style={styles.textBlock}>
          <AppText variant="displaySm" color="onDark" numberOfLines={1}>
            {alert.title}
          </AppText>
          <AppText variant="bodyMd" color="onDark">
            {formatDistance(alert.distanceM)}
            {alert.roadName !== undefined ? ' · ' : ''}
            {alert.roadName !== undefined ? (
              <Text style={{ color: colors.mute }}>{alert.roadName}</Text>
            ) : null}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: touch.min,
    height: touch.min,
    borderRadius: rounded.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
});
