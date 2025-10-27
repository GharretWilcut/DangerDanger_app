import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../App';

const BASE_URL = 'http://10.0.2.2:4000';

export default function ReportForm({ route, navigation }) {
  const { lat, lng } = route.params || {};
  const [type, setType] = useState('crash');
  const [desc, setDesc] = useState('');
  const { token } = useContext(AuthContext);

  const submit = async () => {
    try {
      await axios.post(`${BASE_URL}/incidents`, { type, description: desc, lat, lng }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Report submitted');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Submit failed', e.response?.data?.error || e.message);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput placeholder="Type (crash/crime/etc)" value={type} onChangeText={setType} />
      <TextInput placeholder="Description" value={desc} onChangeText={setDesc} multiline numberOfLines={4} />
      <Button title="Submit" onPress={submit} />
    </View>
  );
}
