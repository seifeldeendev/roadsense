import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  AppButton,
  AppText,
  EmptyState,
  IconButton,
} from '@/components/ui';
import { colors, elevation, hazardMeta, rounded, spacing, touch, type HazardIconName } from '@/theme/tokens';
import { LimitBadge } from '../components/LimitBadge';
import { StillThereSection } from '../components/StillThereSection';
import { useAlertOverlayViewModel } from '../viewmodels/useAlertOverlayViewModel';

export default function AlertOverlayScreen() {
  const vm = useAlertOverlayViewModel();

  if (vm.alert === null) {
    return (
      <View style={styles.backdrop}>
        <EmptyState
          icon="traffic-light"
          title="No active alert"
          message="Alerts appear while a drive is running."
          action={
            <AppButton
              title="Back"
              variant="secondary"
              onPress={vm.onDismiss}
              accessibilityLabel="Back"
            />
          }
        />
      </View>
    );
  }

  const icon: HazardIconName =
    vm.alertKind === 'camera'
      ? hazardMeta.camera.icon
      : vm.hazard !== null
        ? hazardMeta[vm.hazard.type].icon
        : 'alert';

  return (
    <View style={styles.backdrop}>
      <View style={styles.spacer} />
      <View style={styles.sheet}>
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />
          </View>
          <View style={styles.flex} />
          <IconButton
            icon="close"
            accessibilityLabel="Dismiss alert"
            onPress={vm.onDismiss}
          />
        </View>
        <AppText variant="displayLg" numberOfLines={2}>
          {vm.title}
        </AppText>
        <View style={styles.distanceRow}>
          <AppText variant="displayXxl">{vm.distanceLabel}</AppText>
          {vm.alertKind === 'camera' && vm.cameraLimitKmh !== null && (
            <LimitBadge limitKmh={vm.cameraLimitKmh} size="sm" />
          )}
        </View>
        {vm.roadName !== null && (
          <AppText variant="bodyMd" color="body">
            {vm.roadName}
          </AppText>
        )}
        {vm.alertKind === 'hazard' && vm.hazard !== null && vm.reportedLine !== null && (
          <StillThereSection
            hasVoted={vm.hasVoted}
            reportedLine={vm.reportedLine}
            onVote={vm.onVote}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    padding: spacing.lg,
  },
  spacer: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.canvas,
    borderRadius: rounded.xl,
    ...elevation.level2,
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: touch.min,
    height: touch.min,
    borderRadius: rounded.full,
    backgroundColor: colors.canvasSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
