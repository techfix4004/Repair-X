/**
 * Customer Self-Service QR Code Check-in System
 * Enhanced mobile features for customer device registration
 * Mobile-First Field Operations from RepairX roadmap
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  Modal,
  TextInput, Image } from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface Device {
  id?: string;
  qrCode?: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  imei?: string;
  condition: string;
  issueDescription: string;
  photos: string[];
  accessories: string[];
  customerNotes?: string;
  checkInDate: string;
}

interface CheckInScreenProps {
  navigation: any;
  customerId: string;
}

const CustomerCheckInScreen: React.FC<CheckInScreenProps> = ({ navigation, customerId }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [device, setDevice] = useState<Device>({
    manufacturer: '',
    model: '',
    serialNumber: '',
    imei: '',
    condition: 'Good',
    issueDescription: '',
    photos: [],
    accessories: [],
    customerNotes: '',
    checkInDate: new Date().toISOString(),
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Device condition _options
  const conditionOptions = [
    { value: 'Excellent', label: 'Excellent - Like new', color: '#10b981' },
    { value: 'Good', label: 'Good - Minor wear', color: '#3b82f6' },
    { value: 'Fair', label: 'Fair - Visible wear', color: '#f59e0b' },
    { value: 'Poor', label: 'Poor - Significant damage', color: '#ef4444' },
  ];

  // Common accessories
  const commonAccessories = [
    'Charger', 'Case', 'Screen Protector', 'Headphones', 'SIM Card',
    'Memory Card', 'Original Box', 'Manual', 'Receipt', 'Warranty Card'
  ];

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    
    setScanned(true);
    setShowCamera(false);
    
    // Extract device information from QR code
    try {
      const deviceData = JSON.parse(data);
      setDevice(prevDevice => ({
        ...prevDevice,
        qrCode: data,
        manufacturer: deviceData.manufacturer || '',
        model: deviceData.model || '',
        serialNumber: deviceData.serialNumber || '',
        imei: deviceData.imei || '',
      }));
      setShowDeviceForm(true);
    } catch (error) {
      // If not JSON, treat as simple device identifier
      setDevice(prevDevice => ({
        ...prevDevice,
        qrCode: data,
        serialNumber: data,
      }));
      setShowDeviceForm(true);
    }

    Alert.alert(
      'QR Code Scanned',
      `Device detected: ${data}`,
      [{ text: 'Continue', onPress: () => setShowDeviceForm(true) }]
    );
  };

  const capturePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDevice(prevDevice => ({
          ...prevDevice,
          photos: [...prevDevice.photos, result.assets[0].uri],
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDevice(prevDevice => ({
          ...prevDevice,
          photos: [...prevDevice.photos, result.assets[0].uri],
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const toggleAccessory = (accessory: string) => {
    setDevice(prevDevice => {
      const accessories = prevDevice.accessories.includes(accessory)
        ? prevDevice.accessories.filter(a => a !== accessory)
        : [...prevDevice.accessories, accessory];
      
      return { ...prevDevice, accessories };
    });
  };

  const submitCheckIn = async () => {
    setLoading(true);
    
    try {
      // Validate required fields
      if (!device.manufacturer || !device.model || !device.issueDescription) {
        Alert.alert('Error', 'Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Submit device check-in
      const response = await fetch('/api/v1/devices/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...device,
          customerId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          'Check-In Successful',
          `Your device has been checked in successfully.\n\nJob ID: ${result._jobId}\nTracking Number: ${result.trackingNumber}`,
          [
            {
              text: 'View Details',
              onPress: () => navigation.navigate('JobTracking', { jobId: result._jobId })
            }
          ]
        );
        setShowDeviceForm(false);
        resetForm();
      } else {
        throw new Error('Failed to check in device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check in device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDevice({
      manufacturer: '',
      model: '',
      serialNumber: '',
      imei: '',
      condition: 'Good',
      issueDescription: '',
      photos: [],
      accessories: [],
      customerNotes: '',
      checkInDate: new Date().toISOString(),
    });
    setCurrentStep(1);
    setScanned(false);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index + 1 <= currentStep ? styles.stepDotActive : styles.stepDotInactive
          ]}
        >
          <Text style={[
            styles.stepText,
            index + 1 <= currentStep ? styles.stepTextActive : styles.stepTextInactive
          ]}>
            {index + 1}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Device Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Manufacturer (e.g., Apple, Samsung)*"
        value={device.manufacturer}
        onChangeText={(text) => setDevice(prev => ({ ...prev, manufacturer: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Model (e.g., iPhone 14, Galaxy S23)*"
        value={device.model}
        onChangeText={(text) => setDevice(prev => ({ ...prev, model: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Serial Number"
        value={device.serialNumber}
        onChangeText={(text) => setDevice(prev => ({ ...prev, serialNumber: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="IMEI (for mobile devices)"
        value={device.imei}
        onChangeText={(text) => setDevice(prev => ({ ...prev, imei: text }))}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Device Condition</Text>
      {conditionOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.conditionOption,
            device.condition === option.value && styles.conditionOptionSelected
          ]}
          onPress={() => setDevice(prev => ({ ...prev, condition: option.value }))}
        >
          <View style={[styles.conditionIndicator, { backgroundColor: option.color }]} />
          <Text style={styles.conditionLabel}>{option.label}</Text>
          {device.condition === option.value && (
            <Ionicons name="checkmark-circle" size={24} color={option.color} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Issue Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue you're experiencing*"
        value={device.issueDescription}
        onChangeText={(text) => setDevice(prev => ({ ...prev, issueDescription: text }))}
        multiline
        numberOfLines={4}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Additional notes (optional)"
        value={device.customerNotes}
        onChangeText={(text) => setDevice(prev => ({ ...prev, customerNotes: text }))}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Device Photos</Text>
      <Text style={styles.stepSubtitle}>Take photos to document current condition</Text>
      
      <View style={styles.photoButtons}>
        <TouchableOpacity style={styles.photoButton} onPress={capturePhoto}>
          <Ionicons name="camera" size={24} color="#2563eb" />
          <Text style={styles.photoButtonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={selectFromGallery}>
          <Ionicons name="images" size={24} color="#2563eb" />
          <Text style={styles.photoButtonText}>From Gallery</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.photoPreview}>
        {device.photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removePhoto}
              onPress={() => {
                setDevice(prev => ({
                  ...prev,
                  photos: prev.photos.filter((_, i) => i !== index)
                }));
              }}
            >
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Accessories</Text>
      <Text style={styles.stepSubtitle}>Select any accessories you're leaving with the device</Text>
      
      <View style={styles.accessoriesGrid}>
        {commonAccessories.map((accessory) => (
          <TouchableOpacity
            key={accessory}
            style={[
              styles.accessoryItem,
              device.accessories.includes(accessory) && styles.accessoryItemSelected
            ]}
            onPress={() => toggleAccessory(accessory)}
          >
            <Text style={[
              styles.accessoryText,
              device.accessories.includes(accessory) && styles.accessoryTextSelected
            ]}>
              {accessory}
            </Text>
            {device.accessories.includes(accessory) && (
              <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={getCameraPermissions}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Check-in Options */}
      {!showCamera && !showDeviceForm && (
        <ScrollView contentContainerStyle={styles.mainContent}>
          <Text style={styles.title}>Device Check-In</Text>
          <Text style={styles.subtitle}>
            Check in your device for repair service
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowCamera(true)}
          >
            <Ionicons name="qr-code-outline" size={32} color="white" />
            <Text style={styles.primaryButtonText}>Scan QR Code</Text>
            <Text style={styles.primaryButtonSubtext}>
              If your device has a QR code sticker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowDeviceForm(true)}
          >
            <Ionicons name="add-circle-outline" size={32} color="#2563eb" />
            <Text style={styles.secondaryButtonText}>Manual Check-In</Text>
            <Text style={styles.secondaryButtonSubtext}>
              Enter device information manually
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* QR Code Scanner */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          >
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraInstructions}>
                Position the QR code within the frame
              </Text>
              <View style={styles.qrFrame} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCamera(false)}
              >
                <Ionicons name="close" size={32} color="white" />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>

      {/* Device Form Modal */}
      <Modal visible={showDeviceForm} animationType="slide">
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setShowDeviceForm(false)}>
              <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.formTitle}>Device Check-In</Text>
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {renderStepIndicator()}

          <ScrollView style={styles.formContent}>
            {renderCurrentStep()}
          </ScrollView>

          <View style={styles.formFooter}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {currentStep < totalSteps ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => setCurrentStep(currentStep + 1)}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitCheckIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Check In Device</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  primaryButtonSubtext: {
    color: '#bfdbfe',
    fontSize: 14,
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  secondaryButtonSubtext: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraInstructions: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  resetText: {
    color: '#ef4444',
    fontSize: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  stepDotActive: {
    backgroundColor: '#2563eb',
  },
  stepDotInactive: {
    backgroundColor: '#e5e7eb',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepTextActive: {
    color: 'white',
  },
  stepTextInactive: {
    color: '#9ca3af',
  },
  formContent: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  conditionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  conditionOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  conditionIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  conditionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  photoButtonText: {
    color: '#2563eb',
    marginLeft: 8,
    fontSize: 16,
  },
  photoPreview: {
    flexDirection: 'row',
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  accessoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  accessoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  accessoryItemSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  accessoryText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  accessoryTextSelected: {
    color: '#2563eb',
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  backButton: {
    flex: 0.4,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 0.5,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomerCheckInScreen;