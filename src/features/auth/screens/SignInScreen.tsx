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
import { AuthScreenShell } from '../components/AuthScreenShell';
import { useSignInViewModel } from '../viewmodels/useSignInViewModel';

export default function SignInScreen() {
  const vm = useSignInViewModel();
  const styles = useThemedStyles(signInStyles, undefined);
  const router = useRouter();
  const passwordRef = useRef<TextInputInstance | null>(null);

  return (
    <AuthScreenShell>
      <AuthBrand />
      <View style={styles.heading}>
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
      </AuthFormCard>

      <AuthLink
        prompt="New to RoadSense?"
        label="Create an account"
        onPress={() => {
          router.push('/sign-up');
        }}
      />
      <AppText variant="caption" color="mute" style={styles.demoCaption}>
        Demo account: demo@roadsense.app · Drive2026
      </AppText>
    </AuthScreenShell>
  );
}

function signInStyles(_theme: ResolvedTheme) {
  return StyleSheet.create({
    heading: {
      gap: spacing.xs,
    },
    demoCaption: {
      textAlign: 'center',
    },
  });
}
