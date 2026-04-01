# App Icon Generation

This project includes the `rn-app-icon-generator` tool for easily creating all required iOS and Android app icons from a single source image.

## Quick Start

1. **Create your app icon** as a 1024x1024 PNG file
2. **Save it** as `assets/app_icon.png` in the project root
3. **Generate all icons** with:
   ```bash
   npm run generate:icons
   ```

## What It Creates

### iOS
- All required sizes for `ios/YourApp/Images.xcassets/AppIcon.appiconset/`
- Automatically updates `Contents.json`

### Android 
- Standard icons: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Round icons: `android/app/src/main/res/mipmap-*/ic_launcher_round.png`
- Adaptive icons with white background

## Manual Usage

You can also run the generator directly with custom options:

```bash
# Custom background color
rn-app-icon-generator ./assets/app_icon.png --background "#ff6b35" --platform all

# iOS only
rn-app-icon-generator ./assets/app_icon.png --platform ios

# With custom mask for Android adaptive icons
rn-app-icon-generator ./assets/app_icon.png --mask ./assets/masks/circle-mask.svg
```

## Requirements

- **Source image**: 1024x1024 PNG for best results
- **Background**: Use solid backgrounds unless transparency is intentional  
- **Quality**: High resolution, clear icon design

## Integration with Build Process

This step should be run **after** designing your app icon but **before** building for production. The generated icons will be included in your app bundles automatically.

---

*Generated icons replace any existing app icons in the native folders.*