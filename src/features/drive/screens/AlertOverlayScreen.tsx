import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton, AppText, EmptyState, IconButton } from '@/components/ui';
import { alertIcon, rounded, spacing, touch, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { LimitBadge } from '../components/LimitBadge';
import { StillThereSection } from '../components/StillThereSection';
import { useAlertOverlayViewModel } from '../viewmodels/useAlertOverlayViewModel';

const PROGRESS_HEIGHT = 6;

export default function AlertOverlayScreen() {
  const vm = useAlertOverlayViewModel();
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const panel = [styles.panel, elevation.level2, { backgroundColor: colors.canvas }];

  if (vm.alert === null) {
    return (
      <View pointerEvents="box-none" style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
        <View style={panel}>
          <EmptyState
            icon="traffic-light"
            title="No active alert"
            message="Alerts appear while a drive is running."
            action={<AppButton title="Back" variant="secondary" onPress={vm.onDismiss} accessibilityLabel="Back" />}
          />
        </View>
      </View>
    );
  }

  const icon: HazardIconName = alertIcon(vm.alert.camera?.type, vm.hazard?.type);
  // Speed status colour is the one accent allowed: it marks driving over the camera's limit.
  const accent = vm.isOverCameraLimit ? colors.status.over : colors.ink;

  // Anchored to the top like a speed-camera app's alert banner; the map stays visible below.
  return (
    <View pointerEvents="box-none" style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <View style={panel}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: colors.canvasSoft }]}>
            <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />
          </View>
          <View style={styles.titles}>
            <AppText variant="displaySm" numberOfLines={1}>
              {vm.title}
            </AppText>
            {vm.roadName !== null && (
              <AppText variant="bodySm" color="body" numberOfLines={1}>
                {vm.roadName}
              </AppText>
            )}
          </View>
          <IconButton icon="close" accessibilityLabel="Dismiss alert" onPress={vm.onDismiss} />
        </View>

        <View style={styles.distanceRow}>
          <AppText variant="displayXl">{vm.distanceLabel}</AppText>
          {vm.alertKind === 'camera' && vm.cameraLimitKmh !== null && (
            <LimitBadge limitKmh={vm.cameraLimitKmh} size="sm" over={vm.isOverCameraLimit} />
          )}
        </View>

        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Warning progress"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(vm.progress * 100) }}
          style={[styles.track, { backgroundColor: colors.canvasSoft }]}
        >
          <View style={[styles.fill, { width: `${Math.round(vm.progress * 100)}%`, backgroundColor: accent }]} />
        </View>

        {vm.isOverCameraLimit && vm.cameraLimitKmh !== null && (
          <AppText variant="bodySmStrong" style={{ color: colors.status.over }}>
            Slow down — limit {vm.cameraLimitKmh} km/h
          </AppText>
        )}

        {vm.alertKind === 'hazard' && vm.hazard !== null && vm.reportedLine !== null && (
          <StillThereSection hasVoted={vm.hasVoted} reportedLine={vm.reportedLine} onVote={vm.onVote} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.lg },
  panel: { borderRadius: rounded.xl, padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: touch.min,
    height: touch.min,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1, gap: spacing.xxs },
  distanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  track: { height: PROGRESS_HEIGHT, borderRadius: rounded.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: rounded.pill },
});
