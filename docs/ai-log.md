# RoadSense — AI Engineering Log

Format required by the module: verbatim prompt → output → my changes & verification → rationale.
Full verbatim prompts are stored in `docs/ai-prompts/`.

---

### AI-001 · 2026-10-24 · Seif · planning · Claude Code (claude-opus-5-5)
**Prompt (verbatim):** "we're trying to start implementing @phase-1.md our propsal was @"Mobile Application Development Project Proposal.pdf" and the selected idea is RoadSense so i want from you to write .md plan file for implementing each detail in @phase-1.md" — followed by "review this webpage and crawl accross the website for any detail that might help at the plan you wrote https://labverse-indol.vercel.app/mobile-development/coursework/cw-01"
**Output:** `docs/phase-1-plan.md` (task-by-task plan, folder structure, data model, screen specs).
**My changes & verification:** _Seif: fill in what you changed/checked in the plan._
**Rationale:** _Seif: fill in._

### AI-002 · 2026-10-24 · Seif · domain / data / services / stores · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-002-core-layers.txt`
**Output:** entities, repository interfaces, use cases (`getSpeedStatus`, `findUpcomingAlerts`, `isHazardExpired`, `applyVote`, geo utils), Cairo mock fixtures + mock repositories, `MockLocationSource`, speech wrapper, Zustand stores, 16 Jest tests; added ESLint config for `npx expo lint`.
**My changes & verification:** Re-ran `npx tsc --noEmit`, `npm test` (16/16) and `npx expo lint` independently; read all use cases, stores and services. Fixed `Trip.startedAt/endedAt` to epoch ms (matches the data model) and a leaked interval in `MockLocationSource.setRate()` when called while stopped. _Seif: add your own review notes._
**Rationale:** _Seif: fill in._

### AI-003 · 2026-10-24 · Seif · theme / ui primitives / navigation shell · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-003-ui-shell.txt`
**Output:** `src/theme/tokens.ts`, 11 UI primitives in `src/components/ui`, root Stack + 4-tab layout, 9 thin route files, 9 placeholder feature screens for the team to replace.
**My changes & verification:** Re-ran tsc, jest (16/16), lint; confirmed in `node_modules/expo-router/build/index.d.ts` that `Tabs` from `expo-router` is deprecated in favour of `expo-router/js-tabs` (the implementer's deviation). Raised `Chip` min height from 40 to `touch.min` (48) to meet the touch-target rule. _Seif: add your own review notes._
**Rationale:** _Seif: fill in._

### AI-004 · 2026-10-24 · Seif · features/drive (Drive Mode, Alert Overlay, Alert Settings) · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-004-drive-screens.txt`
**Output:** 3 screens, 3 ViewModel hooks + helpers, 8 feature components in `src/features/drive/`.
**My changes & verification:** Re-ran tsc, jest (16/16), lint and an Android bundle export; checked screens/components import no stores, services or data. Fixed two bugs: (1) a new alert while the overlay was open pushed a second stacked `/alert` modal — now the open overlay just updates; (2) the "target behind you" auto-dismiss ran while not driving, so "Preview alert" could close instantly after a stopped drive — now only checked while driving. _Seif: add your own review notes and on-device test results._
**Rationale:** _Seif: fill in._

### AI-005 · 2026-10-24 · Seif · design system (tokens, fonts, ui primitives, navigation) · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-005-design-system.txt` (applies `DESIGN.md`)
**Output:** tokens rewritten to DESIGN.md (black/white/grayscale, Inter type scale, 4-px spacing, pill/xl radii, elevation levels), Inter fonts loaded behind the splash screen, light header/tab bar with vector icons, all ui primitives restyled, new `AppText` and `IconButton`; callers migrated.
**Design decision:** DESIGN.md forbids accent colours, but FR1 requires amber/red speed status — kept two semantic colours (`status.near`, `status.over`) used only for speed status.
**My changes & verification:** Re-ran tsc, jest (16/16), lint; grepped `src/` for hex literals, `fontWeight`, letter-spacing and upper-casing outside tokens — none. Reviewed tokens against DESIGN.md tables. _Seif: add your notes._
**Rationale:** _Seif: fill in._

### AI-006 · 2026-10-24 · Seif · features/drive redesign to DESIGN.md · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-006-drive-redesign.txt`
**Output:** Drive Mode (speed card with level-2 shadow, black next-alert band, monochrome report tiles, one black CTA), Alert Overlay (modal card, pill vote buttons), Alert Settings (tab-toggle segmented controls, faq-row toggles, validation note); ViewModels unchanged.
**My changes & verification:** Re-ran tsc, jest, lint, Android export; grepped screens/components for hex, font props, letter-spacing and store/service/data imports — none. Replaced a duplicated `SpeedStatus` union with a type re-export from the domain so it can't drift. _Seif: add on-device review notes._
**Rationale:** _Seif: fill in._

### AI-007 · 2026-10-24 · Seif · dark mode + appearance toggle · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-007-dark-mode.txt`
**Output:** light/dark semantic palettes (dark = DESIGN.md polarity flip: black canvas, white primary CTA, white inverse band), persisted theme preference store (System/Light/Dark), ThemeProvider + `useTheme`/`useThemedStyles`, hairline borders on elevated surfaces in dark, all ui primitives / navigation / drive screens migrated, Appearance section in Alert settings.
**My changes & verification:** Re-ran tsc, jest (16/16), lint; grepped for hex/rgba outside `src/theme`, static colour imports, raw font props, and store imports in screens — none. Reviewed ThemeProvider/useTheme and confirmed speed-status colours still drive the gauge and status line. _Seif: test both schemes on device and add notes._
**Rationale:** _Seif: fill in._
