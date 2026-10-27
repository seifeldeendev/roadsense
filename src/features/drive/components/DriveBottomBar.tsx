import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppText, Card } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

type DriveBottomBarProps = {
  roadName: string | null;
  // null hides the pill (turned off in Drive screen settings).
  alertsAhead: number | null;
  isDriving: boolean;
  onOpenAlerts: () => void;
  onStart: () => void;
  onStop: () => void;
};

// The bottom request-form card: current road, alerts ahead and the drive CTA.
export function DriveBottomBar({
  roadName,
  alertsAhead,
  isDriving,
  onOpenAlerts,
  onStart,
  onStop,
}: DriveBottomBarProps) {
  const { colors } = useTheme();
  const alertsLabel = alertsAhead === null ? '' : `${alertsAhead} alert${alertsAhead === 1 ? '' : 's'} ahead`;
  return (
    <Card variant="form">
      <View className="mb-md flex-row items-center gap-md">
        <View className="flex-1 flex-row items-center gap-xs">
          {roadName !== null ? (
            <>
              <MaterialCommunityIcons name="road-variant" size={18} color={colors.ink} />
              <AppText variant="bodySmStrong" numberOfLines={1} className="shrink">
                {roadName}
              </AppText>
            </>
          ) : null}
        </View>
        {alertsAhead === null ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Active alerts, ${alertsLabel}`}
            onPress={onOpenAlerts}
            className="min-h-touch flex-row items-center gap-xs rounded-pill bg-canvas-soft px-lg active:bg-surface-pressed"
          >
            <MaterialCommunityIcons name="alert-outline" size={16} color={colors.ink} />
            <AppText variant="bodySmStrong">{alertsLabel}</AppText>
          </Pressable>
        )}
      </View>
      <AppButton
        title={isDriving ? 'Stop drive' : 'Start drive'}
        variant={isDriving ? 'secondary' : 'large'}
        onPress={isDriving ? onStop : onStart}
        accessibilityLabel={isDriving ? 'Stop drive' : 'Start drive'}
      />
    </Card>
  );
}
