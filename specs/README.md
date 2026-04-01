# App Specifications

This directory contains structured specs for the skeleton and all apps built from it.

## Structure

```
specs/
├── mobile-app-skeleton/     ← Skeleton baseline (reference for format)
│   ├── requirements.md      — User stories + acceptance criteria
│   ├── design.md            — Architecture, screens, data models
│   └── tasks.md             — Implementation checklist
├── TEMPLATE/                ← Copy this when creating a new app spec
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
└── <your-app-name>/         ← Your app's spec (same 3-file structure)
```

## How Specs Fit the Process

Specs are **Phase 2** of the [Zero to App Store](../docs/00-zero-to-store.md) workflow:

```
Phase 1: Design (Google Stitch mockups)
Phase 2: Spec (requirements → design → tasks)    ← YOU ARE HERE
Phase 3: Fork & Configure
Phase 4: Platform Setup
Phase 5: Build & Test (includes AI implementation from spec)
Phase 6: App Store Connect
Phase 7: Release Build & Submit
Phase 8: Post-Launch
```

## Creating a Spec for a New App

1. **Read [`SPEC_WRITING_GUIDE.md`](./SPEC_WRITING_GUIDE.md) first.** This covers the exact format, EARS-style wording, correctness properties, testing strategy, and what NOT to include. Follow it strictly — specs that deviate will need rewrites.

2. **Read `specs/mobile-app-skeleton/` as a reference.** All three files. This is your reference for format, level of detail, and tone. Your app's spec should match it closely.

3. **Copy the template:**
   ```bash
   cp -r specs/TEMPLATE specs/<your-app-name>
   ```

4. **Write requirements.md** — Follow the skeleton's WHEN/SHALL format exactly. Focus on what's UNIQUE to your app — don't repeat auth/payment flows unless you're changing them. Include business rules, edge cases, error states.

5. **Write design.md** — Follow the skeleton's structure (navigation, data models, component mapping). Reference mockups from `design/<screen>/code.html`. Specify which of the 11 skeleton UI components each screen uses.

6. **Write tasks.md** — Follow the skeleton's phase/task/sub-item format. Each task must be atomic, ordered by dependency, and reference specific files + requirements. The AI will execute these sequentially.

## Format Guidelines

**Follow the skeleton spec format exactly.** The `specs/mobile-app-skeleton/` files are the reference:

- **requirements.md** uses `WHEN [trigger], THE System SHALL [behavior]` format
- **design.md** includes TypeScript interfaces, navigation structure, component mapping
- **tasks.md** uses checkbox format `- [ ] N. Task name` with sub-items and requirement references

This consistency matters because:
- AI tools can parse the structure reliably
- Requirements trace to tasks via numbered references
- The same review process works across all apps

## Using Specs for AI Implementation

The spec is designed to be fed directly to an AI coding agent:

1. **Give it the skeleton spec first:** Have the AI read all three files in `specs/mobile-app-skeleton/`. This teaches it the architecture, conventions, component library, mode system, and patterns. Without this context, it will reinvent things that already exist.
2. **Then your app spec:** Have it read all three files in `specs/<your-app>/`.
3. **Work through tasks sequentially:** The AI implements one task at a time, following the exact order in `tasks.md`. Don't skip ahead.
4. **Verify after each task:** Check the relevant acceptance criteria from `requirements.md` are satisfied before moving to the next task.
5. **Reference mockups:** For each screen, the AI should match the design in `design/<screen>/code.html` using skeleton UI components.

### Tips for better AI results

- **More detail = fewer iterations.** Vague specs lead to guesswork.
- **Specify which skeleton components to use.** Don't let the AI reinvent DataCard when it exists.
- **Include edge cases in requirements.** Empty states, error states, loading states.
- **Keep tasks atomic.** One screen or one feature per task, not "build the whole app."
- **Reference file paths.** "Create `src/features/nutrition/hooks/useSearch.ts`" beats "create a search hook."
