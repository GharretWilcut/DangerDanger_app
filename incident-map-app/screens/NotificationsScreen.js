import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../App';
import { useTheme } from '../theme';
import { BASE_URL, API_ENDPOINTS } from '../config/constants';

export default function NotificationsScreen({ navigation }) {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, dismissed
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const theme = useTheme();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from /notifications endpoint
      // For now, we'll use incidents as alerts
      const res = await axios.get(`${BASE_URL}${API_ENDPOINTS.INCIDENTS.BASE}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Transform incidents into alerts
      const alertsData = res.data.slice(0, 20).map((incident) => ({
        id: incident.id,
        title: `${incident.type} Alert`,
        description: incident.description || 'No description available',
        type: incident.type,
        severity: incident.severity || 1,
        time: incident.created_at,
        read: false,
        dismissed: false,
      }));
      setAlerts(alertsData);
    } catch (e) {
      console.warn('Failed to load alerts', e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  };

  const dismissAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a))
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'unread') return !alert.read && !alert.dismissed;
    if (filter === 'dismissed') return alert.dismissed;
    return !alert.dismissed;
  });

  const styles = getStyles(theme);

  const renderAlert = ({ item }) => (
    <TouchableOpacity
      style={[styles.alertCard, !item.read && styles.unreadCard]}
      onPress={() => {
        markAsRead(item.id);
        navigation.navigate('Map', { incidentId: item.id });
      }}
    >
      <View style={styles.alertHeader}>
        <View style={[styles.alertIcon, { backgroundColor: getTypeColor(item.type, theme) }]}>
          <Ionicons name={getIconForType(item.type)} size={20} color="#fff" />
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>{item.title}</Text>
          <Text style={styles.alertTime}>
            {new Date(item.time).toLocaleString()}
          </Text>
        </View>
        <View style={styles.alertActions}>
          {!item.read && <View style={styles.unreadDot} />}
          <TouchableOpacity
            onPress={() => dismissAlert(item.id)}
            style={styles.dismissButton}
          >
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.alertDescription} numberOfLines={2}>
        {item.description}
      </Text>
      {item.severity > 3 && (
        <View style={styles.highSeverityBadge}>
          <Ionicons name="warning" size={16} color={theme.danger} />
          <Text style={styles.highSeverityText}>High Severity</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSubtitle}>Live safety alerts</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.activeFilter]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
            Unread
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'dismissed' && styles.activeFilter]}
          onPress={() => setFilter('dismissed')}
        >
          <Text style={[styles.filterText, filter === 'dismissed' && styles.activeFilterText]}>
            Dismissed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAlerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAlerts} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>No alerts available</Text>
          </View>
        }
      />
    </View>
  );
}

const getIconForType = (type) => {
  const icons = {
    crash: 'car',
    crime: 'shield',
    fire: 'flame',
    flood: 'water',
    default: 'alert-circle',
  };
  return icons[type?.toLowerCase()] || icons.default;
};

const getTypeColor = (type, theme) => {
  const colors = {
    crash: theme.error,
    crime: theme.danger,
    fire: theme.warning,
    flood: theme.secondary,
    default: theme.primary,
  };
  return colors[type?.toLowerCase()] || colors.default;
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
    filters: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: theme.background,
    },
    activeFilter: {
      backgroundColor: theme.primary,
    },
    filterText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    activeFilterText: {
      color: '#fff',
    },
    listContent: {
      padding: 16,
    },
    alertCard: {
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
    unreadCard: {
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    alertIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    alertContent: {
      flex: 1,
    },
    alertTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    alertTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    alertActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
      marginRight: 8,
    },
    dismissButton: {
      padding: 4,
    },
    alertDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    highSeverityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.danger}20`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    highSeverityText: {
      fontSize: 12,
      color: theme.danger,
      fontWeight: 'bold',
      marginLeft: 4,
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
      marginTop: 60,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
    },
  });
