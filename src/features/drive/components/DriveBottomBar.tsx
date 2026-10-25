import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppText, Card } from '@/components/ui';
import { rounded, spacing, touch } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type DriveBottomBarProps = {
  roadName: string | null;
  alertsAhead: number;
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
  const alertsLabel = `${alertsAhead} alert${alertsAhead === 1 ? '' : 's'} ahead`;
  return (
    <Card variant="form">
      <View style={styles.info}>
        <View style={styles.road}>
          {roadName !== null ? (
            <>
              <MaterialCommunityIcons name="road-variant" size={18} color={colors.ink} />
              <AppText variant="bodySmStrong" numberOfLines={1} style={styles.roadText}>
                {roadName}
              </AppText>
            </>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Active alerts, ${alertsLabel}`}
          onPress={onOpenAlerts}
          style={({ pressed }) => [
            styles.alertsPill,
            { backgroundColor: pressed ? colors.surfacePressed : colors.canvasSoft },
          ]}
        >
          <MaterialCommunityIcons name="alert-outline" size={16} color={colors.ink} />
          <AppText variant="bodySmStrong">{alertsLabel}</AppText>
        </Pressable>
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

const styles = StyleSheet.create({
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  road: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  roadText: {
    flexShrink: 1,
  },
  alertsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: touch.min,
    paddingHorizontal: spacing.lg,
    borderRadius: rounded.pill,
  },
});
