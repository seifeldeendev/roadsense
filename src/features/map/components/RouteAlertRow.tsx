import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, Badge } from '@/components/ui';
import type { RouteAlert } from '@/domain/usecases/routes/getAlertsAlongRoute';
import { formatDistance } from '@/shared/format';
import { alertIcon, spacing } from '@/theme/tokens';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

type RouteAlertRowProps = {
  alert: RouteAlert;
};

const ROW_ICON_SIZE = 22;

export function RouteAlertRow({ alert }: RouteAlertRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(alertRowStyles, undefined);
  const icon = alertIcon(alert.featureType, alert.hazardType);

  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name={icon} size={ROW_ICON_SIZE} color={colors.ink} />
      <View style={styles.text}>
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

function alertRowStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.hairline,
    },
    text: {
      flex: 1,
      gap: spacing.xxs,
    },
  });
}
