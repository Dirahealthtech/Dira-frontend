import React, { useState } from 'react';
import { X, CheckCircle, Package, CreditCard, AlertTriangle, FileText } from 'lucide-react';

const OrderCompleteModal = ({ orderId, orderData, onClose, onComplete }) => {
  const [confirmations, setConfirmations] = useState({
    delivery_confirmation: true,
    payment_collected: orderData?.payment_method === 'cash_on_delivery'
  });
  const [completionNotes, setCompletionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleConfirmationChange = (key, value) => {
    setConfirmations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onComplete(
        confirmations.delivery_confirmation,
        confirmations.payment_collected,
        completionNotes
      );
    } catch (error) {
      console.error('Error completing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const canComplete = confirmations.delivery_confirmation && 
    (orderData?.payment_method !== 'cash_on_delivery' || confirmations.payment_collected);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Complete Order
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
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Order Summary
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span className="font-medium">#{orderData?.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">{formatPrice(orderData?.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium capitalize">{orderData?.payment_method?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Status:</span>
                <span className="font-medium capitalize">{orderData?.status}</span>
              </div>
            </div>
          </div>

          {/* Completion Confirmations */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-gray-900">Completion Confirmations</h3>
            
            {/* Delivery Confirmation */}
            <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                id="delivery_confirmation"
                checked={confirmations.delivery_confirmation}
                onChange={(e) => handleConfirmationChange('delivery_confirmation', e.target.checked)}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <label htmlFor="delivery_confirmation" className="text-sm font-medium text-gray-900">
                  Delivery Confirmation
                </label>
                <p className="text-sm text-gray-600">
                  Confirm that the order has been successfully delivered to the customer
                </p>
              </div>
              <Package className="w-5 h-5 text-green-500" />
            </div>

            {/* Payment Collection (for COD orders) */}
            {orderData?.payment_method === 'cash_on_delivery' && (
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="payment_collected"
                  checked={confirmations.payment_collected}
                  onChange={(e) => handleConfirmationChange('payment_collected', e.target.checked)}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="payment_collected" className="text-sm font-medium text-gray-900">
                    Cash Payment Collected
                  </label>
                  <p className="text-sm text-gray-600">
                    Confirm that cash payment of {formatPrice(orderData?.total)} has been collected from the customer
                  </p>
                </div>
                <CreditCard className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>

          {/* Warning Messages */}
          {!canComplete && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Cannot complete order</p>
                <p>Please confirm all required items before completing the order.</p>
              </div>
            </div>
          )}

          {/* Completion Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Completion Notes (Optional)
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add any final notes about the order completion..."
            />
          </div>

          {/* What Happens Next */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Order status will be updated to "Delivered"</li>
              {orderData?.payment_method === 'cash_on_delivery' && confirmations.payment_collected && (
                <li>• Payment status will be marked as "Completed"</li>
              )}
              <li>• Customer will receive completion confirmation email</li>
              <li>• Order will be marked as fulfilled in the system</li>
              <li>• Financial records will be updated accordingly</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canComplete || loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderCompleteModal;