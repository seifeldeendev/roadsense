import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, Badge } from '@/components/ui';
import type { RouteAlert } from '@/domain/usecases/routes/getAlertsAlongRoute';
import { formatDistance } from '@/shared/format';
import { alertIcon } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type RouteAlertRowProps = {
  alert: RouteAlert;
};

const ROW_ICON_SIZE = 22;

export function RouteAlertRow({ alert }: RouteAlertRowProps) {
  const { colors } = useTheme();
  const icon = alertIcon(alert.featureType, alert.hazardType);

  return (
    <View className="flex-row items-center gap-md border-hairline py-md" style={divider.bottom}>
      <MaterialCommunityIcons name={icon} size={ROW_ICON_SIZE} color={colors.ink} />
      <View className="flex-1 gap-xxs">
        <AppText variant="bodyMdStrong">{alert.title}</AppText>
        <AppText variant="bodySm" color="body">
          at {formatDistance(alert.distanceAlongM)}
        </AppText>
      </View>
      {alert.speedLimitKmh !== undefined ? (
        <Badge text={`${alert.speedLimitKmh ?? '–'} km/h`} variant="ink" />
      ) : null}
    </View>
  );
}

const divider = StyleSheet.create({
  bottom: { borderBottomWidth: StyleSheet.hairlineWidth },
});
