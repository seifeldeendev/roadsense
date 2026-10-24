import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, EmptyState, IconButton } from '@/components/ui';
import { colors, elevation, hazardMeta, rounded, spacing, typography, type HazardIconName } from '@/theme/tokens';
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
          action={<AppButton title="Back" onPress={vm.onDismiss} accessibilityLabel="Back" />}
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
      <View style={styles.card}>
        <IconButton icon="close" accessibilityLabel="Dismiss alert" onPress={vm.onDismiss} />
        <View style={styles.head}>
          <MaterialCommunityIcons name={icon} size={40} color={colors.ink} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>{vm.title}</Text>
            <Text style={styles.detail}>
              {vm.distanceLabel}
              {vm.roadName !== null ? ` · ${vm.roadName}` : ''}
            </Text>
          </View>
          {vm.alertKind === 'camera' && (
            <LimitBadge limitKmh={vm.cameraLimitKmh} size="sm" />
          )}
        </View>
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
    padding: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.canvas,
    borderRadius: rounded.xl,
    ...elevation.level2,
    padding: spacing.md,
    gap: spacing.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.displayMd,
    color: colors.ink,
  },
  detail: {
    ...typography.bodyMd,
    color: colors.body,
  },
});
