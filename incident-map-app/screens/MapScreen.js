import React, { useEffect, useState, useContext } from 'react';
import { View, Button, Alert } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';
import { AuthContext } from '../App';

const BASE_URL = 'http://10.0.2.2:4000'; // on emulator; on device use LAN IP or ngrok

export default function MapScreen({ navigation }) {
  const [region, setRegion] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const auth = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission needed to show nearby incidents.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      loadIncidents(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const loadIncidents = async (lat, lng) => {
    try {
      const res = await axios.get(`${BASE_URL}/incidents?lat=${lat}&lng=${lng}&radius_m=5000`);
      setIncidents(res.data);
    } catch (e) {
      console.warn('loadIncidents', e);
    }
  };

  const onLongPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    navigation.navigate('Report', { lat: latitude, lng: longitude });
  };

  return (
    <View style={{ flex: 1 }}>
      {region && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={region}
          onLongPress={onLongPress}
        >
          {/* OpenStreetMap tiles */}
          <UrlTile
            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
            tileSize={256}
            zIndex={0}
            maximumNativeZoom={19}
            subdomains={['a', 'b', 'c']}
          />
          {incidents.map((inc) => (
            <Marker
              key={inc.id}
              coordinate={{ latitude: parseFloat(inc.lat), longitude: parseFloat(inc.lng) }}
              title={inc.type}
              description={inc.description}
            />
          ))}
        </MapView>
      )}
      <Button title="Refresh" onPress={() => region && loadIncidents(region.latitude, region.longitude)} />
    </View>
  );
}
