# 🚀 START HERE - Run Your App!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (includes npm)
- ✅ Backend server ready to run

### Install Node.js (if not installed)
1. Download from: https://nodejs.org/
2. Install the LTS version
3. **Restart your terminal/VS Code after installation**

## Quick Start (3 Steps)

### Step 1: Open Terminal in Project Directory

Navigate to:
```
d:\Documentss\DangerDanger\DangerDanger_app\incident-map-app
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (takes 2-5 minutes).

### Step 3: Start the App

```bash
npm start
```

Or use Expo CLI directly:
```bash
npx expo start
```

## What Happens Next?

After running `npm start`, you'll see:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

### Options to View App:

**Option A: Android Emulator**
1. Press `a` in the terminal
2. Ensure Android Studio emulator is running

**Option B: iOS Simulator (Mac only)**
1. Press `i` in the terminal
2. Xcode simulator will open

**Option C: Physical Device**
1. Install "Expo Go" app from Play Store (Android) or App Store (iOS)
2. Scan the QR code shown in terminal
3. Ensure phone and computer are on same WiFi

**Option D: Web Browser**
1. Press `w` in the terminal
2. App opens in browser (limited functionality)

## Before Starting - Important!

### 1. Start Your Backend Server

In a **separate terminal**, navigate to where your backend `index.js` is located and run:
```bash
node index.js
```

The backend should be running on port 4000.

### 2. Configure API URL (if needed)

Edit `config/constants.js`:

```javascript
// Default (Android emulator):
export const BASE_URL = 'http://10.0.2.2:4000';

// For iOS simulator, change to:
export const BASE_URL = 'http://localhost:4000';

// For physical device, use your computer's IP:
export const BASE_URL = 'http://192.168.1.XXX:4000';
```

To find your computer's IP:
- Windows: Run `ipconfig` → Look for "IPv4 Address"
- Mac/Linux: Run `ifconfig` → Look for "inet"

## Troubleshooting

### "npm is not recognized"
- ✅ Install Node.js from nodejs.org
- ✅ Restart your terminal after installation
- ✅ Verify: Run `node --version` and `npm --version`

### "Cannot connect to backend"
- ✅ Start backend: `node index.js` (in separate terminal)
- ✅ Check backend is on port 4000
- ✅ Verify `BASE_URL` in `config/constants.js`

### "Module not found" errors
```bash
# Delete and reinstall:
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
```bash
npx expo start --port 8082
```

## Expected First Run

1. ✅ Metro bundler starts (this is normal)
2. ✅ QR code appears in terminal
3. ✅ Options to open in emulator/simulator
4. ✅ App loads with Login screen

## Testing the App

Once running, test these features:
- [ ] Sign up (create account)
- [ ] Login
- [ ] View Home screen
- [ ] Open Map (should show OpenStreetMap)
- [ ] Long-press map to create report
- [ ] Submit a test report
- [ ] View Notifications
- [ ] Check Settings

## Need Help?

See these files for more details:
- `QUICK_START.md` - Quick reference
- `SETUP.md` - Detailed setup instructions
- `README.md` - Full documentation

---

**Ready? Run these commands:**

```bash
cd d:\Documentss\DangerDanger\DangerDanger_app\incident-map-app
npm install
npm start
```

🎉 **Happy Coding!**
