import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Camera Screen for photo documentation
const CameraScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Camera</Text>
    <Text>Photo capture and documentation tools will be implemented here</Text>
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

export default CameraScreen;