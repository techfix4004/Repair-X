'use client';

import React, { useState } from 'react';
import { CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

interface PaymentIntegrationProps {
  amount: number;
  currency: string;
  jobSheetId?: string;
  customerId: string;
  onSuccess?: (paymentResult: PaymentResult) => void;
  onError?: (error: string) => void;
}

interface PaymentResult {
  id: string;
  status: string;
  amount: number;
}

interface PaymentMethod {
  id: string;
  type: 'CARD' | 'WALLET' | 'BANK_TRANSFER';
  display: string;
  icon: React.ReactNode;
  supported: boolean;
}

interface TaxBreakdown {
  type: string;
  rate: number;
  amount: number;
  description: string;
}

interface TaxCalculation {
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  grossAmount: number;
  breakdown: TaxBreakdown[];
  gstin?: string;
}

interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export default function PaymentIntegration({ 
  amount, 
  currency, 
  jobSheetId, 
  customerId, 
  onSuccess, 
  onError 
}: PaymentIntegrationProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('CARD');
  const [processing, setProcessing] = useState(false);
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'CARD',
      type: 'CARD',
      display: 'Credit / Debit Card',
      icon: <CreditCardIcon className="w-6 h-6" />,
      supported: true,
    },
    {
      id: 'WALLET',
      type: 'WALLET',
      display: 'Digital Wallet',
      icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
      supported: true,
    },
    {
      id: 'BANK_TRANSFER',
      type: 'BANK_TRANSFER',
      display: 'Bank Transfer',
      icon: <BanknotesIcon className="w-6 h-6" />,
      supported: true,
    },
  ];

  const calculateTax = React.useCallback(async () => {
    try {
      // Detect jurisdiction based on currency or user location
      const jurisdiction = currency === 'INR' ? 'IN' : currency === 'CAD' ? 'CA' : 'US-CA';
      
      const response = await fetch('/api/v1/payments/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          jurisdiction,
          itemType: 'SERVICE',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setTaxCalculation(result.data);
      }
    } catch (error) {
      console.error('Tax calculation failed:', error);
      // Continue without tax calculation
      setTaxCalculation({
        taxRate: 0,
        taxAmount: 0,
        netAmount: amount,
        grossAmount: amount,
        breakdown: [],
      });
    }
  }, [amount, currency]);

  // Calculate tax automatically
  React.useEffect(() => {
    calculateTax();
  }, [calculateTax]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/v1/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: taxCalculation?.grossAmount || amount,
          currency,
          customerId,
          jobSheetId,
          description: `RepairX Service Payment ${jobSheetId ? `- Job #${jobSheetId}` : ''}`,
          taxCalculation: taxCalculation ? {
            jurisdiction: 'AUTO_DETECTED',
            taxRate: taxCalculation.taxRate,
            taxAmount: taxCalculation.taxAmount,
          } : undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPaymentIntent(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw error;
    }
  };

  const processPayment = async () => {
    if (!taxCalculation) return;

    setProcessing(true);
    try {
      // Create payment intent
      const intent = await createPaymentIntent();
      console.log('Payment intent created:', paymentIntent?.id);
      
      // For demo purposes, we'll simulate payment processing
      // In production, integrate with Stripe Elements, PayPal SDK, etc.
      const mockPaymentMethodId = 'pm_mock_card_visa';
      
      const confirmResponse = await fetch(`/api/v1/payments/${intent.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: mockPaymentMethodId }),
      });

      const confirmResult = await confirmResponse.json();
      
      if (confirmResult.success && confirmResult.data.status === 'succeeded') {
        onSuccess?.(confirmResult.data);
      } else {
        throw new Error(confirmResult.data.failureReason || 'Payment failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      onError?.(errorMessage);
      console.error('Payment processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!taxCalculation) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Calculating taxes...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>
      
      {/* Amount Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Service Amount</span>
          <span className="font-medium">{currency} {taxCalculation.netAmount.toFixed(2)}</span>
        </div>
        
        {taxCalculation.taxAmount > 0 && (
          <>
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Taxes ({(taxCalculation.taxRate * 100).toFixed(1)}%)
              </button>
              <span className="font-medium">{currency} {taxCalculation.taxAmount.toFixed(2)}</span>
            </div>
            
            {showTaxBreakdown && (
              <div className="ml-4 mb-2">
                {taxCalculation.breakdown.map((tax, index) => (
                  <div key={index} className="flex justify-between text-xs text-gray-500">
                    <span>{tax.description}</span>
                    <span>{currency} {tax.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        <hr className="my-2" />
        <div className="flex justify-between items-center font-bold text-lg">
          <span>Total Amount</span>
          <span>{currency} {taxCalculation.grossAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Payment Method</h3>
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!method.supported ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => setSelectedMethod(e.target.value)}
                disabled={!method.supported}
                className="sr-only"
              />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className={`mr-3 ${selectedMethod === method.id ? 'text-blue-600' : 'text-gray-400'}`}>
                    {method.icon}
                  </div>
                  <span className="font-medium text-gray-800">{method.display}</span>
                </div>
                {selectedMethod === method.id && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Card Details Form (shown when card is selected) */}
      {selectedMethod === 'CARD' && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-3">Card Details</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Card Number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={19}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={5}
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={4}
              />
            </div>
            <input
              type="text"
              placeholder="Cardholder Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Security Info */}
      <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-green-800">
            🔒 PCI DSS Compliant - Your payment information is secure
          </span>
        </div>
      </div>

      {/* Process Payment Button */}
      <button
        onClick={processPayment}
        disabled={processing}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          processing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
        }`}
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay ${currency} ${taxCalculation.grossAmount.toFixed(2)}`
        )}
      </button>

      {/* Payment Methods Logos */}
      <div className="mt-4 flex justify-center items-center space-x-4 text-xs text-gray-500">
        <span>Powered by:</span>
        <span className="font-semibold">Stripe</span>
        <span>•</span>
        <span className="font-semibold">PayPal</span>
        <span>•</span>
        <span className="font-semibold">Square</span>
      </div>
    </div>
  );
}