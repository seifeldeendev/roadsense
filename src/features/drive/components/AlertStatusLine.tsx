import { StyleSheet, Text } from 'react-native';
import { typography } from '@/theme/tokens';
import { STATUS_COLOR, type SpeedStatus } from './speedStatusMeta';

type StatusLineProps = {
  status: SpeedStatus;
  label: string;
};

export function AlertStatusLine({ status, label }: StatusLineProps) {
  return (
    <Text accessibilityRole="text" style={[styles.line, { color: STATUS_COLOR[status] }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  line: {
    ...typography.bodyMdStrong,
  },
});
