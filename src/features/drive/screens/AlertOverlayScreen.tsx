import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton, EmptyState } from '@/components/ui';
import { colors, hazardMeta, spacing, typography } from '@/theme/tokens';
import { LimitBadge } from '../components/LimitBadge';
import { StillThereSection } from '../components/StillThereSection';
import { useAlertOverlayViewModel } from '../viewmodels/useAlertOverlayViewModel';

export default function AlertOverlayScreen() {
  const vm = useAlertOverlayViewModel();

  if (vm.alert === null) {
    return (
      <View style={styles.backdrop}>
        <EmptyState
          icon="🚦"
          title="No active alert"
          message="Alerts appear while a drive is running."
          action={<AppButton title="Back" onPress={vm.onDismiss} accessibilityLabel="Back" />}
        />
      </View>
    );
  }

  const icon =
    vm.alertKind === 'camera'
      ? hazardMeta.camera.icon
      : vm.hazard !== null
        ? hazardMeta[vm.hazard.type].icon
        : '⚠️';

  return (
    <View style={styles.backdrop}>
      <View style={styles.spacer} />
      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
          onPress={vm.onDismiss}
          style={({ pressed }) => [styles.closeWrap, pressed && styles.pressed]}
        >
          <Text style={styles.closeIcon}>×</Text>
        </Pressable>
        <View style={styles.head}>
          <Text style={styles.icon} accessibilityLabel={vm.title}>
            {icon}
          </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  closeWrap: {
    alignSelf: 'flex-end',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: typography.size.title,
    color: colors.muted,
    fontWeight: '700',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.size.title,
    fontWeight: '700',
    color: colors.text,
  },
  detail: {
    fontSize: typography.size.body,
    color: colors.muted,
  },
});
