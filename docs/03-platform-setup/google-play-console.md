# Google Play Console Setup

> ⚠️ **Requires development builds**
> Google Play billing uses native modules. **Expo Go is not supported.**
> Use **`npx expo run:android`** or EAS dev builds.

This guide covers Play Console app creation, listing setup, content/data forms, IAP products, and license testing.

Use placeholders:
- `{appName}`
- `{packageName}`
- `{productId}`

---

## 1) Create Play Console app

1. Navigate to: `https://play.google.com/console/developers`
2. Open your developer account → click **Create app**.
3. Fill form fields:
   - **App name**: `{appName}`
   - **Default language**: `{language}`
   - **App or game**: App
   - **Free or paid**: Free (or Paid; note Paid can't be switched back)
   - Check policy declarations checkboxes
4. Click **Create app**.

**Verify:** App dashboard opens and shows `{appName}` in header.

---

## 2) Complete main store listing

1. In left nav: **Grow** → **Store presence** → **Main store listing**.
2. Fill required text fields:
   - **App name / Title** (max 30 chars)
   - **Short description** (max 80 chars)
   - **Full description** (max 4000 chars)
3. Upload required graphics:
   - App icon
   - Phone screenshots
   - Feature graphic (1024 × 500)
4. Click **Save**.

**Verify:** No red validation errors; listing section shows completed status.

---

## 3) Content rating questionnaire

1. Go to **Policy and programs** → **App content**.
2. Open **Content rating** → **Start questionnaire**.
3. For a typical skeleton utility/content app (no UGC, no violence/gambling):
   - Category: choose relevant non-violent category
   - Violence/sexual/drugs/gambling/hate: **No**
   - User-generated content: **No** (unless your app has it)
4. Submit questionnaire.

**Verify:** Rating is generated and shown as complete.

---

## 4) Data safety form (typical skeleton answers)

1. Go to **Policy and programs** → **App content** → **Data safety**.
2. Click **Start**.
3. For typical `device:*` mode with local-only storage and no analytics backend:
   - **Does your app collect or share user data?** → **No**
   - If prompted about processing, indicate local/on-device handling only.
4. Submit form.

**Verify:** Data safety section shows complete status.

> If you enable backend auth/analytics/crash reporting later, update this form before release.

---

## 5) Create in-app products

1. Go to **Monetize** → **Products** → **In-app products**.
2. Click **Create product**.
3. Fill:
   - **Product ID**: `{productId}` (must match `src/config/iap.ts`)
   - **Name**: `{appName} Lifetime`
   - **Description**
4. Set pricing and activate product.
5. Save.

**Verify:** Product status is **Active**.

CLI check for IDs:
```bash
grep -n "oneTime\|subscriptions" mobile-app/src/config/iap.ts
```

---

## 6) License testing setup

1. Go to **Settings** → **License testing**.
2. In **Gmail accounts with testing access**, add tester emails.
3. Save.

**Verify:** Tester emails appear in list; purchases on tester devices use test billing.

---

## 7) Upload test release (recommended before billing tests)

```bash
cd mobile-app
npx expo prebuild --platform android --clean
cd android
./gradlew bundleRelease
```

Upload `app-release.aab` to **Testing** → **Internal testing** and roll out.

**Verify:** Internal test track shows active release.

## Related Docs

- [Google Play IAP](../05-payments/google-play-iap.md)
- [Android Builds](../06-build-and-deploy/android-build.md)
- [Android Signing](../06-build-and-deploy/android-signing.md)
