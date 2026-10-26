import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppText, Badge, Card, IconButton } from '@/components/ui';
import type { RouteAlert } from '@/domain/usecases/routes/getAlertsAlongRoute';
import { formatDistance } from '@/shared/format';
import { alertIcon } from '@/theme/tokens';
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
      <View className="flex-row items-start gap-md">
        <View className="flex-1 gap-xxs">
          <AppText variant="bodySm" color="body" numberOfLines={1}>
            To {props.destinationName}
          </AppText>
          {props.isRouting ? (
            <ActivityIndicator color={colors.ink} className="my-sm self-start" />
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
        <View key={alert.refId} className="flex-row items-center gap-sm border-hairline py-sm" style={divider.top}>
          <MaterialCommunityIcons
            name={alertIcon(alert.featureType, alert.hazardType)}
            size={20}
            color={colors.ink}
          />
          <AppText variant="bodySm" className="flex-1" numberOfLines={1}>
            {alert.title} · at {formatDistance(alert.distanceAlongM)}
          </AppText>
          {alert.speedLimitKmh !== undefined ? <Badge text={`${alert.speedLimitKmh} km/h`} variant="ink" /> : null}
        </View>
      ))}

      <View className="mt-md">
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

const divider = StyleSheet.create({
  top: { borderTopWidth: StyleSheet.hairlineWidth },
});
