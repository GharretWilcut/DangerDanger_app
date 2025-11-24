// API Configuration
// Web app configuration - uses localhost for development
// For production, update this to your production API URL

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

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
