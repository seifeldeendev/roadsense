import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, AppText } from '@/components/ui';
import { rounded, spacing, touch } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
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
  const { colors } = useTheme();

  if (!isDriving) {
    return (
      <Card variant="soft">
        <View style={panelStyles.idle}>
          <View style={[panelStyles.idleIcon, { backgroundColor: colors.canvas }]}>
            <MaterialCommunityIcons name="steering" size={24} color={colors.ink} />
          </View>
          <AppText variant="displaySm" style={panelStyles.centered}>
            Ready when you are
          </AppText>
          <AppText variant="bodyMd" color="body" style={panelStyles.centered}>
            Start a drive to see live speed and nearby alerts.
          </AppText>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="form">
      <View style={panelStyles.hero}>
        <SpeedGauge speedKmh={speedKmh} status={status} />
        <LimitBadge limitKmh={hasLimit ? limitKmh : null} over={status === 'over'} />
        <AlertStatusLine status={status} label={statusLabel} />
      </View>
    </Card>
  );
}

const panelStyles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    textAlign: 'center',
  },
});
