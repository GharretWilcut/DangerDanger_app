# DangerDanger - Web App

A React web application for reporting and viewing community safety incidents using OpenStreetMap and free APIs. Built with Expo for web, React Leaflet for maps, and modern web technologies.

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
- User authentication (Login/Signup)
- Location-based incident reporting using browser geolocation API
- Real-time incident map with OpenStreetMap via React Leaflet
- Incident filtering by type and location
- Severity-based alert system
- Dark mode support (via theme system)
- Safe route visualization
- Report verification workflow

## Setup

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with geolocation support (Chrome, Firefox, Safari, Edge)
- Backend API server running (see Backend API section)

### Installation

1. Navigate to the app directory:
```bash
cd incident-map-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API URL in `config/constants.js`:
   - Default is `http://localhost:4000` (for local development)
   - For production, set the `REACT_APP_API_URL` environment variable or update `BASE_URL` directly

4. Start the development server:
```bash
npm start
```

The app will automatically open in your default web browser at `http://localhost:19006` (or the next available port).

## Configuration

### Backend API
**All API configuration is centralized in `config/constants.js`**

The `BASE_URL` is set to `http://localhost:4000` by default. To change it:

1. **Environment Variable** (recommended for production):
   ```bash
   export REACT_APP_API_URL=https://your-api-domain.com
   ```

2. **Direct Configuration**:
   Edit `config/constants.js`:
   ```javascript
   export const BASE_URL = 'http://localhost:4000';
   ```

3. **Make Sure Postgres sql database is set up correctly**

   
   ```bash
      cd server
      sudo -u postgres psql
   ```

   ``` sql
      CREATE USER youruser WITH PASSWORD 'yourpassword';
      ALTER USER youruser CREATEDB;
      CREATE DATABASE yourdb OWNER youruser;
      GRANT ALL PRIVILEGES ON DATABASE yourdb TO youruser;
      \q
   ```
   User and password has to match what is in the server/.env
   
   check to make sure it works.
   ```bash
      sudo systemctl start postgresql
      sudo systemctl enable postgresql   # optional, start on boot
      sudo systemctl status postgresql   # check running
   ```

### Maps
The app uses OpenStreetMap tiles via `react-leaflet`. No API key required. The map library is loaded via CDN in `web/index.html`.

## Project Structure

```
incident-map-app/
├── App.js                 # Main app component with navigation
├── app.json               # Expo configuration
├── theme.js               # Theme configuration (light/dark)
├── web/
│   └── index.html         # Web entry point with Leaflet CSS
├── config/
│   └── constants.js       # Centralized API configuration
├── screens/
│   ├── LoginScreen.js     # User authentication
│   ├── SignupScreen.js    # User registration
│   ├── HomeScreen.js      # Dashboard
│   ├── MapScreen.js       # Interactive map (React Leaflet)
│   ├── ReportForm.js      # Incident reporting
│   ├── NotificationsScreen.js # Alerts
│   ├── GlobalEventsScreen.js  # Global incidents
│   ├── SettingsScreen.js   # App settings
│   └── AdminScreen.js      # Admin panel
├── utils/
│   ├── geolocation.js     # Web geolocation API wrapper
│   └── storage.js         # localStorage wrapper
├── package.json
└── README.md
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
- `expo`: Expo framework for web
- `react-leaflet`: Map component with OpenStreetMap support
- `leaflet`: Core mapping library
- `@react-navigation/native`: Navigation library
- `@react-navigation/bottom-tabs`: Tab navigation
- `react-native-web`: React Native components for web
- `axios`: HTTP client
- `@expo/vector-icons`: Icon library
- `@react-navigation/stack`
- `--save-dev` 
- `@testing-library/react-native` 
- `@testing-library/jest-native`
- `jest-expo `
- `react-test-renderer` 
- `eslint` 
- `eslint-config-expo` 
- `prettier`
- `@babel/preset-env`
- `babel-jest`


## Development Notes

### Theme System
The app includes a theme system in `theme.js` that supports light and dark modes. Currently uses system preference, but can be extended to persist user preference using localStorage.

### OpenStreetMap Integration
Maps use OpenStreetMap tiles via React Leaflet. No API key needed, but ensure you comply with OSM's usage policy for production apps. The Leaflet CSS is loaded via CDN in `web/index.html`.

### Location Services
The app uses the browser's native geolocation API (via `utils/geolocation.js`) for:
- Displaying user location on map
- Submitting reports with location
- Filtering nearby incidents

**Note**: Users will be prompted to allow location access when the app requests it.

### Storage
The app uses `localStorage` (via `utils/storage.js`) for:
- Storing authentication tokens
- Persisting user preferences (can be extended)

### API Integration
The frontend expects a backend API with these endpoints:
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /incidents?lat={lat}&lng={lng}&radius_m={radius}` - Get nearby incidents
- `POST /incidents` - Create new incident (requires auth token in Authorization header)

### Building for Production

To build the app for production:

```bash
npm run build
```

This will create an optimized production build in the `web-build` directory that can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## Browser Compatibility

The app is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Required features:**
- ES6+ JavaScript support
- Geolocation API
- LocalStorage API
- CSS Grid/Flexbox

## Troubleshooting

### Map not displaying?
- Ensure Leaflet CSS is loaded (check `web/index.html`)
- Check browser console for errors
- Verify internet connection (OpenStreetMap tiles require internet)

### Location not working?
- Check browser permissions (allow location access)
- Ensure you're using HTTPS or localhost (geolocation requires secure context)
- Check browser console for permission errors

### API connection issues?
- Verify backend server is running on the configured port
- Check `BASE_URL` in `config/constants.js`
- Check browser console for CORS errors
- Ensure backend allows requests from your domain

## Future Enhancements

- Push notifications (via browser notifications API)
- Photo attachments for reports
- Reverse geocoding for location names
- Offline mode support (Service Workers)
- Report verification by users
- Integration with weather APIs
- Integration with news APIs for global events
- PWA support for installable web app

## License

MIT License
