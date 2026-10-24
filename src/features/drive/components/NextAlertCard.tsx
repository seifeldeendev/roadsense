import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { UpcomingAlert } from '@/domain/entities';
import { Card, AppText } from '@/components/ui';
import { formatDistance } from '@/shared/format';
import { hazardMeta, rounded, spacing, touch, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type NextAlertCardProps = {
  alert: UpcomingAlert | null;
};

export function NextAlertCard({ alert }: NextAlertCardProps) {
  const { colors } = useTheme();

  if (alert === null) {
    return (
      <Card variant="inverse">
        <AppText variant="displaySm" color="onInverse">
          No alerts ahead
        </AppText>
        <AppText variant="bodyMd" color="inverseMuted">
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
    <Card variant="inverse">
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: colors.onInverse }]}>
          <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />
        </View>
        <View style={styles.textBlock}>
          <AppText variant="displaySm" color="onInverse" numberOfLines={1}>
            {alert.title}
          </AppText>
          <AppText variant="bodyMd" color="onInverse">
            {formatDistance(alert.distanceM)}
            {alert.roadName !== undefined ? ' · ' : ''}
            {alert.roadName !== undefined ? (
              <Text style={{ color: colors.inverseMuted }}>{alert.roadName}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
});
