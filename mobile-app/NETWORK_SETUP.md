# Network Configuration

API URLs are configured via environment variables in `mobile-app/.env`.

## Default Values

| Platform | Variable | Default |
|----------|----------|---------|
| Web | `EXPO_PUBLIC_API_URL_WEB` | `http://127.0.0.1:3000/api` |
| Android emulator | `EXPO_PUBLIC_API_URL_ANDROID` | `http://10.0.2.2:3000/api` |
| iOS simulator | `EXPO_PUBLIC_API_URL_IOS` | `http://localhost:3000/api` |

## Physical Devices

Replace default URLs with your machine's LAN IP:

```env
EXPO_PUBLIC_API_URL_ANDROID=http://192.168.1.100:3000/api
EXPO_PUBLIC_API_URL_IOS=http://192.168.1.100:3000/api
```

Find your IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

The backend binds to `0.0.0.0` in development, so it's accessible on any network interface.
