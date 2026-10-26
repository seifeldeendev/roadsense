import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton, AppText, EmptyState, GlassSurface, IconButton } from '@/components/ui';
import { alertIcon, rounded, spacing, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { LimitBadge } from '../components/LimitBadge';
import { StillThereSection } from '../components/StillThereSection';
import { useAlertOverlayViewModel } from '../viewmodels/useAlertOverlayViewModel';

const PANEL = 'gap-md p-lg';

export default function AlertOverlayScreen() {
  const vm = useAlertOverlayViewModel();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (vm.alert === null) {
    return (
      <View pointerEvents="box-none" className="flex-1 px-lg" style={{ paddingTop: insets.top + spacing.md }}>
        <GlassSurface radius={rounded.xl} className={PANEL}>
          <EmptyState
            icon="traffic-light"
            title="No active alert"
            message="Alerts appear while a drive is running."
            action={<AppButton title="Back" variant="secondary" onPress={vm.onDismiss} accessibilityLabel="Back" />}
          />
        </GlassSurface>
      </View>
    );
  }

  const icon: HazardIconName = alertIcon(vm.alert.camera?.type, vm.hazard?.type);
  // Speed status colour is the one accent allowed: it marks driving over the camera's limit.
  const accent = vm.isOverCameraLimit ? 'bg-status-over' : 'bg-ink';

  // Anchored to the top like a speed-camera app's alert banner; the map stays visible below.
  return (
    <View pointerEvents="box-none" className="flex-1 px-lg" style={{ paddingTop: insets.top + spacing.md }}>
      <GlassSurface radius={rounded.xl} className={PANEL}>
        <View className="flex-row items-center gap-md">
          <View className="h-touch w-touch items-center justify-center rounded-full bg-canvas-soft">
            <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />
          </View>
          <View className="flex-1 gap-xxs">
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

        <View className="flex-row items-center justify-between">
          <AppText variant="displayXl">{vm.distanceLabel}</AppText>
          {vm.alertKind === 'camera' && vm.cameraLimitKmh !== null && (
            <LimitBadge limitKmh={vm.cameraLimitKmh} size="sm" over={vm.isOverCameraLimit} />
          )}
        </View>

        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Warning progress"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(vm.progress * 100) }}
          className="h-1.5 overflow-hidden rounded-pill bg-canvas-soft"
        >
          <View className={`h-full rounded-pill ${accent}`} style={{ width: `${Math.round(vm.progress * 100)}%` }} />
        </View>

        {vm.isOverCameraLimit && vm.cameraLimitKmh !== null && (
          <AppText variant="bodySmStrong" className="text-status-over">
            Slow down — limit {vm.cameraLimitKmh} km/h
          </AppText>
        )}

        {vm.alertKind === 'hazard' && vm.hazard !== null && vm.reportedLine !== null && (
          <StillThereSection hasVoted={vm.hasVoted} reportedLine={vm.reportedLine} onVote={vm.onVote} />
        )}
      </GlassSurface>
    </View>
  );
}
