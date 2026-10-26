import { useRef } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import type { TextInputInstance } from 'react-native';
import { AppButton, AppText, TextField } from '@/components/ui';
import { AuthBrand, AuthLink } from '../components/AuthBrand';
import { AuthFormCard } from '../components/AuthFormCard';
import { FormErrorNote } from '../components/FormErrorNote';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { AuthScreenShell } from '../components/AuthScreenShell';
import { useSocialAuthViewModel } from '../viewmodels/useSocialAuthViewModel';
import { useSignInViewModel } from '../viewmodels/useSignInViewModel';

export default function SignInScreen() {
  const vm = useSignInViewModel();
  const social = useSocialAuthViewModel();
  const router = useRouter();
  const passwordRef = useRef<TextInputInstance | null>(null);

  return (
    <AuthScreenShell>
      <AuthBrand />
      <View className="gap-xs">
        <AppText variant="displayXl">Welcome back</AppText>
        <AppText variant="bodyMd" color="body">
          Sign in to report hazards and keep your trips.
        </AppText>
      </View>

      <AuthFormCard>
        <TextField
          label="Email"
          value={vm.email}
          onChangeText={vm.setEmail}
          error={vm.errorFor('email')}
          placeholder="you@example.com"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => {
            passwordRef.current?.focus();
          }}
        />
        <TextField
          label="Password"
          value={vm.password}
          onChangeText={vm.setPassword}
          error={vm.errorFor('password')}
          placeholder="Your password"
          secureToggle
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          ref={passwordRef}
          onSubmitEditing={vm.submit}
        />
        {vm.formError !== null && <FormErrorNote message={vm.formError} />}
        <AppButton
          title="Sign in"
          onPress={vm.submit}
          loading={vm.submitting}
          disabled={vm.submitting}
          accessibilityLabel="Sign in"
        />
        <SocialAuthButtons
          pendingProvider={social.pendingProvider}
          error={social.error}
          onContinue={social.continueWith}
        />
      </AuthFormCard>

      <AuthLink
        prompt="New to RoadSense?"
        label="Create an account"
        onPress={() => {
          router.push('/sign-up');
        }}
      />
      <AppText variant="caption" color="mute" className="text-center">
        Demo account: demo@roadsense.app · Drive2026
      </AppText>
    </AuthScreenShell>
  );
}
