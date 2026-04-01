---
name: mobile-app-create
description: Create a new mobile app from the skeleton template. Use when starting a new app project, forking the skeleton, generating specs from designs, or following the zero-to-store workflow.
---

# Mobile App Create

Build a new mobile app from the skeleton template.

## Golden Rule

**`docs/00-zero-to-store.md` is the single source of truth.** Read it yourself, top to bottom, before doing anything. Do not rely on summaries, ticket descriptions, or notes from other agents. The docs contain critical details that get lost when paraphrased.

## How to Use

1. **Read `docs/00-zero-to-store.md` in full** — understand the complete pipeline before starting.
2. **Determine which phase you're starting from** — check `PROGRESS.md` if it exists.
3. **Follow every phase in order** — do not skip phases, do not combine steps, do not invent shortcuts.
4. **Create your own sub-tasks** based on what the docs tell you to do. The docs specify exact steps — follow them, don't wait for someone else to break them down for you.
5. **Do not start building (Phase 5) until the spec is generated, audited, AND enriched (Phase 2 complete).**

## Critical: Phase 2 is multi-step

Spec generation is NOT one step. The docs describe 3 mandatory sub-steps:

- **Step 2a: Generate** — create specs from designs + app description
- **Step 2b: Audit** — code-focused consistency pass against designs, description, and skeleton spec
- **Step 2c: Enrich** — dual-model pass using `docs/07-reference/` patterns (UX, dark theme, touch targets, edge cases)

All 3 are mandatory. Skipping enrichment produces barebones apps. The docs explain exactly how to run each sub-step.

## Common mistakes to avoid

- Skipping spec enrichment (Step 2c)
- Not reading the skeleton spec (`specs/mobile-app-skeleton/`) — leads to reinventing what's already built
- Not removing unused skeleton features (auth/payments/ads) for the app's mode
- Starting to code before the spec is complete
- Summarizing the docs instead of reading them directly
- Ignoring `docs/07-reference/ux-patterns.md` and `platform-gotchas.md`

## During work

- Read the relevant `docs/` subdirectory for each feature
- Read design `code.html` mockups for exact layout, colors, and components
- Keep `PROGRESS.md` and `specs/*/tasks.md` updated after completing work
- Commit frequently with meaningful messages
