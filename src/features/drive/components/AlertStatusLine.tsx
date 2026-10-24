import { StyleSheet, Text } from 'react-native';
import { typography } from '@/theme/tokens';
import { useTheme, type ResolvedTheme } from '@/theme/useTheme';
import type { SpeedStatus } from './speedStatusMeta';

type StatusLineProps = {
  status: SpeedStatus;
  label: string;
};

export function AlertStatusLine({ status, label }: StatusLineProps) {
  const { colors } = useTheme();
  return (
    <Text
      accessibilityRole="text"
      style={[styles.line, { color: statusColor(colors, status) }]}
    >
      {label}
    </Text>
  );
}

function statusColor(colors: ResolvedTheme['colors'], status: SpeedStatus): string {
  return colors.status[status];
}

const styles = StyleSheet.create({
  line: {
    ...typography.bodyMdStrong,
  },
});
