# DangerDanger App - Complete Screens Overview

## 📱 Application Structure

The app uses React Navigation with:
- **Stack Navigator** (Root): Handles authentication flow
- **Tab Navigator** (MainTabs): Main app navigation with 6 tabs

---

## 🔐 Authentication Screens (Stack Navigator)

### 1. **LoginScreen** (`screens/LoginScreen.js`)
**Route:** `/Login`

**Features:**
- Email and password input fields
- Show/hide password toggle
- "Community Safety Alert System" branding with shield icon
- Navigation to Signup screen
- Form validation
- Loading state during authentication
- Error handling with alerts

**UI Elements:**
- Shield checkmark icon (64px)
- Email input with mail icon
- Password input with lock icon and eye toggle
- Login button
- "Don't have an account? Sign Up" link

**API Endpoint:** `POST /auth/login`

---

### 2. **SignupScreen** (`screens/SignupScreen.js`)
**Route:** `/Signup`

**Features:**
- Full name, email, password, and confirm password fields
- Password validation (minimum 6 characters)
- Password matching validation
- Form validation
- Navigation back to Login screen
- Error handling

**UI Elements:**
- "Create Account" title
- Four input fields
- Sign Up button
- "Already have an account? Login" link

**API Endpoint:** `POST /auth/signup`

---

## 🏠 Main Application Screens (Tab Navigator)

### 3. **HomeScreen** (`screens/HomeScreen.js`)
**Route:** `/Home` (Tab 1)

**Features:**
- Dashboard with latest reports
- Quick action buttons:
  - Report Danger (navigates to Report form)
  - View Map (navigates to Map)
  - Alerts (navigates to Notifications)
- Latest Reports section (shows 10 most recent)
- Pull-to-refresh functionality
- Report cards with:
  - Incident type badge (color-coded)
  - Date/time
  - Description preview
  - Severity indicator (1-5 dots)
- Global Events link
- Empty state when no reports available

**UI Elements:**
- Header: "Community Safety" title
- Three quick action cards with icons
- Scrollable list of report cards
- Global Events card at bottom

**API Endpoint:** `GET /incidents`

---

### 4. **MapScreen** (`screens/MapScreen.js`)
**Route:** `/Map` (Tab 2)

**Features:**
- Interactive OpenStreetMap using React Leaflet
- Custom markers for incidents (color-coded by type)
- Marker popups with incident details
- Filter by incident type (all, crash, crime, fire, flood)
- Safe route visualization (circle overlay)
- Location services integration
- Map controls:
  - Filter button
  - Safe routes toggle
  - Locate user button
  - Refresh incidents button
- Right-click (web) / Long-press (mobile) to create report
- Incident detail modal with:
  - Type icon and color
  - Description
  - Severity indicator
  - "Report Similar Incident" button
- Filter modal with type selection
- Auto-centers on user location (with permission)

**UI Elements:**
- Full-screen map
- Floating control buttons (top-right)
- Filter modal (bottom sheet)
- Incident detail modal (bottom sheet)
- Custom colored markers

**API Endpoint:** `GET /incidents?lat={lat}&lng={lng}&radius_m={radius}`

**Map Features:**
- OpenStreetMap tiles
- Custom SVG markers
- Circle overlay for safe routes
- Click handlers for reporting

---

### 5. **ReportForm** (`screens/ReportForm.js`)
**Route:** `/Report` (Modal - Stack Navigator)

**Features:**
- Incident type selection (grid layout):
  - Traffic Crash (car icon)
  - Crime (shield icon)
  - Fire (flame icon)
  - Flood (water icon)
  - Other (alert icon)
- Severity level selection (1-5):
  - Low (green)
  - Low-Medium
  - Medium (yellow)
  - High (orange)
  - Critical (red)
- Description text area (multiline)
- Location handling:
  - Auto-get current location
  - Display coordinates
  - "Select on Map" button
- Form validation
- Submit with loading state
- Success/error alerts

**UI Elements:**
- Header: "Report Danger"
- Type selection grid (2 columns)
- Severity buttons (horizontal)
- Description textarea
- Location display/buttons
- Submit button

**API Endpoint:** `POST /incidents` (requires auth token)

---

### 6. **NotificationsScreen** (`screens/NotificationsScreen.js`)
**Route:** `/Notifications` (Tab 3)

**Features:**
- Live safety alerts list
- Filter buttons:
  - All
  - Unread
  - Dismissed
- Alert cards with:
  - Type icon (color-coded)
  - Title and timestamp
  - Description preview
  - Unread indicator (blue dot)
  - Dismiss button
  - High severity badge (for severity > 3)
- Pull-to-refresh
- Tap alert to view on map
- Mark as read on tap
- Empty state

**UI Elements:**
- Header: "Notifications"
- Three filter buttons
- Scrollable list of alert cards
- Unread cards have left border accent

**API Endpoint:** `GET /incidents` (transformed into alerts)

---

### 7. **GlobalEventsScreen** (`screens/GlobalEventsScreen.js`)
**Route:** `/GlobalEvents` (Tab 4)

**Features:**
- Verified global incidents
- Category filter (horizontal scroll):
  - All
  - Weather
  - Natural
  - Crime
  - Crash
- Event cards with:
  - Category icon (color-coded)
  - Title
  - Verified badge (checkmark)
  - Timestamp
  - Description
  - Severity indicator
- Pull-to-refresh
- Tap to view on map
- Empty state with message

**UI Elements:**
- Header: "Global Events"
- Horizontal category filter bar
- Scrollable list of event cards
- Verified badge on verified events

**API Endpoint:** `GET /incidents` (filtered for verified events)

**Future Integration:**
- OpenWeatherMap for weather alerts
- USGS Earthquake API
- NewsAPI for global incidents

---

### 8. **SettingsScreen** (`screens/SettingsScreen.js`)
**Route:** `/Settings` (Tab 5)

**Features:**

#### Appearance Section:
- Dark Mode toggle (with note about restart)

#### Notifications Section:
- Enable Notifications toggle
- High Severity Only toggle
- Nearby Only toggle (within 5km)
- Verified Only toggle

#### Location Section:
- Location Tracking toggle

#### Account Section:
- Profile (placeholder)
- Privacy & Security (placeholder)
- Logout button (with confirmation)

#### About Section:
- App Version (1.0.0)
- Help & Support (placeholder)
- Terms & Privacy (placeholder)

**UI Elements:**
- Scrollable settings list
- Section headers
- Setting items with icons
- Toggle switches
- Navigation arrows
- Footer with app name

**Actions:**
- Logout clears auth token and returns to Login screen

---

### 9. **AdminScreen** (`screens/AdminScreen.js`)
**Route:** `/Admin` (Tab 6)

**Features:**
- Admin panel for report management
- Filter tabs:
  - Pending
  - Verified
  - Flagged
- Report cards with:
  - Type and timestamp
  - Status badge (Pending/Verified)
  - Description preview
  - Action buttons:
    - Verify (green, for pending reports)
    - Flag (yellow, opens modal)
    - Delete (red, with confirmation)
- Flag modal with:
  - Reason text input
  - Cancel/Submit buttons
- Pull-to-refresh
- Empty state

**UI Elements:**
- Header: "Admin Panel"
- Three filter tabs
- Scrollable list of report cards
- Status badges (color-coded)
- Action buttons row
- Flag modal overlay

**API Endpoints:**
- `GET /incidents` (filtered by status)
- `PATCH /incidents/:id/verify` (future)
- `PATCH /incidents/:id/flag` (future)
- `DELETE /incidents/:id` (future)

---

## 🎨 Design System

### Theme Colors:
- **Primary:** App brand color
- **Secondary:** Accent color
- **Success:** Green (verified, safe)
- **Warning:** Yellow/Orange (alerts)
- **Danger:** Red (critical incidents)
- **Error:** Red (errors)
- **Text:** Main text color
- **TextSecondary:** Secondary text color
- **Background:** Main background
- **Surface:** Card/component background
- **Border:** Border color
- **Shadow:** Shadow color

### Incident Type Colors:
- **Crash:** Error/Danger (red)
- **Crime:** Danger (red)
- **Fire:** Warning (orange/yellow)
- **Flood:** Secondary (blue)
- **Other:** Primary (default)

