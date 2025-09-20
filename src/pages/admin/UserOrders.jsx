import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock,
  AlertCircle, Eye, Search, Filter, Calendar, Download,
  RefreshCw, User, Mail, Phone, DollarSign
} from 'lucide-react';
import api from '../../auth/api';

const UserOrders = ({ userId, onNavigate }) => {
  
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  
  const ORDERS_PER_PAGE = 20;

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
    completed: { label: 'Paid', color: 'bg-green-100 text-green-800' },
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

  const fetchUserAndOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch user details
      const userResponse = await api.get(`/api/v1/admin/users/${userId}`);
      setUser(userResponse.data);

      // Fetch user orders
      const params = new URLSearchParams({
        skip: (currentPage - 1) * ORDERS_PER_PAGE,
        limit: ORDERS_PER_PAGE,
      });

      const ordersResponse = await api.get(`/api/v1/admin/users/${userId}/orders?${params}`);
      const ordersData = ordersResponse.data;
      
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
        setTotalOrders(ordersData.length);
      } else {
        setOrders(ordersData.orders || []);
        setTotalOrders(ordersData.total || 0);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch user orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    onNavigate(`/admin/orders/${orderId}`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (userId) {
      fetchUserAndOrders();
    }
  }, [userId, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 mb-6">{error || 'User not found.'}</p>
        <button
          onClick={() => onNavigate('/admin/users')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
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
            onClick={() => onNavigate('/admin/users')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Orders for {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-gray-600">
              Customer ID: {user.id} • {totalOrders} total orders
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate(`/admin/customers/${userId}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <User className="w-4 h-4 mr-2" />
            View Profile
          </button>
          <button
            onClick={fetchUserAndOrders}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Customer Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {user.first_name} {user.last_name}
                </h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {user.email}
                  </div>
                  {user.phone_number && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {user.phone_number}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{user.total_orders || 0}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatPrice(user.total_spent || 0)}</div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const orderStatus = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
                const paymentStatus = PAYMENT_STATUSES[order.payment_status] || PAYMENT_STATUSES.pending;
                const StatusIcon = orderStatus.icon;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <StatusIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.order_number}
                          </div>
                          <div className="text-sm text-gray-500">ID: {order.id}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${orderStatus.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {orderStatus.label}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatus.color}`}>
                        {paymentStatus.label}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'No orders match your current filters.'
                : 'This customer has not placed any orders yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Order Statistics */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Order</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length > 0 
                    ? formatPrice(orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length)
                    : formatPrice(0)
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;