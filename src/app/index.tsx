import { Redirect } from 'expo-router';
// TODO(item-5): routing reads the session store; move into an auth-gate component in a feature slice
import { useSessionStore } from '@/stores/useSessionStore';

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
