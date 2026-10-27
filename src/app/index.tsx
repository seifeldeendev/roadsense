import { Redirect } from 'expo-router';
// eslint-disable-next-line import/no-restricted-paths -- TODO(auth-gate): move session-driven rendering into an auth-gate component in a feature slice
import { useSessionStore } from '@/composition/stores';

export default function SessionRedirect() {
  const user = useSessionStore((s) => s.user);
  const hasCompletedOnboarding = useSessionStore((s) => s.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  if (user === null) {
    return <Redirect href="/sign-in" />;
  }
  return <Redirect href="/drive" />;
}