### Icons:
- Uses `@expo/vector-icons` (Ionicons)
- Consistent icon usage across screens
- Color-coded by type/severity

---

## 🔄 Navigation Flow

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ├───> Signup
       │
       │ (After Auth)
       ▼
┌─────────────────────┐
│     MainTabs        │
├─────────────────────┤
│ 1. Home             │
│ 2. Map              │
│ 3. Notifications    │
│ 4. Global Events    │
│ 5. Settings         │
│ 6. Admin            │
└─────────────────────┘
       │
       │ (Modal)
       ▼
┌─────────────┐
│   Report    │
└─────────────┘
```

---

## 📊 Data Flow

1. **Authentication:**
   - Login/Signup → Backend API → JWT Token → localStorage → AuthContext

2. **Incidents:**
   - Fetch from API → Display in lists/maps
   - Create via ReportForm → POST to API → Refresh lists

3. **Notifications:**
   - Transform incidents into alerts
   - Filter by read/dismissed status
   - Mark as read locally

4. **Admin:**
   - Fetch all incidents
   - Filter by verification status
   - Actions: Verify, Flag, Delete

---

## 🧪 Testing Checklist

### Authentication:
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Signup with new account
- [ ] Signup validation (password length, matching)
- [ ] Navigation between Login/Signup

### Home Screen:
- [ ] Quick actions navigate correctly
- [ ] Latest reports load and display
- [ ] Pull-to-refresh works
- [ ] Empty state displays when no reports
- [ ] Report cards show correct information
- [ ] Tap report card navigates to Map

### Map Screen:
- [ ] Map loads with OpenStreetMap tiles
- [ ] User location requested and displayed
- [ ] Incidents load and display as markers
- [ ] Filter by type works
- [ ] Safe routes toggle works
- [ ] Locate button centers on user
- [ ] Refresh button reloads incidents
- [ ] Right-click creates report
- [ ] Marker click shows detail modal
- [ ] Filter modal opens/closes

### Report Form:
- [ ] Type selection works
- [ ] Severity selection works
- [ ] Description input works
- [ ] Location auto-detection works
- [ ] "Select on Map" navigation works
- [ ] Form validation works
- [ ] Submit creates report
- [ ] Success/error alerts display

### Notifications:
- [ ] Alerts load and display
- [ ] Filter buttons work (All/Unread/Dismissed)
- [ ] Tap alert marks as read
- [ ] Dismiss button works
- [ ] High severity badge displays
- [ ] Pull-to-refresh works
- [ ] Empty state displays

### Global Events:
- [ ] Events load and display
- [ ] Category filters work
- [ ] Verified badge displays
- [ ] Pull-to-refresh works
- [ ] Empty state displays
- [ ] Tap event navigates to Map

### Settings:
- [ ] All toggles work
- [ ] Dark mode toggle (note about restart)
- [ ] Logout confirmation works
- [ ] Logout clears token and navigates to Login
- [ ] Placeholder items display

### Admin:
- [ ] Reports load and display
- [ ] Filter tabs work (Pending/Verified/Flagged)
- [ ] Verify button works
- [ ] Flag button opens modal
- [ ] Flag modal input works
- [ ] Delete button shows confirmation
- [ ] Pull-to-refresh works
- [ ] Empty state displays

---

## 🚀 Current Status

**✅ Working:**
- All screens render correctly
- Navigation structure is complete
- UI components are styled
- API integration points are defined
- Theme system is implemented

**⚠️ Requires Backend:**
- Database connection for data persistence
- Authentication endpoints
- Incident CRUD operations
- Admin verification/flagging endpoints

**🔮 Future Enhancements:**
- Push notifications
- Photo attachments
- Reverse geocoding
- Offline mode
- PWA support
- Real-time updates (WebSocket)

---

## 📝 Notes

- All screens use the theme system for consistent styling
- API calls use axios with BASE_URL from constants
- Authentication token stored in localStorage
- Location services use browser geolocation API
- Maps use OpenStreetMap (no API key required)
- All screens support pull-to-refresh where applicable
- Empty states provide user feedback
- Error handling with alerts throughout

---

**Last Updated:** 2025-12-09
**App Version:** 1.0.0

