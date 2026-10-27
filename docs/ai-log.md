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
