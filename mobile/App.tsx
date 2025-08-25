import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import CustomerDashboard, { JobTrackingScreen, DeviceRegistrationScreen, PaymentScreen } from './src/screens/customer';
import TechnicianDashboard, { JobManagementScreen, FieldOperationsScreen } from './src/screens/technician'; 
import AdminDashboard, { BusinessSettingsScreen } from './src/screens/admin';
import CameraScreen from './src/screens/shared';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Configure push notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Wrapper components for navigation
const mockUser = {
  id: '1',
  email: 'user@example.com',
  role: 'customer' as const,
  name: 'Demo User'
};

const CustomerDashboardWrapper: React.FC = ({ route }: any) => {
  const user = route?.params?.user || mockUser;
  const onLogout = route?.params?.onLogout || (() => console.log('Logout'));
  return <CustomerDashboard route={{ params: { user, onLogout } }} />;
};

const TechnicianDashboardWrapper: React.FC = ({ route }: any) => {
  const user = route?.params?.user || mockUser;
  const onLogout = route?.params?.onLogout || (() => console.log('Logout'));
  return <TechnicianDashboard route={{ params: { user, onLogout } }} />;
};

interface User {
  id: string;
  email: string;
  role: 'customer' | 'technician' | 'admin';
  name: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    checkAuthStatus();
    
    // Request notification permissions
    requestNotificationPermissions();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Notifications Disabled',
        'To receive updates about your repairs, please enable notifications in settings.'
      );
    }
  };

  const handleLogin = async (userData: User) => {
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error storing user data:', error);
      Alert.alert('Error', 'Failed to save login information');
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading RepairX...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Customer Navigation
  const CustomerTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Track Jobs':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Register Device':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Payment':
              iconName = focused ? 'card' : 'card-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={CustomerDashboardWrapper}
        initialParams={{ user, onLogout: handleLogout }}
      />
      <Tab.Screen 
        name="Track Jobs" 
        component={JobTrackingScreen}
      />
      <Tab.Screen 
        name="Register Device" 
        component={DeviceRegistrationScreen}
      />
      <Tab.Screen 
        name="Payment" 
        component={PaymentScreen}
        initialParams={{ user }}
      />
    </Tab.Navigator>
  );

  // Technician Navigation
  const TechnicianTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'construct' : 'construct-outline';
              break;
            case 'Jobs':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Field Ops':
              iconName = focused ? 'location' : 'location-outline';
              break;
            case 'Camera':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={TechnicianDashboardWrapper}
        initialParams={{ user, onLogout: handleLogout }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={JobManagementScreen}
      />
      <Tab.Screen 
        name="Field Ops" 
        component={FieldOperationsScreen}
        initialParams={{ user }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        initialParams={{ user }}
      />
    </Tab.Navigator>
  );

  // Admin Navigation
  const AdminTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'business' : 'business-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboard}
        initialParams={{ user, onLogout: handleLogout }}
      />
      <Tab.Screen 
        name="Settings" 
        component={BusinessSettingsScreen}
        initialParams={{ user }}
      />
    </Tab.Navigator>
  );

  // Render based on user role
  const renderAppContent = () => {
    switch (user.role) {
      case 'customer':
        return <CustomerTabs />;
      case 'technician':
        return <TechnicianTabs />;
      case 'admin':
        return <AdminTabs />;
      default:
        return (
          <View style={styles.centerContainer}>
            <Text>Invalid user role</Text>
          </View>
        );
    }
  };

  return (
    <NavigationContainer>
      {renderAppContent()}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default App;