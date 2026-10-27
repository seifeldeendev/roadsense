import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Dependencies } from '../data/dependencies';
import { createStores, type AppStores } from './createStores';

type Container = { dependencies: Dependencies; stores: AppStores };

const DependenciesContext = createContext<Container | null>(null);

type Props = {
  dependencies: Dependencies;
  // Stores already built from these dependencies (the app's); built fresh when omitted.
  stores?: AppStores;
  children: ReactNode;
};

export function DependenciesProvider({ dependencies, stores, children }: Props) {
  const [container] = useState<Container>(() => ({ dependencies, stores: stores ?? createStores(dependencies) }));
  return <DependenciesContext.Provider value={container}>{children}</DependenciesContext.Provider>;
}

function useContainer(): Container {
  const container = useContext(DependenciesContext);
  if (container === null) throw new Error('Wrap the app (or the test) in a DependenciesProvider');
  return container;
}

export function useDependencies(): Dependencies {
  return useContainer().dependencies;
}

export function useStores(): AppStores {
  return useContainer().stores;
}
