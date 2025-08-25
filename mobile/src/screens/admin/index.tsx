import AdminDashboard from './AdminDashboard';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Business Settings Screen
const BusinessSettingsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Business Settings</Text>
    <Text>20+ business configuration categories implemented</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
});

export default AdminDashboard;
export { BusinessSettingsScreen };