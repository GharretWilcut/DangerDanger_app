# Testing Guide - All Screens

## 🌐 Access the App

**Frontend:** http://localhost:19006  
**Backend API:** http://localhost:4000

---

## 🧪 Screen Testing Checklist

### 1. **Login Screen** (Initial Screen)
**How to Access:**
- Open http://localhost:19006
- Should be the first screen you see

**What to Test:**
- ✅ Email input field accepts text
- ✅ Password input field accepts text (hidden by default)
- ✅ Eye icon toggles password visibility
- ✅ "Sign Up" link navigates to Signup screen
- ✅ Login button (will fail without valid credentials, but UI should work)

**Visual Check:**
- Shield icon at top
- "Community Safety Alert System" branding
- Clean form layout with icons

---

### 2. **Signup Screen**
**How to Access:**
- Click "Don't have an account? Sign Up" on Login screen

**What to Test:**
- ✅ Name input field
- ✅ Email input field
- ✅ Password input field
- ✅ Confirm Password input field
- ✅ "Login" link navigates back to Login
- ✅ Sign Up button (will fail without backend, but UI should work)

**Visual Check:**
- "Create Account" title
- Four input fields
- Form validation (if implemented)

---

### 3. **Home Screen** (After Login)
**How to Access:**
- Login successfully (or manually set token in localStorage for testing)
- First tab in bottom navigation

**What to Test:**
- ✅ "Report Danger" quick action → Opens Report form
- ✅ "View Map" quick action → Navigates to Map tab
- ✅ "Alerts" quick action → Navigates to Notifications tab
- ✅ Latest Reports section displays (may be empty)
- ✅ Pull down to refresh
- ✅ Tap on report card → Navigates to Map with incident
- ✅ "View Global Events" card → Navigates to Global Events tab

**Visual Check:**
- Header: "Community Safety - Stay informed, stay safe"
- Three quick action cards with icons
- List of report cards (if any exist)
- Empty state if no reports

---

### 4. **Map Screen**
**How to Access:**
- Click "Map" tab (second tab)
- Or click "View Map" from Home

**What to Test:**
- ✅ Map loads with OpenStreetMap tiles
- ✅ Browser requests location permission
- ✅ User location marker appears (if permission granted)
- ✅ Incident markers appear on map (if any exist)
- ✅ Click marker → Shows popup with incident details
- ✅ Filter button (top-right) → Opens filter modal
- ✅ Filter by type (All, Crash, Crime, Fire, Flood)
- ✅ Safe Routes toggle → Shows/hides circle overlay
- ✅ Locate button → Centers map on user location
- ✅ Refresh button → Reloads incidents
- ✅ Right-click on map → Opens Report form with coordinates

**Visual Check:**
- Full-screen interactive map
- Control buttons in top-right corner
- Colored markers for different incident types
- Filter modal slides up from bottom
- Incident detail modal (when marker clicked)

---

### 5. **Report Form** (Modal)
**How to Access:**
- Click "Report Danger" from Home
- Right-click on Map
- Click "Report Similar Incident" from incident detail

**What to Test:**
- ✅ Select incident type (Crash, Crime, Fire, Flood, Other)
- ✅ Selected type highlights
- ✅ Select severity level (1-5)
- ✅ Selected severity highlights with color
- ✅ Description textarea accepts multiline text
- ✅ "Get Current Location" button → Gets coordinates
- ✅ "Select on Map" button → Navigates to Map
- ✅ Submit button → Submits report (requires auth token)
- ✅ Form validation (description required)

**Visual Check:**
- "Report Danger" header
- Type selection grid (2 columns, 5 options)
- Severity buttons (horizontal, color-coded)
- Description textarea
- Location display/buttons
- Submit button at bottom

---

### 6. **Notifications Screen**
**How to Access:**
- Click "Notifications" tab (third tab)
- Or click "Alerts" from Home

**What to Test:**
- ✅ Filter buttons: All, Unread, Dismissed
- ✅ Active filter highlights
- ✅ Alert cards display (if any exist)
- ✅ Tap alert card → Marks as read and navigates to Map
- ✅ Dismiss button (X) → Removes alert from view
- ✅ Unread indicator (blue dot) shows on unread alerts
- ✅ High severity badge shows for severity > 3
- ✅ Pull down to refresh
- ✅ Empty state displays if no alerts

**Visual Check:**
- Header: "Notifications - Live safety alerts"
- Three filter buttons at top
- List of alert cards
- Unread cards have left blue border
- Empty state with icon

---

### 7. **Global Events Screen**
**How to Access:**
- Click "Global Events" tab (fourth tab)
- Or click "View Global Events" from Home

