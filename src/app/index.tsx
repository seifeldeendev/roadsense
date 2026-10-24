import { Redirect } from 'expo-router';
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
