import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { rounded, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type ValidationNoteProps = {
  message: string;
};

export function ValidationNote({ message }: ValidationNoteProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: colors.canvasSoft }]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.ink} />
      <AppText variant="bodySmStrong">{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: rounded.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});
