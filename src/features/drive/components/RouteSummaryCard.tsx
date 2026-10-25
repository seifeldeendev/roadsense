import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppText, Badge, Card, IconButton } from '@/components/ui';
import type { RouteAlert } from '@/domain/usecases/routes/getAlertsAlongRoute';
import { formatDistance } from '@/shared/format';
import { hazardMeta, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const MAX_ALERT_ROWS = 3;

type RouteSummaryCardProps = {
  destinationName: string;
  isRouting: boolean;
  error: string | null;
  durationLabel: string;
  detailLabel: string;
  alerts: RouteAlert[];
  onStart: () => void;
  onClose: () => void;
};

// Bottom card once a destination is chosen: time, distance, what's on the way, start.
export function RouteSummaryCard(props: RouteSummaryCardProps) {
  const { colors } = useTheme();
  return (
    <Card variant="form">
      <View style={styles.header}>
        <View style={styles.titles}>
          <AppText variant="bodySm" color="body" numberOfLines={1}>
            To {props.destinationName}
          </AppText>
          {props.isRouting ? (
            <ActivityIndicator color={colors.ink} style={styles.loading} />
          ) : (
            <AppText variant="displayMd">{props.error ?? props.durationLabel}</AppText>
          )}
          {!props.isRouting && props.error === null ? (
            <AppText variant="bodySm" color="body">
              {props.detailLabel}
            </AppText>
          ) : null}
        </View>
        <IconButton icon="close" accessibilityLabel="Clear route" onPress={props.onClose} />
      </View>

      {props.alerts.slice(0, MAX_ALERT_ROWS).map((alert) => (
        <View key={alert.refId} style={[styles.alertRow, { borderTopColor: colors.hairline }]}>
          <MaterialCommunityIcons
            name={hazardMeta[alert.kind === 'camera' ? 'camera' : (alert.hazardType ?? 'accident')].icon}
            size={20}
            color={colors.ink}
          />
          <AppText variant="bodySm" style={styles.alertText} numberOfLines={1}>
            {alert.title} · at {formatDistance(alert.distanceAlongM)}
          </AppText>
          {alert.speedLimitKmh !== undefined ? <Badge text={`${alert.speedLimitKmh} km/h`} variant="ink" /> : null}
        </View>
      ))}

      <View style={styles.cta}>
        <AppButton
          title="Start drive"
          variant="large"
          onPress={props.onStart}
          disabled={props.isRouting}
          accessibilityLabel="Start drive"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titles: { flex: 1, gap: spacing.xxs },
  loading: { alignSelf: 'flex-start', marginVertical: spacing.sm },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  alertText: { flex: 1 },
  cta: { marginTop: spacing.md },
});
