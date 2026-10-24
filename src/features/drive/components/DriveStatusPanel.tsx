import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { colors, spacing, typography } from '@/theme/tokens';
import { AlertStatusLine } from './AlertStatusLine';
import { LimitBadge } from './LimitBadge';
import { SpeedGauge } from './SpeedGauge';

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
      <View style={styles.idleCard}>
        <MaterialCommunityIcons name="steering" size={28} color={colors.ink} />
        <Text style={styles.idleText}>
          Start a drive to see live speed (demo route: Salah Salem)
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.driveRow}>
      <SpeedGauge speedKmh={speedKmh} status={status} />
      <View style={styles.driveSide}>
        <LimitBadge limitKmh={hasLimit ? limitKmh : null} over={status === 'over'} />
        <AlertStatusLine status={status} label={statusLabel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  driveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  driveSide: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  idleCard: {
    minHeight: 168,
    borderRadius: spacing.lg,
    backgroundColor: colors.canvasSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  idleText: {
    ...typography.bodySm,
    color: colors.body,
    textAlign: 'center',
  },
});
