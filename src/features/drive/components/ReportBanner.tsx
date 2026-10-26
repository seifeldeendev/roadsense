import { View } from 'react-native';
import { AppText } from '@/components/ui';
import { elevation } from '@/theme/tokens';

type ReportBannerProps = {
  message: string | null;
};

export function ReportBanner({ message }: ReportBannerProps) {
  if (message === null) return null;
  return (
    <View
      accessibilityLiveRegion="polite"
      className="min-h-touch items-center justify-center rounded-xl bg-inverse px-lg py-md"
      style={elevation.level3}
    >
      <AppText variant="bodyMdStrong" color="onInverse" className="text-center">
        {message}
      </AppText>
    </View>
  );
}
