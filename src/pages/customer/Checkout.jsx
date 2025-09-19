import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, MapPin, User, Phone, Mail,ArrowLeft, ArrowRight,CheckCircle,AlertCircle,Loader,Package,Shield,Truck} from 'lucide-react';
import { useCart } from './CartContext.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import api from '../../auth/api.js';

const CHECKOUT_STEPS = {
  SHIPPING: 'shipping',
  BILLING: 'billing',
  PAYMENT: 'payment',
  CONFIRMATION: 'confirmation'
};

const PAYMENT_METHODS = {
  MPESA: 'mpesa',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  BANK_TRANSFER: 'bank_transfer'
};

const Checkout = () => {
  const { cart, itemCount, isLoading: cartLoading, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [currentStep, setCurrentStep] = useState(CHECKOUT_STEPS.SHIPPING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    county: '',
    postal_code: ''
  });

  const [billingAddress, setBillingAddress] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    county: '',
    postal_code: ''
  });

  const [paymentData, setPaymentData] = useState({
    payment_method: PAYMENT_METHODS.MPESA,
    mpesa_phone: '',
    notes: ''
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [orderResult, setOrderResult] = useState(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const initialData = {
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        phone_number: user.phone_number || '',
        email: user.email || '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        county: '',
        postal_code: ''
      };
      setShippingAddress(initialData);
      setBillingAddress(initialData);
      setPaymentData(prev => ({
        ...prev,
        mpesa_phone: user.phone_number || ''
      }));
    }
  }, [user]);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!cartLoading && (!cart?.items || cart.items.length === 0)) {
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, cart, cartLoading, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatPhoneNumber = (phone) => {
    // Convert to 254XXXXXXXXX format
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      // Already in correct format
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  };

  const validateStep = (step) => {
    setError('');
    
    switch (step) {
      case CHECKOUT_STEPS.SHIPPING:
        const requiredShipping = ['full_name', 'phone_number', 'email', 'address_line_1', 'city', 'county'];
        for (let field of requiredShipping) {
          if (!shippingAddress[field]?.trim()) {
            setError(`Please fill in ${field.replace('_', ' ')}`);
            return false;
          }
        }
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(shippingAddress.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        return true;

      case CHECKOUT_STEPS.BILLING:
        if (!sameAsBilling) {
          const requiredBilling = ['full_name', 'phone_number', 'email', 'address_line_1', 'city', 'county'];
          for (let field of requiredBilling) {
            if (!billingAddress[field]?.trim()) {
              setError(`Please fill in billing ${field.replace('_', ' ')}`);
              return false;
            }
          }
          // Validate email
          if (!emailRegex.test(billingAddress.email)) {
            setError('Please enter a valid billing email address');
            return false;
          }
        }
        return true;

      case CHECKOUT_STEPS.PAYMENT:
        if (paymentData.payment_method === PAYMENT_METHODS.MPESA) {
          if (!paymentData.mpesa_phone?.trim()) {
            setError('Please enter M-Pesa phone number');
            return false;
          }
          const formatted = formatPhoneNumber(paymentData.mpesa_phone);
          if (!formatted.startsWith('254') || formatted.length !== 12) {
            setError('Please enter a valid Kenyan phone number');
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (sameAsBilling && currentStep === CHECKOUT_STEPS.SHIPPING) {
      setBillingAddress({ ...shippingAddress });
    }

    const steps = Object.values(CHECKOUT_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps = Object.values(CHECKOUT_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep(CHECKOUT_STEPS.PAYMENT)) return;

    setIsLoading(true);
    setError('');

    try {
      // Prepare order data
      const orderData = {
        shipping_address: shippingAddress,
        billing_address: sameAsBilling ? shippingAddress : billingAddress,
        payment_method: paymentData.payment_method,
        shipping_cost: 0.0,
        notes: paymentData.notes || '',
        prescription_id: null
      };

      console.log('Creating order with data:', orderData);

      // Create the order
      const orderResponse = await api.post('/api/v1/orders', orderData);
      console.log('Order created:', orderResponse.data);

      if (orderResponse.data) {
        setOrderResult(orderResponse.data);

        // If payment method is M-Pesa, initiate STK push
        if (paymentData.payment_method === PAYMENT_METHODS.MPESA) {
          const mpesaData = {
            phone_number: formatPhoneNumber(paymentData.mpesa_phone),
            amount: Math.round(cart.total || 0)
          };

          console.log('Initiating M-Pesa payment:', mpesaData);

          const mpesaResponse = await api.post('/api/v1/payments/mpesa/stk-push', mpesaData);
          console.log('M-Pesa response:', mpesaResponse.data);

          if (mpesaResponse.data?.success) {
            setSuccess(`Order created successfully! ${mpesaResponse.data.customer_message || 'Please check your phone for M-Pesa prompt.'}`);
          } else {
            setError('Order created but M-Pesa payment failed. Please try again or contact support.');
          }
        } else {
          setSuccess('Order created successfully!');
        }

        // Clear cart and move to confirmation
        await clearCart();
        setCurrentStep(CHECKOUT_STEPS.CONFIRMATION);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to create order';
      setError(`Order creation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: CHECKOUT_STEPS.SHIPPING, label: 'Shipping', icon: Truck },
      { key: CHECKOUT_STEPS.BILLING, label: 'Billing', icon: User },
      { key: CHECKOUT_STEPS.PAYMENT, label: 'Payment', icon: CreditCard },
      { key: CHECKOUT_STEPS.CONFIRMATION, label: 'Confirmation', icon: CheckCircle }
    ];

    const getCurrentStepIndex = () => steps.findIndex(step => step.key === currentStep);
    const currentIndex = getCurrentStepIndex();

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-blue-600 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`mx-4 h-px w-12 ${
                  index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderShippingForm = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Truck className="h-5 w-5 mr-2 text-blue-600" />
        Shipping Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            value={shippingAddress.full_name}
            onChange={(e) => setShippingAddress(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <input
            type="tel"
            value={shippingAddress.phone_number}
            onChange={(e) => setShippingAddress(prev => ({ ...prev, phone_number: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+254 7XX XXX XXX"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
          <input
            type="email"
            value={shippingAddress.email}
            onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
          <input
            type="text"
            value={shippingAddress.address_line_1}
            onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Street address, building, etc."
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
          <input
            type="text"
            value={shippingAddress.address_line_2}
            onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input
            type="text"
            value={shippingAddress.city}
            onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nairobi"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">County *</label>
          <input
            type="text"
            value={shippingAddress.county}
            onChange={(e) => setShippingAddress(prev => ({ ...prev, county: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nairobi County"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
          <input
            type="text"
            value={shippingAddress.postal_code}
            onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="00100"
          />
        </div>
      </div>
    </div>
  );

  const renderBillingForm = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <User className="h-5 w-5 mr-2 text-blue-600" />
        Billing Information
      </h2>
      
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Same as shipping address</span>
        </label>
      </div>
      
      {!sameAsBilling && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={billingAddress.full_name}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={billingAddress.phone_number}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, phone_number: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+254 7XX XXX XXX"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              value={billingAddress.email}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
            <input
              type="text"
              value={billingAddress.address_line_1}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Street address, building, etc."
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
            <input
              type="text"
              value={billingAddress.address_line_2}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <input
              type="text"
              value={billingAddress.city}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nairobi"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">County *</label>
            <input
              type="text"
              value={billingAddress.county}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, county: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nairobi County"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
            <input
              type="text"
              value={billingAddress.postal_code}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="00100"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
          Payment Method
        </h2>
        
        <div className="space-y-4">
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment_method"
              value={PAYMENT_METHODS.MPESA}
              checked={paymentData.payment_method === PAYMENT_METHODS.MPESA}
              onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium">M-Pesa</span>
              </div>
              <p className="text-sm text-gray-600">Pay using your M-Pesa mobile money</p>
            </div>
          </label>
          
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment_method"
              value={PAYMENT_METHODS.CASH_ON_DELIVERY}
              checked={paymentData.payment_method === PAYMENT_METHODS.CASH_ON_DELIVERY}
              onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Cash on Delivery</span>
              </div>
              <p className="text-sm text-gray-600">Pay when your order is delivered</p>
            </div>
          </label>
          
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment_method"
              value={PAYMENT_METHODS.BANK_TRANSFER}
              checked={paymentData.payment_method === PAYMENT_METHODS.BANK_TRANSFER}
              onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium">Bank Transfer</span>
              </div>
              <p className="text-sm text-gray-600">Transfer money directly to our bank account</p>
            </div>
          </label>
        </div>
        
        {paymentData.payment_method === PAYMENT_METHODS.MPESA && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number *</label>
            <input
              type="tel"
              value={paymentData.mpesa_phone}
              onChange={(e) => setPaymentData(prev => ({ ...prev, mpesa_phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+254 7XX XXX XXX"
            />
            <p className="text-sm text-gray-600 mt-1">
              You will receive a prompt on this number to complete payment
            </p>
          </div>
        )}
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
          <textarea
            value={paymentData.notes}
            onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Any special instructions for your order..."
          />
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        
        {orderResult && (
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Order Number:</p>
            <p className="text-xl font-semibold text-blue-600">#{orderResult.order_number || orderResult.id}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}
        
        <div className="space-y-4 text-left mb-8">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
            <p className="text-gray-600">
              {shippingAddress.full_name}<br />
              {shippingAddress.address_line_1}<br />
              {shippingAddress.address_line_2 && <>{shippingAddress.address_line_2}<br /></>}
              {shippingAddress.city}, {shippingAddress.county}<br />
              {shippingAddress.postal_code}<br />
              {shippingAddress.phone_number}
            </p>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
            <p className="text-gray-600">
              {paymentData.payment_method === PAYMENT_METHODS.MPESA && 'M-Pesa'}
              {paymentData.payment_method === PAYMENT_METHODS.CASH_ON_DELIVERY && 'Cash on Delivery'}
              {paymentData.payment_method === PAYMENT_METHODS.BANK_TRANSFER && 'Bank Transfer'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-4 justify-center">
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );

  const renderOrderSummary = () => {
    if (!cart?.items || cart.items.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
          Order Summary
        </h3>
        
        <div className="space-y-3 mb-4">
          {cart.items.slice(0, 3).map((item) => (
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
                <p className="text-sm text-gray-600">
                  Qty: {item.quantity} × {formatPrice(item.product_price)}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(item.product_price * item.quantity)}
              </p>
            </div>
          ))}
          
          {cart.items.length > 3 && (
            <p className="text-sm text-gray-600 text-center">
              ... and {cart.items.length - 3} more items
            </p>
          )}
        </div>
        
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({itemCount} items):</span>
            <span className="font-medium">{formatPrice(cart.subtotal || 0)}</span>
          </div>
          
          {cart.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount:</span>
              <span className="font-medium text-green-600">
                -{formatPrice(cart.discount)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-medium text-green-600">FREE</span>
          </div>
          
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span className="text-blue-600">{formatPrice(cart.total || 0)}</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-sm text-blue-800">
            <Shield className="h-4 w-4 mr-2" />
            <span>Secure checkout with SSL encryption</span>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Redirect cases handled in useEffect
  if (!isAuthenticated || !cart?.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            </div>
            <Link
              to="/cart"
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cart</span>
            </Link>
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === CHECKOUT_STEPS.SHIPPING && renderShippingForm()}
            {currentStep === CHECKOUT_STEPS.BILLING && renderBillingForm()}
            {currentStep === CHECKOUT_STEPS.PAYMENT && renderPaymentForm()}
            {currentStep === CHECKOUT_STEPS.CONFIRMATION && renderConfirmation()}

            {/* Navigation Buttons */}
            {currentStep !== CHECKOUT_STEPS.CONFIRMATION && (
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === CHECKOUT_STEPS.SHIPPING}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    currentStep === CHECKOUT_STEPS.SHIPPING
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                {currentStep === CHECKOUT_STEPS.PAYMENT ? (
                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {currentStep !== CHECKOUT_STEPS.CONFIRMATION && (
            <div className="lg:col-span-1">
              {renderOrderSummary()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;