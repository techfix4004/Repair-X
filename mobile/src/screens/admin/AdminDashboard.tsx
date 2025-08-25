import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface BusinessSetting {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'pending' | 'configured';
  itemCount?: number;
}

const AdminDashboard: React.FC = () => {
  const [settings] = useState<BusinessSetting[]>([
    { id: '1', category: 'Tax Settings', title: 'GST/VAT Configuration', description: 'Tax rates and calculations', icon: 'calculator-outline', status: 'completed', itemCount: 5 },
    { id: '2', category: 'Print Settings', title: 'Document Templates', description: 'Job sheets, invoices, receipts', icon: 'print-outline', status: 'completed', itemCount: 12 },
    { id: '3', category: 'Payment Settings', title: 'Payment Gateways', description: 'Stripe, PayPal, Square integration', icon: 'card-outline', status: 'completed', itemCount: 3 },
    { id: '4', category: 'SMS Settings', title: 'SMS Configuration', description: 'Automated notifications and alerts', icon: 'chatbubble-outline', status: 'configured', itemCount: 8 },
    { id: '5', category: 'Employee Management', title: 'Staff & Technicians', description: 'User roles and permissions', icon: 'people-outline', status: 'configured', itemCount: 15 },
    { id: '6', category: 'Workflow Settings', title: 'Business Processes', description: '12-state job lifecycle', icon: 'git-branch-outline', status: 'completed', itemCount: 12 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'configured': return '#FF9800';
      case 'pending': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const handleSettingPress = (setting: BusinessSetting) => {
    Alert.alert(setting.title, `Configure ${setting.description}\n\nStatus: ${setting.status.toUpperCase()}\nItems: ${setting.itemCount || 0}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#673AB7', '#9C27B0']} style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Business management and configuration</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Settings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>55</Text>
            <Text style={styles.statLabel}>Configured</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Business Configuration</Text>
        
        {settings.map((setting) => (
          <TouchableOpacity key={setting.id} style={styles.settingCard} onPress={() => handleSettingPress(setting)}>
            <View style={styles.settingIcon}>
              <Ionicons name={setting.icon as any} size={24} color="#673AB7" />
            </View>
            
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
              <Text style={styles.settingCategory}>{setting.category}</Text>
            </View>
            
            <View style={styles.settingStatus}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(setting.status) }]} />
              <Text style={styles.itemCount}>{setting.itemCount} items</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="analytics-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>View Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Ionicons name="settings-outline" size={20} color="#673AB7" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>System Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statCard: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  statLabel: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  settingCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  settingIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  settingDescription: { fontSize: 14, color: '#666', marginBottom: 4 },
  settingCategory: { fontSize: 12, color: '#9C27B0', fontWeight: '500' },
  settingStatus: { alignItems: 'flex-end' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  itemCount: { fontSize: 12, color: '#666' },
  actionButton: { backgroundColor: '#673AB7', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  secondaryButton: { backgroundColor: 'white', borderWidth: 1, borderColor: '#673AB7' },
  actionButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  secondaryButtonText: { color: '#673AB7' },
});

export default AdminDashboard;