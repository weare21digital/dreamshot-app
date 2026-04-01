# Zero to App Store

Step-by-step guide to go from skeleton fork to a live App Store app.

Check off each step as you complete it. This serves as a progress tracker for both humans and AI agents building from this template.

> **This is your roadmap.** Follow this guide straight through for a complete journey from `git fork` to App Store submission. Each phase links to detailed docs when you need them.

## Prerequisites

Before you start, you'll need:

- **macOS** with Xcode 26+ (for iOS builds)
- **Node.js 22+**
- **CocoaPods** (`gem install cocoapods`)
- **Kiro CLI** (`curl -fsSL https://cli.kiro.dev/install.sh | bash` then `kiro-cli login`) — for spec generation
- **Apple Developer Program** membership ($99/year)
- **Google Cloud** project (free tier works fine — needed for Google Sign-In)

**Time estimate:** 4–6 hours spread across setup, testing, and submission phases

---

## Ground Rules

These rules prevent the most expensive mistakes in mobile app development:

1. **UX research is mandatory** for user-facing apps — don't skip `specs/UX_REQUIREMENTS.md` during spec generation
2. **Enrich specs after generation** — Kiro produces structure; the enrichment step adds production quality using `docs/07-reference/` patterns. Don't skip it.
3. **Read [UX Patterns](07-reference/ux-patterns.md) before building any screen** — dark theme contrast, pickers, touch targets, form design. Prevents 80% of post-build fixes.
4. **Check [Platform Gotchas](07-reference/platform-gotchas.md) when something breaks** — hard-won lessons from real builds (JS thread blocking, cache invalidation, native module issues)
5. **Follow this guide top to bottom** — don't skip phases, don't invent new workflows
6. **Single source of truth** — these docs are the process. Skills, agents, and tools reference them but never duplicate or override them.
7. **Designs are starting points** — improve UX where the mockups fall short (see [UX Patterns](07-reference/ux-patterns.md) for what "good" looks like)
8. **Reuse first, build second** — the skeleton ships with working modules for AI photo generation, video generation, coins/IAP, backend API proxy, theming, settings, and more. Before building anything, inventory what already exists in `src/features/`, `src/hooks/`, `src/services/`, and `backend/src/modules/`. Wire into existing code — don't reimplement. Your app-specific work should only be the screens and logic that are genuinely new.

---

## Quick Example: QuickNutrition

Here's what the full flow looks like for a real app:

**Step 1 — Generate spec:** Give Kiro (or any AI) your designs + app description → it outputs `specs/quicknutrition/` with requirements, design, and tasks.

**Step 2 — Audit:** A code-focused model (Codex/Claude) fixes inconsistencies in the spec.

**Step 3 — Enrich:** A creative model (Opus/Codex) reads `docs/07-reference/` patterns and upgrades the spec with production-quality UX details.

**Step 4 — Build:** An AI coding agent reads the enriched spec and implements task by task.

**Step 5 — Test & polish:** You test on simulator + device, fix issues, submit.

That's it. The rest of this doc walks through each step in detail.

---

## Stage Map (Who owns what)

Use this map as your high-level workflow. It makes handoffs explicit.

### Stage A — AI Build Pipeline (Zero → First Testable Build)

**Goal:** get from design files to a running app in simulator/device with all core flows implemented.

Includes:
- Phase 1 (Design)
- Phase 2 (Spec generation + audit + dual-model enrichment)
- Phase 3 (Fork/config)
- Phase 4 (Platform setup needed for local build)
- Phase 5 (Build & local test)

**Exit criteria (Stage A complete):**
- App runs in simulator/device
- Core user journeys from spec are implemented
- No blocking crashes
- All core-scope tasks in `specs/<app>/tasks.md` are marked complete (non-core/stretch tasks may remain)
- Ready for human polish pass

### Stage B — Manual Polish & Product Fit

**Owner:** human/operator (with AI support)

**Goal:** iterate UX quality, interaction details, copy, visual polish, and edge-case behavior.

Includes:
- Phase 6 (Audit & polish)
- Additional manual QA loops and UX refinements

**Exit criteria (Stage B complete):**
- App feels production-quality to the operator
- Edge cases handled (empty, error, loading, permissions, offline)
- Final UX decisions locked

### Stage C — Store Finalization & Publishing

**Goal:** complete console metadata, IAP records, legal/compliance, and submit.

Includes:
- Phase 7 (App Store Connect / Play Console setup)
- Phase 8 (Release build & submit)
- Phase 9 (Post-launch operations)

**Exit criteria (Stage C complete):**
- Store listings complete
- Build submitted/released
- Post-launch monitoring plan active

**Handoff rule:** do not start Stage C until Stage B sign-off is explicit.

---

## Pick Your Mode

Choose your app's operating mode before starting. This determines which phases to skip.

| Mode | Flag | What It Means |
|------|------|---------------|
| **Offline + Free with Ads** | `device:freemium` | No backend. Free to download. Shows ads. Optional premium IAP removes ads + unlocks features. **Most common choice.** |
| **Offline + IAP Gate** | `device:paid` | No backend. Free to download but locked behind a paywall. User must buy premium to use the app. |
| **Paid Download** | `device:unlocked` | No backend. No IAP. No ads. User pays once on the App Store to download. Everything unlocked. |
| **SaaS + Free with Ads** | `backend:freemium` | Full backend (auth, user accounts, server-side verification). Free tier with ads, premium upgrade via IAP. |
| **SaaS + IAP Gate** | `backend:paid` | Full backend. Free download but locked behind paywall. Server-side receipt verification. |

**Not sure?** Use `device:freemium`. It's the simplest — no backend to deploy, works fully offline, and you can always add a backend later.

### What to Skip per Mode

| Mode | Skip | Required |
|---|---|---|
| **device:unlocked** | Phase 4 Firebase/OAuth, all IAP docs, auth docs, backend docs | Apple Developer (distribution), App Store Connect (app record + pricing) |
| **device:freemium** | backend docs, backend env setup | Everything else including IAP setup |
| **device:paid** | Same as `device:freemium` | Same as `device:freemium` |
| **backend:freemium / backend:paid** | Nothing | Everything |

---

## Phase 1: Design Your App

Before touching any code, design your screens. The skeleton ships with example designs in `design/` — study them for the expected format.

