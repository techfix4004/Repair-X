/**
 * Complete Business Management Frontend Interface
 * 
 * This component integrates with the 20+ business settings categories
 * backend system to provide a comprehensive enterprise-grade UI for
 * business configuration and management.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save,
  Check,
  AlertTriangle,
  Loader,
  Download
} from 'lucide-react';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  implementation: 'COMPLETE' | 'PARTIAL' | 'PLANNED';
  features: string[];
  schema: unknown;
  defaultConfig: Record<string, unknown>;
}

interface BusinessManagementProps {
  tenantId?: string;
}

export function BusinessManagementSystem({ tenantId = 'default' }: BusinessManagementProps) {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [categorySettings, setCategorySettings] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const loadCategorySettings = useCallback(async (categoryId: string) => {
    try {
      const response = await fetch(`/api/v1/business-management/categories/${categoryId}`);
      const result = await response.json();
      
      if (result.success) {
        setCategorySettings(result.data.defaultConfig || {});
      }
    } catch (error) {
      console.error('Failed to load category settings:', error);
    }
  }, []);

  const loadBusinessCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/business-management/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
        if (result.data.length > 0) {
          setSelectedCategory(result.data[0]);
          loadCategorySettings(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load business categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadCategorySettings]);

  useEffect(() => {
    loadBusinessCategories();
  }, [loadBusinessCategories]);

  const saveCategorySettings = async () => {
    if (!selectedCategory) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/v1/business-management/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categorySettings),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const exportSettings = async () => {
    try {
      const response = await fetch(`/api/v1/business-management/export/${tenantId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repairx-settings-${tenantId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading Business Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Management System</h1>
              <p className="text-gray-600 mt-1">Configure 20+ comprehensive business categories</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportSettings}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Settings
              </button>
              
              <button
                onClick={saveCategorySettings}
                disabled={isSaving || !selectedCategory}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Complete Business Management System
          </h2>
          <p className="text-gray-600 mt-2">
            20+ comprehensive business categories with enterprise-grade configuration
          </p>
          <div className="mt-4 flex justify-center">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
              {categories.length} Categories Available
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded border mt-1 ${
                      category.implementation === 'COMPLETE' ? 'text-green-600 bg-green-50 border-green-200' :
                      category.implementation === 'PARTIAL' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                      'text-blue-600 bg-blue-50 border-blue-200'
                    }`}>
                      {category.implementation}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${
                  category.priority === 'HIGH' ? 'text-red-600 bg-red-50 border-red-200' :
                  category.priority === 'MEDIUM' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                  'text-green-600 bg-green-50 border-green-200'
                }`}>
                  {category.priority}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mt-3 mb-4">{category.description}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {category.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {category.features.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                      +{category.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {category.implementation === 'COMPLETE' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-green-800 text-sm font-semibold">Ready for Production</span>
                  </div>
                  <p className="text-green-700 text-xs mt-1">
                    All features implemented and tested
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-yellow-800 text-sm font-semibold">In Development</span>
                  </div>
                  <p className="text-yellow-700 text-xs mt-1">
                    Category is {category.implementation.toLowerCase()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg ${
            saveStatus === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
            'bg-red-100 text-red-800 border border-red-300'
          }`}>
            <div className="flex items-center">
              {saveStatus === 'success' ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Settings saved successfully!
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Failed to save settings. Please try again.
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}