**What to Test:**
- ✅ Category filters: All, Weather, Natural, Crime, Crash
- ✅ Horizontal scroll for categories
- ✅ Active category highlights
- ✅ Event cards display (if any exist)
- ✅ Verified badge shows on verified events
- ✅ Tap event card → Navigates to Map
- ✅ Pull down to refresh
- ✅ Empty state displays

**Visual Check:**
- Header: "Global Events - Verified incidents worldwide"
- Horizontal category filter bar
- List of event cards with icons
- Verified badge (green checkmark)
- Empty state with globe icon

---

### 8. **Settings Screen**
**How to Access:**
- Click "Settings" tab (fifth tab)

**What to Test:**
- ✅ Dark Mode toggle → Shows alert about restart
- ✅ Enable Notifications toggle
- ✅ High Severity Only toggle
- ✅ Nearby Only toggle
- ✅ Verified Only toggle
- ✅ Location Tracking toggle
- ✅ Profile item (placeholder)
- ✅ Privacy & Security item (placeholder)
- ✅ Logout button → Shows confirmation dialog
- ✅ Logout confirmation → Clears token and returns to Login
- ✅ Help & Support (placeholder)
- ✅ Terms & Privacy (placeholder)

**Visual Check:**
- Header: "Settings - Manage your preferences"
- Sections: Appearance, Notifications, Location, Account, About
- Setting items with icons and toggles
- Footer with app name

---

### 9. **Admin Screen**
**How to Access:**
- Click "Admin" tab (sixth tab)

**What to Test:**
- ✅ Filter tabs: Pending, Verified, Flagged
- ✅ Active tab highlights
- ✅ Report cards display (if any exist)
- ✅ Status badge shows (Pending/Verified)
- ✅ Verify button (green) → Verifies report
- ✅ Flag button (yellow) → Opens flag modal
- ✅ Flag modal:
  - ✅ Text input for reason
  - ✅ Cancel button closes modal
  - ✅ Flag button submits
- ✅ Delete button (red) → Shows confirmation
- ✅ Delete confirmation → Deletes report
- ✅ Pull down to refresh
- ✅ Empty state displays

**Visual Check:**
- Header: "Admin Panel - Review and validate reports"
- Three filter tabs
- List of report cards
- Status badges (color-coded)
- Action buttons row (Verify, Flag, Delete)
- Flag modal overlay

---

## 🎯 Quick Navigation Test

Test the bottom tab navigation:
1. Click each tab icon
2. Verify screen changes
3. Verify active tab highlights
4. Test navigation from screen to screen:
   - Home → Map (via quick action)
   - Home → Notifications (via quick action)
   - Map → Report (via right-click)
   - Notifications → Map (via alert tap)
   - Global Events → Map (via event tap)

---

## 🔍 Visual Consistency Check

For each screen, verify:
- ✅ Consistent header style
- ✅ Consistent color scheme (theme)
- ✅ Consistent icon usage
- ✅ Consistent button styles
- ✅ Consistent card/card styles
- ✅ Consistent spacing and padding
- ✅ Responsive layout (test different window sizes)

---

## 🐛 Common Issues to Check

1. **Empty States:**
   - All screens should show appropriate empty states when no data

2. **Loading States:**
   - Check for loading indicators during API calls

3. **Error Handling:**
   - Test with network errors
   - Test with invalid API responses
   - Verify error messages display

4. **Navigation:**
   - Back button works (where applicable)
   - Modal closes properly
   - Tab navigation persists state

5. **Forms:**
   - Validation messages display
   - Required fields marked
   - Submit buttons disabled during submission

---

## 📱 Browser Testing

Test in multiple browsers:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari (if on Mac)
- ✅ Edge

Test different screen sizes:
- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667) - use browser dev tools

---

## 🔐 Authentication Flow Test

1. **Without Token:**
   - Should show Login screen
   - Cannot access main tabs

2. **With Valid Token:**
   - Should show MainTabs
   - All screens accessible

3. **After Logout:**
   - Token cleared
   - Returns to Login screen
   - Cannot access main tabs

---

## 📊 Data Flow Test

1. **Create Report:**
   - Fill form → Submit → Check if appears in:
     - Home screen (latest reports)
     - Map screen (as marker)
     - Notifications (as alert)
     - Admin (as pending report)

2. **Verify Report (Admin):**
   - Admin verifies → Check if:
     - Status changes to "Verified"
     - Appears in "Verified" filter
     - Shows verified badge in Global Events

---

## ✅ Success Criteria

All screens should:
- ✅ Load without errors
- ✅ Display correctly
- ✅ Navigate properly
- ✅ Handle empty states
- ✅ Show loading states
- ✅ Display error messages
- ✅ Work with theme system
- ✅ Be responsive

---

**Happy Testing! 🚀**

