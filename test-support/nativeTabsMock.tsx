// Jest stand-in for expo-router/native-tabs: the system tab bar cannot render
// under Jest (it mounts every tab at once), so the same triggers drive the JS
// tab navigator, which shows one screen at a time like the device does.
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Tabs } from 'expo-router/js-tabs';

type TriggerProps = { name: string; children?: ReactNode };

function Trigger(_props: TriggerProps) {
  return null;
}
Trigger.Label = (_props: { children?: ReactNode }) => null;
Trigger.Icon = (_props: object) => null;

function NativeTabs({ children }: { children?: ReactNode }) {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {Children.toArray(children)
        .filter((child): child is ReactElement<TriggerProps> => isValidElement(child))
        .map((child) => (
          <Tabs.Screen key={child.props.name} name={child.props.name} />
        ))}
    </Tabs>
  );
}
NativeTabs.Trigger = Trigger;

module.exports = { NativeTabs };
