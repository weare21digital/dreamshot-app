# PROGRESS.md — Build Progress Tracker

Copy this file into your app repo and check off steps as you complete them. This helps AI agents resume work across sessions — they can read this file to know exactly where you left off.

## How to Use

1. Copy this file to your app's root: `cp docs/PROGRESS.md ./PROGRESS.md`
2. Check off each step as you complete it
3. Add notes for anything unusual or blocked
4. Commit regularly so agents always have the latest state

---

## Progress

### Phase 1: Design
- [ ] Screen mockups created in `design/`
- [ ] Brand colors defined in tailwind config blocks
- [ ] All screens reviewed and finalized

### Phase 2: Spec
- [ ] Spec generated in `specs/<app-name>/`
- [ ] `requirements.md` — complete
- [ ] `design.md` — complete
- [ ] `tasks.md` — complete
- [ ] Codex audit pass — inconsistencies fixed

### Phase 3: Fork & Configure
- [ ] Repo forked/cloned (or skeleton copied into existing repo)
- [ ] `setup.sh` run successfully
- [ ] App identity updated (name, bundle ID, slug)
- [ ] Brand colors set
- [ ] App icons replaced
- [ ] App modes configured
- [ ] Unused skeleton features removed (if applicable)

### Phase 4: Platform Setup
- [ ] Apple Developer — App ID created
- [ ] Google Cloud — OAuth client ID created
- [ ] `.env` configured

### Phase 5: Build & Test
- [ ] `npm install` — dependencies installed
- [ ] Features implemented (task-by-task from spec)
  - [ ] Task 1: ...
  - [ ] Task 2: ...
  - [ ] _(add tasks from your spec)_
- [ ] `npx expo prebuild --platform ios --clean`
- [ ] Simulator build works
- [ ] All screens tested
- [ ] Physical device tested
- [ ] Auth flows tested (if applicable)
- [ ] Payments tested (if applicable)

### Phase 6: Audit & Polish
- [ ] Auto-audit run (all screens reviewed)
- [ ] Findings triaged (P0/P1/P2 with effort estimates)
- [ ] P0 fixes — all critical bugs resolved
- [ ] P1 fixes — missing interactions and features added
- [ ] P2 fixes — polish and animations applied
- [ ] Competitive analysis done
- [ ] Final rebuild and device test passed

### Phase 7: App Store Connect
- [ ] App record created
- [ ] IAP products created (if applicable)
- [ ] Sandbox tester configured
- [ ] Screenshots prepared and resized

### Phase 8: Release & Submit
- [ ] Version bumped
- [ ] Release IPA built
- [ ] Uploaded via Transporter
- [ ] TestFlight processing complete
- [ ] Submitted for review
- [ ] Android AAB built (if applicable)
- [ ] Google Play upload (if applicable)

### Phase 9: Post-Launch
- [ ] Crash monitoring set up
- [ ] First update planned

---

## Notes

- Added local payments v1 guardrails documentation (`docs/05-payments/local-v1-guardrails.md`).
- Skeleton consumable coin flow now uses local transaction idempotency + ledger (`@coins/processed-transactions`, `@coins/ledger`) to prevent duplicate grants on purchase/restore.
- This keeps local-only mode simple while staying migration-ready for future backend verification.
