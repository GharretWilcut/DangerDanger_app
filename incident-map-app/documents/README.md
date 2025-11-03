# Community Safety Alert System - Mobile App

A React Native mobile application for reporting and viewing community safety incidents using OpenStreetMap and free APIs.

## Features

### Screens
- **Home**: Dashboard with latest reports, quick actions, and navigation
- **Map**: Interactive map with OpenStreetMap tiles, incident markers, filters, and safe route visualization
- **Report**: Submit new danger reports with incident type, severity, description, and location
- **Notifications**: Live safety alerts with filtering (all, unread, dismissed)
- **Global Events**: Browse verified global incidents by category
- **Settings**: Manage app preferences including dark mode, notifications, and location tracking
- **Admin**: Review, verify, and manage incident reports

### Key Functionality
- ✅ User authentication (Login/Signup)
- ✅ Location-based incident reporting
- ✅ Real-time incident map with OpenStreetMap
- ✅ Incident filtering by type and location
- ✅ Severity-based alert system
- ✅ Dark mode support (via theme system)
- ✅ Safe route visualization
- ✅ Report verification workflow

## Setup

### Prerequisites
- Node.js (v14+)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. Navigate to the app directory:
```bash
cd incident-map-app
```

2. Install dependencies:
```bash
npm install
```

3. Update `BASE_URL` in all screen files:
   - Default is `http://10.0.2.2:4000` (for Android emulator)
   - For iOS simulator, use `http://localhost:4000`
   - For physical device, use your computer's LAN IP (e.g., `http://192.168.1.100:4000`)

4. Start the Expo development server:
```bash
npm start
# or
expo start
```

## Configuration

### Backend API
**All API configuration is centralized in `config/constants.js`**

Simply update the `BASE_URL` in `config/constants.js`:
- **Android Emulator**: `http://10.0.2.2:4000`
- **iOS Simulator**: `http://localhost:4000`
- **Physical Device**: `http://YOUR_COMPUTER_IP:4000`

See `SETUP.md` for detailed setup instructions.

### Maps
The app uses OpenStreetMap tiles via `react-native-maps`. No API key required.

## Project Structure

```
incident-map-app/
├── App.js                 # Main app component with navigation
├── theme.js               # Theme configuration (light/dark)
├── config/
│   └── constants.js       # Centralized API configuration
├── screens/
│   ├── LoginScreen.js     # User authentication
│   ├── SignupScreen.js    # User registration
│   ├── HomeScreen.js      # Dashboard
│   ├── MapScreen.js       # Interactive map
│   ├── ReportForm.js      # Incident reporting
│   ├── NotificationsScreen.js # Alerts
│   ├── GlobalEventsScreen.js  # Global incidents
│   ├── SettingsScreen.js   # App settings
│   └── AdminScreen.js      # Admin panel
├── package.json
├── README.md
└── SETUP.md               # Detailed setup guide
```

## Navigation Structure

- **Stack Navigator** (Root):
  - Login/Signup (when not authenticated)
  - MainTabs + Report (when authenticated)

- **Tab Navigator** (MainTabs):
  - Home
  - Map
  - Notifications
  - Global Events
  - Settings
  - Admin

## Dependencies

Key dependencies:
- `expo`: Expo framework
- `react-native-maps`: Map component with OpenStreetMap support
- `@react-navigation/native`: Navigation library
- `@react-navigation/bottom-tabs`: Tab navigation
- `expo-location`: Location services
- `@react-native-async-storage/async-storage`: Local storage
- `axios`: HTTP client
- `@expo/vector-icons`: Icon library

## Development Notes

### Theme System
The app includes a theme system in `theme.js` that supports light and dark modes. Currently uses system preference, but can be extended to persist user preference.

### OpenStreetMap Integration
Maps use OpenStreetMap tiles via `UrlTile` component. No API key needed, but ensure you comply with OSM's usage policy for production apps.

### Location Services
The app requires location permissions for:
- Displaying user location on map
- Submitting reports with location
- Filtering nearby incidents

### API Integration
The frontend expects a backend API with these endpoints:
- `POST /auth/login`
- `POST /auth/signup`
- `GET /incidents?lat={lat}&lng={lng}&radius_m={radius}`
- `POST /incidents` (with auth token)

## Future Enhancements

- [ ] Push notifications
- [ ] Photo attachments for reports
- [ ] Reverse geocoding for location names
- [ ] Offline mode support
- [ ] Report verification by users
- [ ] Integration with weather APIs
- [ ] Integration with news APIs for global events

## License

See LICENSE file in parent directory.
