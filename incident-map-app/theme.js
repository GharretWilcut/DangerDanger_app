import { useColorScheme } from 'react-native';

export const lightTheme = {
  primary: '#4CAF50',
  primaryDark: '#45a049',
  secondary: '#2196F3',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  error: '#f44336',
  warning: '#ff9800',
  danger: '#f44336',
  success: '#4CAF50',
  card: '#ffffff',
  shadow: '#000',
};

export const darkTheme = {
  primary: '#66BB6A',
  primaryDark: '#4CAF50',
  secondary: '#42A5F5',
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#333333',
  error: '#ef5350',
  warning: '#ffb74d',
  danger: '#ef5350',
  success: '#66BB6A',
  card: '#2c2c2c',
  shadow: '#000',
};

export const useTheme = () => {
  const colorScheme = useColorScheme();
  // You can add AsyncStorage to persist theme preference
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};
