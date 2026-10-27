import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { colors, rounded, spacing } from '@/theme/tokens';

type ValidationNoteProps = {
  message: string;
};

export function ValidationNote({ message }: ValidationNoteProps) {
  return (
    <View style={styles.row}>
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
    backgroundColor: colors.canvasSoft,
    borderRadius: rounded.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});