- [ ] Use [Google Stitch](https://stitch.withgoogle.com/) (or similar) to generate HTML mockups for every screen
- [ ] Store them in a `design/` directory — one folder per screen with `code.html` + `screen.png`
- [ ] **Define your brand colors in the tailwind config block** inside each HTML file — this is how `setup.sh` will extract them later:
   ```js
   colors: {
       "primary": "#FF6B6B",
       "secondary": "#4ECDC4",
       "accent": "#3B82F6",
       "background-light": "#F5F5F5",
       "background-dark": "#1A1A2E",
   }
   ```
- [ ] Iterate until the design feels right — this is cheaper than changing code later

See [Design Mockups](01-getting-started/design-mockups.md) for the full workflow, directory structure, and tips.

---

## Phase 2: Write Your App Spec (with Kiro)

Before writing any code, create a detailed specification. Use **Kiro CLI** to generate specs from your designs and a high-level description — it produces much better specs than writing them manually.

> **⚠️ Mandatory UX research**: Always include `specs/UX_REQUIREMENTS.md` as context when generating specs. This drives competitor analysis, platform conventions, gap analysis, and accessibility requirements. Skipping it produces specs that look complete but miss critical real-world UX needs. See [UX Patterns](07-reference/ux-patterns.md) for the patterns your spec should produce.

### Prerequisites

Install and log in to Kiro CLI (one-time setup):
```bash
# Install
curl -fsSL https://cli.kiro.dev/install.sh | bash

# Log in (opens browser)
kiro-cli login
```

### Step 2a: Generate the spec

- [ ] **Read the skeleton spec first** — study `specs/mobile-app-skeleton/` to understand what the skeleton already provides (auth, payments, ads, theming, UI components). Your spec only needs to cover what's new or different.

- [ ] Copy the spec template:
   ```bash
   cp -r specs/TEMPLATE specs/<your-app-name>
   ```

#### Option A: Kiro CLI (recommended)

```bash
kiro-cli chat --agent kiro_planner --model claude-sonnet-4.5
```

> **Use the best model available.** Kiro defaults to `auto` (free tier) which produces lower quality specs. `claude-sonnet-4.5` is currently the best option. Run `kiro-cli chat --model help` to see available models.

Then paste this prompt (fill in the blanks):

```
I'm building "[APP_NAME]" from a mobile app skeleton (React Native/Expo).

Design mockups are in design/*/code.html — read them all.
Skeleton architecture spec is in specs/mobile-app-skeleton/ — read it for format and context.
Spec writing guide is in specs/SPEC_WRITING_GUIDE.md — follow it strictly.
Template files are in specs/TEMPLATE/ — use this structure.

Also read specs/UX_REQUIREMENTS.md and apply its UX research framework.
Use it to analyze gaps between mockups and production UX, then generate
context-specific requirements.

App description:
[DESCRIBE YOUR APP HERE — what it does, who it's for, key features,
business rules, what premium unlocks, any data sources, etc.]

Mode: [MODE]

Generate specs/[APP_NAME_LOWERCASE]/:
- requirements.md — EARS-style WHEN/SHALL requirements with acceptance criteria
- design.md — screens, navigation, data models, component mapping to skeleton UI
- tasks.md — ordered implementation checklist

CRITICAL: If the app doesn't use auth/login (e.g. device:unlocked mode), the tasks
MUST include removing skeleton auth routes (app/auth/), auth hooks, auth components,
and replacing app/index.tsx to skip the auth redirect. The skeleton ships with full
auth — unused features must be explicitly removed.
```

> **⚠️ Kiro planner cannot write files.** The `kiro_planner` agent has shell commands blocked — it outputs spec content to the terminal but cannot create files. You'll need to copy the output into the spec files manually.

#### Option B: Any AI tool

If Kiro isn't available, use the same prompt above in any AI assistant that can read your project files and write the spec files directly.

#### Tips for a good app description

The designs show *what it looks like*. Your description fills in *what it does*:

- **Business rules** — "free users limited to 10 favorites", "search is offline-only"
- **Data sources** — "local SQLite database", "REST API at api.example.com"
- **Premium features** — "removes ads, unlocks unlimited X, enables Y"
- **Edge cases** — "works fully offline", "syncs when back online"
- **What's NOT in the designs** — loading states, error states, empty states

The more specific you are, the better the spec. Vague → the AI guesses. Specific → the AI gets it right.

### Step 2b: Audit the spec

Kiro drafts fast but often has inconsistencies. **Always run a codex audit** before enriching:

```
Audit the spec in specs/[APP_NAME_LOWERCASE]/ for consistency and completeness.

Cross-reference against:
1. Design files in design/*/code.html — every screen element must map to a requirement
2. Original app description: [paste your description]
3. Skeleton spec in specs/mobile-app-skeleton/
4. specs/SPEC_WRITING_GUIDE.md for format compliance

Check for:
- Requirements that don't match the designs
- Tasks referencing non-existent requirements (or vice versa)
- Missing cleanup tasks (removing auth/payments/ads if unused)
- Wrong file paths or component names
- Contradictions between the three spec files

Fix all issues directly. List what you changed.
```

**Review checklist** (verify these after the audit):
- [ ] Does `tasks.md` include removing unused skeleton features? (auth routes if no auth, payment screens if unlocked, ad components if no ads)
- [ ] Does `tasks.md` include replacing `app/index.tsx` to route correctly? (skeleton defaults to auth redirect)
- [ ] Does `design.md` reference the correct skeleton UI components from `src/components/ui/`?
- [ ] Does `requirements.md` specify the app's access mode explicitly? (freemium/paid/unlocked)
- [ ] Are edge cases covered? (empty states, error states, offline behavior, large datasets)

   > **Critical lesson:** If your app doesn't use auth (e.g. `device:unlocked`), the spec MUST include a task to remove auth routes, components, and hooks. The skeleton ships with full auth — it won't disappear on its own.

### Step 2c: Enrich the spec with production patterns

- [ ] **Enrich the spec.** Kiro produces structurally correct but barebones specs. They describe *what* to build but not *how to build it well*. This step upgrades the spec using lessons learned from real app builds.

   Use two different models for this — ideally **Claude Opus** and **Codex 5.3** (or whichever strong models you have access to). Different models catch different things: Opus is strong on UX reasoning and creative solutions, Codex is strong on implementation accuracy and edge cases. Run both, then cross-check.

   #### Pass 1: First model enrichment

   Use Model A (e.g. Claude Opus):

   ```
   Read these reference docs:
   - docs/07-reference/ux-patterns.md (dark theme, touch targets, pickers, forms, component consistency)
   - docs/07-reference/platform-gotchas.md (JS thread blocking, cache invalidation, native gotchas)
   - docs/07-reference/notifications.md (if app uses notifications)
   - specs/UX_REQUIREMENTS.md (gap analysis framework)

   Now read the generated spec:
   - specs/<your-app>/requirements.md
   - specs/<your-app>/design.md
   - specs/<your-app>/tasks.md

   Enrich the spec by:
   1. For each screen/feature, identify which proven patterns from the reference docs apply
   2. Add concrete UX requirements where the spec is vague (e.g., "show time picker" → specify modal bottom-sheet pattern with Done button, dark theme contrast, 12h display)
   3. Add implementation notes to tasks that reference specific patterns (e.g., "use CALENDAR triggers with deterministic IDs per notifications.md")
   4. Add edge cases the spec missed: empty states, error states, dark theme contrast, touch target sizes
   5. Add a "Patterns Applied" section to design.md listing which reference patterns each screen uses
   6. Flag any spec decisions that contradict the reference docs (e.g., inline date spinners, no borders on dark theme cards)

   Do NOT:
   - Rewrite the spec structure — keep Kiro's format
   - Add features that aren't in the original spec
   - Be prescriptive about implementation details that don't affect UX quality
   - Duplicate the reference docs — just reference them by name/section

   The goal: a builder reading this spec produces Pillminder-quality output, not a barebones prototype.
   ```

   #### Pass 2: Second model review

   Use Model B (e.g. Codex 5.3) on the **already-enriched** spec:

   ```
   Read the enriched spec in specs/<your-app>/ and the same reference docs:
   - docs/07-reference/ux-patterns.md
   - docs/07-reference/platform-gotchas.md
   - docs/07-reference/notifications.md (if applicable)
   - specs/UX_REQUIREMENTS.md

   Review the enrichment for:
   1. Missed patterns — anything in the reference docs that applies but wasn't added
   2. Over-engineering — enrichments that add complexity without clear UX benefit
   3. Contradictions — enrichments that conflict with each other or with the original requirements
   4. Implementation feasibility — enrichments that sound good but are hard/impossible in React Native/Expo
   5. Missing platform-specific handling — patterns that need different approaches on iOS vs Android

   Fix issues directly in the spec files. Add anything important that was missed.
   List what you changed and why.
   ```

   #### Why two passes?

   Single-model enrichment has blind spots. Opus might add beautiful UX ideas but miss a React Native limitation. Codex might nail implementation details but overlook a UX anti-pattern. The cross-check catches what each model misses individually.

   If you only have access to one model, run the enrichment once — it's still a massive improvement over the raw Kiro spec.

   This enrichment step is what closes the gap between "technically correct spec" and "spec that produces a polished app." The reference docs grow with every app built — each new lesson automatically improves future specs.

- [ ] **Alternative: Write specs manually.** If you prefer not to use Kiro, follow the format in `specs/mobile-app-skeleton/` and the conventions in `specs/SPEC_WRITING_GUIDE.md`.

See [specs/README.md](../specs/README.md) for full guidelines.

> **Note:** The `specs/` directory travels with the fork — your new app inherits the skeleton spec as architecture reference, and your app-specific spec lives alongside it.

---

## Phase 3: Fork & Configure (30 min)

- [ ] **Fork and clone the repo**

   ```bash
   # Fork on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/mobile-skeleton-app.git
   cd mobile-skeleton-app
   ```

- [ ] **Already have a repo with designs?** If your app repo already exists (e.g., with a `design/` folder), copy the skeleton into it instead of forking:

   ```bash
   # From the skeleton repo, copy everything except .git and design
   rsync -av --exclude='.git' --exclude='design' /path/to/mobile-skeleton-app/ /path/to/your-app/
   ```

- [ ] **Copy your design mockups** into the repo (if they're in a separate location):

   ```bash
   cp -r /path/to/your/mockups/ design/
   ```

   Each screen should have its own folder under `design/` with `code.html` + `screen.png`.

- [ ] **Decide your app modes**

   The skeleton supports three operating modes. Choose based on your app's needs:

   | Use Case | Config |
   |----------|--------|
   | **Simple offline app** (no backend needed) | `authMode: 'device'`, `paymentMode: 'device'`, `accessMode: 'freemium'` |
   | **Paid download** (no IAP, no backend) | `authMode: 'device'`, `accessMode: 'unlocked'` |
   | **Full SaaS app** (backend + subscriptions) | `authMode: 'backend'`, `paymentMode: 'backend'` |

   See [App Modes](02-configuration/app-modes.md) for full details on what each mode does.

   **Most common choice:** Device mode + freemium (no backend, optional IAP)

   **For `device:unlocked` mode (paid download, no auth/IAP/ads), remove these files after setup:**

   Directories to delete:
   - `app/(auth)/` — welcome, verify-code, layout

   Screens to delete from `app/(main)/`:
   - `profile.tsx`
   - `premium.tsx`
   - `components.tsx`
   - `language-settings.tsx`
   - `notifications-settings.tsx`
   - `security-settings.tsx`

   Hooks/services to remove from `src/`:
   - Auth: `useAuth`, `useEmailLogin`, `useVerifyCode`, `useGoogleLogin`, `useAppleLogin`, `authService`
   - Payments: `useIAP`, `useDevicePremiumStatus`, `PaywallGate`
   - Ads: `useAd*`, `useShouldShowAds`, `adService`

   Update `app/index.tsx` to redirect directly to `/(main)`.
   Update `app/_layout.tsx` to remove PaywallGate wrapper and auth Stack screens.

- [ ] **Set your brand colors**

   Edit `mobile-app/src/config/theme.ts`:

   ```ts
   const brand = {
     primary: '#YOUR_PRIMARY_COLOR',
     secondary: '#YOUR_SECONDARY_COLOR',
     accent: '#YOUR_ACCENT_COLOR',
   };
   ```

   > **Note:** `setup.sh` extracts colors from tailwind config blocks and CSS custom properties in your design HTML. If your designs use inline hex colors instead, you'll need to set brand colors manually in `src/config/theme.ts`.

   See [Theming](02-configuration/theming.md) for the complete rebranding checklist (fonts, shapes, etc.).

- [ ] **Update app identity**

   Edit `mobile-app/app.json`:

   ```json
   {
     "name": "Your App Name",
     "slug": "your-app-name",
     "scheme": "your-app-scheme",
     "ios": {
       "bundleIdentifier": "com.yourcompany.yourapp"
     },
     "owner": "your-expo-username"
   }
   ```

   **Critical:** Choose your bundle ID carefully — you can't change it after App Store submission.

- [ ] **Complete the rename**

   Follow [Fork & Rename](01-getting-started/fork-and-rename.md) to update:
   - [ ] Package names
   - [ ] Android package structure
   - [ ] Deep link schemes
   - [ ] Database name (if using backend mode)

- [ ] **Replace app icons**

   Replace the placeholder icons in `mobile-app/assets/icons/`:

   | File | Size | Purpose |
   |------|------|---------|
   | `icon.png` | 1024×1024 | App Store + iOS home screen |
   | `adaptive-icon.png` | 1024×1024 | Android adaptive icon |
   | `splash-icon.png` | 200×200 | Splash screen logo |
   | `favicon.png` | 48×48 | Web favicon |

   See `assets/icons/README.md` for tips on safe zones and formats.

- [ ] **Android debug keystore (team-shared)**

   The debug keystore is stored in `mobile-app/keystores/debug.keystore` and auto-copied to `android/app/debug.keystore` after prebuild.

   ```bash
   cd mobile-app
   npm run prebuild
   ```

   This keeps Android debug SHA fingerprints stable across machines (required for Google Sign-In).

- [ ] **Set product IDs** (if using IAP)

   Edit `mobile-app/src/config/iap.ts`:

   ```ts
   ios: {
     subscriptions: ['com.yourcompany.yourapp.monthly'],
     oneTime: ['com.yourcompany.yourapp.lifetime'],
   },
   ```

   **Important:** Product IDs must start with your bundle identifier.

---

## Phase 4: Platform Setup (1–2 hours)

- [ ] **Apple Developer Portal**

   Visit [developer.apple.com](https://developer.apple.com):

   - [ ] **Create App ID** — Identifiers → App IDs → Register a New Identifier
     - Bundle ID must match `app.json`
     - Enable capabilities: ✅ Sign in with Apple, ✅ In-App Purchase (if using IAP)
   - [ ] **Create provisioning profiles** (Xcode can auto-generate these)

   See [Apple Developer Portal](03-platform-setup/apple-developer.md) for detailed steps.

- [ ] **Android `google-services.json` (build requirement)**

   - [ ] Generate/download `google-services.json` for your Android package name
   - [ ] Place it in `mobile-app/google-services.json`
   - [ ] Keep `android.googleServicesFile` in `app.json`

   This file is required by the Android Gradle Google Services plugin at build time. It does not mean Firebase runtime SDK usage.

   See [Android Config File](03-platform-setup/android-config-file.md).

- [ ] **Google Cloud OAuth**

   Visit [console.cloud.google.com](https://console.cloud.google.com):

   - [ ] APIs & Services → Credentials
   - [ ] Create OAuth 2.0 Client ID (Type: iOS, Bundle ID: your iOS bundle ID)
   - [ ] Copy the iOS Client ID
   - [ ] Optionally create a Web client ID (needed if using backend mode)

   See [Google OAuth](04-authentication/google-oauth.md) for complete setup.

- [ ] **Update .env files**

   ```bash
   cd mobile-app
   cp .env.example .env
   ```

   Edit `mobile-app/.env`:

   ```bash
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com  # optional
   ```

   **Device mode users:** That's all you need — no backend, no API URLs.

   **Backend mode users:** See [Local Development Setup](01-getting-started/local-dev-setup.md) for backend env setup.

---

## Phase 5: Build & Test Locally (1–2 hours)

### ⛔ Pre-build gate (mandatory)

Before writing ANY code, verify these Phase 3 outputs are complete. If any are missing, go back and finish Phase 3 first:

- [ ] `app.json` has your app's real name (not "mobile-app")
- [ ] `app.json` has your app's real slug (not "mobile-app")
- [ ] `app.json` has your app's real bundle ID (not "com.mobileskeleton.app")
- [ ] Brand colors are applied in the theme config
- [ ] App icon is replaced (not the default skeleton icon)
- [ ] Unused skeleton features are removed for your mode (auth/payments/ads if not needed)

**Do not proceed if any of these still show skeleton defaults.** An app built with the wrong name/bundle ID requires a full rebuild to fix.

---

- [ ] **Read mandatory reference docs before building**

   These prevent the most common and expensive build failures:

   - [ ] [**UX Patterns**](07-reference/ux-patterns.md) — dark theme contrast, date/time pickers, list patterns, form design, pre-flight checklist
   - [ ] [**Platform Gotchas**](07-reference/platform-gotchas.md) — JS thread blocking, cache invalidation, Reanimated, Metro, native module issues
   - [ ] [**UI Components**](02-configuration/ui-components.md) — skeleton component library (use before building custom)

- [ ] **Build the app.** Paste this prompt to an AI coding agent:

   ```
   Build a new app called "[APP_NAME]" from the mobile-skeleton-app skeleton.

   Read docs/00-zero-to-store.md and follow it from Phase 5 onward.
   Design files are already in design/.
   App spec is in specs/[APP_NAME_LOWERCASE]/.
   Mode: [MODE].

   Use ./setup.sh --non-interactive for Phase 3 (if not done already).
   Use ./setup.sh --verify after setup and after implementation.
   ```

   The agent will:
   - [ ] Read `specs/mobile-app-skeleton/` first (skeleton architecture)
   - [ ] Read `specs/<your-app>/` (your app's features)
   - [ ] Install dependencies (`cd mobile-app && npm install`)
   - [ ] Work through `tasks.md` sequentially — one task at a time
   - [ ] After each task, verify against the acceptance criteria in `requirements.md`
   - [ ] For each screen, match the design mockup in `design/<screen>/code.html`

   See [specs/README.md](../specs/README.md) for detailed AI implementation tips.

- [ ] **Prebuild iOS native code**

   ```bash
   npx expo prebuild --platform ios --clean
   ```

   This generates the `ios/` folder with native Xcode project. Run this after implementing features (or after changing native dependencies).

- [ ] **Run on simulator**

   ```bash
   LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
   ```

   This builds the native app **and** installs it on the default iOS simulator. After a successful build the app should launch automatically. **Verify it works before moving on:**

   - [ ] The app should open on the simulator without a red error screen
   - [ ] Navigate through all tabs/screens to confirm basic rendering
   - [ ] If the app is a dev client (uses `expo-dev-client`), Metro Bundler must be running — start it with `npx expo start --dev-client` if the app shows the Expo dev launcher instead of your screens
   - [ ] If you see a blank white screen, check Metro logs for JS errors — the native build succeeded but a JS-level crash is hiding the UI

   **Troubleshooting:**
   - [ ] First launch after clean rebuild may crash with "AccessibilityManager is nil" → just relaunch, second attempt works fine
   - [ ] For CocoaPods locale errors → the `LANG` prefix fixes them
   - [ ] If the simulator shows the Expo dev client launcher (not your app), run `npx expo start --dev-client` in another terminal and reopen the app
   - [ ] Blank screen with no errors usually means a navigation/redirect issue — check `app/index.tsx` is routing to your main screen

- [ ] **Smoke test every screen and fix issues**

   After the app launches in the simulator, **systematically test all functionality before moving on.** Don't just confirm it opens — actually use the app:

   - [ ] **Navigate every tab/screen** — verify content renders, no blank screens
   - [ ] **Test core interactions** — search, tap items, open detail views, go back, toggle settings
   - [ ] **Test data flows** — add favorites, check history, clear data, verify persistence
   - [ ] **Test edge cases** — empty states (no results, no favorites), long text, large datasets
   - [ ] **Check navigation** — back buttons work, swipe-back works, deep links resolve
   - [ ] **Verify skeleton cleanup** — no leftover auth screens, no payment prompts if unlocked, no ad placeholders

   **Fix every issue you find before proceeding.** Common post-build problems:
   - [ ] `app/index.tsx` still has skeleton's auth redirect → replace with `<Redirect href="/(main)" />`
   - [ ] Food detail or other push screens inside Tabs → move to root Stack for proper back navigation
   - [ ] Skeleton hooks still imported (useAuth, useAds) → remove imports and delete unused files
   - [ ] Category/search returns empty despite data existing → check async data loading and query keys

   This test-and-fix loop is critical. The build agent implements from the spec but can't visually verify — you catch what it missed.

- [ ] **Test on physical device**

   ```bash
   # Find your device
   xcrun devicectl list devices

   # Build for device (Xcode will prompt for signing)
   LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios --device
   ```

   See [iOS Builds](06-build-and-deploy/ios-build.md) for more build options.

- [ ] **Test authentication flows**

   - [ ] **Google Sign-In:** Should show native Google picker → store user info
   - [ ] **Apple Sign-In:** Should show native Apple dialog → store user info
   - [ ] **Device mode:** No network calls, everything stored in AsyncStorage
   - [ ] **Backend mode:** Should call your API and receive tokens

- [ ] **Test payments** (if applicable)

   - [ ] Open Profile screen → tap "Upgrade to Premium"
   - [ ] Complete sandbox purchase (use App Store sandbox account)
   - [ ] Verify premium status is saved
   - [ ] Restore purchases (Profile → Restore)

   **Device mode (iOS only):** Uses StoreKit 2 local verification
   **Backend mode:** Sends receipt to your backend for verification

   See [Payments Configuration](05-payments/payments.md) for full IAP testing guide.

---

## Phase 6: Audit & Polish (1–2 hours)

Phase 6 is now a **light verification pass**, not a discovery phase. Most UX conventions and polish expectations should already be captured in your spec via `specs/UX_REQUIREMENTS.md` and implemented during Phase 5.

Use this phase to catch what still slips through: real bugs, visual inconsistencies, and edge cases the spec missed.

- [ ] **Run the pre-flight checklist** from [UX Patterns](07-reference/ux-patterns.md#7-pre-flight-checklist) on every screen
- [ ] **Run the verification audit** — Review every screen against your implemented spec and `specs/UX_REQUIREMENTS.md`
- [ ] **Triage findings** — Categorize as P0/P1/P2 with effort estimates
- [ ] **Fix in parallel** — Spawn agents by category for fast iteration
- [ ] **Verify** — Rebuild, test on devices, confirm fixes

### Common structural issues to check

- [ ] Sub-screens nested inside Tabs can break iOS swipe-back — move them to the root Stack
- [ ] Onboarding data may be saved only in local state — ensure it persists to your real database/storage
- [ ] Tab transition animations can cause visual flash/shift — set tab animation to `'none'` where appropriate
- [ ] Parallel fix agents should get non-overlapping file assignments to avoid merge conflicts

See [Audit & Polish](06-build-and-deploy/audit-and-polish.md) for the complete guide, competitive analysis template, and prompt templates.

---

## Phase 7: App Store Connect (1 hour)

- [ ] **Create app record**

   Visit [appstoreconnect.apple.com](https://appstoreconnect.apple.com):

   - [ ] Apps → + → New App
   - [ ] **Platform:** iOS
   - [ ] **Name:** Your App Name (user-facing)
   - [ ] **Bundle ID:** Select the one you registered
   - [ ] **SKU:** Internal identifier (e.g., `your-app-1`)
   - [ ] **User Access:** Full Access

   See [App Store Connect](03-platform-setup/app-store-connect.md) for screenshots and details.

- [ ] **Accept Paid Apps Agreement** (if using IAP)

   - [ ] Agreements, Tax, and Banking → Paid Apps Agreement
   - [ ] Complete tax forms and banking info
   - [ ] Agreement must be "Active" before IAP works

   **Skip this if** `accessMode: 'unlocked'` (paid download with no IAP)

- [ ] **Create IAP products**

   For each product ID in `src/config/iap.ts`:

   - [ ] App Store Connect → Your App → In-App Purchases → +
   - [ ] **Type:** Consumable / Non-Consumable / Auto-Renewable Subscription
   - [ ] **Product ID:** Must match exactly (e.g., `com.yourcompany.yourapp.lifetime`)
   - [ ] **Pricing:** Set price tier
   - [ ] **Localization:** Add title + description for each market
   - [ ] **Screenshot:** Upload IAP review screenshot (required)

   **Status:** Save as "Ready to Submit" — products go live with your app.

   See [App Store IAP Setup](05-payments/app-store-iap.md) for full IAP creation guide.

- [ ] **Create sandbox tester account**

   - [ ] App Store Connect → Users and Access → Sandbox Testers
   - [ ] Add tester email (can be fake, e.g., `test+sandbox@yourcompany.com`)
   - [ ] Sign out of real App Store on device → sign in with sandbox account
   - [ ] Test purchases now use sandbox (no real charges)

- [ ] **Prepare store assets**

   Add screenshots and promotional assets to `mobile-app/assets/store/`:

   ```
   assets/store/
   ├── ios/
   │   ├── 6.7/          # iPhone 6.7" screenshots (1290×2796)
   │   └── 6.5/          # iPhone 6.5" screenshots (1242×2688)
   ├── android/
   │   ├── phone/        # Phone screenshots
   │   └── feature.png   # Feature graphic (1024×500)
   └── shared/           # Source designs, mockups
   ```

   > **⚠️ Simulator screenshots need resizing.** iPhone simulator screenshots (e.g., 1206×2622 for iPhone 17 Pro) don't match App Store Connect requirements (1242×2688 or 1284×2778). Resize with:
   > ```bash
   > sips -z 2778 1284 screenshot.png
   > ```

   See `assets/store/README.md` for full requirements per store.

---

## Phase 8: Release Build & Submit (1 hour)

- [ ] **Bump version**

   Edit `mobile-app/app.json`:

   ```json
   {
     "version": "1.0.0",
     "ios": {
       "buildNumber": "1"
     }
   }
   ```

   Increment `buildNumber` for every TestFlight upload.

- [ ] **Build release IPA**

   ```bash
   cd mobile-app
   npx expo prebuild --platform ios --clean
   cd ios
   LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install

   # Archive the build
   xcodebuild -workspace mobileapp.xcworkspace \
     -scheme mobileapp \
     -configuration Release \
     -sdk iphoneos \
     -archivePath build/mobileapp.xcarchive \
     archive

   # Export IPA
   xcodebuild -exportArchive \
     -archivePath build/mobileapp.xcarchive \
     -exportPath build/ipa \
     -exportOptionsPlist ExportOptions.plist
   ```

   **Note:** You'll need an `ExportOptions.plist` file — see the [Submission Checklist](06-build-and-deploy/submission-checklist.md) for the template.

   Alternatively, use **EAS Build**:

   ```bash
   npm install -g eas-cli
   cd mobile-app
   npm run build:prod:ios  # Defined in package.json
   ```

- [ ] **Upload via Transporter**

   - [ ] Open **Transporter** app (from Mac App Store)
   - [ ] Sign in with your Apple ID
   - [ ] Drag `mobileapp.ipa` into Transporter
   - [ ] Click **Deliver**

   Wait 5–20 minutes for processing.

- [ ] **Wait for TestFlight processing**

   - [ ] App Store Connect → TestFlight → iOS Builds
   - [ ] Build will appear with status "Processing"
   - [ ] When ready: status changes to "Ready to Submit"
   - [ ] You'll get an email notification

- [ ] **Submit for review**

   - [ ] App Store Connect → Your App → App Store tab
   - [ ] Create new version (e.g., 1.0.0)
   - [ ] Select build from TestFlight
   - [ ] Fill out metadata:
     - App description
     - Screenshots (required sizes: 6.7" and 6.5" — see `assets/store/`)
     - Keywords
     - Support URL
     - Privacy Policy URL (required)
     - App Review Information (demo account if needed)
   - [ ] Click **Submit for Review**

   **Review time:** Typically 24–48 hours. Apple will email you with the result.

### Android release keystore setup (one-time)

- [ ] **Generate a release keystore** (do this once, keep it private):

   ```bash
   cd mobile-app
   keytool -genkeypair -v \
     -keystore keystores/release.keystore \
     -alias release \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000
   ```

- [ ] **Do not commit** `keystores/release.keystore` (it's gitignored).
- [ ] **Configure Gradle signing** in `android/app/build.gradle` to read your release keystore path/passwords (typically via `gradle.properties` or env vars).
- [ ] **Keep secrets out of git** — never hardcode release passwords in tracked files.

### Android / Google Play

- [ ] **Build AAB:** `cd android && ./gradlew bundleRelease`
- [ ] **Upload** to Google Play Console → Internal testing track
- [ ] **Note:** Google Play requires **closed testing with 12+ testers for 14+ days** before production access
- [ ] See [Android Build](06-build-and-deploy/android-build.md) for full details

---

## Phase 9: Post-Launch

### Monitor crashes

- **Xcode Organizer** (Xcode → Window → Organizer → Crashes)
- Check for crash reports from users
- Monitor crashes in Xcode Organizer (or your preferred crash reporting service).

### Update IAP products

- Change pricing → takes effect immediately
- Add promotional offers → configure in App Store Connect

### Plan updates

- Bump `version` and `buildNumber` for each update
- Repeat Phase 7 (build + submit)

---

## Quick Reference: Config Files

| File | What it controls |
|------|-----------------|
| `app.json` | App name, bundle ID, version, Expo plugins |
| `src/config/app.ts` | `authMode` (device/backend) |
| `src/config/iap.ts` | `paymentMode`, `accessMode`, product IDs |
| `src/config/theme.ts` | Brand colors, light/dark palettes |
| `.env` | API URLs, OAuth client IDs |
| `assets/icons/` | App icons (icon.png, adaptive-icon.png, splash-icon.png) |
| `assets/store/` | Store screenshots, feature graphics, promotional assets |
| `google-services.json` | Android build-time config required by Google Services Gradle plugin |

---

## Paths Not Covered (Yet)

These are documented separately or coming soon:

- **Android / Google Play:** See [Android Builds](06-build-and-deploy/android-build.md)
- **Backend deployment:** Only needed if `authMode: 'backend'` (docs in progress)
- **Push notifications:** Local notifications supported via `expo-notifications`. Server-side push requires adding your own push service.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "AccessibilityManager is nil" crash on first launch | Normal after clean rebuild — rebuild again |
| CocoaPods locale errors | Prefix commands with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` |
| Google Sign-In not working | Verify iOS Client ID in `.env` and `iosUrlScheme` in `app.json` |
| IAP products not loading | Check bundle ID matches, products "Ready to Submit", agreement active |
| Build fails with signing error | Open Xcode → Signing & Capabilities → select team + provisioning profile |

See [Troubleshooting](07-reference/troubleshooting.md) for more solutions.

---

## Related Docs

- [App Modes](02-configuration/app-modes.md) — Deep dive into authMode, paymentMode, accessMode
- [Fork & Rename](01-getting-started/fork-and-rename.md) — Complete rename checklist
- [Submission Checklist](06-build-and-deploy/submission-checklist.md) — Pre-flight checks
- [IAP Overview](05-payments/iap-overview.md) — Understanding in-app purchases

---

**You made it!** 🎉 Questions? Open an issue or check the [Troubleshooting guide](07-reference/troubleshooting.md).
