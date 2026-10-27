import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { rounded, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type FormErrorNoteProps = {
  message: string;
};

export function FormErrorNote({ message }: FormErrorNoteProps) {
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
  },
});
