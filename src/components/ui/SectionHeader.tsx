import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '@/theme/tokens';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md';
};

export function SectionHeader({ title, subtitle, size = 'sm' }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <AppText variant={size === 'md' ? 'displayMd' : 'displaySm'}>{title}</AppText>
      {subtitle !== undefined && <AppText variant="bodySm" color="body">{subtitle}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
});
