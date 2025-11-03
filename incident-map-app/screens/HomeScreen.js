import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../App';
import { useTheme } from '../theme';
import { BASE_URL, API_ENDPOINTS } from '../config/constants';

export default function HomeScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const theme = useTheme();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}${API_ENDPOINTS.INCIDENTS.BASE}`, {
        params: { lat: 0, lng: 0 }, // Get latest reports
      });
      setReports(res.data.slice(0, 10)); // Show latest 10
    } catch (e) {
      console.warn('Failed to load reports', e);
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Safety</Text>
        <Text style={styles.headerSubtitle}>Stay informed, stay safe</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadReports} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Report')}
          >
            <Ionicons name="add-circle" size={32} color={theme.primary} />
            <Text style={styles.actionText}>Report Danger</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map" size={32} color={theme.secondary} />
            <Text style={styles.actionText}>View Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={32} color={theme.warning} />
            <Text style={styles.actionText}>Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Latest Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Reports</Text>
          {reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="information-circle-outline" size={48} color={theme.textSecondary} />
              <Text style={styles.emptyText}>No reports available</Text>
            </View>
          ) : (
            reports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportCard}
                onPress={() => navigation.navigate('Map', { incidentId: report.id })}
              >
                <View style={styles.reportHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(report.type, theme) }]}>
                    <Text style={styles.typeText}>{report.type}</Text>
                  </View>
                  <Text style={styles.reportTime}>
                    {new Date(report.created_at).toLocaleDateString()}
                  </Text>
                </View>
                {report.description && (
                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {report.description}
                  </Text>
                )}
                {report.severity && (
                  <View style={styles.severityContainer}>
                    <Text style={styles.severityLabel}>Severity: </Text>
                    <View style={styles.severityBar}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.severityDot,
                            level <= report.severity && { backgroundColor: theme.danger },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Global Events Link */}
        <TouchableOpacity
          style={styles.globalEventsCard}
          onPress={() => navigation.navigate('GlobalEvents')}
        >
          <Ionicons name="globe" size={24} color={theme.primary} />
          <Text style={styles.globalEventsText}>View Global Events</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

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
    content: {
      flex: 1,
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 16,
      backgroundColor: theme.surface,
      marginBottom: 16,
    },
    actionCard: {
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.background,
      borderRadius: 12,
      minWidth: 100,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    actionText: {
      marginTop: 8,
      fontSize: 12,
      color: theme.text,
      fontWeight: '500',
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    reportCard: {
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
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    typeBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    typeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      textTransform: 'capitalize',
    },
    reportTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    reportDescription: {
      fontSize: 14,
      color: theme.text,
      marginBottom: 8,
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
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
    },
    globalEventsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      padding: 16,
      margin: 16,
      marginTop: 8,
      borderRadius: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    globalEventsText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
  });
