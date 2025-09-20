import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Truck, Package,
  User, Mail, Phone, MapPin, Copy, Printer, Send, FileText, Edit,
  DollarSign, Calendar, UserCheck, ExternalLink, CreditCard, Plus, X
} from 'lucide-react';
import api from '../../auth/api';
import ShippingModal from './ShippingModal';
import PaymentVerificationModal from './PaymentVerificationModal';
import OrderCompleteModal from './OrderCompleteModal';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeOrderLoading, setCompleteOrderLoading] = useState(false);
  const [verifyPaymentLoading, setVerifyPaymentLoading] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

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

  const PAYMENT_METHODS = {
    mpesa: { label: 'M-Pesa', icon: Phone },
    cash_on_delivery: { label: 'Cash on Delivery', icon: Package },
    bank_transfer: { label: 'Bank Transfer', icon: DollarSign },
    credit_card: { label: 'Credit Card', icon: DollarSign }
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
  };

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/api/v1/admin/orders/${orderId}`);
      setOrder(response.data);
      
      if (response.data.customer_id) {
        await fetchCustomer(response.data.customer_id);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to fetch order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomer = async (customerId) => {
    setCustomerLoading(true);
    try {
      const response = await api.get(`/api/v1/admin/users/${customerId}`);
      setCustomer(response.data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus, notes = '') => {
    setStatusUpdateLoading(true);
    try {
      await api.patch(`/api/v1/admin/orders/${orderId}/status`, { 
        status: newStatus,
        notes: notes 
      });
      await fetchOrder();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(`Failed to update order status: ${err.message}`);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleCompleteOrder = async (deliveryConfirmation = true, paymentCollected = true, notes = '') => {
    setCompleteOrderLoading(true);
    try {
      await api.post(`/api/v1/admin/orders/${orderId}/complete`, { notes }, {
        params: {
          delivery_confirmation: deliveryConfirmation,
          payment_collected: paymentCollected
        }
      });
      setCompleteModalOpen(false);
      await fetchOrder();
    } catch (err) {
      console.error('Error completing order:', err);
      setError(`Failed to complete order: ${err.message}`);
    } finally {
      setCompleteOrderLoading(false);
    }
  };

  const handleAssignShipping = async (shippingData) => {
    try {
      await api.post(`/api/v1/admin/orders/${orderId}/shipping/assign`, shippingData);
      setShippingModalOpen(false);
      await fetchOrder();
    } catch (err) {
      console.error('Error assigning shipping:', err);
      setError(`Failed to assign shipping: ${err.message}`);
    }
  };

  const handleVerifyPayment = async (paymentData) => {
    setVerifyPaymentLoading(true);
    try {
      await api.post(`/api/v1/admin/orders/${orderId}/payment/verify`, null, {
        params: paymentData
      });
      await fetchOrder();
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError(`Failed to verify payment: ${err.message}`);
    } finally {
      setVerifyPaymentLoading(false);
    }
  };

  const handleStatusUpdateWithModal = async () => {
    if (!selectedStatus) return;
    await handleStatusUpdate(selectedStatus, statusNotes);
    setStatusModalOpen(false);
    setStatusNotes('');
    setSelectedStatus('');
  };

  const handleViewCustomer = () => {
    if (order?.customer_id) {
      navigate(`/admin/customers/${order.customer_id}`);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleSendEmail = () => {
    console.log('Sending email update...');
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
        <p className="text-gray-600 mb-6">{error || 'The requested order could not be found.'}</p>
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

  const orderStatus = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
  const paymentStatus = PAYMENT_STATUSES[order.payment_status] || PAYMENT_STATUSES.pending;
  const paymentMethod = PAYMENT_METHODS[order.payment_method] || PAYMENT_METHODS.mpesa;
  const StatusIcon = orderStatus.icon;
  const PaymentIcon = paymentMethod.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.order_number}
            </h1>
            <p className="text-sm text-gray-600">
              Order ID: {order.id} • Created {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${orderStatus.color}`}>
            <StatusIcon className="w-4 h-4 mr-2" />
            {orderStatus.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <div className="flex items-center">
                    <span className="font-medium">#{order.order_number}</span>
                    <button
                      onClick={() => copyToClipboard(order.order_number)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(order.created_at)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${orderStatus.color}`}>
                    {orderStatus.label}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Count:</span>
                  <span className="font-medium">{order.items_count || 0} item{order.items_count !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <div className="flex items-center">
                    <PaymentIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{paymentMethod.label}</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${paymentStatus.color}`}>
                    {paymentStatus.label}
                  </span>
                </div>
                
                {order.tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <div className="flex items-center">
                      <span className="font-medium">{order.tracking_number}</span>
                      <button
                        onClick={() => copyToClipboard(order.tracking_number)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                {order.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Notes:</span>
                    <span className="font-medium max-w-48 truncate" title={order.notes}>
                      {order.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {customer && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
                <button
                  onClick={handleViewCustomer}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  View Full Profile
                  <ExternalLink className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              {customerLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading customer details...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {customer.first_name} {customer.last_name}
                      </span>
                      {customer.is_verified && (
                        <UserCheck className="w-4 h-4 text-green-500 ml-2" />
                      )}
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{customer.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{customer.phone_number}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-600">Total Orders: </span>
                      <span className="font-medium text-blue-600">{customer.total_orders || 0}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Total Spent: </span>
                      <span className="font-medium text-green-600">{formatPrice(customer.total_spent || 0)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Customer Since: </span>
                      <span className="font-medium">{formatDate(customer.created_at)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shipping Information */}
          {order.shipping_address && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{order.shipping_address.name}</div>
                  <div className="text-gray-600 mt-1">
                    <div>{order.shipping_address.address_line_1}</div>
                    {order.shipping_address.address_line_2 && (
                      <div>{order.shipping_address.address_line_2}</div>
                    )}
                    <div>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    </div>
                    <div>{order.shipping_address.country}</div>
                  </div>
                  {order.shipping_address.phone && (
                    <div className="text-sm text-gray-600 mt-2">
                      Phone: {order.shipping_address.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">SKU: {item.product_sku}</p>
                        {item.variant && (
                          <p className="text-xs text-gray-500">Variant: {item.variant}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(item.price)} × {item.quantity}</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">{event.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(event.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatPrice(order.subtotal || 0)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">{formatPrice(order.tax)}</span>
                </div>
              )}
              {order.shipping_cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">{formatPrice(order.shipping_cost)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Discount:</span>
                  <span className="font-medium text-green-600">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Updates */}
          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="space-y-2">
              {Object.entries(ORDER_STATUSES).map(([status, config]) => {
                const StatusIconComponent = config.icon;
                const isCurrentStatus = order.status === status;
                
                return (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setStatusModalOpen(true);
                    }}
                    disabled={isCurrentStatus || statusUpdateLoading}
                    className={`w-full flex items-center px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isCurrentStatus 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <StatusIconComponent className="w-4 h-4 mr-2" />
                    {isCurrentStatus ? `Current: ${config.label}` : `Mark as ${config.label}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={handlePrintInvoice}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4 inline mr-2" />
                Print Invoice
              </button>
              <button 
                onClick={handleSendEmail}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Send Email Update
              </button>
              <button 
                onClick={handleViewCustomer}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
              >
                <User className="w-4 h-4 inline mr-2" />
                View Customer
              </button>
              
              {/* New Actions */}
              {(order.status === 'processing' || order.status === 'pending') && (
                <button 
                  onClick={() => setShippingModalOpen(true)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
                >
                  <Truck className="w-4 h-4 inline mr-2" />
                  Assign Shipping
                </button>
              )}
              
              {order.payment_status !== 'completed' && (
                <button 
                  onClick={() => setPaymentModalOpen(true)}
                  disabled={verifyPaymentLoading}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  {verifyPaymentLoading ? 'Verifying...' : 'Verify Payment'}
                </button>
              )}
              
              {(order.status === 'shipped' || order.status === 'processing') && (
                <button 
                  onClick={() => setCompleteModalOpen(true)}
                  disabled={completeOrderLoading}
                  className="w-full bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  {completeOrderLoading ? 'Completing...' : 'Complete Order'}
                </button>
              )}
              
              <button 
                onClick={() => setStatusModalOpen(true)}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Update Status with Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Update Order Status
                </h3>
                <button
                  onClick={() => {
                    setStatusModalOpen(false);
                    setStatusNotes('');
                    setSelectedStatus('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdateWithModal}
                  disabled={statusUpdateLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {statusUpdateLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Assignment Modal */}
      {shippingModalOpen && (
        <ShippingModal
          orderId={orderId}
          onClose={() => setShippingModalOpen(false)}
          onAssign={handleAssignShipping}
        />
      )}

      {/* Payment Verification Modal */}
      {paymentModalOpen && (
        <PaymentVerificationModal
          orderId={orderId}
          orderData={order}
          onClose={() => setPaymentModalOpen(false)}
          onVerify={handleVerifyPayment}
        />
      )}

      {/* Order Complete Modal */}
      {completeModalOpen && (
        <OrderCompleteModal
          orderId={orderId}
          orderData={order}
          onClose={() => setCompleteModalOpen(false)}
          onComplete={handleCompleteOrder}
        />
      )}
    </div>
  );
};

export default OrderDetails;