# Store Assets

Screenshots, banners, and promotional materials for App Store and Google Play submissions.

## App Store (iOS)

### Screenshots (required)
Capture on these simulator sizes or provide images at these resolutions:

| Device | Resolution | Required? |
|--------|-----------|-----------|
| iPhone 6.7" (15 Pro Max) | 1290×2796 | ✅ Yes |
| iPhone 6.5" (11 Pro Max) | 1242×2688 | ✅ Yes |
| iPhone 5.5" (8 Plus) | 1242×2208 | Optional |
| iPad Pro 12.9" | 2048×2732 | If supporting iPad |

- Minimum 3 screenshots per device size
- Maximum 10 screenshots per device size
- Can use same screenshots for similar sizes

### App Preview (optional)
- 15–30 second video
- Same resolutions as screenshots

## Google Play

### Screenshots (required)
- Minimum 2, maximum 8
- JPEG or PNG, 16:9 or 9:16
- Min 320px, max 3840px on any side

### Feature Graphic (required)
- 1024×500 PNG or JPEG
- Shown at top of store listing

### Promo Video (optional)
- YouTube URL

## Directory Structure

```
store/
├── ios/
│   ├── 6.7/          # iPhone 6.7" screenshots
│   ├── 6.5/          # iPhone 6.5" screenshots
│   └── ipad/         # iPad screenshots (if applicable)
├── android/
│   ├── phone/        # Phone screenshots
│   └── feature.png   # Feature graphic (1024×500)
├── shared/           # Source designs, mockups
└── README.md         # This file
```
