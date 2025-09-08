import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  ArrowLeft, 
  CreditCard, 
  Phone, 
  MapPin, 
  User, 
  Mail, 
  Package, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight,
  Clock,
  Smartphone,
  Copy,
  RefreshCw,
  XCircle,
  Info
} from 'lucide-react';
import { useCart } from './CartContext.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import api from '../../auth/api';

const Checkout = () => {
  const { cart, itemCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [transactionId, setTransactionId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  
  // STK Push states
  const [stkPushSent, setStkPushSent] = useState(false);
  const [stkPushFailed, setStkPushFailed] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [showPaybillFallback, setShowPaybillFallback] = useState(false);
  
  // Paybill information
  const [paybillInfo] = useState({
    businessNumber: '174379',
    businessName: 'Dira Healthcare',
    accountNumber: '' // Will be set to order number
  });
  
  // Manual payment confirmation
  const [manualPaymentRef, setManualPaymentRef] = useState('');
  const [isConfirmingManualPayment, setIsConfirmingManualPayment] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Redirect if not authenticated or cart is empty
    if (!isAuthenticated || !cart?.items || cart.items.length === 0) {
      window.location.href = '/cart';
    }
  }, [isAuthenticated, cart]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatPhoneNumber = (phone) => {
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    } else if (formatted.startsWith('7') || formatted.startsWith('1')) {
      formatted = '254' + formatted;
    }
    return formatted;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!shippingInfo.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!shippingInfo.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!shippingInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!shippingInfo.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!shippingInfo.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (paymentMethod === 'mpesa' && !mpesaPhone.trim()) {
      newErrors.mpesaPhone = 'M-Pesa phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const createOrder = async () => {
    try {
      const addressData = {
        first_name: shippingInfo.firstName,
        last_name: shippingInfo.lastName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        postal_code: shippingInfo.postalCode
      };

      const orderData = {
        shipping_address: addressData,
        billing_address: addressData, // Use same address for billing
        payment_method: paymentMethod,
        notes: `Order from ${shippingInfo.firstName} ${shippingInfo.lastName}`
      };

      const response = await api.post('/api/v1/orders/', orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create order');
    }
  };

  const initiateMpesaPayment = async (orderId) => {
    try {
      const paymentData = {
        order_id: orderId,
        payment_method: 'mpesa',
        phone_number: mpesaPhone,
        amount: cart.total
      };

      const response = await api.post('/api/v1/payments/mpesa/order-payment', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to initiate M-Pesa payment');
    }
  };

  const checkPaymentStatus = async (checkoutRequestId) => {
    try {
      const response = await api.get(`/api/v1/payments/mpesa/status/${checkoutRequestId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  };

  const pollPaymentStatus = async (checkoutRequestId, maxAttempts = 24) => {
    const pollInterval = 5000; // 5 seconds
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      setPollAttempts(attempt + 1);
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusData = await checkPaymentStatus(checkoutRequestId);
      
      if (statusData?.status === 'SUCCESS') {
        setPaymentStatus('success');
        addNotification('Payment completed successfully!', 'success');
        return true;
      } else if (statusData?.status === 'FAILED') {
        setPaymentStatus('failed');
        setStkPushFailed(true);
        addNotification('STK Push failed. You can use the manual payment option below.', 'warning');
        setShowPaybillFallback(true);
        return false;
      } else if (statusData?.status === 'CANCELLED') {
        setPaymentStatus('failed');
        setStkPushFailed(true);
        addNotification('Payment was cancelled. You can use the manual payment option below.', 'warning');
        setShowPaybillFallback(true);
        return false;
      }
    }
    
    // Timeout - show fallback option
    setPaymentStatus('timeout');
    setStkPushFailed(true);
    addNotification('STK Push timed out. Please use the manual payment option below.', 'warning');
    setShowPaybillFallback(true);
    return false;
  };

  const handleRetrySTKPush = async () => {
    if (!orderDetails) return;
    
    setIsProcessing(true);
    setStkPushFailed(false);
    setShowPaybillFallback(false);
    setPollAttempts(0);
    
    try {
      const paymentResponse = await initiateMpesaPayment(orderDetails.id);
      
      if (paymentResponse.success) {
        setTransactionId(paymentResponse.transaction_id);
        setCheckoutRequestId(paymentResponse.checkout_request_id);
        setStkPushSent(true);
        setPaymentStatus('processing');
        
        addNotification('New STK Push sent! Please check your phone.', 'info');
        
        const paymentSuccess = await pollPaymentStatus(paymentResponse.checkout_request_id);
        
        if (paymentSuccess) {
          await clearCart();
        }
      } else {
        setStkPushFailed(true);
        setShowPaybillFallback(true);
        addNotification(paymentResponse.message || 'STK Push failed', 'error');
      }
    } catch (error) {
      setStkPushFailed(true);
      setShowPaybillFallback(true);
      addNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualPaymentConfirmation = async () => {
    if (!manualPaymentRef.trim()) {
      addNotification('Please enter the M-Pesa reference number', 'error');
      return;
    }

    setIsConfirmingManualPayment(true);
    
    try {
      // Submit manual payment confirmation
      const confirmationData = {
        order_id: orderDetails.id,
        mpesa_reference: manualPaymentRef,
        amount: cart.total,
        payment_method: 'mpesa_manual'
      };

      await api.post('/api/v1/payments/manual-confirmation', confirmationData);
      
      setPaymentStatus('success');
      addNotification('Payment confirmation submitted! We will verify and update your order status.', 'success');
      await clearCart();
      
    } catch (error) {
      addNotification('Failed to submit payment confirmation. Please try again.', 'error');
    } finally {
      setIsConfirmingManualPayment(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      addNotification('Copied to clipboard!', 'success');
    });
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      addNotification('Please fix the form errors', 'error');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create order first
      const order = await createOrder();
      setOrderDetails(order);
      setOrderPlaced(true);
      
      // Set account number for paybill
      paybillInfo.accountNumber = order.order_number || order.id.toString();

      if (paymentMethod === 'mpesa') {
        setPaymentStatus('processing');
        
        // Initiate M-Pesa payment
        const paymentResponse = await initiateMpesaPayment(order.id);
        
        if (paymentResponse.success) {
          setTransactionId(paymentResponse.transaction_id);
          setCheckoutRequestId(paymentResponse.checkout_request_id);
          setStkPushSent(true);
          
          addNotification('STK Push sent! Please check your phone to complete payment.', 'info');
          
          // Start polling payment status
          const paymentSuccess = await pollPaymentStatus(paymentResponse.checkout_request_id);
          
          if (paymentSuccess) {
            await clearCart();
          }
        } else {
          setStkPushFailed(true);
          setShowPaybillFallback(true);
          setPaymentStatus('failed');
          addNotification(paymentResponse.message || 'STK Push failed. Please use manual payment option.', 'error');
        }
      } else {
        setPaymentStatus('success');
        addNotification('Order placed successfully!', 'success');
        await clearCart();
      }
      
    } catch (error) {
      console.error('Order creation error:', error);
      addNotification(error.message, 'error');
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Notification component
  const NotificationItem = ({ notification, onRemove }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      notification.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
      notification.type === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
      notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
      'bg-blue-50 border-blue-400 text-blue-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm">{notification.message}</p>
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // Show success page after successful order
  if (orderPlaced && paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
            
            {orderDetails && (
              <div className="bg-white rounded-2xl shadow-sm p-6 max-w-md mx-auto mb-8">
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{orderDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-green-600">{formatPrice(orderDetails.total_amount || cart.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-blue-600">Confirmed</span>
                  </div>
                  {transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction:</span>
                      <span className="font-medium">#{transactionId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-x-4">
              <a
                href="/orders"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>View Orders</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>Continue Shopping</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !cart?.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            </div>
            <a
              href="/cart"
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cart</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="07xxxxxxxx or +254xxxxxxxxx"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full address"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Payment Method
              </h2>

              <div className="space-y-4">
                {/* M-Pesa Option */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'mpesa' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setPaymentMethod('mpesa')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="mpesa"
                      checked={paymentMethod === 'mpesa'}
                      onChange={() => setPaymentMethod('mpesa')}
                      className="text-blue-600"
                    />
                    <Smartphone className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">M-Pesa</div>
                      <div className="text-sm text-gray-500">Pay with M-Pesa mobile money</div>
                    </div>
                  </div>

                  {paymentMethod === 'mpesa' && (
                    <div className="mt-4 pl-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        M-Pesa Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={mpesaPhone}
                        onChange={(e) => {
                          setMpesaPhone(e.target.value);
                          if (errors.mpesaPhone) {
                            setErrors(prev => ({ ...prev, mpesaPhone: '' }));
                          }
                        }}
                        className={`w-full max-w-xs px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.mpesaPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="07xxxxxxxx or +254xxxxxxxxx"
                      />
                      {errors.mpesaPhone && (
                        <p className="text-red-600 text-sm mt-1">{errors.mpesaPhone}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        You'll receive an STK push notification to complete payment
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Processing Status */}
            {orderPlaced && paymentStatus === 'processing' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
                  <p className="text-gray-600 mb-4">
                    {stkPushSent 
                      ? `Please check your phone and enter your M-Pesa PIN to complete the payment. (Attempt ${pollAttempts}/24)`
                      : 'Initiating M-Pesa payment...'
                    }
                  </p>
                  
                  {orderDetails && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Order ID:</strong> #{orderDetails.id}<br/>
                        <strong>Amount:</strong> {formatPrice(cart.total)}<br/>
                        <strong>Phone:</strong> {mpesaPhone}
                      </p>
                    </div>
                  )}

                  {stkPushSent && (
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={handleRetrySTKPush}
                        disabled={isProcessing}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Resend STK Push</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manual Paybill Payment Fallback */}
            {orderPlaced && showPaybillFallback && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Alternative Payment Method
                    </h3>
                    <p className="text-gray-600 mb-4">
                      STK Push failed or timed out. You can complete your payment using M-Pesa Paybill:
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Pay via M-Pesa Paybill:</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Paybill Number:</span>
                        <p className="text-lg font-bold text-gray-900">{paybillInfo.businessNumber}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(paybillInfo.businessNumber)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Account Number:</span>
                        <p className="text-lg font-bold text-gray-900">{paybillInfo.accountNumber}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(paybillInfo.accountNumber)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Amount:</span>
                        <p className="text-lg font-bold text-green-600">{formatPrice(cart.total)}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(cart.total.toString())}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Payment Instructions:</p>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          <li>Go to M-Pesa menu</li>
                          <li>Select "Lipa na M-Pesa"</li>
                          <li>Select "Pay Bill"</li>
                          <li>Enter Business Number: {paybillInfo.businessNumber}</li>
                          <li>Enter Account Number: {paybillInfo.accountNumber}</li>
                          <li>Enter Amount: {cart.total}</li>
                          <li>Enter your M-Pesa PIN</li>
                          <li>Enter the M-Pesa reference below</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manual Payment Confirmation */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Reference Number *
                    </label>
                    <input
                      type="text"
                      value={manualPaymentRef}
                      onChange={(e) => setManualPaymentRef(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter M-Pesa reference (e.g., QA12BC3DEF)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You'll receive an SMS with the M-Pesa reference after completing payment
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleManualPaymentConfirmation}
                      disabled={isConfirmingManualPayment || !manualPaymentRef.trim()}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {isConfirmingManualPayment ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Confirm Payment</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleRetrySTKPush}
                      disabled={isProcessing}
                      className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Retry STK</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                Order Summary
              </h3>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product_image ? (
                        <img
                          src={`http://localhost:8000/${item.product_image.split(',')[0].trim()}`}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full ${item.product_image ? 'hidden' : 'flex'} items-center justify-center text-gray-400`}>
                        <Package className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × {formatPrice(item.product_price)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(item.product_price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200 my-4" />
              
              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} items):</span>
                  <span className="font-medium">{formatPrice(cart.subtotal || 0)}</span>
                </div>
                
                {cart.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600">Discount:</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(cart.discount)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping:</span>
                  <span>FREE</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatPrice(cart.total || 0)}</span>
                </div>
              </div>

              {/* Payment Status Summary (when order is placed) */}
              {orderPlaced && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    Payment Status
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">#{orderDetails?.id}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${
                        paymentStatus === 'success' ? 'bg-green-100 text-green-800' :
                        paymentStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                        paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {paymentStatus === 'success' ? 'Paid' :
                         paymentStatus === 'processing' ? 'Processing' :
                         paymentStatus === 'failed' ? 'Failed' :
                         'Pending'}
                      </span>
                    </div>
                    
                    {transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction:</span>
                        <span className="font-medium">#{transactionId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium text-sm">Secure Checkout</p>
                    <p className="text-green-700 text-xs mt-1">
                      Your payment information is encrypted and secure. We never store your payment details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Place Order Button - only show if order not yet placed */}
              {!orderPlaced && (
                <>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full mt-6 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>Place Order - {formatPrice(cart.total || 0)}</span>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    By placing your order, you agree to our Terms of Service and Privacy Policy
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;