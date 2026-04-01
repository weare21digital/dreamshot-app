# Implementation Plan — [App Name]

<!--
BEFORE WRITING THIS FILE:
Read specs/SPEC_WRITING_GUIDE.md — it defines task principles (atomic, ordered,
specific, visible increment, linked). Then read specs/mobile-app-skeleton/tasks.md
as a reference for format and level of detail.

Key patterns to follow:
- Tasks grouped into phases (Setup, Data, Screens, Logic, Polish)
- Each task has a number, description, and sub-items with specific actions
- Sub-items reference actual file paths to create/modify
- Each task ends with _Requirements: X.Y, X.Z_ linking back to requirements.md
- Checkbox format: - [ ] for pending, - [x] for completed
- Tasks are ordered by dependency (foundations first, then screens, then polish)

CRITICAL for AI implementation:
- Tasks must be ATOMIC — one screen or one feature per task
- Tasks must be ORDERED — the AI will work through them sequentially
- Tasks must reference SPECIFIC FILES — "Create src/features/nutrition/hooks/useSearch.ts"
- Tasks must reference SKELETON COMPONENTS — "Use SearchInput, DataCard from src/components/ui/"
- Tasks must reference MOCKUPS — "Match design in design/food_search/code.html"
- Tasks must reference REQUIREMENTS — "_Requirements: 1.1, 1.2, 2.3_"

The AI reads this file and implements one task at a time, verifying each
against the acceptance criteria in requirements.md before moving to the next.
-->

## Overview

[Brief summary of what's being built and estimated task count.]

## Tasks

### Phase 1: Configuration & Setup

- [ ] 1. Configure app identity and skeleton modes
  - Update `app.json`: name, bundleId, scheme, version
  - Set `src/config/app.ts`: authMode
  - Set `src/config/iap.ts`: paymentMode, accessMode, product IDs
  - Set `src/config/theme.ts`: brand colors (primary, secondary, accent)
  - Replace icons in `assets/icons/` (icon.png, adaptive-icon.png, splash-icon.png)
  - _Requirements: [list]_

### Phase 2: Data Models & Services

- [ ] 2. Create app-specific data types and services
  - Create `src/features/[feature]/types.ts` with TypeScript interfaces
  - Create `src/features/[feature]/hooks/use[Feature].ts` for data access
  - [Define storage: local AsyncStorage, API calls, or both]
  - _Requirements: [list]_

### Phase 3: Screens & UI

- [ ] 3. Build [Screen Name] screen
  - Create `app/(main)/[screen].tsx`
  - Match design: `design/[screen_name]/code.html`
  - Use skeleton components: [SearchInput, DataCard, ChipSelector, etc.]
  - Create custom component `src/components/[Name].tsx` if needed
  - Wire up data from task 2
  - Test: [specific acceptance criteria to verify]
  - _Requirements: [list]_

- [ ] 4. Build [Next Screen] screen
  - Create `app/(main)/[screen].tsx`
  - Match design: `design/[screen_name]/code.html`
  - [Same pattern as above]
  - _Requirements: [list]_

### Phase 4: Business Logic

- [ ] 5. Implement [Feature/Logic]
  - Create `src/features/[feature]/hooks/use[Logic].ts`
  - [Describe the specific business logic]
  - [Reference edge cases from requirements]
  - _Requirements: [list]_

### Phase 5: Polish & Testing

- [ ] 6. Verify all flows on device
  - Test each acceptance criterion from requirements.md
  - Test edge cases: [list specific ones]
  - Test light and dark theme
  - Test with different access modes if applicable
  - _Requirements: all_

## Notes

- [Implementation decisions, gotchas, skeleton features to leverage]
- [Any known limitations or deferred items]
