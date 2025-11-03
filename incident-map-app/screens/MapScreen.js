import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import MapView, { Marker, UrlTile, Circle, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { AuthContext } from '../App';
import { useTheme } from '../theme';
import { BASE_URL, API_ENDPOINTS } from '../config/constants';

export default function MapScreen({ navigation, route }) {
  const [region, setRegion] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSafeRoutes, setShowSafeRoutes] = useState(false);
  const auth = useContext(AuthContext);
  const theme = useTheme();

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

  useEffect(() => {
    if (route?.params?.incidentId) {
      const incident = incidents.find((inc) => inc.id === route.params.incidentId);
      if (incident) {
        setSelectedIncident(incident);
        setRegion({
          latitude: parseFloat(incident.lat),
          longitude: parseFloat(incident.lng),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
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

  const onLongPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    navigation.navigate('Report', { lat: latitude, lng: longitude });
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

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'all') return true;
    return inc.type?.toLowerCase() === filter.toLowerCase();
  });

  const incidentTypes = ['all', 'crash', 'crime', 'fire', 'flood'];

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          style={styles.map}
          initialRegion={region}
          region={region}
          onLongPress={onLongPress}
          showsUserLocation
          showsMyLocationButton={false}
          onRegionChangeComplete={setRegion}
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
          {filteredIncidents.map((inc) => (
            <Marker
              key={inc.id}
              coordinate={{ latitude: parseFloat(inc.lat), longitude: parseFloat(inc.lng) }}
              onPress={() => setSelectedIncident(inc)}
            >
              <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(inc.type) }]}>
                <Ionicons name={getMarkerIcon(inc.type)} size={20} color="#fff" />
              </View>
            </Marker>
          ))}
          {showSafeRoutes && region && (
            <Circle
              center={region}
              radius={2000}
              strokeColor={theme.success}
              fillColor={`${theme.success}30`}
              strokeWidth={2}
            />
          )}
        </MapView>
      )}

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
          onPress={() => {
            Location.getCurrentPositionAsync({}).then((loc) => {
              setRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              });
              loadIncidents(loc.coords.latitude, loc.coords.longitude);
            });
          }}
        >
          <Ionicons name="locate" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (region) {
              loadIncidents(region.latitude, region.longitude);
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
    },
    map: {
      flex: 1,
    },
    controls: {
      position: 'absolute',
      right: 16,
      top: 60,
      gap: 8,
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
    markerContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#fff',
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
