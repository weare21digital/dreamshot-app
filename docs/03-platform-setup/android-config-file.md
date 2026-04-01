# Android Config File (`google-services.json`)

This project does **not** depend on Firebase SDK/services for runtime auth, but Android builds still require `google-services.json` because Gradle applies:

- `com.google.gms.google-services`

## Why this file is needed

The plugin reads `google-services.json` during Android build configuration. Without it, Android build can fail even if you are not using Firebase runtime APIs.

## Steps

1. Open Firebase Console (or Google tooling that provides the same file)
2. Select/create project
3. Add Android app with package name from `app.json` (`android.package`)
4. Download `google-services.json`
5. Place it at:

```
mobile-app/google-services.json
```

6. Ensure `mobile-app/app.json` includes:

```json
{
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

That is all. No iOS Firebase file is required.
