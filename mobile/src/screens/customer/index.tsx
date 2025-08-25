import CustomerDashboard from './CustomerDashboard';
import JobTrackingScreen from './JobTrackingScreen';
import DeviceRegistrationScreen from './DeviceRegistrationScreen';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Payment Screen
const PaymentScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Payment</Text>
    <Text>Payment processing interface will be implemented here</Text>
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

export default CustomerDashboard;
export { JobTrackingScreen, DeviceRegistrationScreen, PaymentScreen };