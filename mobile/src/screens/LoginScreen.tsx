import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image,
  KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: string;
  email: string;
  role: 'customer' | 'technician' | 'admin';
  name: string;
}

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [_password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Mock authentication - replace with actual API call
  const handleLogin = async () => {
    if (!email || !_password) {
      Alert.alert('Error', 'Please enter both email and _password');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data based on email domain for demo
      let mockUser: User;
      if (email.includes('tech') || email.includes('technician')) {
        mockUser = {
          id: '2',
          email,
          role: 'technician',
          name: 'John Technician'
        };
      } else if (email.includes('admin')) {
        mockUser = {
          id: '3',
          email,
          role: 'admin',
          name: 'Admin User'
        };
      } else {
        mockUser = {
          id: '1',
          email,
          role: 'customer',
          name: 'Customer User'
        };
      }

      onLogin(mockUser);
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'customer' | 'technician' | 'admin') => {
    const demoUsers = {
      customer: {
        id: '1',
        email: 'customer@repairx.com',
        role: 'customer' as const,
        name: 'Demo Customer'
      },
      technician: {
        id: '2', 
        email: 'tech@repairx.com',
        role: 'technician' as const,
        name: 'Demo Technician'
      },
      admin: {
        id: '3',
        email: 'admin@repairx.com', 
        role: 'admin' as const,
        name: 'Demo Admin'
      }
    };

    onLogin(demoUsers[role]);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#2196F3', '#21CBF3']}
        style={styles.gradient}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="construct" size={60} color="white" />
          </View>
          <Text style={styles.logoText}>RepairX</Text>
          <Text style={styles.taglineText}>Professional Repair Services</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={_password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? 'eye' : 'eye-off'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.demoTitle}>Demo Accounts:</Text>
          
          <TouchableOpacity 
            style={[styles.demoButton, styles.customerDemo]}
            onPress={() => handleDemoLogin('customer')}
          >
            <Ionicons name="person" size={20} color="white" />
            <Text style={styles.demoButtonText}>Customer Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.demoButton, styles.technicianDemo]}
            onPress={() => handleDemoLogin('technician')}
          >
            <Ionicons name="construct" size={20} color="white" />
            <Text style={styles.demoButtonText}>Technician Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.demoButton, styles.adminDemo]}
            onPress={() => handleDemoLogin('admin')}
          >
            <Ionicons name="business" size={20} color="white" />
            <Text style={styles.demoButtonText}>Admin Demo</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  taglineText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 20,
    paddingBottom: 10,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
  },
  customerDemo: {
    backgroundColor: '#2196F3',
  },
  technicianDemo: {
    backgroundColor: '#4CAF50',
  },
  adminDemo: {
    backgroundColor: '#FF9800',
  },
  demoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default LoginScreen;