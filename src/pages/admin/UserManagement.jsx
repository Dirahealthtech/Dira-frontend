import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Search, Filter, Download, RefreshCw, Eye, Ban, Shield, Trash2, UserCheck, AlertTriangle, Clock, CheckCircle, XCircle, User, X } from 'lucide-react';
import api from '../../auth/api';

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedVerification, setSelectedVerification] = useState(searchParams.get('verified') || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState(null);
  const [banReason, setBanReason] = useState('');

  // Pagination and filtering
  const USERS_PER_PAGE = 20;

  const USER_ROLES = {
    customer: { label: 'Customer', color: 'bg-blue-100 text-blue-800' },
    admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
    staff: { label: 'Staff', color: 'bg-green-100 text-green-800' }
  };

  const USER_STATUSES = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    banned: { label: 'Banned', color: 'bg-red-100 text-red-800', icon: XCircle },
    inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: Clock }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        skip: (currentPage - 1) * USERS_PER_PAGE,
        limit: USERS_PER_PAGE,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedRole !== 'all') params.append('role', selectedRole);
      if (selectedVerification !== 'all') params.append('is_verified', selectedVerification === 'verified');

      const response = await api.get(`/api/v1/admin/users/?${params}`);
      const data = response.data;

      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedRole, selectedVerification]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
    fetchUsers();
  }, [searchTerm, searchParams, setSearchParams, fetchUsers]);

  const handleFilterChange = useCallback((filterType, value) => {
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);

    if (filterType === 'role') {
      setSelectedRole(value);
      if (value === 'all') {
        params.delete('role');
      } else {
        params.set('role', value);
      }
    } else if (filterType === 'verification') {
      setSelectedVerification(value);
      if (value === 'all') {
        params.delete('verified');
      } else {
        params.set('verified', value);
      }
    } else if (filterType === 'status') {
      setSelectedStatus(value);
      if (value === 'all') {
        params.delete('status');
      } else {
        params.set('status', value);
      }
    }

    setSearchParams(params);
    fetchUsers();
  }, [searchParams, setSearchParams, fetchUsers]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleViewUser = useCallback((userId) => {
    navigate(`/admin/customers/${userId}`);
  }, [navigate]);

  const handleBanUser = useCallback(async (userId, reason = '') => {
    setActionLoading(userId);
    try {
      await api.post(`/api/v1/admin/users/${userId}/ban`, {
        reason: reason || 'Account banned by administrator',
        ban_duration_days: null // Permanent ban
      });
      fetchUsers();
      setShowBanModal(false);
      setSelectedUserForAction(null);
      setBanReason('');
    } catch (err) {
      console.error('Error banning user:', err);
      setError('Failed to ban user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }, [fetchUsers]);

  const handleUnbanUser = useCallback(async (userId) => {
    setActionLoading(userId);
    try {
      await api.post(`/api/v1/admin/users/${userId}/unban`);
      fetchUsers();
    } catch (err) {
      console.error('Error unbanning user:', err);
      setError('Failed to unban user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }, [fetchUsers]);

  const handleDeleteUser = useCallback(async (userId) => {
    setActionLoading(userId);
    try {
      await api.delete(`/api/v1/admin/users/${userId}`);
      fetchUsers();
      setShowDeleteModal(false);
      setSelectedUserForAction(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }, [fetchUsers]);

  const handleBanClick = useCallback((user) => {
    setSelectedUserForAction(user);
    setShowBanModal(true);
  }, []);

  const handleDeleteClick = useCallback((user) => {
    setSelectedUserForAction(user);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmBan = useCallback(() => {
    if (selectedUserForAction) {
      handleBanUser(selectedUserForAction.id, banReason);
    }
  }, [selectedUserForAction, banReason, handleBanUser]);

  const handleConfirmDelete = useCallback(() => {
    if (selectedUserForAction) {
      handleDeleteUser(selectedUserForAction.id);
    }
  }, [selectedUserForAction, handleDeleteUser]);

  const handleSelectUser = useCallback((userId, isSelected) => {
    const newSelected = new Set(selectedUsers);
    if (isSelected) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setShowBulkActions(newSelected.size > 0);
  }, [selectedUsers]);

  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedUsers(new Set(users.map(user => user.id)));
      setShowBulkActions(true);
    } else {
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    }
  }, [users]);

  const exportUsers = useCallback(async () => {
    setError('Export functionality is not available yet.');
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage customer accounts and user data</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportUsers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchUsers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.is_verified).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Banned</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'banned').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-6">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedRole}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>

            <select
              value={selectedVerification}
              onChange={(e) => handleFilterChange('verification', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="From date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Activity</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="">Any time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="quarter">This quarter</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                Ban Selected
              </button>
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                Export Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Users Table with Separated Columns */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedUsers.size === users.length && users.length > 0}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const userStatus = USER_STATUSES[user.status] || USER_STATUSES.active;
                const userRole = USER_ROLES[user.role] || USER_ROLES.customer;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name || 'N/A'}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.last_name || 'N/A'}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.phone_number || 'No phone'}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userRole.color}`}>
                        {userRole.label}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${userStatus.color}`}>
                        <userStatus.icon className="w-3 h-3 mr-1" />
                        {userStatus.label}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {user.is_verified ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          No
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {user.total_orders || 0}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatPrice(user.total_spent || 0)}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(user.last_order_date)}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(user.last_login)}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(user.created_at)}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {user.status === 'banned' ? (
                          <button
                            onClick={() => handleUnbanUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 p-1 rounded hover:bg-green-50"
                            title="Unban User"
                          >
                            {actionLoading === user.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanClick(user)}
                            disabled={actionLoading === user.id || user.role === 'admin'}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1 rounded hover:bg-red-50"
                            title={user.role === 'admin' ? 'Cannot ban admin' : 'Ban User'}
                          >
                            {actionLoading === user.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteClick(user)}
                          disabled={actionLoading === user.id || user.role === 'admin'}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1 rounded hover:bg-red-50"
                          title={user.role === 'admin' ? 'Cannot delete admin' : 'Delete User'}
                        >
                          {actionLoading === user.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedRole !== 'all' || selectedVerification !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'No users have been registered yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg border">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * USERS_PER_PAGE + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * USERS_PER_PAGE, totalUsers)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{totalUsers}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Ban User</h3>
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUserForAction(null);
                    setBanReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Are you sure you want to ban <strong>{selectedUserForAction?.first_name} {selectedUserForAction?.last_name}</strong>?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  This will prevent them from accessing their account.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for ban (optional)
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Enter reason for banning this user..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUserForAction(null);
                    setBanReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBan}
                  disabled={actionLoading === selectedUserForAction?.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 flex items-center"
                >
                  {actionLoading === selectedUserForAction?.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Ban className="w-4 h-4 mr-2" />
                  )}
                  Ban User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUserForAction(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Are you sure?</h4>
                    <p className="text-sm text-gray-500">This action cannot be undone.</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  You are about to permanently delete the user:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {selectedUserForAction?.first_name} {selectedUserForAction?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedUserForAction?.email}</p>
                </div>

                <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">Warning</h4>
                      <p className="text-sm text-red-700">
                        This will permanently delete all user data including orders, reviews, and account information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUserForAction(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={actionLoading === selectedUserForAction?.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 flex items-center"
                >
                  {actionLoading === selectedUserForAction?.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;























// this is the user responses when banned and when not banned:banned:
// {
//     "id": 2,
//     "first_name": "Omar",
//     "last_name": "Abdullahi",
//     "email": "omarmahat702@gmail.com",
//     "phone_number": "+254725375325",
//     "role": "customer",
//     "is_verified": false,
//     "status": "active",
//     "created_at": "2025-09-15T13:46:48.226187Z",
//     "updated_at": "2025-09-20T14:50:00.543005Z",
//     "total_orders": 2,
//     "total_spent": 4.0,
//     "last_order_date": "2025-09-15T13:49:15.977891",
//     "last_login": null,
//     "customer_profile": null,
//     "recent_orders": [
//         {
//             "id": 5,
//             "order_number": "ORDER-460B5939",
//             "status": "shipped",
//             "total": 2.0,
//             "payment_status": "pending",
//             "created_at": "2025-09-15T13:49:15.977891",
//             "items_count": 1
//         },
//         {
//             "id": 4,
//             "order_number": "ORDER-7BB8E127",
//             "status": "pending",
//             "total": 2.0,
//             "payment_status": "pending",
//             "created_at": "2025-09-15T13:48:09.717047",
//             "items_count": 1
//         }
//     ],
//     "total_reviews": 0,
//     "account_created": "2025-09-15T13:46:48.226187Z",
//     "shipping_addresses": []
// }not banned: 
// {
//     "id": 2,
//     "first_name": "Omar",
//     "last_name": "Abdullahi",
//     "email": "omarmahat702@gmail.com",
//     "phone_number": "+254725375325",
//     "role": "customer",
//     "is_verified": true,
//     "status": "active",
//     "created_at": "2025-09-15T13:46:48.226187Z",
//     "updated_at": "2025-09-20T14:51:43.928261Z",
//     "total_orders": 2,
//     "total_spent": 4.0,
//     "last_order_date": "2025-09-15T13:49:15.977891",
//     "last_login": null,
//     "customer_profile": null,
//     "recent_orders": [
//         {
//             "id": 5,
//             "order_number": "ORDER-460B5939",
//             "status": "shipped",
//             "total": 2.0,
//             "payment_status": "pending",
//             "created_at": "2025-09-15T13:49:15.977891",
//             "items_count": 1
//         },
//         {
//             "id": 4,
//             "order_number": "ORDER-7BB8E127",
//             "status": "pending",
//             "total": 2.0,
//             "payment_status": "pending",
//             "created_at": "2025-09-15T13:48:09.717047",
//             "items_count": 1
//         }
//     ],
//     "total_reviews": 0,
//     "account_created": "2025-09-15T13:46:48.226187Z",
//     "shipping_addresses": []
// }EditLooking at your API responses, I can see the issue. The banned and not banned users both have "status": "active", so the ban status is not determined by the status field.
// Comparing the two responses, I notice that the only difference is:

// Banned user: "is_verified": false
// Not banned user: "is_verified": true

// However, this doesn't seem right either because is_verified should indicate email verification, not ban status.
// Looking at both responses, I don't see any field that clearly indicates ban status (no is_banned, banned_at, ban_status, or similar field). This suggests that either:

// The API response doesn't include the ban status information in the user list endpoint
// There's a separate field that should be present but isn't showing in your examples
// The ban information might only be available in the detailed user endpoint, not the list endpoint

// You would need to check with your backend API documentation or inspect what fields are actually returned when you call the ban/unban endpoints to see what field indicates the ban status.