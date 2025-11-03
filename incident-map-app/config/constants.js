// API Configuration
// Update this URL based on your environment:
// - Android Emulator: http://10.0.2.2:4000
// - iOS Simulator: http://localhost:4000
// - Physical Device: http://YOUR_COMPUTER_IP:4000 (e.g., http://192.168.1.100:4000)
// 
// To use environment variables, install expo-constants:
// npm install expo-constants
// Then use: import Constants from 'expo-constants';
// export const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:4000';

export const BASE_URL = 'http://10.0.2.2:4000'; // Default for Android emulator
// Change this to match your backend server URL

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
  },
  INCIDENTS: {
    BASE: '/incidents',
    GET_NEARBY: (lat, lng, radius = 5000) => 
      `/incidents?lat=${lat}&lng=${lng}&radius_m=${radius}`,
  },
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_REGION: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  DEFAULT_RADIUS: 5000, // meters
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

// App Configuration
export const APP_CONFIG = {
  MAX_DESCRIPTION_LENGTH: 500,
  DEFAULT_SEVERITY: 3,
  REFRESH_INTERVAL: 30000, // 30 seconds
};
