import type { ReactNode } from 'react';
import { productionDependencies } from '../data/dependencies';
import { DependenciesProvider } from '../stores/DependenciesProvider';
import { productionStores } from './stores';

// Hands the production dependencies and stores to everything below it.
export function AppDependenciesProvider({ children }: { children: ReactNode }) {
  return (
    <DependenciesProvider dependencies={productionDependencies} stores={productionStores}>
      {children}
    </DependenciesProvider>
  );
}
