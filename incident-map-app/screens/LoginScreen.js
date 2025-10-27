import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../App';

const BASE_URL = 'http://10.0.2.2:4000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setToken } = useContext(AuthContext);

  const login = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      setToken(res.data.token);
    } catch (e) {
      Alert.alert('Login failed', e.response?.data?.error || e.message);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} autoCapitalize="none" />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
      <Button title="Login" onPress={login} />
    </View>
  );
}
