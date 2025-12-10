import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { requestLocationPermission, getCurrentPosition } from '../utils/geolocation';
import { AuthContext } from '../App';
import { useTheme } from '../theme';
import { BASE_URL, API_ENDPOINTS } from '../config/constants';

const INCIDENT_TYPES = [
  { value: 'crash', label: 'Traffic Crash', icon: 'car' },
  { value: 'crime', label: 'Crime', icon: 'shield' },
  { value: 'fire', label: 'Fire', icon: 'flame' },
  { value: 'flood', label: 'Flood', icon: 'water' },
  { value: 'other', label: 'Other', icon: 'alert-circle' },
];

const SEVERITY_LEVELS = [
  { value: 1, label: 'Low', color: '#4CAF50' },
  { value: 2, label: 'Low-Medium', color: '#8BC34A' },
  { value: 3, label: 'Medium', color: '#FFC107' },
  { value: 4, label: 'High', color: '#FF9800' },
  { value: 5, label: 'Critical', color: '#F44336' },
];

export default function ReportForm({ route, navigation }) {
  const { lat: paramLat, lng: paramLng } = route.params || {};
  const [type, setType] = useState('crash');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState(3);
  const [location, setLocation] = useState({ lat: paramLat, lng: paramLng });
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const theme = useTheme();

  useEffect(() => {
    if (!paramLat || !paramLng) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await requestLocationPermission();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission needed to submit reports.');
        return;
      }
      const loc = await getCurrentPosition({});
      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
      // Reverse geocoding would go here
    } catch (e) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const submit = async () => {
    if (!desc.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    if (!location.lat || !location.lng) {
      Alert.alert('Error', 'Location is required');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}${API_ENDPOINTS.INCIDENTS.BASE}`,
        {
          type,
          description: desc,
          lat: location.lat,
          lng: location.lng,
          severity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Close the modal first
      navigation.goBack();
      
      // Then show success alert
      setTimeout(() => {
        Alert.alert('Success', 'Report submitted successfully!');
      }, 300);
      
    } catch (e) {
      Alert.alert('Submit failed', e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };
  const styles = getStyles(theme);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report Danger</Text>
          <Text style={styles.headerSubtitle}>Help keep your community safe</Text>
        </View>

        {/* Incident Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Type</Text>
          <View style={styles.typeGrid}>
            {INCIDENT_TYPES.map((incidentType) => (
              <TouchableOpacity
                key={incidentType.value}
                style={[
                  styles.typeButton,
                  type === incidentType.value && styles.activeTypeButton,
                  type === incidentType.value && { backgroundColor: theme.primary },
                ]}
                onPress={() => setType(incidentType.value)}
              >
                <Ionicons
                  name={incidentType.icon}
                  size={24}
                  color={type === incidentType.value ? '#fff' : theme.text}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    type === incidentType.value && styles.activeTypeLabel,
                    { color: type === incidentType.value ? '#fff' : theme.text },
                  ]}
                >
                  {incidentType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Severity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Severity Level</Text>
          <View style={styles.severityContainer}>
            {SEVERITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.severityButton,
                  severity === level.value && {
                    backgroundColor: level.color,
                    borderColor: level.color,
                  },
                ]}
                onPress={() => setSeverity(level.value)}
              >
                <Text
                  style={[
                    styles.severityLabel,
                    severity === level.value && styles.activeSeverityLabel,
                    { color: severity === level.value ? '#fff' : theme.text },
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Provide details about the incident..."
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          {location.lat && location.lng ? (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color={theme.primary} />
              <Text style={styles.locationText}>
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
              <Ionicons name="locate" size={20} color={theme.primary} />
              <Text style={styles.locationButtonText}>Get Current Location</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => navigation.navigate('Map', { selectLocation: true })}
          >
            <Ionicons name="map" size={20} color={theme.secondary} />
            <Text style={styles.mapButtonText}>Select on Map</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
          onPress={submit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    typeButton: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 2,
      borderColor: theme.border,
    },
    activeTypeButton: {
      borderColor: theme.primary,
    },
    typeLabel: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },
    activeTypeLabel: {
      fontWeight: 'bold',
    },
    severityContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    severityButton: {
      flex: 1,
      minWidth: '30%',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      backgroundColor: theme.surface,
    },
    severityLabel: {
      fontSize: 12,
      fontWeight: '500',
    },
    activeSeverityLabel: {
      fontWeight: 'bold',
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 12,
      minHeight: 120,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.surface,
    },
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 8,
    },
    locationText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.text,
    },
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    locationButtonText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.primary,
      fontWeight: '500',
    },
    mapButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    mapButtonText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.secondary,
      fontWeight: '500',
    },
    submitButton: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 32,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
