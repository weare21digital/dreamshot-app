# Audit & Polish

A structured verification process to confirm quality before submitting to any app store.

## Why This Phase Exists

This phase is a **verification pass**, not a requirements discovery pass. By the time you reach Phase 6, your spec should already include core UX expectations via `specs/UX_REQUIREMENTS.md`, and implementation should already cover those items.

Use this phase to validate execution quality:

- **Find real defects** — broken flows, incorrect behavior, regressions
- **Catch visual inconsistencies** — spacing, typography, animation mismatches, dark-mode issues
- **Catch edge cases the spec missed** — unusual states, partial data, uncommon navigation paths

Goal: move from “mostly complete” to “store-ready,” without redefining product requirements this late in the process.

---

## The Audit Process

Three steps: audit, triage, fix.

### Step 1: Auto-Audit

Spawn an AI agent to review every screen against four sources:

1. **Your original specs and mockups** — is everything implemented?
2. **`specs/UX_REQUIREMENTS.md`** — what required conventions are missing?
3. **Competitive apps** in the same App Store category — what do users expect?
4. **Platform conventions** — iOS Human Interface Guidelines, Material Design

#### Audit Prompt Template

Copy this and adapt it for your app. Replace `[bracketed]` values with your specifics.

```
You are auditing a [app category] app built from HTML mockups and specs.
The app is called [app name] and runs on [iOS / Android / both].

## Your task

Review every screen in the app against:
1. The specs in specs/[your-app]/ — verify every requirement is implemented
2. The design mockups in design/ — verify screens match the designs
3. `specs/UX_REQUIREMENTS.md` — identify missing required interactions and polish
4. Top 5 apps in the [App Store category] category — identify gaps

## What to check on every screen

### Interactions
- Haptic feedback on buttons, keypad, save, delete
- Swipe-to-delete on list items
- Long-press context menus on actionable items
- Pull-to-refresh on data lists
- Native date/time pickers (not custom)
- Visual feedback on all tappable elements (opacity/scale)

### Data & State
- Empty states with CTAs on every list
- Loading states during data fetch
- Error states with retry
- Search on lists with >10 items
- Filter/sort on data lists
- Undo for destructive actions

### Navigation & Flow
- Onboarding / first-run experience
- All "View All" / "See More" links work
- Back navigation works everywhere
- Modal screens slide up, push screens slide right

### Visual Polish
- Entry animations on lists and cards
- Animated progress bars/rings
- Number/amount animations on change
- Consistent category/type colors
- Light AND dark mode
- Consistent spacing and typography

### Platform Conventions
- Currency formatting uses user's locale (no hardcoded $)
- Date formatting respects locale
- Biometric lock option (if app has sensitive data)
- Share sheet for export/backup
- Native pickers throughout

### Feature Completeness
- Every spec requirement has a working implementation
- All CRUD operations work
- Settings toggles do something
- Recurring/scheduled features have frequency options

## Output format

For each finding, provide:
- **Screen:** Which screen
- **Issue:** What's wrong or missing
- **Priority:** P0 (broken), P1 (missing expected feature), P2 (nice polish)
- **Effort:** Low (<30 min), Medium (30–60 min), High (>1 hour)
- **Fix:** Specific code change needed

Group findings by priority, then by screen.
```

### Step 2: Triage

Categorize every finding from the audit:

| Priority | Definition | Action |
|----------|-----------|--------|
| **P0** | Broken or non-functional — crashes, missing screens, data loss | Must fix before store submission |
| **P1** | Missing expected functionality — no empty states, no search, broken navigation | Should fix — users will notice |
| **P2** | Nice-to-have polish — animations, haptics, visual tweaks | Fix if time allows |

Rate effort for each:

| Effort | Time | Examples |
|--------|------|----------|
| **Low** | <30 min | Add haptic feedback, fix a link, add empty state |
| **Medium** | 30–60 min | Implement swipe-to-delete, add search, fix navigation |
| **High** | >1 hour | Onboarding flow, data export, competitive feature |

Sort by: P0 first, then P1 by effort (low → high), then P2.

### Step 3: Parallel Fix

Spawn multiple agents to work in parallel by category:

| Agent | Focus | Example tasks |
|-------|-------|---------------|
| **Agent 1** | P0 bug fixes | Crashes, broken screens, data loss |
| **Agent 2** | UX improvements | Haptics, swipe gestures, pull-to-refresh, feedback |
| **Agent 3** | Missing features | Search, filter, empty states, onboarding |
| **Agent 4** | UI polish | Animations, transitions, dark mode fixes, spacing |

Each agent gets:
- The relevant subset of findings
- Access to the codebase
- The spec and mockups for reference

After all agents finish:
1. Rebuild the app (`npx expo prebuild --platform ios --clean && npx expo run:ios`)
2. Test every fix on simulator
3. Test on physical device
4. Confirm no regressions

---

## Common Structural Bugs

These high-impact issues repeatedly show up in real app builds (including BudgetVault). Verify them explicitly:

- **Sub-screens inside Tabs break iOS swipe-back**
  - Symptom: detail screens open, but edge-swipe back is missing or unreliable
  - Fix: move detail/sub-screens to root Stack; keep Tabs for top-level destinations only

- **Onboarding data does not persist to database**
  - Symptom: user config appears set during onboarding but resets later
  - Fix: write onboarding values to the real persistence layer (SQLite/main storage), not transient local state

- **Tab transition animations flash/shift**
  - Symptom: visual flash, flicker, or content shift during tab changes
  - Fix: disable tab transition animation (`animation: 'none'`) where transitions are not stable

- **Parallel fix agents collide in the same files**
  - Symptom: merge conflicts and regressions after parallel work
  - Fix: assign non-overlapping file ownership per agent before implementation

---

## Competitive Analysis Template

Before submitting, check what users in your category expect:

1. **Search the App Store** for your app's category (e.g., "budget tracker", "habit tracker")
2. **Download the top 5 apps** (focus on 4+ star ratings)
3. **For each app, note:**
   - Onboarding flow — how many steps? What do they ask?
   - Data entry speed — how fast can you add a new item?
   - Visualizations — charts, progress indicators, summaries
   - Unique features — what do they have that you don't?
   - Polish level — animations, transitions, haptics
4. **Identify gaps** between your app and market leaders
5. **Prioritize** — which gaps matter most for launch? Which can wait for v1.1?

Don't try to match every feature. Focus on the basics that users in your category take for granted.

---

## Expected Timeline

| Step | Time |
|------|------|
| Verification audit | 15–30 min (AI agent does the work) |
| Triage | 15 min |
| Parallel fixes | 30–60 min (depends on finding count) |
| Verify | 15–30 min |
| **Total** | **1–2 hours** |

This is fast because verification is automated and fixes run in parallel. The alternative — discovering structural bugs from App Store reviews — is much more expensive.
