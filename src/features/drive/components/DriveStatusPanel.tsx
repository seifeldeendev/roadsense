import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, AppText } from '@/components/ui';
import { colors, rounded, spacing, touch } from '@/theme/tokens';
import { AlertStatusLine } from './AlertStatusLine';
import { LimitBadge } from './LimitBadge';
import { SpeedGauge } from './SpeedGauge';
import type { SpeedStatus } from './speedStatusMeta';

type DriveStatusPanelProps = {
  isDriving: boolean;
  speedKmh: number;
  status: SpeedStatus;
  statusLabel: string;
  hasLimit: boolean;
  limitKmh: number;
};

export function DriveStatusPanel({
  isDriving,
  speedKmh,
  status,
  statusLabel,
  hasLimit,
  limitKmh,
}: DriveStatusPanelProps) {
  if (!isDriving) {
    return (
      <Card variant="soft">
        <View style={styles.idle}>
          <View style={styles.idleIcon}>
            <MaterialCommunityIcons name="steering" size={24} color={colors.ink} />
          </View>
          <AppText variant="displaySm" style={styles.centered}>
            Ready when you are
          </AppText>
          <AppText variant="bodyMd" color="body" style={styles.centered}>
            Start a drive to see live speed and nearby alerts.
          </AppText>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="form">
      <View style={styles.hero}>
        <SpeedGauge speedKmh={speedKmh} status={status} />
        <LimitBadge limitKmh={hasLimit ? limitKmh : null} over={status === 'over'} />
        <AlertStatusLine status={status} label={statusLabel} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  idle: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  idleIcon: {
    width: touch.min,
    height: touch.min,
    borderRadius: rounded.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    textAlign: 'center',
  },
});
