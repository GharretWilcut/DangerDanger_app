import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from './screens/MapScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ReportForm from './screens/ReportForm';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

const Stack = createNativeStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then(t => { if (t) setToken(t); });
  }, []);

  const auth = {
    token,
    setToken: async (t) => { setToken(t); if (t) await AsyncStorage.setItem('token', t); else await AsyncStorage.removeItem('token'); }
  };

  return (
    <AuthContext.Provider value={auth}>
      <NavigationContainer>
        <Stack.Navigator>
          {!token ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Map" component={MapScreen} />
              <Stack.Screen name="Report" component={ReportForm} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
