/**
 * Customer Onboarding Component
 * 
 * Provides a comprehensive onboarding experience with:
 * - Step-by-step guided setup
 * - Progress tracking
 * - Automated assistance
 * - Personalized experience
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Settings, 
  CreditCard, 
  Smartphone,
  CheckCircle,
  Clock,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Heart
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  estimatedTime: number;
  completed: boolean;
}

interface OnboardingProgress {
  currentStep: string;
  completedSteps: string[];
  completionPercentage: number;
  estimatedCompletion: string;
}

const CustomerOnboarding: React.FC<{ userId?: string }> = ({ userId }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentStep: 'account_creation',
    completedSteps: [],
    completionPercentage: 0,
    estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    communicationChannels: ['email'],
    serviceCategories: [] as string[],
    paymentMethod: '',
  });

  const onboardingSteps: OnboardingStep[] = useMemo(() => [
    {
      id: 'account_creation',
      title: 'Welcome to RepairX',
      description: 'Let\'s create your account and get started',
      icon: <User className="w-6 h-6" />,
      required: true,
      estimatedTime: 3,
      completed: progress.completedSteps.includes('account_creation'),
    },
    {
      id: 'profile_completion',
      title: 'Complete Your Profile',
      description: 'Help us personalize your experience',
      icon: <Mail className="w-6 h-6" />,
      required: true,
      estimatedTime: 5,
      completed: progress.completedSteps.includes('profile_completion'),
    },
    {
      id: 'service_preferences',
      title: 'Service Preferences',
      description: 'Choose your preferred services and availability',
      icon: <Settings className="w-6 h-6" />,
      required: false,
      estimatedTime: 3,
      completed: progress.completedSteps.includes('service_preferences'),
    },
    {
      id: 'payment_setup',
      title: 'Payment Method',
      description: 'Add a secure payment method',
      icon: <CreditCard className="w-6 h-6" />,
      required: false,
      estimatedTime: 4,
      completed: progress.completedSteps.includes('payment_setup'),
    },
    {
      id: 'mobile_app_setup',
      title: 'Get the Mobile App',
      description: 'Download our app for the best experience',
      icon: <Smartphone className="w-6 h-6" />,
      required: false,
      estimatedTime: 8,
      completed: progress.completedSteps.includes('mobile_app_setup'),
    },
    {
      id: 'first_booking_tutorial',
      title: 'Ready to Book!',
      description: 'Learn how to book your first service',
      icon: <Star className="w-6 h-6" />,
      required: false,
      estimatedTime: 7,
      completed: progress.completedSteps.includes('first_booking_tutorial'),
    },
  ], [progress.completedSteps]);

  const currentStep = onboardingSteps[currentStepIndex];

  const loadOnboardingProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/onboarding/${userId}/status`);
      const data = await response.json();
      
      if (data.success) {
        setProgress(data.progress);
        const stepIndex = onboardingSteps.findIndex(s => s.id === data.progress.currentStep);
        if (stepIndex !== -1) {
          setCurrentStepIndex(stepIndex);
        }
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
  }, [userId, onboardingSteps]);

  useEffect(() => {
    // Load progress if userId provided
    if (userId) {
      loadOnboardingProgress();
    }
  }, [userId, loadOnboardingProgress]);

  const completeStep = async (stepId: string) => {
    try {
      const response = await fetch(`/api/v1/onboarding/${userId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepId,
          completed: true,
          data: formData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setProgress(data.progress);
        if (currentStepIndex < onboardingSteps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        }
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleNext = () => {
    completeStep(currentStep.id);
  };

  const handleSkip = () => {
    if (currentStepIndex < onboardingSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'account_creation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to RepairX! 🎉
              </h3>
              <p className="text-gray-600">
                Your trusted repair service platform. Let&apos;s get your account set up.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        );

      case 'profile_completion':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Profile
              </h3>
              <p className="text-gray-600">
                This helps us provide better service recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => setFormData({
                    ...formData, 
                    address: {...formData.address, street: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData, 
                      address: {...formData.address, city: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData, 
                      address: {...formData.address, state: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({
                      ...formData, 
                      address: {...formData.address, zipCode: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ZIP"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'service_preferences':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Service Preferences
              </h3>
              <p className="text-gray-600">
                Select the services you&apos;re most interested in.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'electronics', title: 'Electronics Repair', icon: '📱', desc: 'Phone, laptop, tablet repairs' },
                { id: 'appliances', title: 'Home Appliances', icon: '🏠', desc: 'Washing machine, fridge, etc.' },
                { id: 'automotive', title: 'Automotive Service', icon: '🚗', desc: 'Car maintenance and repairs' },
                { id: 'maintenance', title: 'Home Maintenance', icon: '🔧', desc: 'Plumbing, electrical, etc.' },
              ].map((service) => (
                <div
                  key={service.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.serviceCategories.includes(service.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => {
                    const updatedCategories = formData.serviceCategories.includes(service.id)
                      ? formData.serviceCategories.filter(cat => cat !== service.id)
                      : [...formData.serviceCategories, service.id];
                    setFormData({...formData, serviceCategories: updatedCategories});
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{service.title}</h4>
                      <p className="text-sm text-gray-600">{service.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'payment_setup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Secure Payment Setup
              </h3>
              <p className="text-gray-600">
                Add a payment method for quick and secure transactions.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  Your payment information is encrypted and secure
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'card', title: 'Credit/Debit Card', icon: '💳', desc: 'Visa, MasterCard, Amex' },
                { id: 'paypal', title: 'PayPal', icon: '🅿️', desc: 'Pay with your PayPal account' },
                { id: 'applepay', title: 'Apple Pay', icon: '📱', desc: 'Quick checkout with Apple Pay' },
              ].map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setFormData({...formData, paymentMethod: method.id})}
                >
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">{method.icon}</span>
                    <h4 className="font-medium text-gray-900">{method.title}</h4>
                    <p className="text-sm text-gray-600">{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'mobile_app_setup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Get the RepairX Mobile App
              </h3>
              <p className="text-gray-600">
                Track your repairs, communicate with technicians, and more.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <div className="text-center space-y-4">
                <Smartphone className="w-16 h-16 text-blue-600 mx-auto" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Real-time tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Direct communication</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Secure payments</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    📱 Download for iOS
                  </button>
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    🤖 Download for Android
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'first_booking_tutorial':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You&apos;re All Set! 🎉
              </h3>
              <p className="text-gray-600">
                Ready to book your first repair service? Here&apos;s how it works.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Book Service', desc: 'Choose your service and schedule' },
                { step: '2', title: 'Get Matched', desc: 'We find the perfect technician' },
                { step: '3', title: 'Get Fixed', desc: 'Professional repair at your location' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Book Your First Service
              </button>
            </div>
          </div>
        );

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Account Setup</h2>
            <span className="text-sm text-gray-500">
              {Math.round(progress.completionPercentage)}% Complete
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : index === currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="text-xs text-center font-medium hidden sm:block">
                  {step.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            {currentStep.icon}
            <div>
              <h3 className="text-lg font-medium text-gray-900">{currentStep.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{currentStep.description}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentStep.estimatedTime} min</span>
                </div>
              </div>
            </div>
          </div>

          {renderStepContent()}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            <div className="flex space-x-3">
              {!currentStep.required && (
                <button
                  onClick={handleSkip}
                  className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
                >
                  Skip for now
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>
                  {currentStepIndex === onboardingSteps.length - 1 ? 'Complete' : 'Continue'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@repairx.com" className="text-blue-600 hover:underline">
              support@repairx.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerOnboarding;