import { StyleSheet, View } from 'react-native';
import { AppText, IconButton } from '@/components/ui';
import { spacing } from '@/theme/tokens';

type WeekSelectorProps = {
  label: string;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function WeekSelector({ label, canGoNext, onPrev, onNext }: WeekSelectorProps) {
  return (
    <View style={styles.row}>
      <IconButton icon="chevron-left" accessibilityLabel="Previous week" onPress={onPrev} />
      <View style={styles.label}>
        <AppText variant="bodyMdStrong">{label}</AppText>
      </View>
      <IconButton
        icon="chevron-right"
        accessibilityLabel="Next week"
        onPress={onNext}
        disabled={!canGoNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    flex: 1,
    alignItems: 'center',
  },
});
