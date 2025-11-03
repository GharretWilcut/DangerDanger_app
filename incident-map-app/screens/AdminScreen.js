import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../App';
import { useTheme } from '../theme';
import { BASE_URL, API_ENDPOINTS } from '../config/constants';

export default function AdminScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, verified, flagged
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
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
      // In a real app, filter by verification status from backend
      let filtered = res.data;
      if (filter === 'pending') {
        filtered = res.data.filter((r) => !r.verified); // Assume verified field
      } else if (filter === 'verified') {
        filtered = res.data.filter((r) => r.verified);
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
    try {
      // In a real app, call PATCH /incidents/:id/verify
      Alert.alert('Success', 'Report verified successfully');
      loadReports();
    } catch (e) {
      Alert.alert('Error', 'Failed to verify report');
    }
  };

  const flagReport = async (reportId, reason) => {
    try {
      // In a real app, call PATCH /incidents/:id/flag with reason
      Alert.alert('Success', 'Report flagged successfully');
      loadReports();
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to flag report');
    }
  };

  const deleteReport = (reportId) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, call DELETE /incidents/:id
              Alert.alert('Success', 'Report deleted');
              loadReports();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete report');
            }
          },
        },
      ]
    );
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
            {item.verified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.reportActions}>
        {!item.verified && (
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
          onPress={() => {
            setSelectedReport(item);
            setModalVisible(true);
          }}
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

      {/* Flag Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Flag Report
            </Text>
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="Reason for flagging..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={() => {
                  if (selectedReport) {
                    flagReport(selectedReport.id, 'Flagged by admin');
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Flag</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStatusColor = (item, theme) => {
  if (item.verified) return theme.success;
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      borderRadius: 12,
      padding: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    modalInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    modalButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    cancelButton: {
      backgroundColor: theme.background,
    },
    submitButton: {
      backgroundColor: theme.warning,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
  });
