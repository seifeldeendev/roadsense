import { View } from 'react-native';
import { AppText } from './AppText';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md';
};

export function SectionHeader({ title, subtitle, size = 'sm' }: SectionHeaderProps) {
  return (
    <View className="mb-sm gap-xs">
      <AppText variant={size === 'md' ? 'displayMd' : 'displaySm'}>{title}</AppText>
      {subtitle !== undefined && <AppText variant="bodySm" color="body">{subtitle}</AppText>}
    </View>
  );
}
