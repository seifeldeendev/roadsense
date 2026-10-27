import { productionDependencies } from '../data/dependencies';
import { createStores, type AppStores } from '../stores/createStores';

// The app's store instances, built once from the production dependencies.
export const productionStores: AppStores = createStores(productionDependencies);

// Direct handles on the same instances, for the few places outside a feature
// that read a store without useStores().
export const { useHazardStore, useNavigationStore, useRouteStore, useSessionStore, useTripStore } = productionStores;
