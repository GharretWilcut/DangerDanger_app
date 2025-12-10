import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { requestLocationPermission, getCurrentPosition } from '../utils/geolocation';
import { AuthContext } from '../App';
import { useTheme } from '../theme';
import { BASE_URL, API_ENDPOINTS } from '../config/constants';

// Fix for default marker icons in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map click events
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    contextmenu: (e) => {
      // Right-click for web (equivalent to long press on mobile)
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to handle map instance for programmatic control
function MapController({ center, zoom, mapRef }) {
  const map = useMap();
  
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  
  useEffect(() => {
    if (center && zoom !== undefined) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function MapScreen({ navigation, route }) {
  const [center, setCenter] = useState([37.78825, -122.4324]); // Default location
  const [zoom, setZoom] = useState(13);
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSafeRoutes, setShowSafeRoutes] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const auth = useContext(AuthContext);
  const theme = useTheme();
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await requestLocationPermission();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Location permission needed to show nearby incidents.');
          // Use default location
          loadIncidents(center[0], center[1]);
          return;
        }
        const loc = await getCurrentPosition();
        const newCenter = [loc.coords.latitude, loc.coords.longitude];
        setCenter(newCenter);
        loadIncidents(newCenter[0], newCenter[1]);
      } catch (error) {
        console.warn('Location error:', error);
        Alert.alert('Location Error', 'Could not get your location. Using default location.');
        loadIncidents(center[0], center[1]);
      }
    })();
  }, []);

  useEffect(() => {
    if (route?.params?.incidentId) {
      const incident = incidents.find((inc) => inc.id === route.params.incidentId);
      if (incident) {
        setSelectedIncident(incident);
        const newCenter = [parseFloat(incident.lat), parseFloat(incident.lng)];
        setCenter(newCenter);
        setZoom(15);
      }
    }
  }, [route?.params?.incidentId, incidents]);

  const loadIncidents = async (lat, lng) => {
    try {
      const res = await axios.get(`${BASE_URL}${API_ENDPOINTS.INCIDENTS.GET_NEARBY(lat, lng)}`);
      setIncidents(res.data);
    } catch (e) {
      console.warn('loadIncidents', e);
    }
  };

  const onMapClick = (lat, lng) => {
    navigation.navigate('Report', { lat, lng });
  };

  const getMarkerColor = (type) => {
    const colors = {
      crash: theme.error,
      crime: theme.danger,
      fire: theme.warning,
      flood: theme.secondary,
      default: theme.primary,
    };
    return colors[type?.toLowerCase()] || colors.default;
  };

  const getMarkerIcon = (type) => {
    const icons = {
      crash: 'car',
      crime: 'shield',
      fire: 'flame',
      flood: 'water',
      default: 'alert-circle',
    };
    return icons[type?.toLowerCase()] || icons.default;
  };

  const createCustomIcon = (type) => {
    const color = getMarkerColor(type);
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="18" cy="18" r="8" fill="white" opacity="0.3"/>
        </svg>
      `)}`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'all') return true;
    return inc.type?.toLowerCase() === filter.toLowerCase();
  });

  const incidentTypes = ['all', 'crash', 'crime', 'fire', 'flood'];

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={[styles.mapWrapper, Platform.OS === 'web' && { height: '100vh', minHeight: '100vh' }]}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          whenCreated={() => setMapReady(true)}
          scrollWheelZoom={true}
        >
          <MapController center={center} zoom={zoom} mapRef={mapRef} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            subdomains={['a', 'b', 'c']}
          />
          <MapClickHandler onMapClick={onMapClick} />
          
          {filteredIncidents.map((inc) => (
            <Marker
              key={inc.id}
              position={[parseFloat(inc.lat), parseFloat(inc.lng)]}
              icon={createCustomIcon(inc.type)}
              eventHandlers={{
                click: () => setSelectedIncident(inc),
              }}
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <strong>{inc.type}</strong>
                  <br />
                  {inc.description && <span>{inc.description.substring(0, 50)}...</span>}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {showSafeRoutes && (
            <Circle
              center={center}
              radius={2000}
              pathOptions={{
                color: theme.success,
                fillColor: theme.success,
                fillOpacity: 0.3,
                weight: 2,
              }}
            />
          )}
        </MapContainer>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowSafeRoutes(!showSafeRoutes)}
        >
          <Ionicons
            name={showSafeRoutes ? 'shield-checkmark' : 'shield-outline'}
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={async () => {
            try {
              const loc = await getCurrentPosition();
              const newCenter = [loc.coords.latitude, loc.coords.longitude];
              setCenter(newCenter);
              setZoom(13);
              loadIncidents(newCenter[0], newCenter[1]);
            } catch (error) {
              Alert.alert('Error', 'Could not get your location');
            }
          }}
        >
          <Ionicons name="locate" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (center) {
              loadIncidents(center[0], center[1]);
            }
          }}
        >
          <Ionicons name="refresh" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilters} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          <View style={[styles.filterModal, { backgroundColor: theme.surface }]}>
            <Text style={[styles.filterTitle, { color: theme.text }]}>Filter by Type</Text>
            {incidentTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterOption,
                  filter === type && { backgroundColor: theme.primary },
                ]}
                onPress={() => {
                  setFilter(type);
                  setShowFilters(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    { color: filter === type ? '#fff' : theme.text },
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                {filter === type && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Incident Detail Modal */}
      <Modal
        visible={!!selectedIncident}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedIncident(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModal, { backgroundColor: theme.surface }]}>
            {selectedIncident && (
              <>
                <View style={styles.detailHeader}>
                  <View
                    style={[
                      styles.typeIcon,
                      { backgroundColor: getMarkerColor(selectedIncident.type) },
                    ]}
                  >
                    <Ionicons
                      name={getMarkerIcon(selectedIncident.type)}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.detailTitleContainer}>
                    <Text style={[styles.detailTitle, { color: theme.text }]}>
                      {selectedIncident.type}
                    </Text>
                    <Text style={[styles.detailTime, { color: theme.textSecondary }]}>
                      {new Date(selectedIncident.created_at).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedIncident(null)}>
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                {selectedIncident.description && (
                  <Text style={[styles.detailDescription, { color: theme.text }]}>
                    {selectedIncident.description}
                  </Text>
                )}
                {selectedIncident.severity && (
                  <View style={styles.severityContainer}>
                    <Text style={[styles.severityLabel, { color: theme.textSecondary }]}>
                      Severity:
                    </Text>
                    <View style={styles.severityBar}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.severityDot,
                            level <= selectedIncident.severity && {
                              backgroundColor: theme.danger,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.reportButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setSelectedIncident(null);
                    navigation.navigate('Report', {
                      lat: selectedIncident.lat,
                      lng: selectedIncident.lng,
                    });
                  }}
                >
                  <Text style={styles.reportButtonText}>Report Similar Incident</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    mapWrapper: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    controls: {
      position: 'absolute',
      right: 16,
      top: 60,
      gap: 8,
      zIndex: 1000,
    },
    controlButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    filterModal: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 40,
    },
    filterTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: theme.background,
    },
    filterOptionText: {
      fontSize: 16,
      fontWeight: '500',
    },
    detailModal: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '60%',
    },
    detailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    typeIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    detailTitleContainer: {
      flex: 1,
    },
    detailTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textTransform: 'capitalize',
      marginBottom: 4,
    },
    detailTime: {
      fontSize: 12,
    },
    detailDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
    },
    severityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    severityLabel: {
      fontSize: 14,
      marginRight: 8,
    },
    severityBar: {
      flexDirection: 'row',
      gap: 4,
    },
    severityDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.border,
    },
    reportButton: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    reportButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
