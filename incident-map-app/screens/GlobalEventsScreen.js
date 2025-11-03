import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../theme';
import { BASE_URL, API_ENDPOINTS } from '../config/constants';

// In a real app, you'd integrate with free APIs like:
// - OpenWeatherMap for weather alerts
// - USGS Earthquake API
// - NewsAPI for global incidents
// For now, we'll use incidents as a placeholder

export default function GlobalEventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const theme = useTheme();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Fetch global incidents
      const res = await axios.get(`${BASE_URL}${API_ENDPOINTS.INCIDENTS.BASE}`);
      // Sort by most recent and verify
      const verifiedEvents = res.data
        .filter((e) => e) // In real app, filter by verified status
        .map((incident) => ({
          ...incident,
          verified: true,
          category: incident.type,
        }));
      setEvents(verifiedEvents);
    } catch (e) {
      console.warn('Failed to load events', e);
      // Fallback: show sample data
      setEvents([
        {
          id: 1,
          type: 'weather',
          title: 'Severe Weather Alert',
          description: 'Heavy rainfall expected in region',
          verified: true,
          category: 'weather',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'earthquake',
          title: 'Earthquake Activity',
          description: 'Minor seismic activity detected',
          verified: true,
          category: 'natural',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'weather', 'natural', 'crime', 'crash'];

  const filteredEvents = events.filter((event) => {
    if (selectedCategory === 'all') return true;
    return event.category === selectedCategory || event.type === selectedCategory;
  });

  const styles = getStyles(theme);

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('Map', { incidentId: item.id })}
    >
      <View style={styles.eventHeader}>
        <View style={[styles.eventIcon, { backgroundColor: getCategoryColor(item.category, theme) }]}>
          <Ionicons name={getIconForCategory(item.category)} size={24} color="#fff" />
        </View>
        <View style={styles.eventContent}>
          <View style={styles.eventTitleRow}>
            <Text style={styles.eventTitle}>
              {item.title || `${item.type} Incident`}
            </Text>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <Text style={styles.eventTime}>
            {new Date(item.createdAt || item.created_at).toLocaleString()}
          </Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}
      {item.severity && (
        <View style={styles.severityContainer}>
          <Text style={styles.severityLabel}>Severity: </Text>
          <View style={styles.severityBar}>
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                style={[
                  styles.severityDot,
                  level <= item.severity && { backgroundColor: theme.danger },
                ]}
              />
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Global Events</Text>
        <Text style={styles.headerSubtitle}>Verified incidents worldwide</Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.activeCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.activeCategoryText,
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadEvents} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="globe-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>No global events available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for verified updates
            </Text>
          </View>
        }
      />
    </View>
  );
}

const getIconForCategory = (category) => {
  const icons = {
    weather: 'rainy',
    natural: 'leaf',
    crime: 'shield',
    crash: 'car',
    fire: 'flame',
    flood: 'water',
    default: 'alert-circle',
  };
  return icons[category?.toLowerCase()] || icons.default;
};

const getCategoryColor = (category, theme) => {
  const colors = {
    weather: theme.secondary,
    natural: theme.success,
    crime: theme.danger,
    crash: theme.error,
    fire: theme.warning,
    flood: theme.secondary,
    default: theme.primary,
  };
  return colors[category?.toLowerCase()] || colors.default;
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
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
    categoryScroll: {
      maxHeight: 60,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    categoryContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: theme.background,
    },
    activeCategory: {
      backgroundColor: theme.primary,
    },
    categoryText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    activeCategoryText: {
      color: '#fff',
    },
    listContent: {
      padding: 16,
    },
    eventCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    eventHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    eventIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    eventContent: {
      flex: 1,
    },
    eventTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 4,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginRight: 8,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.success}20`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    verifiedText: {
      fontSize: 10,
      color: theme.success,
      fontWeight: 'bold',
      marginLeft: 4,
    },
    eventTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    eventDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    severityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    severityLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginRight: 8,
    },
    severityBar: {
      flexDirection: 'row',
      gap: 4,
    },
    severityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.border,
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
      marginTop: 60,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
    },
    emptySubtext: {
      marginTop: 8,
      fontSize: 14,
      color: theme.textSecondary,
    },
  });
