# Android Signing (Release)

End-to-end guide for signing Android releases for Play Console.

## 1) Generate release keystore

```bash
mkdir -p mobile-app/keystores
keytool -genkeypair -v \
  -keystore mobile-app/keystores/{appName}-release.jks \
  -alias {keyAlias} \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You will be prompted for:
- keystore password
- key password
- name/org/location details

**Verify:** file exists at `mobile-app/keystores/{appName}-release.jks`.

## 2) Configure `gradle.properties`

In `mobile-app/android/gradle.properties`, add:

```properties
MYAPP_UPLOAD_STORE_FILE=../keystores/{appName}-release.jks
MYAPP_UPLOAD_KEY_ALIAS={keyAlias}
MYAPP_UPLOAD_STORE_PASSWORD={storePassword}
MYAPP_UPLOAD_KEY_PASSWORD={keyPassword}
```

Then wire these in `mobile-app/android/app/build.gradle` release signingConfig (if not already wired).

**Verify:** `./gradlew bundleRelease` succeeds and produces `app-release.aab`.

## 3) Play App Signing model (important)

Google Play uses two key concepts:

- **App signing key**: held by Google, used to sign artifacts delivered to users.
- **Upload key**: your local key used to sign uploads (`.aab`).

Typical flow:
1. You sign AAB with upload key.
2. Upload to Play Console.
3. Google verifies upload key, then re-signs with app signing key for distribution.

If upload key is compromised, you can request reset without rotating end-user signing key.

## 4) Get SHA-1 from Play Console (Google Sign-In)

For release OAuth on Android, use SHA-1 from Play Console:

1. Play Console → **Setup** → **App integrity**.
2. Copy SHA-1 for the app signing key (and upload key if needed for testing).
3. Add SHA-1 to Google Cloud OAuth Android client.

CLI local check (upload key):
```bash
keytool -list -v -keystore mobile-app/keystores/{appName}-release.jks -alias {keyAlias}
```

## 5) Security rules

- Never commit `.jks` files.
- Never commit real keystore passwords in git.
- Use CI secrets / local secret manager for passwords.
- Back up keystore securely (password manager + encrypted backup).

Recommended `.gitignore` entries:
```gitignore
mobile-app/keystores/
*.jks
*.keystore
```

## Related Docs

- [Android Builds](android-build.md)
- [Google Play Console](../03-platform-setup/google-play-console.md)
