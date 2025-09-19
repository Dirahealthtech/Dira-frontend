import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  Search,
  Calendar,
  DollarSign,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  FileText,
  Printer,
  Send,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../auth/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);

  // Filters and sorting
  const [filters, setFilters] = useState({
    status_filter: '',
    payment_method: '',
    payment_status: '',
    customer_id: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // UI State
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
    bank_transfer: { label: 'Bank Transfer', icon: CreditCard },
    credit_card: { label: 'Credit Card', icon: CreditCard }
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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      console.log('Fetching orders with params:', params.toString());
      
      const response = await api.get(`/api/v1/admin/orders?${params}`);
      console.log('Orders response:', response.data);
      
      if (Array.isArray(response.data)) {
        setOrders(response.data);
        setTotalOrders(response.data.length);
        setTotalPages(Math.ceil(response.data.length / pageSize));
      } else if (response.data.orders) {
        setOrders(response.data.orders);
        setTotalOrders(response.data.total || response.data.orders.length);
        setTotalPages(Math.ceil((response.data.total || response.data.orders.length) / pageSize));
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;
    
    setActionLoading(true);
    try {
      // Implement bulk actions here
      console.log(`Performing ${bulkAction} on orders:`, selectedOrders);
      
      // Reset selections
      setSelectedOrders([]);
      setBulkAction('');
      
      // Refresh orders
      await fetchOrders();
    } catch (err) {
      setError(`Failed to perform bulk action: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      // In a real app, you'd fetch detailed order info
      const order = orders.find(o => o.id === orderId);
      setSelectedOrder(order);
      setShowOrderDetails(true);
    } catch (err) {
      setError(`Failed to load order details: ${err.message}`);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // Implement status update API call
      console.log(`Updating order ${orderId} status to ${newStatus}`);
      await fetchOrders(); // Refresh orders
    } catch (err) {
      setError(`Failed to update order status: ${err.message}`);
    }
  };

  const clearFilters = () => {
    setFilters({
      status_filter: '',
      payment_method: '',
      payment_status: '',
      customer_id: '',
      date_from: '',
      date_to: '',
      search: ''
    });
    setCurrentPage(1);
  };

  const exportOrders = async () => {
    try {
      // Implement export functionality
      console.log('Exporting orders...');
    } catch (err) {
      setError(`Failed to export orders: ${err.message}`);
    }
  };

  const renderFilters = () => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 ${showFilters ? 'block' : 'hidden'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
          <select
            value={filters.status_filter}
            onChange={(e) => handleFilterChange('status_filter', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {Object.entries(ORDER_STATUSES).map(([key, status]) => (
              <option key={key} value={key}>{status.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <select
            value={filters.payment_method}
            onChange={(e) => handleFilterChange('payment_method', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Methods</option>
            {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
              <option key={key} value={key}>{method.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
          <select
            value={filters.payment_status}
            onChange={(e) => handleFilterChange('payment_status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Payment Status</option>
            {Object.entries(PAYMENT_STATUSES).map(([key, status]) => (
              <option key={key} value={key}>{status.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
          <input
            type="text"
            value={filters.customer_id}
            onChange={(e) => handleFilterChange('customer_id', e.target.value)}
            placeholder="Enter customer ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by order number, customer name..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={clearFilters}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          Clear All Filters
        </button>
        <div className="text-sm text-gray-600">
          {totalOrders} orders found
        </div>
      </div>
    </div>
  );

  const renderOrderRow = (order) => {
    const orderStatus = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
    const paymentStatus = PAYMENT_STATUSES[order.payment_status] || PAYMENT_STATUSES.pending;
    const paymentMethod = PAYMENT_METHODS[order.payment_method] || PAYMENT_METHODS.mpesa;
    const StatusIcon = orderStatus.icon;
    const PaymentIcon = paymentMethod.icon;

    return (
      <tr key={order.id} className="hover:bg-gray-50 border-b border-gray-200">
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selectedOrders.includes(order.id)}
            onChange={() => handleSelectOrder(order.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </td>
        
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-900">
            #{order.order_number}
          </div>
          <div className="text-xs text-gray-500">
            ID: {order.id}
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="text-sm text-gray-900">Customer #{order.customer_id}</div>
          <div className="text-xs text-gray-500">
            {formatDate(order.created_at)}
          </div>
        </td>

        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${orderStatus.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {orderStatus.label}
          </span>
        </td>

        <td className="px-6 py-4">
          <div className="flex items-center text-sm text-gray-900">
            <PaymentIcon className="w-4 h-4 mr-2 text-gray-400" />
            {paymentMethod.label}
          </div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${paymentStatus.color} mt-1`}>
            {paymentStatus.label}
          </span>
        </td>

        <td className="px-6 py-4 text-right">
          <div className="text-sm font-semibold text-gray-900">
            {formatPrice(order.total)}
          </div>
          {order.discount > 0 && (
            <div className="text-xs text-green-600">
              -{formatPrice(order.discount)} discount
            </div>
          )}
        </td>

        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewOrder(order.id)}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <div className="relative group">
              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'processing')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Mark as Processing
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'shipped')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Mark as Shipped
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'delivered')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Mark as Delivered
                  </button>
                  <hr className="my-1" />
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Printer className="w-4 h-4 inline mr-2" />
                    Print Invoice
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Send className="w-4 h-4 inline mr-2" />
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderOrderDetails = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Order Details - #{selectedOrder?.order_number}
          </h2>
          <button
            onClick={() => setShowOrderDetails(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{selectedOrder?.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(selectedOrder?.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${ORDER_STATUSES[selectedOrder?.status]?.color}`}>
                      {ORDER_STATUSES[selectedOrder?.status]?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{PAYMENT_METHODS[selectedOrder?.payment_method]?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${PAYMENT_STATUSES[selectedOrder?.payment_status]?.color}`}>
                      {PAYMENT_STATUSES[selectedOrder?.payment_status]?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Customer ID: #{selectedOrder?.customer_id}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Email: customer@example.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Phone: +254 7XX XXX XXX</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatPrice(selectedOrder?.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatPrice(selectedOrder?.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">{formatPrice(selectedOrder?.shipping_cost)}</span>
                  </div>
                  {selectedOrder?.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600">Discount:</span>
                      <span className="font-medium text-green-600">-{formatPrice(selectedOrder?.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatPrice(selectedOrder?.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                    Update Status
                  </button>
                  <button className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors">
                    Print Invoice
                  </button>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                    Send Email Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-700">
        <span>Show</span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setCurrentPage(1);
          }}
          className="mx-2 px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>per page</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track all customer orders
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={exportOrders}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'text-blue-600' },
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
          { label: 'Processing', value: orders.filter(o => o.status === 'processing').length, icon: Package, color: 'text-blue-600' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'text-green-600' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showFilters 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </button>

            {selectedOrders.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {selectedOrders.length} selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Bulk Actions</option>
                  <option value="mark_processing">Mark as Processing</option>
                  <option value="mark_shipped">Mark as Shipped</option>
                  <option value="mark_delivered">Mark as Delivered</option>
                  <option value="export_selected">Export Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {actionLoading ? 'Processing...' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {renderFilters()}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(filter => filter) 
                ? 'Try adjusting your filters to see more results.'
                : 'Orders will appear here once customers start placing orders.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('order_number')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Order</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Customer & Date</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Status</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('total')}
                        className="flex items-center space-x-1 hover:text-gray-700 ml-auto"
                      >
                        <span>Total</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(renderOrderRow)}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && renderOrderDetails()}
    </div>
  )
};
export default OrderManagement;