import { StyleSheet, Text } from 'react-native';
import type { SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { colors, typography } from '@/theme/tokens';

type StatusLineProps = {
  status: SpeedStatus;
  label: string;
};

const STATUS_COLOR: Record<SpeedStatus, string> = {
  ok: colors.status.ok,
  near: colors.status.near,
  over: colors.status.over,
};

export function AlertStatusLine({ status, label }: StatusLineProps) {
  return (
    <Text accessibilityRole="text" style={[styles.line, { color: STATUS_COLOR[status] }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  line: typography.bodyMdStrong,
});
