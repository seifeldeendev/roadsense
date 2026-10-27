import { StyleSheet, Text } from 'react-native';
import type { SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { colors, typography } from '@/theme/tokens';

type StatusLineProps = {
  status: SpeedStatus;
  label: string;
};

const TEXT_COLOR: Record<SpeedStatus, string> = {
  ok: colors.ok,
  near: colors.near,
  over: colors.over,
};

export function AlertStatusLine({ status, label }: StatusLineProps) {
  return (
    <Text accessibilityRole="text" style={[styles.line, { color: TEXT_COLOR[status] }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  line: {
    fontSize: typography.size.body,
    fontWeight: '700',
  },
});
