'use client';

import React, { useState } from 'react';

const serviceCategories = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '📱',
    services: ['Smartphone Repair', 'Laptop Repair', 'Tablet Repair', 'Gaming Console Repair']
  },
  {
    id: 'appliances', 
    name: 'Appliances',
    icon: '🏠',
    services: ['Washing Machine', 'Refrigerator', 'Dishwasher', 'HVAC System']
  },
  {
    id: 'automotive',
    name: 'Automotive', 
    icon: '🚗',
    services: ['Oil Change', 'Brake Service', 'Battery Replacement', 'Diagnostic Check']
  },
  {
    id: 'home',
    name: 'Home Maintenance',
    icon: '🔧',
    services: ['Plumbing', 'Electrical', 'Carpentry', 'Painting']
  }
];

export function ServiceBooking() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', {
      category: selectedCategory,
      service: selectedService,
      location,
      date,
      description
    });
    // TODO: Send booking request to backend API
    alert('Service booking request submitted successfully!');
  };

  const selectedCategoryData = serviceCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-text-dark mb-6">Book a Repair Service</h2>
      
      <form onSubmit={handleBooking} className="space-y-6">
        {/* Service Category Selection */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Select Service Category
          </label>
          <div className="grid grid-cols-2 gap-3">
            {serviceCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedService(''); // Reset service selection
                }}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  selectedCategory === category.id
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium text-text-dark">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Specific Service Selection */}
        {selectedCategory && (
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Select Specific Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Choose a service...</option>
              {selectedCategoryData?.services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Location Input */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-text-dark mb-2">
            Service Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your address or zip code"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Preferred Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-text-dark mb-2">
            Preferred Date & Time
          </label>
          <input
            type="datetime-local"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-dark mb-2">
            Problem Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Please describe the issue you're experiencing..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedCategory || !selectedService}
          className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Book Service
        </button>
      </form>
    </div>
  );
}