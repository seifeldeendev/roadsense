import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, FormErrorNote } from '@/components/ui';
import type { AuthProvider } from '@/domain/repositories';


type SocialAuthButtonsProps = {
  pendingProvider: AuthProvider | null;
  error: string | null;
  onContinue: (provider: AuthProvider) => void;
};

// Both providers use the white secondary pill so the form keeps a single black CTA.
export function SocialAuthButtons({ pendingProvider, error, onContinue }: SocialAuthButtonsProps) {
  const busy = pendingProvider !== null;

  return (
    <View className="gap-md">
      <View className="flex-row items-center gap-md">
        <View className="flex-1 bg-hairline" style={lineStyles.line} />
        <AppText variant="bodySm" color="body">
          or
        </AppText>
        <View className="flex-1 bg-hairline" style={lineStyles.line} />
      </View>
      <AppButton
        title="Continue with Google"
        variant="secondary"
        icon="google"
        onPress={() => onContinue('google')}
        loading={pendingProvider === 'google'}
        disabled={busy}
        accessibilityLabel="Continue with Google"
      />
      <AppButton
        title="Continue with Apple"
        variant="secondary"
        icon="apple"
        onPress={() => onContinue('apple')}
        loading={pendingProvider === 'apple'}
        disabled={busy}
        accessibilityLabel="Continue with Apple"
      />
      {error !== null && <FormErrorNote message={error} />}
    </View>
  );
}

const lineStyles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth },
});
