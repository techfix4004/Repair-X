import TechnicianDashboard from './TechnicianDashboard';
import JobManagementScreen from './JobManagementScreen';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Field Operations Screen
const FieldOperationsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Field Operations</Text>
    <Text>GPS tracking and field operations tools will be implemented here</Text>
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

export default TechnicianDashboard;
export { JobManagementScreen, FieldOperationsScreen };