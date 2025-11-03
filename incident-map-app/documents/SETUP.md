# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd incident-map-app
npm install
```

### 2. Configure API URL

Edit `config/constants.js` and update `BASE_URL`:

```javascript
// For Android Emulator
export const BASE_URL = 'http://10.0.2.2:4000';

// For iOS Simulator
export const BASE_URL = 'http://localhost:4000';

// For Physical Device (replace with your computer's IP)
export const BASE_URL = 'http://192.168.1.100:4000';
```

**To find your computer's IP:**
- **Windows**: Run `ipconfig` in CMD and look for IPv4 Address
- **Mac/Linux**: Run `ifconfig` or `ip addr` and look for inet address

### 3. Start Development Server

```bash
npm start
# or
expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator  
- Scan QR code with Expo Go app on your phone

## Platform-Specific Setup

### Android

1. Install Android Studio and set up an emulator
2. Or use Expo Go app on your Android device
3. Make sure your backend server is running

### iOS

1. Install Xcode (Mac only)
2. Or use Expo Go app on your iPhone
3. For iOS Simulator, use `http://localhost:4000`
4. For physical iPhone, use your Mac's IP address

## Troubleshooting

### Cannot connect to backend
- Verify backend server is running on port 4000
- Check firewall settings
- For physical device, ensure phone and computer are on same WiFi network
- Try using `http://YOUR_IP:4000` instead of localhost

### Location permissions not working
- On Android: Check app permissions in Settings
- On iOS: Add location permissions in `app.json`

### Maps not loading
- OpenStreetMap tiles should work without configuration
- Check internet connection
- Verify `react-native-maps` is properly installed

## Next Steps

1. Start your backend server (if not already running)
2. Run `npm install` to install dependencies
3. Update `BASE_URL` in `config/constants.js`
4. Run `expo start` to launch the app
5. Test on emulator/simulator or physical device

## Testing the App

1. **Sign Up**: Create a new account
2. **Login**: Use your credentials
3. **View Map**: See incidents on the map
4. **Report**: Long-press on map to report an incident
5. **View Reports**: Check Home screen for latest reports
6. **Settings**: Configure app preferences

## Environment Variables (Optional)

For production, you can use environment variables:

1. Install `expo-constants`:
```bash
npm install expo-constants
```

2. Update `config/constants.js`:
```javascript
import Constants from 'expo-constants';

export const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:4000';
```

3. Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-production-api.com"
    }
  }
}
```
