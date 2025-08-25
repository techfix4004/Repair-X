import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../../services/apiService';

interface DeviceRegistrationProps {
  navigation?: any;
}

interface DeviceForm {
  brand: string;
  model: string;
  category: string;
  condition: string;
  serialNumber: string;
  description: string;
  purchaseDate: string;
  warrantyExpiry: string;
}

const deviceCategories = [
  'Smartphone',
  'Laptop',
  'Tablet',
  'Desktop',
  'Television',
  'Gaming Console',
  'Smartwatch',
  'Headphones',
  'Other'
];

const deviceConditions = [
  'New',
  'Like New', 
  'Good',
  'Fair',
  'Poor'
];

const DeviceRegistrationScreen: React.FC<DeviceRegistrationProps> = () => {
  const [form, setForm] = useState<DeviceForm>({
    brand: '',
    model: '',
    category: 'Smartphone',
    condition: 'Good',
    serialNumber: '',
    description: '',
    purchaseDate: '',
    warrantyExpiry: '',
  });
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [deviceImages, setDeviceImages] = useState<string[]>([]);
  const [permission, requestPermission] = useCameraPermissions();

  const updateForm = (field: keyof DeviceForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setShowScanner(false);
    
    // Try to parse QR code data for device information
    try {
      const deviceInfo = JSON.parse(data);
      if (deviceInfo.brand) setForm(prev => ({ ...prev, brand: deviceInfo.brand }));
      if (deviceInfo.model) setForm(prev => ({ ...prev, model: deviceInfo.model }));
      if (deviceInfo.serialNumber) setForm(prev => ({ ...prev, serialNumber: deviceInfo.serialNumber }));
    } catch {
      // If not JSON, treat as serial number
      setForm(prev => ({ ...prev, serialNumber: data }));
    }

    Alert.alert('QR Code Scanned', `Data: ${data}`);
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera Permission Required', 'Please enable camera access to scan QR codes.');
        return;
      }
    }
    setShowScanner(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDeviceImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDeviceImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setDeviceImages(prev => prev.filter((_, i) => i !== index));
  };

  const submitForm = async () => {
    if (!form.brand.trim() || !form.model.trim()) {
      Alert.alert('Required Fields', 'Please fill in brand and model information.');
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.registerDevice({
        brand: form.brand,
        model: form.model,
        category: form.category,
        condition: form.condition,
        serialNumber: form.serialNumber || undefined,
      });

      if (result._success) {
        Alert.alert(
          'Device Registered',
          'Your device has been successfully registered. You can now create repair requests for this device.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setForm({
                  brand: '',
                  model: '',
                  category: 'Smartphone',
                  condition: 'Good',
                  serialNumber: '',
                  description: '',
                  purchaseDate: '',
                  warrantyExpiry: '',
                });
                setDeviceImages([]);
              }
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', result.error || 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register device. Please try again.');
      console.error('Device registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showScanner) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.scanner}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
        />
        <View style={styles.scannerOverlay}>
          <Text style={styles.scannerText}>Scan QR code or barcode</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowScanner(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#45A049']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Device Registration</Text>
        <Text style={styles.headerSubtitle}>Register your device for repair</Text>
      </LinearGradient>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* QR Scanner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Registration</Text>
          <TouchableOpacity style={styles.qrButton} onPress={openScanner}>
            <Ionicons name="qr-code-outline" size={24} color="white" />
            <Text style={styles.qrButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
          <Text style={styles.orText}>or fill manually</Text>
        </View>

        {/* Device Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              style={styles.input}
              value={form.brand}
              onChangeText={(text) => updateForm('brand', text)}
              placeholder="e.g., Apple, Samsung, HP"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model *</Text>
            <TextInput
              style={styles.input}
              value={form.model}
              onChangeText={(text) => updateForm('model', text)}
              placeholder="e.g., iPhone 13, Galaxy S21"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {deviceCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      form.category === category && styles.categoryButtonActive
                    ]}
                    onPress={() => updateForm('category', category)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        form.category === category && styles.categoryButtonTextActive
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condition</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {deviceConditions.map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.categoryButton,
                      form.condition === condition && styles.categoryButtonActive
                    ]}
                    onPress={() => updateForm('condition', condition)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        form.condition === condition && styles.categoryButtonTextActive
                      ]}
                    >
                      {condition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Serial Number</Text>
            <TextInput
              style={styles.input}
              value={form.serialNumber}
              onChangeText={(text) => updateForm('serialNumber', text)}
              placeholder="Enter serial number"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(text) => updateForm('description', text)}
              placeholder="Additional details about your device"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Photos (Optional)</Text>
          
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={20} color="#2196F3" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={20} color="#2196F3" />
              <Text style={styles.photoButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {deviceImages.length > 0 && (
            <ScrollView horizontal style={styles.imageContainer}>
              {deviceImages.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.deviceImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={submitForm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text style={styles.submitButtonText}>Register Device</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 10,
  },
  qrButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginTop: 5,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  photoActions: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 5,
    backgroundColor: 'white',
  },
  photoButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  imageContainer: {
    marginTop: 10,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  deviceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 20,
  },
  scannerContainer: {
    flex: 1,
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scannerText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeviceRegistrationScreen;