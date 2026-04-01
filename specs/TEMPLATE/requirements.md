# Requirements Document — [App Name]

<!--
BEFORE WRITING THIS FILE:
Read specs/SPEC_WRITING_GUIDE.md — it defines the exact format, EARS wording,
and what to include/exclude. Then read specs/mobile-app-skeleton/requirements.md
as a reference for level of detail.

Key patterns to follow:
- Introduction paragraph explaining what the app does + which skeleton modes it uses
- Glossary defining app-specific terms
- Each requirement has a User Story + numbered Acceptance Criteria
- Acceptance criteria use WHEN/SHALL format: "WHEN [trigger], THE System SHALL [behavior]"
- Requirements cover happy paths AND error/edge cases
- Reference skeleton modes (Auth_Mode, Payment_Mode, Access_Mode) where behavior differs
- Number requirements sequentially (Requirement 1, 2, 3...)
- Number acceptance criteria per requirement (1, 2, 3...)

What to include that's DIFFERENT from skeleton:
- Your app's unique features and business logic
- App-specific data models and validation rules
- Custom screens and their behavior
- Any skeleton defaults you're overriding

What NOT to repeat:
- Authentication flows (already in skeleton spec unless you're changing them)
- Payment/IAP flows (already in skeleton spec unless you're changing them)
- Push notifications, email service (already in skeleton spec)
- Generic CRUD operations that match skeleton patterns
-->

## Introduction

[Describe the app, its purpose, and target audience.]

**Skeleton configuration:**
- authMode: `device` | `backend`
- paymentMode: `device` | `backend`
- accessMode: `freemium` | `paid` | `unlocked`

## Glossary

- **[Term]**: [Definition]

## Requirements

### Requirement 1: [Feature Name]

**User Story:** As a [role], I want to [action], so that [benefit].

#### Acceptance Criteria

1. WHEN [trigger], THE System SHALL [behavior]
2. WHEN [condition], THE System SHALL [behavior]
3. WHEN [error case], THE System SHALL [error handling behavior]
