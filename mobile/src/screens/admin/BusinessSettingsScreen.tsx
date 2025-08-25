import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/apiService';

interface BusinessSettingCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  settingsCount: number;
  lastUpdated: string;
}

interface BusinessSetting {
  id: string;
  key: string;
  name: string;
  value: any;
  type: 'text' | 'number' | 'boolean' | 'select';
  _options?: string[];
  description: string;
  required: boolean;
}

interface BusinessSettingsScreenProps {
  onBack: () => void;
}

const BusinessSettingsScreen: React.FC<BusinessSettingsScreenProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<BusinessSettingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BusinessSettingCategory | null>(null);
  const [settings, setSettings] = useState<BusinessSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSettingId, setEditingSettingId] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<any>('');

  useEffect(() => {
    loadCategories();
  }, []);

  const businessCategories: BusinessSettingCategory[] = [
    {
      id: '1',
      name: 'Tax Settings',
      icon: 'receipt-outline',
      description: 'GST/VAT/HST configuration and tax calculations',
      settingsCount: 8,
      lastUpdated: '2025-08-10'
    },
    {
      id: '2',
      name: 'Print Settings & Templates',
      icon: 'print-outline',
      description: 'Customizable job sheets, invoices, and receipts',
      settingsCount: 12,
      lastUpdated: '2025-08-10'
    },
    {
      id: '3',
      name: 'Workflow Configuration',
      icon: 'git-branch-outline',
      description: 'Business process automation and rules',
      settingsCount: 15,
      lastUpdated: '2025-08-10'
    },
    {
      id: '4',
      name: 'Email Settings',
      icon: 'mail-outline',
      description: 'SMTP configuration and templates',
      settingsCount: 10,
      lastUpdated: '2025-08-09'
    },
    {
      id: '5',
      name: 'SMS Settings',
      icon: 'chatbubble-outline',
      description: 'SMS gateway and notification setup',
      settingsCount: 6,
      lastUpdated: '2025-08-09'
    },
    {
      id: '6',
      name: 'Employee Management',
      icon: 'people-outline',
      description: 'Staff roles and permissions',
      settingsCount: 9,
      lastUpdated: '2025-08-08'
    },
    {
      id: '7',
      name: 'Customer Database',
      icon: 'person-outline',
      description: 'CRM configuration and data management',
      settingsCount: 11,
      lastUpdated: '2025-08-09'
    },
    {
      id: '8',
      name: 'Invoice Settings',
      icon: 'document-outline',
      description: 'Automated generation and compliance',
      settingsCount: 10,
      lastUpdated: '2025-08-10'
    },
    {
      id: '9',
      name: 'Quotation Settings',
      icon: 'document-text-outline',
      description: 'Multi-approval workflows and terms',
      settingsCount: 8,
      lastUpdated: '2025-08-09'
    },
    {
      id: '10',
      name: 'Payment Settings',
      icon: 'card-outline',
      description: 'Gateway configuration and collection rules',
      settingsCount: 14,
      lastUpdated: '2025-08-10'
    },
    {
      id: '11',
      name: 'Address/Location Settings',
      icon: 'location-outline',
      description: 'Service areas and territory management',
      settingsCount: 12,
      lastUpdated: '2025-08-10'
    },
    {
      id: '12',
      name: 'Reminder System',
      icon: 'notifications-outline',
      description: 'Automated follow-ups and escalations',
      settingsCount: 9,
      lastUpdated: '2025-08-10'
    },
    {
      id: '13',
      name: 'Business Information',
      icon: 'business-outline',
      description: 'Company profiles and branding',
      settingsCount: 15,
      lastUpdated: '2025-08-10'
    },
    {
      id: '14',
      name: 'Sequence Settings',
      icon: 'list-outline',
      description: 'Automated numbering sequences',
      settingsCount: 6,
      lastUpdated: '2025-08-10'
    },
    {
      id: '15',
      name: 'Expense Management',
      icon: 'wallet-outline',
      description: 'Budget controls and workflows',
      settingsCount: 13,
      lastUpdated: '2025-08-10'
    },
    {
      id: '16',
      name: 'Parts Inventory Settings',
      icon: 'cube-outline',
      description: 'Parts management and supplier integration',
      settingsCount: 11,
      lastUpdated: '2025-08-07'
    },
    {
      id: '17',
      name: 'Outsourcing Settings',
      icon: 'people-circle-outline',
      description: 'External provider network management',
      settingsCount: 8,
      lastUpdated: '2025-08-08'
    },
    {
      id: '18',
      name: 'Quality Settings',
      icon: 'checkmark-circle-outline',
      description: 'Six Sigma checkpoints and standards',
      settingsCount: 7,
      lastUpdated: '2025-08-10'
    },
    {
      id: '19',
      name: 'Security Settings',
      icon: 'shield-checkmark-outline',
      description: 'Access controls and audit trails',
      settingsCount: 13,
      lastUpdated: '2025-08-10'
    },
    {
      id: '20',
      name: 'Integration Settings',
      icon: 'flash-outline',
      description: 'Third-party APIs and data sync',
      settingsCount: 10,
      lastUpdated: '2025-08-10'
    }
  ];

  const loadCategories = async () => {
    setLoading(true);
    try {
      // In production, this would load from API
      setCategories(businessCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load business settings');
    } finally {
      setLoading(false);
    }
  };

  const loadCategorySettings = async (category: BusinessSettingCategory) => {
    setLoading(true);
    setSelectedCategory(category);
    
    try {
      // Mock settings data - in production, this would load from API
      const mockSettings: BusinessSetting[] = [
        {
          id: '1',
          key: 'gst_rate',
          name: 'GST Rate (%)',
          value: 18,
          type: 'number',
          description: 'Default GST rate for services',
          required: true
        },
        {
          id: '2',
          key: 'auto_calculate_tax',
          name: 'Auto Calculate Tax',
          value: true,
          type: 'boolean',
          description: 'Automatically calculate taxes on invoices',
          required: false
        },
        {
          id: '3',
          key: 'business_name',
          name: 'Business Name',
          value: 'RepairX Services',
          type: 'text',
          description: 'Legal business name for documents',
          required: true
        },
        {
          id: '4',
          key: 'currency',
          name: 'Default Currency',
          value: 'USD',
          type: 'select',
          _options: ['USD', 'EUR', 'GBP', 'CAD', 'INR'],
          description: 'Default currency for all transactions',
          required: true
        }
      ];
      
      setSettings(mockSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (setting: BusinessSetting) => {
    try {
      const updatedSettings = settings.map(s =>
        s.id === setting.id ? { ...s, value: tempValue } : s
      );
      setSettings(updatedSettings);
      setEditingSettingId(null);
      setTempValue('');
      
      // In production, save to API
      console.log('Saving setting:', { id: setting.id, value: tempValue });
      
    } catch (error) {
      console.error('Error saving setting:', error);
      Alert.alert('Error', 'Failed to save setting');
    }
  };

  const renderCategoryCard = (category: BusinessSettingCategory) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => loadCategorySettings(category)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={category.icon as any} size={24} color="#007AFF" />
      </View>
      
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
        
        <View style={styles.categoryMeta}>
          <Text style={styles.settingsCount}>
            {category.settingsCount} settings
          </Text>
          <Text style={styles.lastUpdated}>
            Updated: {category.lastUpdated}
          </Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const renderSettingItem = (setting: BusinessSetting) => {
    const isEditing = editingSettingId === setting.id;
    
    return (
      <View key={setting.id} style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingName}>{setting.name}</Text>
          {setting.required && (
            <Text style={styles.requiredLabel}>Required</Text>
          )}
        </View>
        
        <Text style={styles.settingDescription}>{setting.description}</Text>
        
        <View style={styles.settingValue}>
          {isEditing ? (
            <View style={styles.editingContainer}>
              {setting.type === 'boolean' ? (
                <Switch
                  value={tempValue}
                  onValueChange={setTempValue}
                />
              ) : setting.type === 'select' ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {setting._options?.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        tempValue === option && styles.selectedOption
                      ]}
                      onPress={() => setTempValue(option)}
                    >
                      <Text style={[
                        styles.optionText,
                        tempValue === option && styles.selectedOptionText
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <TextInput
                  style={styles.settingInput}
                  value={tempValue.toString()}
                  onChangeText={setTempValue}
                  keyboardType={setting.type === 'number' ? 'numeric' : 'default'}
                  placeholder={`Enter ${setting.name.toLowerCase()}`}
                />
              )}
              
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => {
                    setEditingSettingId(null);
                    setTempValue('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.editButton, styles.saveButton]}
                  onPress={() => saveSetting(setting)}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.displayContainer}>
              <Text style={styles.currentValue}>
                {setting.type === 'boolean' 
                  ? (setting.value ? 'Enabled' : 'Disabled')
                  : setting.value.toString()
                }
              </Text>
              
              <TouchableOpacity
                style={styles.editIconButton}
                onPress={() => {
                  setEditingSettingId(setting.id);
                  setTempValue(setting.value);
                }}
              >
                <Ionicons name="pencil" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (selectedCategory) {
    return (
      <View style={styles.container}>
        {/* Category Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setSelectedCategory(null)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{selectedCategory.name}</Text>
            <Text style={styles.headerSubtitle}>
              {settings.length} settings
            </Text>
          </View>
        </View>
        
        {/* Settings List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            settings.map(renderSettingItem)
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Business Settings</Text>
          <Text style={styles.headerSubtitle}>
            {categories.length} categories
          </Text>
        </View>
      </View>
      
      {/* Categories List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          categories.map(renderCategoryCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settingsCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
  },
  settingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  requiredLabel: {
    fontSize: 11,
    color: '#FF6B6B',
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  settingValue: {
    minHeight: 40,
  },
  editingContainer: {
    gap: 12,
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editIconButton: {
    padding: 8,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFF',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default BusinessSettingsScreen;