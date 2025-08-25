'use client'

import { useState } from 'react'
import { DeviceFormData, DeviceCondition } from '@/types/device'

interface DeviceRegistrationFormProps {
  onSubmit: (data: DeviceFormData) => void
  isLoading?: boolean
}

export default function DeviceRegistrationForm({ onSubmit, isLoading }: DeviceRegistrationFormProps) {
  const [formData, setFormData] = useState<DeviceFormData>({
    brand: '',
    model: '',
    serialNumber: '',
    yearManufactured: new Date().getFullYear(),
    category: '',
    subcategory: '',
    color: '',
    condition: 'FAIR' as DeviceCondition,
    specifications: {},
    purchaseDate: '',
    warrantyExpiry: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const deviceCategories = [
    {
      category: 'Electronics',
      subcategories: ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'TV', 'Gaming Console']
    },
    {
      category: 'Appliances', 
      subcategories: ['Refrigerator', 'Washing Machine', 'Dryer', 'Dishwasher', 'Microwave', 'Oven']
    },
    {
      category: 'Automotive',
      subcategories: ['Car', 'Motorcycle', 'Truck', 'SUV']
    },
    {
      category: 'Home & Garden',
      subcategories: ['HVAC', 'Plumbing', 'Electrical', 'Landscaping']
    }
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.brand.trim()) newErrors.brand = 'Brand is required'
    if (!formData.model.trim()) newErrors.model = 'Model is required'  
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.condition) newErrors.condition = 'Condition is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof DeviceFormData, value: string | number | DeviceCondition) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }

  const selectedCategory = deviceCategories.find(cat => cat.category === formData.category)

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Device Registration</h2>
      <p className="text-gray-600 mb-6">
        Register your device to create a repair job sheet. Brand and model are required for accurate service matching.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand & Model - Required Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.brand ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Apple, Samsung, Dell"
            />
            {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.model ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., iPhone 14, Galaxy S23, XPS 13"
            />
            {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
          </div>
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                handleInputChange('category', e.target.value)
                handleInputChange('subcategory', '') // Reset subcategory
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              {deviceCategories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <select
              value={formData.subcategory}
              onChange={(e) => handleInputChange('subcategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedCategory}
            >
              <option value="">Select Subcategory</option>
              {selectedCategory?.subcategories.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Serial Number & Condition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serial Number
            </label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Device serial number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.condition}
              onChange={(e) => handleInputChange('condition', e.target.value as DeviceCondition)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.condition ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
              <option value="DAMAGED">Damaged</option>
            </select>
            {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Manufactured
            </label>
            <input
              type="number"
              value={formData.yearManufactured}
              onChange={(e) => handleInputChange('yearManufactured', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warranty Expiry
            </label>
            <input
              type="date"
              value={formData.warrantyExpiry}
              onChange={(e) => handleInputChange('warrantyExpiry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Device color"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Registering Device...
              </div>
            ) : (
              'Register Device'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Why do we need brand and model?</h3>
        <p className="text-sm text-blue-700">
          Brand and model information helps us match you with the right technician who specializes in your device type, 
          ensuring accurate diagnosis and repair estimates for your job sheet.
        </p>
      </div>
    </div>
  )
}