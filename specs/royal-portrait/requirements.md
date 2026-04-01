# Requirements Document — DreamShot

## Introduction
DreamShot is an AI photo/video transformation app that turns user selfies into aristocratic portraits and short cinematic clips.
The app is built from mobile-skeleton-app in `backend:freemium` mode:
- backend is used only as a secure proxy for AI generation (no exposed provider keys)
- monetization uses local coin balance + IAP packs
- app experience is intentionally no-auth for end users

## Architecture Baseline
- `authMode: backend`
- `paymentMode: backend`
- `accessMode: freemium`
- No login/signup flow in the Royal user journey
- Backend endpoints must accept app-level requests without end-user auth session coupling

## Glossary
- **Style Preset**: Curated royal theme containing title, prompt, preview image, and coin costs.
- **Generation Job**: Backend-managed async task for creating photo/video output.
- **Pending Job Recovery**: On-launch restore of unfinished generation jobs from AsyncStorage.
- **Coin Wallet**: Device-visible balance used to pay for generations.

## Requirements

### Requirement 1: Style Gallery Home
**User Story:** As a user, I want a gallery of royal styles so I can quickly choose a look.

#### Acceptance Criteria
1. WHEN the app opens, THE System SHALL show a light-theme Royal gallery matching design/home_gallery (2-column card grid, crown branding, filter tabs, and bottom nav).
2. WHEN style presets are loaded, THE System SHALL render title + subtitle + preview image per preset.
3. WHEN no presets are available, THE System SHALL show a branded empty state with retry action.
4. WHEN dark mode is enabled from Settings, THE System SHALL preserve readable contrast and card separation.

### Requirement 2: Style Detail & Cost Actions
**User Story:** As a user, I want a detail screen for a style so I understand what creation options cost.

#### Acceptance Criteria
1. WHEN a style card is tapped, THE System SHALL open style detail with hero media, long-form description, and style affordances from design/style_detail.
2. WHEN generation actions are visible, THE System SHALL show Create Photo (20 coins) and Create Video (50 coins).
3. WHEN user balance is insufficient, THE System SHALL disable unaffordable actions and offer navigation to Coins.

### Requirement 3: Photo Picker Flow
**User Story:** As a user, I want to provide a source image so AI generation can start.

#### Acceptance Criteria
1. WHEN generation is initiated, THE System SHALL allow camera or gallery selection.
2. WHEN photo permission is denied, THE System SHALL show a clear recovery message with Settings guidance.
3. WHEN an image is selected, THE System SHALL persist draft context needed to resume interrupted generation.

### Requirement 4: Generation Progress & Result
**User Story:** As a user, I want feedback during generation and a polished result screen.

#### Acceptance Criteria
1. WHEN generation starts, THE System SHALL deduct coins atomically and create a backend generation job.
2. WHEN a job is pending, THE System SHALL poll status on intervals that avoid UI thread blocking.
3. WHEN app is relaunched mid-job, THE System SHALL recover pending jobs from AsyncStorage and resume status tracking.
4. WHEN the job succeeds, THE System SHALL open Result with Save, Share, Try Another Style, and photo-to-video upsell for photo outputs.
5. WHEN the job fails or times out, THE System SHALL show recoverable retry UI and refund on failure paths where deduction already occurred.

### Requirement 5: My Gallery History
**User Story:** As a user, I want to revisit generated outputs so I can save/share later.

#### Acceptance Criteria
1. WHEN generation succeeds, THE System SHALL persist result entries locally with type badges (photo/video).
2. WHEN My Gallery opens, THE System SHALL show reverse-chronological items with thumbnails and tap-to-view behavior.
3. WHEN history is empty, THE System SHALL show an intentional empty state with CTA to create first portrait.

### Requirement 6: Coins & Monetization
**User Story:** As a user, I want transparent coin balance and purchase options.

#### Acceptance Criteria
1. WHEN Coins opens, THE System SHALL show current balance and purchasable packs (100, 500, 1000).
2. WHEN purchase succeeds, THE System SHALL update balance idempotently and reflect updated value globally.
3. WHEN deduction or purchase verification fails, THE System SHALL preserve consistent balance and show actionable error feedback.
4. WHEN the app runs without signed-in user identity, THE System SHALL still allow coin spend/purchase flows using device-local wallet behavior.

### Requirement 7: Settings, Legal, and No-Auth Cleanup
**User Story:** As a user, I want confidence and control without being forced through unrelated auth surfaces.

#### Acceptance Criteria
1. WHEN opening Settings, THE System SHALL provide theme toggle, restore purchases, rate app, privacy policy, and terms.
2. WHEN theme changes, THE System SHALL update all Royal screens immediately without contrast regressions.
3. WHEN navigating Royal app routes, THE System SHALL avoid legacy skeleton auth/paywall onboarding entrypoints.
4. WHEN app launches, THE System SHALL land in Royal flow (`/(main)/home`) rather than welcome/auth funnels.
