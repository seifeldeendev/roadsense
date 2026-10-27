# Architecture migration audit

Branch `seif/radarbot-map`, audited 2026-10-27 at `da7e9b3`. The one authorised fix (Section 7) is `f3ee1ed`. Fix rounds 1–5 and the blocker follow-up came after, up to the commit that logs AI-059. Everything here is local and unpushed.

## Status after the fix rounds (Round 5)

### Verdict

**Fully Clean Architecture + MVVM, with the listed debt.** Nothing in the findings table or the filed items blocks it.

The blocking item from Round 5 was `useDriveStore`, a module singleton outside `useStores()`. It is now built by `createStores`, which closes F7 and the last of F9 (AI-058). Every store reaches view models through `useStores()`. The only `getState()` calls left in `src` are the approved `drivePointHandler` (a drive outlives any render) and `useSessionStore` reading its own handle during rehydration.

**What holds, each proved by breaking it:**
- **Boundaries are enforced.** All 48 audit plants were re-run after the conversion: 47 of 47 violations are caught, 45 by lint and 2 by the layer-shape guard tests. The control passes.
- **Allowlists, not denylists.** The domain imports only itself. Stores may import only `zustand` and `react`. There are no file exemptions and no `eslint-disable` anywhere in `src`.
- **Platform code reaches the inner layers only through `Dependencies`:** location, geocoding, app lifecycle, storage and camera data.
- **Screen and route shape.** Every screen goes through a view model, and every route file is a one-line re-export.
- **Store identity is pinned.** The provider builds its stores once, so a drive keeps one drive store and one working set across renders. A test fails if the provider ever rebuilds on render.
- **The critical driver-safety gaps are closed.** A camera query that hangs, a location feed that fails or stops, and the map's first-load hang (F15, now tested) all end in a state the driver or the user can see.

### Findings status

