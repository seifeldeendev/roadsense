import { createContext, useContext, useState, type ReactNode } from 'react';
// eslint-disable-next-line no-restricted-imports -- TODO(composition-root): default instance built from production dependencies
import { productionDependencies, type Dependencies } from '../data/dependencies';
import { createStores, defaultStores, type AppStores } from './createStores';

type Container = { dependencies: Dependencies; stores: AppStores };

const productionContainer: Container = { dependencies: productionDependencies, stores: defaultStores };

// Defaults to production, so anything rendered outside a provider keeps working.
const DependenciesContext = createContext<Container>(productionContainer);

type Props = {
  // Omitted in the app; tests pass fakes and get fresh stores built from them.
  dependencies?: Dependencies;
  children: ReactNode;
};

export function DependenciesProvider({ dependencies, children }: Props) {
  const [container] = useState<Container>(() =>
    dependencies === undefined ? productionContainer : { dependencies, stores: createStores(dependencies) },
  );
  return <DependenciesContext.Provider value={container}>{children}</DependenciesContext.Provider>;
}

export function useDependencies(): Dependencies {
  return useContext(DependenciesContext).dependencies;
}

export function useStores(): AppStores {
  return useContext(DependenciesContext).stores;
}
