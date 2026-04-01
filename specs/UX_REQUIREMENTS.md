# Mobile App UX Research Framework

Use this framework when generating app specs from design mockups.
Its purpose is to drive **UX thinking and validation**, not to prescribe fixed features.

> Goal: Produce a product-grade UX spec that is grounded in category norms, platform conventions, and the app’s actual workflows.

---

## 1) Core Principles (Principles, not checklists)

1. **Designs are starting points, not complete UX.**
   Mockups define structure and intent; specs must define behavior, states, and edge cases.

2. **Follow user expectations for the app category.**
   Treat common competitor patterns as table stakes unless there is a clear reason to differ.

3. **Respect platform-native interaction models.**
   Prefer iOS/Android conventions over novel patterns when solving common problems.

4. **Design for full state coverage.**
   Every screen and data surface should account for loading, empty, error, success, and transition states as applicable.

5. **Define complete data lifecycles.**
   For each data entity: creation, display, editing, deletion/archive, persistence, sync, and recovery behavior.

6. **Prioritize clarity, feedback, and trust.**
   User actions should have clear affordances, immediate feedback, and predictable outcomes.

7. **Build for real users in real contexts.**
   Include accessibility, localization, variable data sizes, and interruption handling.

8. **Specify outcomes, not implementation trivia.**
   State UX intent and acceptance outcomes; avoid prescribing exact animations, gestures, or component names unless required.

---

## 2) Research Workflow (What the agent must do)

### A. Analyze design inputs
- Enumerate all screens, entry points, actions, forms, and navigation paths.
- Identify every data list/detail view and map primary user flows.
- Mark unclear or missing interactions for follow-up in the spec.

### B. Research category conventions
- Review top 5 apps in the same category on the App Store (and Play Store when relevant).
- Capture:
  - Shared UX patterns (baseline expectations)
  - Quality-of-life patterns in top performers
  - Differentiators worth emulating or explicitly rejecting

### C. Apply platform guidance
- Check relevant Apple HIG and Material Design guidance for:
  - Navigation models
  - Input/editing patterns
  - Feedback/confirmation patterns
  - Permissions, privacy, and system integrations
- If app is iOS-only or Android-only, prioritize that platform’s guidance.

### D. Convert findings into spec requirements
- Translate research into requirements tied to user outcomes.
- Justify deviations from category/platform norms.
- Keep requirements testable and traceable to a screen/flow.

---

## 3) Gap Analysis Framework (Mockup → Production UX)

For each screen/flow, compare what the mockup shows vs what production behavior requires:

1. **Interaction gaps**
   - What user actions are implied but unspecified?
   - What feedback, confirmation, or reversal paths are needed?

2. **State gaps**
   - Which states are missing (loading/empty/error/offline/partial data)?
   - How do transitions between states behave?

3. **Flow gaps**
   - Are first-run, return-user, and interrupted-session paths defined?
   - Are back navigation and deep-link entry paths coherent?

4. **Data gaps**
   - Where does each value come from and where is it stored?
   - What happens with no data, stale data, duplicate data, or large data?

5. **Quality gaps**
   - What makes this feel unfinished (jank, ambiguity, inconsistency)?
   - What minimum polish is needed for store-ready UX?

Document each gap as: **Observation → User impact → Proposed requirement**.

---

## 4) Evaluation Categories (Use these as lenses)

Evaluate each category at a high level and generate requirements where needed:

- **Interaction patterns** — Does interaction feel native and predictable?
- **State handling** — Can each screen gracefully handle realistic states?
- **Navigation & flow** — Are primary tasks efficient and logically structured?
- **Visual polish** — Does the app feel coherent, responsive, and production-ready?
- **Locale & accessibility** — Does it work across language, format, and ability differences?
- **Data integrity** — Is data consistent across create/read/update/delete paths and app restarts?

---

## 5) Research Prompts for Spec Generation

Use prompts like these before finalizing requirements:

- What are the top 5 category apps doing that users now expect by default?
- Which conventions are platform-native for this app’s core interactions?
- What critical states are not represented in the mockups?
- What happens when users have zero, one, or thousands of records?
- Where can users make mistakes, and how do they recover safely?
- Which flows require onboarding/help vs immediate direct use?
- What localization/accessibility needs materially affect this UX?
- What assumptions in the mockups are risky in real-world usage?

---

## 6) Output Expectation

The final spec should read as a **research-informed UX rationale** with testable requirements,
not a hardcoded feature checklist copied across app types.

If a requirement is included, it should be justified by at least one of:
- Design evidence
- Category evidence
- Platform guidance
- Data lifecycle necessity
- Accessibility/localization necessity
