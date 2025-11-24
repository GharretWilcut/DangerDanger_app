import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../App';
import { useTheme } from '../theme';

export default function SettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [alertPreferences, setAlertPreferences] = useState({
    highSeverity: true,
    nearbyOnly: false,
    verifiedOnly: false,
  });
  const { setToken } = useContext(AuthContext);
  const theme = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            setToken(null);
          },
        },
      ]
    );
  };

  const styles = getStyles(theme);

  const SettingItem = ({ icon, title, subtitle, rightComponent }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={theme.primary} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your preferences</Text>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          subtitle="Toggle dark theme"
          rightComponent={
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                setDarkMode(value);
                // In a real app, save to localStorage and use a theme context
                Alert.alert(
                  'Note',
                  'Dark mode preference will be saved. Restart the app to apply changes.'
                );
              }}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          icon="notifications-outline"
          title="Enable Notifications"
          subtitle="Receive safety alerts"
          rightComponent={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          }
        />
        <SettingItem
          icon="alert-circle-outline"
          title="High Severity Only"
          subtitle="Only alerts above severity 3"
          rightComponent={
            <Switch
              value={alertPreferences.highSeverity}
              onValueChange={(value) =>
                setAlertPreferences({ ...alertPreferences, highSeverity: value })
              }
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={alertPreferences.highSeverity ? '#fff' : '#f4f3f4'}
            />
          }
        />
        <SettingItem
          icon="location-outline"
          title="Nearby Only"
          subtitle="Only alerts within 5km"
          rightComponent={
            <Switch
              value={alertPreferences.nearbyOnly}
              onValueChange={(value) =>
                setAlertPreferences({ ...alertPreferences, nearbyOnly: value })
              }
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={alertPreferences.nearbyOnly ? '#fff' : '#f4f3f4'}
            />
          }
        />
        <SettingItem
          icon="checkmark-circle-outline"
          title="Verified Only"
          subtitle="Show only verified reports"
          rightComponent={
            <Switch
              value={alertPreferences.verifiedOnly}
              onValueChange={(value) =>
                setAlertPreferences({ ...alertPreferences, verifiedOnly: value })
              }
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={alertPreferences.verifiedOnly ? '#fff' : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <SettingItem
          icon="location-outline"
          title="Location Tracking"
          subtitle="Allow background location updates"
          rightComponent={
            <Switch
              value={locationTracking}
              onValueChange={setLocationTracking}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={locationTracking ? '#fff' : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          icon="person-outline"
          title="Profile"
          subtitle="View and edit profile"
          rightComponent={
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          }
        />
        <SettingItem
          icon="shield-checkmark-outline"
          title="Privacy & Security"
          subtitle="Manage privacy settings"
          rightComponent={
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          }
        />
        <TouchableOpacity onPress={handleLogout}>
          <SettingItem
            icon="log-out-outline"
            title="Logout"
            subtitle="Sign out of your account"
            rightComponent={
              <Ionicons name="chevron-forward" size={20} color={theme.danger} />
            }
          />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <SettingItem
          icon="information-circle-outline"
          title="App Version"
          subtitle="1.0.0"
          rightComponent={null}
        />
        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help and report issues"
          rightComponent={
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          }
        />
        <SettingItem
          icon="document-text-outline"
          title="Terms & Privacy"
          subtitle="Read our terms of service"
          rightComponent={
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          }
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Community Safety Alert System
        </Text>
        <Text style={styles.footerSubtext}>
          Stay informed, stay safe
        </Text>
      </View>
    </ScrollView>
  );
}

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
    section: {
      marginTop: 24,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingText: {
      marginLeft: 12,
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
      marginBottom: 4,
    },
    settingSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    footer: {
      alignItems: 'center',
      padding: 32,
      marginBottom: 20,
    },
    footerText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
    },
    footerSubtext: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
  });
