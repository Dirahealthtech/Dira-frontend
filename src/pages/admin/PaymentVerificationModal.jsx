import React, { useState } from 'react';
import { X, CreditCard, Phone, Package, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const PaymentVerificationModal = ({ orderId, orderData, onClose, onVerify }) => {
  const [formData, setFormData] = useState({
    payment_method: orderData?.payment_method || 'cash_on_delivery',
    amount_collected: orderData?.total || 0,
    payment_reference: '',
    verification_notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: Package },
    { value: 'mpesa', label: 'M-Pesa', icon: Phone },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: DollarSign },
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount_collected' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
    }
    
    if (!formData.amount_collected || formData.amount_collected <= 0) {
      newErrors.amount_collected = 'Amount collected must be greater than 0';
    }
    
    if (formData.amount_collected !== orderData?.total) {
      newErrors.amount_collected = `Amount should match order total: ${formatPrice(orderData?.total)}`;
    }
    
    if (!formData.payment_reference.trim()) {
      newErrors.payment_reference = 'Payment reference is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onVerify({
        payment_method: formData.payment_method,
        amount_collected: formData.amount_collected,
        payment_reference: formData.payment_reference,
        verification_notes: formData.verification_notes
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      setErrors({ submit: 'Failed to verify payment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = paymentMethods.find(method => method.value === formData.payment_method);
  const MethodIcon = selectedMethod?.icon || CreditCard;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-green-600" />
            Verify Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span className="font-medium">#{orderData?.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium text-green-600">{formatPrice(orderData?.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Payment Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  orderData?.payment_status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {orderData?.payment_status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.payment_method ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              {errors.payment_method && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
              )}
            </div>

            {/* Amount Collected */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Collected (KES) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="amount_collected"
                  value={formData.amount_collected}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 pl-8 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount_collected ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.amount_collected && (
                <p className="mt-1 text-sm text-red-600">{errors.amount_collected}</p>
              )}
              {formData.amount_collected === orderData?.total && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Amount matches order total
                </p>
              )}
            </div>

            {/* Payment Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference / Receipt Number *
              </label>
              <input
                type="text"
                name="payment_reference"
                value={formData.payment_reference}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.payment_reference ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={
                  formData.payment_method === 'mpesa' ? 'M-Pesa transaction code' :
                  formData.payment_method === 'bank_transfer' ? 'Bank reference number' :
                  formData.payment_method === 'credit_card' ? 'Card transaction ID' :
                  'Receipt or reference number'
                }
              />
              {errors.payment_reference && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_reference}</p>
              )}
            </div>

            {/* Verification Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Verification Notes (Optional)
              </label>
              <textarea
                name="verification_notes"
                value={formData.verification_notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes about the payment verification..."
              />
            </div>
          </div>

          {/* Payment Method Specific Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <MethodIcon className="w-5 h-5 mr-2 text-gray-600" />
              <h4 className="font-medium text-gray-900">{selectedMethod?.label} Verification</h4>
            </div>
            <div className="text-sm text-gray-600">
              {formData.payment_method === 'cash_on_delivery' && (
                <div>
                  <p>• Confirm cash was collected from customer</p>
                  <p>• Verify amount matches order total exactly</p>
                  <p>• Provide receipt number or delivery confirmation</p>
                </div>
              )}
              {formData.payment_method === 'mpesa' && (
                <div>
                  <p>• Enter the M-Pesa transaction code</p>
                  <p>• Verify payment in your M-Pesa statement</p>
                  <p>• Check sender phone number matches customer</p>
                </div>
              )}
              {formData.payment_method === 'bank_transfer' && (
                <div>
                  <p>• Provide bank reference number</p>
                  <p>• Confirm transfer appears in bank account</p>
                  <p>• Verify sender details match customer information</p>
                </div>
              )}
              {formData.payment_method === 'credit_card' && (
                <div>
                  <p>• Enter credit card transaction ID</p>
                  <p>• Confirm payment was processed successfully</p>
                  <p>• Verify card details match customer information</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-600">{errors.submit}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentVerificationModal;