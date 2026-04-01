# App Icons

Place your app icons here. These are referenced by `app.json`.

## Required Files

| File | Size | Used For |
|------|------|----------|
| `icon.png` | 1024×1024 | App Store icon, iOS home screen |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon (foreground layer) |
| `favicon.png` | 48×48 | Web favicon |
| `splash-icon.png` | 200×200 | Splash screen logo |

## How to Update

1. Replace the files in this folder
2. Update `app.json` paths if filenames differ:
   ```json
   {
     "icon": "./assets/icons/icon.png",
     "ios": { "icon": "./assets/icons/icon.png" },
     "android": { "adaptiveIcon": { "foregroundImage": "./assets/icons/adaptive-icon.png" } },
     "web": { "favicon": "./assets/icons/favicon.png" }
   }
   ```
3. Run `npx expo prebuild --clean` to regenerate native projects

## Tips

- Use PNG format, no transparency for iOS icon
- Android adaptive icon: keep logo in the safe zone (center 66%)
- Generate all sizes from a single 1024×1024 source
