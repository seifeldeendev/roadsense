import { useRef } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import type { TextInputInstance } from 'react-native';
import { AppButton, AppText, TextField } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';
import { AuthBrand, AuthLink } from '../components/AuthBrand';
import { AuthFormCard } from '../components/AuthFormCard';
import { FormErrorNote } from '../components/FormErrorNote';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { AuthScreenShell } from '../components/AuthScreenShell';
import { useSocialAuthViewModel } from '../viewmodels/useSocialAuthViewModel';
import { useSignUpViewModel } from '../viewmodels/useSignUpViewModel';

export default function SignUpScreen() {
  const vm = useSignUpViewModel();
  const social = useSocialAuthViewModel();
  const styles = useThemedStyles(signUpStyles, undefined);
  const router = useRouter();
  const emailRef = useRef<TextInputInstance | null>(null);
  const passwordRef = useRef<TextInputInstance | null>(null);
  const confirmRef = useRef<TextInputInstance | null>(null);

  return (
    <AuthScreenShell>
      <AuthBrand />
      <View style={styles.heading}>
        <AppText variant="displayXl">Create your account</AppText>
        <AppText variant="bodyMd" color="body">
          Sign up to report hazards and keep your trips.
        </AppText>
      </View>

      <AuthFormCard>
        <TextField
          label="Name"
          value={vm.name}
          onChangeText={vm.setName}
          error={vm.errorFor('name')}
          placeholder="Your name"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => {
            emailRef.current?.focus();
          }}
        />
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
          ref={emailRef}
          onSubmitEditing={() => {
            passwordRef.current?.focus();
          }}
        />
        <TextField
          label="Password"
          value={vm.password}
          onChangeText={vm.setPassword}
          error={vm.errorFor('password')}
          placeholder="At least 8 characters"
          secureToggle
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          ref={passwordRef}
          onSubmitEditing={() => {
            confirmRef.current?.focus();
          }}
        />
        <TextField
          label="Confirm password"
          value={vm.confirmPassword}
          onChangeText={vm.setConfirmPassword}
          error={vm.errorFor('confirmPassword')}
          placeholder="Repeat your password"
          secureToggle
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          ref={confirmRef}
          onSubmitEditing={vm.submit}
        />
        {vm.formError !== null && <FormErrorNote message={vm.formError} />}
        <AppButton
          title="Create account"
          onPress={vm.submit}
          loading={vm.submitting}
          disabled={vm.submitting}
          accessibilityLabel="Create account"
        />
        <SocialAuthButtons
          pendingProvider={social.pendingProvider}
          error={social.error}
          onContinue={social.continueWith}
        />
      </AuthFormCard>

      <AuthLink
        prompt="Already have an account?"
        label="Sign in"
        onPress={() => {
          router.push('/sign-in');
        }}
      />
      <AppText variant="caption" color="mute" style={styles.legalCaption}>
        By continuing you agree to drive safely and follow local traffic law.
      </AppText>
    </AuthScreenShell>
  );
}

function signUpStyles(_theme: ResolvedTheme) {
  return StyleSheet.create({
    heading: {
      gap: spacing.xs,
    },
    legalCaption: {
      textAlign: 'center',
    },
  });
}
