# Implementation Plan — DreamShot

## Overview
Phase-ordered plan for DreamShot delivery with explicit sequencing, verification gates, and no-auth cleanup constraints.

## Sequencing Rules
1. Complete identity/config + route cleanup first.
2. Lock domain models/hooks before advanced UI behaviors.
3. Build screen flows in journey order (home → detail → picker → progress → result).
4. Add gallery/coins/settings after generation path is stable.
5. Run type-check and Appium capture at each major milestone.

## Tasks

### Phase 1: Configuration & Setup
- [x] 1. Finalize app identity and mode configuration
  - Update `mobile-app/app.json` (name/slug/scheme/bundle identifiers)
  - Confirm `src/config/app.ts` + `src/config/iap.ts` for backend/freemium
  - Replace remaining skeleton naming defaults
  - _Requirements: 7.1, 7.3_

- [x] 2. Apply complete DreamShot light/dark palettes
  - Update `mobile-app/src/config/theme.ts` across `brand`, `light`, and `dark`
  - Validate readable text and borders in both themes
  - _Requirements: 1.4, 7.2_

- [x] 3. Remove legacy auth/paywall entrypoint routing
  - Force launch/default path to `/(main)/home`
  - Redirect `/auth` and `/auth/welcome` into DreamShot flow
  - Verify no blocking onboarding surfaces remain in Stage A path
  - _Requirements: 7.3, 7.4_

### Phase 2: Domain Layer & Async Generation
- [x] 4. Add style presets config and generation/gallery types
  - Create `mobile-app/src/config/styles.ts`
  - Create `mobile-app/src/features/generation/types.ts`
  - Seed 8+ initial style presets matching design naming
  - _Requirements: 1.2, 2.1, 5.1_

- [x] 5. Add generation hooks/services with backend queue integration
  - Create `useGeneratePhoto`, `useGenerateVideo`, `useGenerationJob`
  - Add AsyncStorage-backed pending job persistence/recovery
  - Ensure failure paths support retry/refund behavior
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 6.3_

### Phase 3: Screen Delivery (Design Parity)
- [x] 6. Build Home / Style Gallery screen
  - Implement `app/(main)/home.tsx` against `design/home_gallery/code.html`
  - Match header branding, tabs, card grid, and bottom nav treatment
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 7. Build Style Detail and Photo Picker screens
  - Implement `app/(main)/style-detail.tsx` and `app/(main)/photo-picker.tsx`
  - Wire cost-aware actions and permission handling
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [x] 8. Build Generation Progress and Result screens
  - Implement `app/(main)/generation-progress.tsx` and `app/(main)/result.tsx`
  - Wire real generation hooks and retry states without long real-time waits in cron
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 9. Build My Gallery, Coins, and Settings screens
  - Implement `app/(main)/my-gallery.tsx`, `app/(main)/coins.tsx`, `app/(main)/settings.tsx`
  - Integrate coin balance display and restore/legal actions
  - _Requirements: 5.2, 5.3, 6.1, 6.2, 7.1_

### Phase 4: Verification & Hardening
- [x] 10. Final screenshot parity sweep vs design HTML/PNGs
  - Capture all key screens with Appium scripts
  - Record mismatch deltas and fix top-priority spacing/typography gaps
  - _Requirements: 1.1–1.4, 2.1, 7.2_

- [x] 11. No-auth + generation resilience acceptance pass
  - Validate startup route invariants and absence of auth blockers
  - Validate pending job restore path from AsyncStorage
  - Validate retry/error/refund behavior without real-time blocking scripts
  - _Requirements: 4.3, 4.5, 6.3, 7.3, 7.4_

- [x] 12. Stage A closeout checklist
  - Ensure `npm run type-check` passes
  - Ensure Appium artifacts exist for all required screens
  - Update PROGRESS + kanban notes with evidence and open deltas
  - _Requirements: all_