| ID | Severity | Status | Where fixed / why still open | Blocks "fully Clean Architecture + MVVM"? |
|---|---|---|---|---|
| F1 | High | ✅ Fixed | Guard test `__tests__/layerShape.test.ts` (AI-053) | — |
| F2 | High | ✅ Fixed | Domain import allowlist (AI-053) | — |
| F3 | High | ✅ Fixed | Guard test: no `.tsx` in `src/domain` (AI-053) | — |
| F4 | High | ✅ Fixed | Stores package allowlist, no exemptions (AI-056) | — |
| F5 | High | ✅ Fixed | `Dependencies.storage` for all four persisted stores (AI-056); report corrected in Round 5 | — |
| F6 | Medium | Open | `Dependencies.settings: SettingsRepository` is still wired and unread. Settings persist through `Dependencies.storage`. | No: a dead port, not a boundary breach. Acceptable debt; delete it or route settings through it. |
| F7 | Medium | ✅ Fixed | The lifecycle callback reads the latest selector values through a ref, not `getState()` (AI-058) | — |
| F8 | Low | No fix needed | Internal to a store | — |
| F9 | Medium | ✅ Fixed | Settings and theme (AI-055), drive (AI-058): every store is built by `createStores` | — |
| F10 | Low | Open | `BrandSplash` sits in `screens/` without a view model | No: cosmetic placement |
| F11 | Medium | ✅ Fixed | `WorkingSet` class with a private list; `forConsumer` is typed by the registry (AI-052) | — |
| F12 | Critical | ✅ Fixed | 5 s hang detector on every camera query; coverage states; one deadline at drive start (AI-051) | — |
| F13 | Critical | ✅ Fixed (detection and warning) | Watch errors reported, staleness after 5 s, same banner, no frozen speed (AI-051) | — |
| F14 | Medium | Open, defused | Before the first reading the follower still targets the phone's last fix. The banner now judges coverage at the drive's start (`drivingFrom`), so the only effect left is one wasted fetch. | No: acceptable debt |
| F15 | Medium | ✅ Fixed by F12, tested | A Live Map whose lookups all hang leaves its loading state within two query timeouts (~10 s: the working set times out, then the view's own query). With `findInBounds` untimed, the test fails (`__tests__/viewModels.test.tsx`, AI-059). | — |
| F16 | Low | Open | A demo drive played in the background stops following | No: demo only |
| F17 | Medium | ✅ Fixed | The status test carries a valid body; deleting the check fails it (AI-052) | — |
| F18 | Medium | ✅ Fixed | Timer cleanup in `afterEach` across four files; a broken warning fails in 13 s (AI-052) | — |
| F19 | High | ✅ Fixed | AI-038 is marked superseded; the `cba488b` message is noted as superseded, not rewritten (AI-054) | — |
| F20 | Low | ✅ Fixed | The report cites the right entries (AI-054) | — |
| F21 | High | ✅ Fixed | AI-046 relabelled as a behaviour change (AI-054) | — |
| F22 | Low | Open | `docs/radar-visibility-findings.md` (dated 2026-10-26) still describes the full-list mechanism, with no "superseded" note | No: a dated investigation record |
| F23 | Medium | Open, unverifiable here | Equivalence is proved through `node:sqlite`, not `expo-sqlite` on a device | No: a verification gap, not an architecture one. Needs a device run. |
| F24 | Medium | Open | The trip planner's destinations `loadUnless` lacks `\|\| state.isLoading` (`useTripPlannerViewModel.ts:79`) | No: correctness debt (a duplicate fetch), not a boundary |
| F25 | Low | Open | Route queries use the whole route's bounding box (at most 938 of 4,215 cameras) | No: efficiency |

**Filed during the fix rounds, still open:**
- **Permission recovery flows (from F13).** The driver is now warned when location fails or stops ("Location unavailable", "GPS signal lost"). There is no in-app recovery yet: re-requesting permission, opening settings, restarting the watch. Recovery means stopping and restarting the drive. It doesn't block the architecture verdict; it is product work on a failure path that is no longer silent.
- **Device measurements.** The dev-only time-to-first-cameras log is still uncommitted in the working tree, in `useDriveMapViewModel.ts`. Query latency on a device is unmeasured (F23). The 5 s camera timeout is a hang detector, not a latency budget (AI-051), so these measurements are not needed to justify it.

**Final state:** tsc, lint, jest 218/218 across 39 suites (exits without `--forceExit`), and the web export builds. No `eslint-disable` in `src`.

---

## Original audit (at `a25b736`)

The rest of this document is the audit as first written. It is kept unchanged as the record the fix rounds worked from.

Every claim in `docs/architecture-migration-report.md` and in AI-036 to AI-048 was treated as unverified until checked against the code. Evidence is either a file and line, or a command that was run: a planted violation, or a mutation that was applied, observed and then reverted. A passing suite was never counted as proof of an architecture claim.

Severity scale:

| Severity | Meaning |
|---|---|
| **Critical** | A driver could miss a camera alert. |
| **High** | A boundary is unenforced, or a documented claim is false. |
| **Medium** | Debt with a known workaround. |
| **Low** | Cosmetic. |

## Verdict

**The app is not yet fully Clean Architecture + MVVM.** The parts that matter most hold, and they hold because they were tested by breaking them:
- the domain is pure and fenced;
- feature slices are isolated;
- every route is a one-line re-export;
- every screen goes through a view model;
- data access goes through repositories wired by DI.

What remains:
1. **Lint gaps.** The lint misses four boundary violations it was meant to enforce (F1–F4).
2. **Outer-layer code in the stores layer.** The stores layer still owns outer-layer code: AsyncStorage persistence and `react-native` imports (F5).
3. **Stores outside DI.** Three stores bypass DI entirely (F9).
4. **Two critical gaps in the driving safety policy.** A fetch that never settles, and a lost GPS feed, both leave the driver without alerts and without a warning (F12, F13).

The migration report's statement that the stores-layer `react-native` import was the only mismatch between table, lint and code is false (F5).

## Findings

| ID | Severity | Where | Finding | Proposed fix |
|---|---|---|---|---|
| F1 | **High** | `eslint.config.js:28` (`routeZone`) | A route file containing logic passes lint. The plant `src/app/zzplant_logic.tsx` called a view model and branched on it. The rule only checks import paths. | Add a `no-restricted-syntax` block for `src/app/**` (excluding `_layout.tsx`) that allows only `ExportNamedDeclaration` with a `source`, and `ExportAllDeclaration`. |
| F2 | **High** | `eslint.config.js:155` | `@react-native-async-storage/async-storage` imported into the domain passes lint. The framework ban is a denylist whose `react-native-*` pattern doesn't match scoped `@react-native-*/…` packages. | Turn the domain rule into an allowlist: forbid every import that isn't relative or `@/domain` (for example the regex `^(?!\.\|@/domain)`). |
| F3 | **High** | `eslint.config.js:148` | A `.tsx` file in the domain passes lint. The framework ban applies to `src/domain/**/*.ts` only, and JSX compiles to an implicit `react/jsx-runtime` import that no import rule ever sees. | Widen `files` to `{ts,tsx}` and forbid JSX in the domain (`no-restricted-syntax` on `JSXElement`/`JSXFragment`), or forbid `.tsx` there outright. |
| F4 | **High** | `eslint.config.js:52` (stores zone), `:166` (stores block) | `expo-location` imported into stores passes lint. The stores rules restrict paths inside `src` and three named imports, but no packages. | Ban `react-native`, `expo*`, `@react-native-*/*` and `@expo/*` in stores, once F5 is resolved. |
| F5 | **High** | `src/stores/persistStorage.ts:1-2`, `docs/architecture-migration-report.md:107` | The stores layer imports AsyncStorage and `react-native` (`Platform`) directly. Route, session, settings and theme persistence all go through it, outside DI. The report names the `AppState` hooks as the only mismatch; this one is missing. | Move persistence behind a `StateStorage` port in `Dependencies` with the implementation in `src/data`, then apply the F4 ban. Correct the report. |
| F6 | **Medium** | `src/data/dependencies.ts:28,42` | `Dependencies.settings: SettingsRepository` is wired but nothing reads it. Settings persist through `useSettingsStore` + `persistStorage` under the same key, `roadsense.settings`. | Make `useSettingsStore` load and save through `deps.settings` (this pairs with F5 and F9), or delete the unused port. |
| F7 | **Medium** | `src/stores/cameraHooks.ts:52` | An imperative `useDriveStore.getState()` inside the lifecycle callback. It isn't in a view model, but it is a `getState()` outside the approved `drivePointHandler` exception. | Pass `isDriving`/`currentLocation` into the effect through a ref updated by an effect, or have `follow` take an "idle target" the hook keeps current. |
| F8 | **Low** | `src/stores/useSessionStore.ts:61` | `store.getState()` inside the store's own `onRehydrateStorage`. This is internal to the store, not a view-model read, and is listed for completeness. | None needed. |
| F9 | **Medium** | 14 files under `src/features/**` | `useDriveStore`, `useSettingsStore` and `useThemeStore` are module singletons that view models import directly, not through `useStores()`. They can't be swapped for fakes, so tests reset them by hand. Already listed as debt in the report. | Build them in `createStores(deps)` and expose them through `useStores()`. |
| F10 | **Low** | `src/features/onboarding/screens/BrandSplash.tsx` | A presentational animation sits in `screens/` with no view model. It is imported by the root layout, not routed. | Move it to `features/onboarding/components/`. |
| F11 | **Medium** | `src/stores/cameraHooks.ts` / `domain/usecases/cameras/cameraRadii.ts` | The coverage guard protects the derivation, not unregistered radii. Raising a registered radius passes because the set grows with it; that was proved with the Live Map at 15 km, 8/8 green. A new consumer that reads `workingSet` with a radius it never registered would silently miss cameras. Map reads are safe, because `useCamerasAround` checks coverage itself. The two direct readers (`drivePointHandler`, the active-alerts list) only use registered radii today. | Make `workingSet.cameras` reachable only through a function that takes a radius and asserts coverage, so an unregistered radius fails at runtime and in tests. |
| F12 | **Critical** | `src/stores/useCameraStore.ts:62-92, 133`; `src/domain/usecases/cameras/workingSet.ts:54` | A working-set fetch that never settles (SQLite hangs, the promise never resolves) has no timeout. `inFlight` never clears, so no refetch ever runs. **At drive start**, `prepareDrive` awaits it forever, so Start does nothing and stays latched (`useDriveModeViewModel.ts:94`, `startingRef`) until the screen remounts. **Mid-drive**, `driveCoverage` reports `loading`, not `unavailable`, so as the car leaves the set no banner shows. **The driver gets no camera alerts and no warning.** | Race each fetch against a timeout (e.g. 10 s) that counts as a failure. Show the driver banner when coverage is `loading` for longer than the timeout while driving. Bound `prepareDrive` by the same timeout. |
| F13 | **Critical** (predates the migration) | `src/data/location/ExpoLocationSource.ts:42` | If `watchPositionAsync` fails to start (permission revoked, location services off), the failure is swallowed. If readings simply stop mid-drive, nothing notices. The Drive tab stays in "driving" with a frozen speed. **The driver gets no alerts, no limit and no warning.** The same applies to a GPS drive with no fix at all. | Report a watch start failure to the view model. Add a reading watchdog: with no reading for N seconds while driving, show and speak "GPS signal lost". |
| F14 | **Medium** | `src/stores/cameraHooks.ts:27`, `useDriveModeViewModel.ts:113-115` | Between Start and the first reading, `isDriving` is true but `position` is null, so the follower targets the phone's last fix (or the demo start). It doesn't target the drive's start. A demo or replay drive started away from the phone fetches the wrong area once, then corrects itself at the first reading. A banner can appear if that wrong fetch fails. | Record the start position in the drive store at start, and make `followedPosition` prefer it while driving without a reading. |
| F15 | **Medium** | `src/stores/cameraHooks.ts:100` | A pattern-1 view query that never settles keeps the Live Map in its loading overlay forever on first load; later pans keep stale markers. There is no timeout. | Same timeout as F12; treat it as `failed` (a quiet idle state). |
| F16 | **Low** | `src/stores/useCameraStore.ts` (suspend), demo source | A demo drive keeps playing its timer in the background on some platforms. While suspended the set doesn't follow, so after 10 km the alerts go quiet, and the banner can't be seen. Demo only. | Pause demo playback on background (through `AppLifecycle`), or keep following during demo playback. |
| F17 | **Medium** | `__tests__/osrmRouteRepository.test.ts:62` | The error-status test is not a distinct path. With `if (!response.ok) throw` deleted, all 8 OSRM tests still pass, because the empty `{}` body fails later as "no routes". | Give the error-status case a body holding a valid route, so only the status check can make it fall back. |
| F18 | **Medium** | `__tests__/viewModels.test.tsx:341` | The driver-warning test calls `suspend()` only at its end. When the warning is broken, the test fails before the cleanup, the store's retry timers stay alive, and the full run hangs instead of reporting a failure. With a timeout and `--forceExit` it fails correctly ("Expected … Received: null"). | Use real cleanup: `afterEach` that suspends the store, or fake timers. |
| F19 | **High** | `docs/ai-log.md:221` (AI-038); commit `cba488b` | "install size grows ~280 KB" still stands in AI-038 and in the item-3 commit message. The net after the index is ~390 KB. AI-039 states ~390 KB, but AI-038 has no pointer to it, so a cold reader of AI-038 or of `git log` gets the superseded number. | Add a dated correction line to AI-038 pointing at AI-039. The commit message can only change by rewriting local history (`git rebase`) or by adding a `git notes` annotation; this needs your decision. |
| F20 | **Low** | `docs/architecture-migration-report.md:82` | The report says the size correction "is recorded in AI-039 and AI-040". AI-040's entry doesn't mention it: the AI-040 commit (`750eccd`) edited AI-039's text. | Reword it to "AI-039 (edited in `750eccd`)". |
| F21 | **High** | `docs/ai-log.md:275` (AI-046) | AI-046 heads the three-screen camera wait "UX kept the same, deliberately". The report (Behavior changes, #1) correctly calls it a behaviour change, so the two documents contradict each other. | Relabel AI-046's heading as a behaviour change and point to the report. |
| F22 | **Low** | `docs/radar-visibility-findings.md:9-10,20` | This dated investigation (2026-10-26) cites line numbers and a mechanism (fixed 150/10 km over the full list) that F replaced. It has no "superseded" note. | Add a status line pointing to AI-047. |
| F23 | **Medium** (unverifiable here) | `test-support/nodeRadarDatabase.js`, `src/data/radars/SqliteRadarCameraRepository.ts` | Equivalence is proved through `node:sqlite`, not `expo-sqlite`. The SQL, the shipped `.db` and the rows are identical, but the native driver's parameter binding and row mapping are never exercised. | Run the equivalence queries once in a dev build on a device, for example a debug screen or a Maestro flow. |
| F24 | **Medium** (carried) | `src/features/drive/viewmodels/useTripPlannerViewModel.ts:80` | The destinations `loadUnless` lacks `|| state.isLoading` (the sixth unguarded load). Confirmed in code. | Add the guard and a per-site test as in B. |
| F25 | **Low** | `src/features/map/viewmodels/useRoutePreviewViewModel.ts`, `useTripPlannerViewModel.ts` | Route queries use the bounding box of the whole route, not a corridor. A Cairo to Alexandria box returns 938 of 4,215 cameras (22%). That is not a full list, but it is 2–3× what the route needs. | Query a box per route segment, or a corridor. |

## Section 1: layer boundaries

**Result: the lint is real but incomplete. It caught 42 of 47 planted violations, plus one control that correctly passed. Of the 5 misses, 4 are high-severity findings (F1–F4) and 1 is the known `react-native` import in stores, fixed for `AppState` in Section 7.**

**Batch 1** (28 plants: 27 violations and 1 control):

| Plant | Caught |
|---|---|
| domain → `react`, `react-native`, `expo-location`, `zustand` | ✅ all 4 (`no-restricted-imports`) |
| domain → store (relative and `@/` alias), Sqlite repository, feature view model | ✅ all 4 (`import/no-restricted-paths`) |
| feature slice → other slice (alias and relative) | ✅ both |
| feature → `src/data`, `productionDependencies`, `services/gps`, `services/geocoding`, `composition` | ✅ all 5 |
| service → usecase (value import), service → store | ✅ both |
| `components/ui` → `components/map`, → `components/navigation` | ✅ both |
| value import from domain in services, in theme | ✅ both |
| store → `productionDependencies`, store → feature | ✅ both |
| data → store; shared → store; route file → store | ✅ all 3 |
| store → `react-native` | ❌ known; fixed for `AppState` in Section 7 |
| `import type` from domain in theme | ✅ passes, as it should (control) |

**Batch 2** (20 plants, edge cases):

| Plant | Caught |
|---|---|
| feature → gps by relative path, `require()`, dynamic `import()`, `export *` re-export | ✅ all 4 |
| feature → `import type` from data, `import type` from another slice | ✅ both (type imports are held to the zones too) |
| feature → `src/services/gps` by root-relative path | ✅ (`import/no-unresolved`) |
| domain → `expo-location/build/…` subpath, `react/jsx-runtime`, `react-native-maps`, services | ✅ all 4 |
| store → gps; map component → feature, → store | ✅ all 3 |
| route file → store (relative); a new `_layout.tsx` → store | ✅ both |
| **route file with logic** | ❌ **F1** |
| **domain → `@react-native-async-storage/async-storage`** | ❌ **F2** |
| **domain `.tsx` file with JSX** | ❌ **F3** |
| **store → `expo-location`** | ❌ **F4** |

**Why each miss passed, and which rule should have caught it:**
- **F1 (route file with logic).** The table says route files are one-liners. The only rule on `src/app` is `routeZone`, an import-path rule, and importing a feature is allowed. Nothing inspects the file body, so any logic after an allowed import passes.
- **F2 (AsyncStorage in the domain).** The domain framework ban (`eslint.config.js:155`) lists `react-native-*`. gitignore-style patterns don't match the scope `@react-native-async-storage/`. Being a denylist, it misses every package it doesn't name: axios, other `@react-native-*` scopes, `@react-navigation/*`.
- **F3 (domain `.tsx`).** The ban's `files` glob is `src/domain/**/*.ts` (`:148`), so `.tsx` files get no framework ban at all. Even with the glob fixed, JSX needs no visible `react` import under the automatic runtime, so an import rule alone can't catch it.
- **F4 (expo-location in stores).** `import/no-restricted-paths` only governs paths under `src/`. The stores' `no-restricted-imports` block names only `productionDependencies`, `createDependencies` and, since Section 7, `AppState`. No package policy exists for stores, and `persistStorage.ts` (F5) would violate one today.

**Config versus the table, by reading:** every zone matches the amended table in the report. Specific checks:
- composition may use stores, domain and `data/dependencies.ts`;
- features may use the three UI-affordance services and nothing else in services;
- layout files get theme, `AppDependenciesProvider` and `useThemeStore`;
- `import type` from domain is enforced in app, services, shared, theme and components.

The table rows `features: stores` and `stores: domain, data via DI` are enforced as paths. As F4 and F5 show, the paths are covered correctly but the layer is only half covered, because packages are outside the rule.

## Section 2: MVVM contract

**Mostly verified. Disproved for direct singleton store access (F9) and one `getState()` (F7).**
- **Route files:** all 19 non-layout files in `src/app` are one-line re-exports (checked by counting lines and reading each). The four layouts only wire providers, theme, fonts and `Stack.Protected` guards, and the guards come from `useSessionGateViewModel`. Nothing in `src/app` reads data.
- **Screens:** all 20 files in `features/*/screens` read view models. None imports a store, data, services or composition, or calls `getState`. `BrandSplash` has no view model and holds no state; it is a misplaced presentational component (F10).
- **View models:**
  - every view model is a `.ts` file, so it cannot contain JSX;
  - each returns a plain object;
  - the ones that need repository-backed stores get them from `useStores()` or `useDependencies()`;
  - no view model imports a repository-backed store module except as `import type`.
  - Fourteen feature files import the singleton `useDriveStore`, `useSettingsStore` or `useThemeStore` directly (F9).
  - Services used directly are only `haptics`, `speech` and `imagePicker`.
- **`getState(` in `src`:**
  - `drivePointHandler.ts` is the approved exception;
  - `cameraHooks.ts:52` is a finding (F7);
  - `useSessionStore.ts:61` is internal to the store (F8).

## Section 3: the two runtime patterns

**Verified as written, except for the two critical gaps found.**

| Claim | Status | Evidence |
|---|---|---|
| Set radius derived, not hardcoded | ✅ | `workingSet.ts`: `WORKING_SET_RADIUS_M = REFETCH_DISTANCE_M + MAX_CONSUMER_RADIUS_M`; `MAX_CONSUMER_RADIUS_M = Math.max(...WORKING_SET_CONSUMER_RADII_M)` |
| Consumer radii in one place, screens import them | ✅ | `cameraRadii.ts`; the Live Map, driving map and active-alerts view models import `LIVE_MAP_RADIUS_M`, `DRIVING_MAP_RADIUS_M` and `ACTIVE_ALERTS_LOOKAHEAD_M`; road match comes from `nearestRoadName.ts` |
| Guard fails when a radius exceeds set − refetch | ✅, with a caveat | Decoupling the set (`2_000 + 8_000`) fails: 10,000 > 8,000, and 4,797 cameras missing. Raising a registered radius (Live Map 15 km) passes 8/8, because the derivation grows the set. The guard protects the derivation; unregistered radii are F11. Both runs were reverted. |
| Set never discarded before a replacement | ✅ | `useCameraStore.ts:78-83`: the failure path never touches `workingSet`. Mutation M2 (empty the set on failure) fails 2 store tests. |
| Retry uses backoff | ✅ | `retryDelayMs`: 1 s doubling, capped at 30 s. Mutation M3 (constant 1 s) fails a store test. |
| Pre-drive failure warns the driver and the drive starts | ✅ | `useDriveModeViewModel.ts:113-117` (start → `prepareDrive` → `startDrive` regardless), plus the banner and `announce`. Mutation M6 (no warning) fails ("Received: null"). |
| Idle set reused only within 2 km | ✅ | `prepareDrive` → `needsFetch` → `isFreshFor` (≤ `REFETCH_DISTANCE_M`). Mutation M4 (never reuse) fails a store test. |
| Resume discards the old position and re-judges by 2 km | ✅ | `resume()` sets `followed: null`. A drive waits for its next reading, and an idle app follows its current position. Proved through the new seam (`appLifecycle.test.ts`); removing `suspend()` fails it. |
| Idle failure is quiet | ✅ | The banner requires `isDriving` (`useDriveModeViewModel.ts`); the Live Map treats `failed` as not loading. |
| Pan keeps old markers, never flashes empty | ✅ | `useLatest`. Mutation M5 (keep nothing) fails the pan test. |
| Planned-route demo queries the whole route | ✅ | `createRouteSpeedLimitLookup(findInBounds, playback.route, …)`. A real-data test compares a ~60 km route against the full database. |

**Gaps** (what the driver experiences):

| Case | Finding | What the driver experiences |
|---|---|---|
| Fetch never resolves | F12, **critical** | Start does nothing and stays stuck, or mid-drive the alerts go silent with no banner. |
| No GPS fix at all, or permission revoked mid-drive | F13, **critical**, predates the migration | "Driving" with a frozen speed: no alerts, no limit, no message. |
| Set centred on a stale or demo position | F14, medium | Between Start and the first reading the set follows the phone's last fix or the demo start, not the drive start. One wasted fetch, corrected at the first reading. A banner shows only if that wrong fetch also fails. |
| Background during a demo drive | F16, low | Playback continues, the set stops following, and alerts go quiet after 10 km. |
| A view query that never resolves | F15, medium | The Live Map stays on its loading overlay at first load. |

## Section 4: getAll() removal

**Verified, except one point that can't be verified here (F23).**
- `grep` finds no `getAll(` and no `HazardState.cameras` in `src`, `__tests__` or `test-support`, apart from the SQLite driver method `getAllAsync`. The `CameraRepository` interface has only `getInBounds`, `getByIds` and `getFirstSpeedCamera`.
- **No other route rebuilds the full list.** The only "everywhere" box is in the tests (`EVERYWHERE`). The largest production queries are:
  - panned views: up to 50 km plus a 2 km margin;
  - idle drive framing: up to 30 km;
  - route boxes: measured at 938 / 650 / 525 cameras for Cairo to Alexandria, Aswan and Hurghada (F25).
- **The equivalence test covers every query on both paths:**
  - 200 seeded boxes, more than 150 of them non-empty;
  - an edge-inclusive box;
  - 50 random id sets, including unknown ids and the empty set;
  - `getFirstSpeedCamera`;
  - the whole database through the `EVERYWHERE` box.
- **Possible divergence was checked:**
  - ids are unique (4,215 of 4,215, with `id TEXT PRIMARY KEY`);
  - both paths include edges (`BETWEEN` versus `>=`/`<=`);
  - both keep the feed order (`ORDER BY rowid` versus the array order).

  The native driver itself (`expo-sqlite`) is never exercised (F23).

## Section 5: test quality

**Seven of eight mutations are caught. One survives (F17), and one is caught only as a hang (F18).**

| # | Mutation | Result |
|---|---|---|
| M1 | Remove `\|\| state.isLoading` from trip history's `loadUnless` | caught, 1 failure |
| M2 | Working-set failure empties the set | caught, 2 failures |
| M3 | Backoff becomes a constant 1 s | caught |
| M4 | `prepareDrive` never reuses a fresh set | caught |
| M5 | `useLatest` keeps nothing | caught (pan test) |
| M6 | Driver warning removed | caught, but hangs a full run (F18) |
| M7 | OSRM ignores the HTTP status | **survives**: 8/8 green (F17) |
| M8 | `useFollowWorkingSet` never suspends (Section 7 test) | caught |

All mutations were reverted. `git status` showed only the uncommitted dev timing log afterwards.

**The tests checked:**
- the store tests on fakes (hazard, camera working set);
- the per-site guard tests;
- the OSRM tests;
- the pan and driver-warning view-model tests;
- the coverage guard;
- the planned-route limits test;
- the lifecycle test.

The OSRM suite does test network failure, malformed bodies (3 shapes plus non-JSON) and success as distinct inputs. But all failures go through one `catch`, so the status test proves nothing on its own (F17).

## Section 6: corrected claims

| Claim | In docs | In commits |
|---|---|---|
| ~160 KB saving, not ~1 MB | ✅ The "~1 MB" figure appears nowhere in the repo or in commit messages (it was only said in conversation). The report and AI-038 carry −160 KB. | ✅ |
| ~390 KB net, not ~280 KB | ❌ AI-038 (`docs/ai-log.md:221`) still says ~280 KB with no pointer (F19). AI-039 and the report say ~390 KB. | ❌ `cba488b` says ~280 KB (F19) |
| 5 km / 2 km set: 53% missing | ✅ AI-047 and the report state the correction with 53% / 9.3%. Every other "5 km" mention is the corrected claim or a test comment about distances. | ✅ `432f882` carries it |

**Behaviour changes, for a cold reader:**
- The three screens waiting on a camera query are in the report under "Behavior changes" (#1), but AI-046 calls the same thing "UX kept the same" (F21).
- The ignored double-tap on Start is in the report (#4) and in AI-047 ("Found while migrating").

## Section 7: the authorised fix

Done in `f3ee1ed` (AI-049), 8 files:
- **Seam:** the domain gains `AppLifecycle`. `src/services/appLifecycle.ts` is the only reader of `AppState`, wired in as `Dependencies.lifecycle`, and `useFollowWorkingSet` subscribes through `useDependencies()`.
- **Lint:** a `no-restricted-imports` rule bans `AppState` everywhere in `src` except that service, and is repeated in the stores block (flat config replaces options there). Planted `AppState` imports in stores, features and shared are all caught.
- **Test:** `__tests__/appLifecycle.test.ts` drives the lifecycle through a fake, and removing the hook's `suspend()` fails it.

**Final state:** tsc, lint and jest 200/200 across 37 suites, exiting without `--forceExit`.

The rule is deliberately limited to `AppState`. A full `react-native` ban in stores would fail on `persistStorage.ts` (F5), which this section doesn't authorise changing.
