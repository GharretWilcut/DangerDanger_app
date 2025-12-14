import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Modal,
  Platform,
} from 'react-native';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import { Icon } from 'leaflet';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';

import { requestLocationPermission, getCurrentPosition } from '../utils/geolocation';
import { AuthContext } from '../App';
import { useTheme } from '../theme';
import { BASE_URL, API_ENDPOINTS } from '../config/constants';

/* ===========================
   Leaflet marker icon fix & custom icons
=========================== */
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom colored marker icons for different incident types
const createCustomIcon = (color) => {
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Define icons for each incident type
const incidentIcons = {
  crash: createCustomIcon('red'),
  crime: createCustomIcon('violet'),
  fire: createCustomIcon('orange'),
  flood: createCustomIcon('blue'),
  other: createCustomIcon('grey'),
  default: createCustomIcon('gold')
};

// Helper to get the appropriate icon for an incident
const getIncidentIcon = (type) => {
  return incidentIcons[type?.toLowerCase()] || incidentIcons.default;
};

/* ===========================
   Helpers
=========================== */
const toLatLng = (obj) => {
  const lat = parseFloat(obj?.latitude);
  const lng = parseFloat(obj?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

/* ===========================
   Map click handler
=========================== */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    contextmenu: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/* ===========================
   Map controller
=========================== */
function MapController({ center, zoom, mapRef }) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;

    // 🔑 Fix tile misalignment (wait for layout + paint)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        map.invalidateSize(true);
      });
    });
  }, [map]);

  useEffect(() => {
    if (
      Array.isArray(center) &&
      Number.isFinite(center[0]) &&
      Number.isFinite(center[1])
    ) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

/* ===========================
   Screen
=========================== */
export default function MapScreen({ navigation, route }) {
  const theme = useTheme();
  const auth = useContext(AuthContext);
  const isFocused = useIsFocused(); // Add this hook

  const [center, setCenter] = useState([37.78825, -122.4324]);
  const [zoom, setZoom] = useState(13);
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSafeRoutes, setShowSafeRoutes] = useState(false);

  const mapRef = useRef(null);

  /* ===========================
     Load location + incidents
  =========================== */
  useEffect(() => {
    (async () => {
      try {
        const { status } = await requestLocationPermission();
        if (status !== 'granted') {
          loadIncidents(center[0], center[1]);
          return;
        }

        const loc = await getCurrentPosition();
        const newCenter = [loc.coords.latitude, loc.coords.longitude];
        setCenter(newCenter);
        loadIncidents(newCenter[0], newCenter[1]);
      } catch {
        loadIncidents(center[0], center[1]);
      }
    })();
  }, []);

  /* ===========================
     Reload incidents when screen comes into focus
  =========================== */
  useEffect(() => {
    if (isFocused) {
      loadIncidents(center[0], center[1]);
    }
  }, [isFocused]);

  /* ===========================
     Route-based centering
  =========================== */
  useEffect(() => {
    if (!route?.params?.incidentId) return;

    const incident = incidents.find(
      (i) => i.id === route.params.incidentId
    );
    if (!incident) return;

    const latlng = toLatLng(incident);
    if (!latlng) return;

    setSelectedIncident(incident);
    setCenter(latlng);
    setZoom(15);
  }, [route?.params?.incidentId, incidents]);

  const loadIncidents = async (lat, lng) => {
    try {
      const res = await axios.get(
        `${BASE_URL}${API_ENDPOINTS.INCIDENTS.GET_NEARBY(lat, lng)}`
      );
      setIncidents(res.data);
    } catch (e) {
      console.warn('loadIncidents', e);
    }
  };

  const onMapClick = (lat, lng) => {
    navigation.navigate('Report', { lat, lng });
  };

  const styles = getStyles(theme);

  /* ===========================
     Render
  =========================== */
  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <MapController center={center} zoom={zoom} mapRef={mapRef} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <MapClickHandler onMapClick={onMapClick} />

          {incidents.map((inc) => {
            const latlng = toLatLng(inc);
            if (!latlng) return null;

            return (
              <Marker
                key={inc.id}
                position={latlng}
                icon={getIncidentIcon(inc.type)}
                eventHandlers={{ click: () => setSelectedIncident(inc) }}
              >
                <Popup>
                  <strong>{inc.type}</strong>
                  <br />
                  {inc.description}
                </Popup>
              </Marker>
            );
          })}

          {showSafeRoutes && (
            <Circle
              center={center}
              radius={2000}
              pathOptions={{
                color: theme.success,
                fillColor: theme.success,
                fillOpacity: 0.3,
              }}
            />
          )}
        </MapContainer>
      </View>
    </View>
  );
}

/* ===========================
   Styles (FIXED)
=========================== */
const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      ...(Platform.OS === 'web' ? { height: '100vh' } : { flex: 1 }),
    },
    mapWrapper: {
      width: '100%',
      ...(Platform.OS === 'web' ? { height: '100vh' } : { flex: 1 }),
    },
  });