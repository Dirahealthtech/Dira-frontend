import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Tag, ArrowRight, Package, Percent, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from './CartContext.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';

const Cart = () => {
  const { cart, itemCount, isLoading, updateQuantity, removeItem, clearCart, applyCoupon } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setApplyingCoupon(true);
    const success = await applyCoupon(couponCode);
    if (success) {
      setCouponCode('');
    }
    setApplyingCoupon(false);
  };

  const handleClearCart = async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  // Enhanced checkout handler with better error handling
  const handleCheckout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Checkout button clicked - navigation starting');
    
    // Validation checks
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (!cart?.items || cart.items.length === 0) {
      console.log('Cart is empty, cannot proceed');
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }
    
    if (isLoading) {
      console.log('Cart is still loading, please wait');
      alert('Please wait while cart loads...');
      return;
    }

    console.log('All validation checks passed, attempting navigation...');
    
    // Use setTimeout to ensure the navigation happens after the current event loop
    setTimeout(() => {
      try {
        console.log('Navigating to checkout...');
        navigate('/checkout');
        console.log('Navigation called successfully');
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to window.location
        window.location.href = '/checkout';
      }
    }, 0);
  };

  // Check if checkout should be enabled
  const isCheckoutEnabled = isAuthenticated && !isLoading && cart?.items && cart.items.length > 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign in to view your cart</h1>
            <p className="text-gray-600 mb-8">Please login to see your cart items and continue shopping</p>
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>Sign In</span>
              </Link>
              <Link
                to="/"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                  {cart.items.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCart}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {cart.items.map((item, index) => (
                    <div key={item.id} className={`${index !== 0 ? 'border-t border-gray-100 pt-4' : ''}`}>
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                            <Package className="h-8 w-8" />
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {item.product_name}
                          </h3>
                          <p className="text-blue-600 font-semibold text-lg mb-3">
                            {formatPrice(item.product_price)}
                          </p>

                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600">Quantity:</span>
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                  disabled={isLoading || item.quantity <= 1}
                                  className="p-2 hover:bg-gray-50 disabled:opacity-50 transition-colors rounded-l-lg"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 text-center font-medium min-w-[3rem] border-x border-gray-300">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                  disabled={isLoading}
                                  className="p-2 hover:bg-gray-50 disabled:opacity-50 transition-colors rounded-r-lg"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              disabled={isLoading}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Remove item"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                            <span className="text-gray-600">Item Total:</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.product_price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="space-y-6">
            {/* Coupon Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-blue-600" />
                Coupon Code
              </h3>
              
              {cart.applied_coupon_code ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Coupon "{cart.applied_coupon_code}" applied
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    You saved {formatPrice(cart.discount)}!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!couponCode.trim() || applyingCoupon}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply Coupon'}
                  </button>
                </form>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
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

              {/* Standalone checkout button - NOT inside any form */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!isCheckoutEnabled}
                  className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-lg ${
                    isCheckoutEnabled
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                Secure checkout with SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;