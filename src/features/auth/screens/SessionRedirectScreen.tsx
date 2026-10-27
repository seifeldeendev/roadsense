import { Redirect } from 'expo-router';
import { useSessionGateViewModel } from '../viewmodels/useSessionGateViewModel';

export default function SessionRedirectScreen() {
  const { startHref } = useSessionGateViewModel();
  return <Redirect href={startHref} />;
}
