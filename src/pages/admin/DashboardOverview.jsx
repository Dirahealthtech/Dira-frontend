import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, BarChart3, TrendingUp, DollarSign, Package2, UserCheck, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Truck, Star, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import api from '../../auth/api';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/api/v1/admin/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094488]"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-[#094488] text-white px-4 py-2 rounded-md hover:bg-[#073a75] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, sales, products, users, orders, reviews, alerts } = dashboardData;

  // Utility function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  // Utility function to format numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  // Utility function to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'returned': return ArrowDownRight;
      default: return Clock;
    }
  };

  // Calculate growth percentages (mock calculation since we don't have historical data)
  const calculateGrowth = (current, previous = 0) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(sales.year_to_date),
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      subtitle: 'Year to date'
    },
    {
      title: 'Total Orders',
      value: formatNumber(summary.total_orders),
      change: `${orders.pending} pending`,
      changeType: 'neutral',
      icon: ShoppingCart,
      subtitle: 'All time'
    },
    {
      title: 'Active Users',
      value: formatNumber(summary.active_users_this_month),
      change: '+8.2%',
      changeType: 'positive',
      icon: UserCheck,
      subtitle: 'This month'
    },
    {
      title: 'Products',
      value: formatNumber(products.active),
      change: `${products.out_of_stock} out of stock`,
      changeType: products.out_of_stock > 0 ? 'negative' : 'positive',
      icon: Package2,
      subtitle: 'Active products'
    },
    {
      title: 'Conversion Rate',
      value: `${summary.conversion_rate.toFixed(1)}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      subtitle: 'This month'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(sales.average_order_value),
      change: sales.average_order_value > 0 ? '+5.3%' : 'No data',
      changeType: sales.average_order_value > 0 ? 'positive' : 'neutral',
      icon: BarChart3,
      subtitle: 'Per order'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome back, {user.first_name || 'Admin'}! Here's what's happening with your store.
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 lg:flex-shrink-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#094488] focus:border-[#094488]"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="year_to_date">Year to Date</option>
          </select>
          
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="w-full sm:w-auto bg-[#094488] text-white px-4 py-2 rounded-md hover:bg-[#073a75] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alerts Banner */}
      {(alerts.low_stock_products > 0 || alerts.pending_orders > 0 || alerts.failed_payments > 0) && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Attention Required</h3>
              <div className="mt-2 text-sm text-amber-700">
                <ul className="space-y-1">
                  {alerts.pending_orders > 0 && (
                    <li>{alerts.pending_orders} orders pending fulfillment</li>
                  )}
                  {alerts.low_stock_products > 0 && (
                    <li>{alerts.low_stock_products} products running low on stock</li>
                  )}
                  {alerts.failed_payments > 0 && (
                    <li>{alerts.failed_payments} failed payment attempts</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <div className="flex items-center mt-2">
                    {card.changeType === 'positive' && (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    )}
                    {card.changeType === 'negative' && (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${card.changeType === 'positive' ? 'text-green-600' :
                        card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                      {card.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>
                <div className="w-12 h-12 bg-[#094488] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#094488]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Overview */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
              <button className="text-sm text-[#094488] hover:text-[#073a75] font-medium">View All</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(sales.today)}</p>
                <p className="text-sm text-gray-600">Today</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(sales.this_week)}</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(sales.this_month)}</p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(sales.year_to_date)}</p>
                <p className="text-sm text-gray-600">Year to Date</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Orders This Month</p>
                  <p className="text-xl font-bold text-gray-900">{sales.order_count_this_month}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Order Value</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(sales.average_order_value)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
            <div className="space-y-3">
              {Object.entries({
                pending: orders.pending,
                confirmed: orders.confirmed,
                shipped: orders.shipped,
                delivered: orders.delivered,
                cancelled: orders.cancelled,
                returned: orders.returned
              }).map(([status, count]) => {
                const StatusIcon = getStatusIcon(status);
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 capitalize">{status}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
            <div className="space-y-3">
              {products.categories
                .filter(cat => cat.product_count > 0)
                .sort((a, b) => b.product_count - a.product_count)
                .slice(0, 5)
                .map((category, index) => (
                  <div key={category.category_id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.product_count} products</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(category.revenue)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-sm text-[#094488] hover:text-[#073a75] font-medium">View All Orders</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Order</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Customer</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.latest_orders.slice(0, 5).map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <tr key={order.order_id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-900">{order.user_name}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4 text-gray-400" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Buyers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
            <button className="text-sm text-[#094488] hover:text-[#073a75] font-medium">View All Customers</button>
          </div>

          <div className="space-y-4">
            {users.top_buyers.map((buyer, index) => (
              <div key={buyer.user_id} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#094488] bg-opacity-10 rounded-full flex items-center justify-center">
                  <span className="text-[#094488] font-medium text-sm">
                    {buyer.first_name.charAt(0)}{buyer.last_name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {buyer.first_name} {buyer.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{buyer.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(buyer.total_spent)}</p>
                  <p className="text-xs text-gray-500">{buyer.total_orders} orders</p>
                </div>
              </div>
            ))}

            {users.top_buyers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No customer data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Health & Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{products.total}</p>
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-xs text-green-600 mt-1">{products.active} active</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{users.total}</p>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-xs text-blue-600 mt-1">{users.verified_users} verified</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{reviews.total_reviews}</p>
            <p className="text-sm text-gray-600">Total Reviews</p>
            <p className="text-xs text-purple-600 mt-1">{reviews.average_rating.toFixed(1)} avg rating</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.total_categories}</p>
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-xs text-orange-600 mt-1">
              {products.categories.filter(c => c.product_count > 0).length} with products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;