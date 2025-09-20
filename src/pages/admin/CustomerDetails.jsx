import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar as CalendarIcon, Clock,
  UserCheck, Copy, Edit, History, AlertCircle, CheckCircle, XCircle,
  Package, Truck, TrendingUp, Star, ShoppingCart, DollarSign, Send
} from 'lucide-react';
import api from '../../auth/api';

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ORDER_STATUSES = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
  };

  const PAYMENT_STATUSES = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const fetchCustomer = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/api/v1/admin/users/${customerId}`);
      setCustomer(response.data);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('Failed to fetch customer details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = () => {
    // Implement email functionality
    console.log('Sending email to customer...');
  };

  const handleCallCustomer = () => {
    // Implement call functionality
    if (customer?.phone_number) {
      window.location.href = `tel:${customer.phone_number}`;
    }
  };

  const handleViewOrderHistory = () => {
    // Navigate to orders filtered by this customer
    navigate(`/admin/orders?customer_id=${customerId}`);
  };

  const handleEditCustomer = () => {
    // Navigate to customer edit page
    navigate(`/admin/customers/${customerId}/edit`);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading customer details...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Not Found</h3>
        <p className="text-gray-600 mb-6">{error || 'The requested customer could not be found.'}</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {customer.first_name} {customer.last_name}
            </h1>
            <p className="text-sm text-gray-600">
              Customer ID: {customer.id} • Member since {formatDate(customer.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            customer.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {customer.status}
          </span>
          {customer.is_verified && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium flex items-center">
              <UserCheck className="w-4 h-4 mr-1" />
              Verified
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {customer.first_name} {customer.last_name}
                </h3>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.status}
                  </span>
                  {customer.is_verified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      <UserCheck className="w-3 h-3 inline mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{customer.email}</span>
                <button
                  onClick={() => copyToClipboard(customer.email)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{customer.phone_number}</span>
                <button
                  onClick={() => copyToClipboard(customer.phone_number)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Joined {formatDate(customer.created_at)}</span>
              </div>
              {customer.last_login && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Last login {formatDate(customer.last_login)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Statistics */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{customer.total_orders || 0}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatPrice(customer.total_spent || 0)}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{customer.total_reviews || 0}</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {customer.total_orders > 0 ? formatPrice((customer.total_spent || 0) / customer.total_orders) : formatPrice(0)}
                </div>
                <div className="text-sm text-gray-600">Avg Order</div>
              </div>
            </div>
          </div>

          {/* Shipping Addresses */}
          {customer.shipping_addresses && customer.shipping_addresses.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Addresses</h3>
              <div className="space-y-3">
                {customer.shipping_addresses.map((address, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{address.name}</h4>
                      {address.is_default && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <div>{address.address_line_1}</div>
                        {address.address_line_2 && <div>{address.address_line_2}</div>}
                        <div>{address.city}, {address.state} {address.postal_code}</div>
                        <div>{address.country}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Profile Info */}
          {customer.customer_profile && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-3">
                {customer.customer_profile.date_of_birth && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium">{new Date(customer.customer_profile.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
                {customer.customer_profile.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium capitalize">{customer.customer_profile.gender}</span>
                  </div>
                )}
                {customer.customer_profile.preferred_language && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Language:</span>
                    <span className="font-medium uppercase">{customer.customer_profile.preferred_language}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Orders */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              {customer.last_order_date && (
                <span className="text-sm text-gray-600">
                  Last order: {formatDate(customer.last_order_date)}
                </span>
              )}
            </div>
            
            {customer.recent_orders && customer.recent_orders.length > 0 ? (
              <div className="space-y-3">
                {customer.recent_orders.slice(0, 5).map((order) => {
                  const orderStatus = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
                  const paymentStatus = PAYMENT_STATUSES[order.payment_status] || PAYMENT_STATUSES.pending;
                  
                  return (
                    <div key={order.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewOrder(order.id)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">#{order.order_number}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${orderStatus.color}`}>
                            {orderStatus.label}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span>{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
                          <span className={`px-2 py-1 rounded text-xs ${paymentStatus.color}`}>
                            {paymentStatus.label}
                          </span>
                        </div>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
                
                {customer.total_orders > 5 && (
                  <button
                    onClick={handleViewOrderHistory}
                    className="w-full text-center py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Orders ({customer.total_orders})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent orders found</p>
              </div>
            )}
          </div>

          {/* Customer Reviews */}
          {customer.recent_reviews && customer.recent_reviews.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {customer.recent_reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">Product: {review.product_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={handleSendEmail}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Send Email
              </button>
              <button 
                onClick={handleCallCustomer}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Call Customer
              </button>
              <button 
                onClick={handleViewOrderHistory}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
              >
                <History className="w-4 h-4 inline mr-2" />
                View Order History
              </button>
              <button 
                onClick={handleEditCustomer}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Edit Customer
              </button>
            </div>
          </div>

          {/* Customer Notes */}
          {customer.notes && (
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Notes</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {customer.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;