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

export default function AdminScreen({ navigation }) {
  console.log('===== AdminScreen loaded =====');
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, verified, flagged
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const theme = useTheme();

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}${API_ENDPOINTS.INCIDENTS.BASE}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      let filtered = res.data;
      if (filter === 'pending') {
        // Pending: not approved and not flagged
        filtered = res.data.filter((r) => !r.approved && !r.flagged);
      } else if (filter === 'verified') {
        // Verified: approved
        filtered = res.data.filter((r) => r.approved);
      } else if (filter === 'flagged') {
        // Flagged: explicitly flagged
        filtered = res.data.filter((r) => r.flagged);
      }
      
      setReports(filtered);
    } catch (e) {
      console.warn('Failed to load reports', e);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const verifyReport = async (reportId) => {
    console.log('===== verify report pressed =====');
    console.log('reportId:', reportId);
    
    const confirmed = window.confirm('Are you sure you want to verify this report?');
    
    if (!confirmed) return;
    
    try {
      console.log('Making PATCH request to verify...');
      const response = await axios.patch(
        `${BASE_URL}${API_ENDPOINTS.INCIDENTS.BASE}/${reportId}/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Verify success:', response.data);
      window.alert('Report verified successfully');
      loadReports();
    } catch (e) {
      console.error('Verify error:', e);
      console.error('Error response:', e.response?.data);
      window.alert(e.response?.data?.error || 'Failed to verify report');
    }
  };

  const flagReport = async (reportId) => {
    console.log('===== flag report pressed =====');
    console.log('reportId:', reportId);
    
    const reason = window.prompt('Enter reason for flagging this report:');
    
    if (!reason || reason.trim() === '') {
      console.log('Flag cancelled or no reason provided');
      return;
    }
    
    try {
      console.log('Making PATCH request to flag...');
      const response = await axios.patch(
        `${BASE_URL}${API_ENDPOINTS.INCIDENTS.BASE}/${reportId}/flag`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Flag success:', response.data);
      window.alert('Report flagged successfully');
      loadReports();
    } catch (e) {
      console.error('Flag error:', e);
      console.error('Error response:', e.response?.data);
      window.alert(e.response?.data?.error || 'Failed to flag report');
    }
  };

  const deleteReport = (reportId) => {
    console.log('===== delete report pressed =====');
    console.log('reportId:', reportId);
    
    const confirmed = window.confirm('Are you sure you want to delete this report?');
    
    if (confirmed) {
      handleDelete(reportId);
    }
  };

  const handleDelete = async (reportId) => {
    console.log('===== DELETE CONFIRMED =====');
    console.log('Attempting to delete reportId:', reportId);
    console.log('Token:', token ? 'Token exists' : 'NO TOKEN');
    console.log('URL:', `${BASE_URL}${API_ENDPOINTS.INCIDENTS.BASE}/${reportId}`);
    
    try {
      const response = await axios.delete(
        `${BASE_URL}${API_ENDPOINTS.INCIDENTS.BASE}/${reportId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('===== DELETE SUCCESS =====');
      console.log('Response:', response.data);
      
      window.alert('Report deleted successfully');
      loadReports();
    } catch (e) {
      console.log('===== DELETE ERROR =====');
      console.error('Delete error:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      
      window.alert(e.response?.data?.error || 'Failed to delete report');
    }
  };

  const styles = getStyles(theme);

  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => navigation.navigate('Map', { incidentId: item.id })}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportType}>{item.type}</Text>
          <Text style={styles.reportTime}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item, theme) }]}>
          <Text style={styles.statusText}>
            {item.approved ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.reportActions}>
        {!item.approved && (
          <TouchableOpacity
            style={[styles.actionButton, styles.verifyButton]}
            onPress={() => verifyReport(item.id)}
          >
            <Ionicons name="checkmark-circle" size={18} color={theme.success} />
            <Text style={[styles.actionText, { color: theme.success }]}>Verify</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.flagButton]}
          onPress={() => flagReport(item.id)}
        >
          <Ionicons name="flag" size={18} color={theme.warning} />
          <Text style={[styles.actionText, { color: theme.warning }]}>Flag</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteReport(item.id)}
        >
          <Ionicons name="trash" size={18} color={theme.danger} />
          <Text style={[styles.actionText, { color: theme.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Review and validate reports</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.activeFilter]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'verified' && styles.activeFilter]}
          onPress={() => setFilter('verified')}
        >
          <Text style={[styles.filterText, filter === 'verified' && styles.activeFilterText]}>
            Verified
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'flagged' && styles.activeFilter]}
          onPress={() => setFilter('flagged')}
        >
          <Text style={[styles.filterText, filter === 'flagged' && styles.activeFilterText]}>
            Flagged
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadReports} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>No reports to review</Text>
          </View>
        }
      />
    </View>
  );
}

const getStatusColor = (item, theme) => {
  if (item.approved) return theme.success;
  return theme.warning;
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
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterTab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeFilter: {
      borderBottomColor: theme.primary,
    },
    filterText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    activeFilterText: {
      color: theme.primary,
      fontWeight: 'bold',
    },
    listContent: {
      padding: 16,
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
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    reportInfo: {
      flex: 1,
    },
    reportType: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      textTransform: 'capitalize',
      marginBottom: 4,
    },
    reportTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#fff',
    },
    reportDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    reportActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.background,
      gap: 4,
    },
    verifyButton: {
      borderWidth: 1,
      borderColor: theme.success,
    },
    flagButton: {
      borderWidth: 1,
      borderColor: theme.warning,
    },
    deleteButton: {
      borderWidth: 1,
      borderColor: theme.danger,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '500',
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