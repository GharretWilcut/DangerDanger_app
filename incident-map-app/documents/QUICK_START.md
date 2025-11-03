# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
cd d:\Documentss\DangerDanger\DangerDanger_app\incident-map-app
npm install
```

## Step 2: Check Backend Server

Make sure your backend server is running. If not, start it:
```bash
# In a separate terminal, navigate to where index.js is located
node index.js
```

The backend should be running on `http://localhost:4000`

## Step 3: Update API URL (if needed)

If you're using a physical device or different emulator, update `config/constants.js`:

```javascript
export const BASE_URL = 'http://10.0.2.2:4000'; // Android emulator
// OR
export const BASE_URL = 'http://localhost:4000'; // iOS simulator
// OR  
export const BASE_URL = 'http://YOUR_IP:4000'; // Physical device
```

## Step 4: Start Expo

```bash
npm start
```

Or if you prefer:
```bash
npx expo start
```

## Step 5: Open the App

After running `npm start`, you'll see options:
- Press **`a`** to open in Android emulator
- Press **`i`** to open in iOS simulator
- **Scan QR code** with Expo Go app on your phone

## Troubleshooting

### npm command not found?
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### Can't connect to backend?
- Ensure backend is running: `node index.js`
- Check `BASE_URL` in `config/constants.js`
- For physical device, ensure phone and computer are on same WiFi

### Port already in use?
```bash
npx expo start --port 8081
```

## That's It! 🎉

Your app should now be running. Try:
1. Sign up for a new account
2. Login
3. Explore the map and reports
4. Submit a test report
