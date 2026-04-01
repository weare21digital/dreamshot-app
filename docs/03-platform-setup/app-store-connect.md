# App Store Connect Setup

> ⚠️ **Requires development builds**
> Use **`npx expo run:ios`** / **`npx expo run:android`** for native testing. **Expo Go is not supported.**

This guide covers app record creation, IAP setup, binary upload, and sandbox testers with exact click paths.

Use placeholders:
- `{appName}`
- `{bundleId}`
- `{sku}`
- `{productId}`

---

## 1) Create app record

1. Navigate to: `https://appstoreconnect.apple.com/apps`
2. Click **+** → **New App**.
3. Fill form fields:
   - **Platforms**: iOS
   - **Name**: `{appName}`
   - **Primary language**: `{language}`
   - **Bundle ID**: select `{bundleId}`
   - **SKU**: `{sku}` (internal unique string)
   - **User Access**: Full Access (or Limit Access)
4. Click **Create**.

**Verify:** You should land on the app dashboard page for `{appName}` and see the selected `{bundleId}` in App Information.

---

## 2) Agreements, tax, and banking (required for paid apps/IAP)

1. Navigate to: `https://appstoreconnect.apple.com/business`
2. Open **Agreements**.
3. Accept the latest **Paid Applications** agreement.
4. Complete **Banking** and **Tax** sections if prompted.

**Verify:** Agreement status is active (not "Action Needed").

---

## 3) Create in-app purchases (IAP)

1. Navigate to: `https://appstoreconnect.apple.com/apps`
2. Open `{appName}`.
3. In left nav, go to **Monetization** → **In-App Purchases**.
4. Click **+**.
5. In **Type** dropdown, choose (typically) **Non-Consumable** for lifetime unlock.
6. Fill form:
   - **Reference Name**: `{appName} Lifetime`
   - **Product ID**: `{productId}` (must match `src/config/iap.ts`)
7. Click **Create**.
8. Fill required metadata:
   - **Price Schedule**: select price tier
   - **Localizations**: add at least one language with **Display Name** and **Description**
   - **Review Information**: upload **Screenshot** and add **Review Notes**
9. Save changes.

**Verify:** Product status becomes **Ready to Submit** (or equivalent ready state).

CLI sanity check for matching IDs:
```bash
grep -n "oneTime\|subscriptions" mobile-app/src/config/iap.ts
```

---

## 4) Upload a binary (required so IAP resolves on-device)

### Option A: Transporter (GUI)

1. Build `.ipa` (see iOS build doc).
2. Open Transporter app on macOS.
3. Sign in with App Store Connect account.
4. Drag `.ipa` into Transporter.
5. Click **Deliver**.

**Verify:** In App Store Connect → **TestFlight**, build appears with processing status, then **Ready to Test**.

### Option B: CLI upload

```bash
xcrun altool --upload-app --type ios --file path/to/app.ipa --apiKey KEY --apiIssuer ISSUER
```

**Verify:** Command returns upload success; TestFlight shows the uploaded build after processing.

---

## 5) Create sandbox testers

1. Navigate to: `https://appstoreconnect.apple.com/access/users`
2. Open **Sandbox** (or **Sandbox Testers**) tab.
3. Click **+** (add tester).
4. Fill form:
   - **First Name**: `{firstName}`
   - **Last Name**: `{lastName}`
   - **Email**: `{sandboxEmail}` (must be unused Apple ID)
   - **Password** / **Confirm Password**
   - **Country/Region**
5. Click **Create**.

**Verify:** Tester appears in sandbox users list.

On test device: **Settings → App Store → Sandbox Account** and sign in with `{sandboxEmail}`.

---

## 6) Final verification checklist

- App exists at `https://appstoreconnect.apple.com/apps` with correct `{bundleId}`
- Paid Applications agreement is active
- IAP product IDs match `src/config/iap.ts`
- At least one build uploaded and processed in TestFlight
- Sandbox tester can sign in on device

## Related Docs

- [App Store IAP](../05-payments/app-store-iap.md)
- [Receipt Verification](../05-payments/receipt-verification.md)
- [iOS Builds](../06-build-and-deploy/ios-build.md)
