import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, X, User, Mail, Phone, MapPin, Calendar,
  AlertCircle, CheckCircle, Shield, Ban, Trash2, Eye, EyeOff
} from 'lucide-react';
import api from '../../auth/api';

const UserEdit = ({ userId, onNavigate, onSave }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: 'customer',
    status: 'active',
    is_verified: false,
    date_of_birth: '',
    gender: '',
    preferred_language: 'en',
    notes: ''
  });

  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Kenya',
    is_default: false
  });

  const USER_ROLES = [
    { value: 'customer', label: 'Customer' },
    { value: 'admin', label: 'Admin' },
    { value: 'staff', label: 'Staff' }
  ];

  const USER_STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'banned', label: 'Banned' }
  ];

  const GENDER_OPTIONS = [
    { value: '', label: 'Not specified' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Swahili' }
  ];

  const fetchUser = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/api/v1/admin/users/${userId}`);
      const userData = response.data;

      setUser(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone_number: userData.phone_number || '',
        role: userData.role || 'customer',
        status: userData.status || 'active',
        is_verified: userData.is_verified || false,
        date_of_birth: userData.customer_profile?.date_of_birth || '',
        gender: userData.customer_profile?.gender || '',
        preferred_language: userData.customer_profile?.preferred_language || 'en',
        notes: userData.notes || ''
      });
      
      setAddresses(userData.shipping_addresses || []);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to fetch user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (index, field, value) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [field]: value
    };
    setAddresses(updatedAddresses);
  };

  const handleAddAddress = () => {
    setAddresses([...addresses, { ...newAddress, id: Date.now() }]);
    setNewAddress({
      name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Kenya',
      is_default: false
    });
  };

  const handleRemoveAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
  };

  const handleSetDefaultAddress = (index) => {
    const updatedAddresses = addresses.map((addr, i) => ({
      ...addr,
      is_default: i === index
    }));
    setAddresses(updatedAddresses);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        ...formData,
        customer_profile: {
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          preferred_language: formData.preferred_language
        },
        shipping_addresses: addresses
      };

      // Remove empty customer_profile fields
      if (!updateData.customer_profile.date_of_birth && !updateData.customer_profile.gender) {
        delete updateData.customer_profile;
      }

      const response = await api.put(`/api/v1/admin/users/${userId}`, updateData);
      setSuccess('User details updated successfully!');
      
      if (onSave) {
        onSave(response.data);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.detail || 'Failed to update user details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading user details...</span>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading User</h3>
        <p className="text-gray-600 mb-6">{error}</p>
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
            onClick={() => onNavigate(`/admin/customers/${userId}`)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit User: {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-sm text-gray-600">
              User ID: {user?.id} • Last updated: {new Date(user?.updated_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate(`/admin/customers/${userId}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {GENDER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language
                </label>
                <select
                  value={formData.preferred_language}
                  onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {LANGUAGE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {USER_ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {USER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Email Verified</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any notes about this customer..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Column - Addresses */}
        <div className="space-y-6">
          {/* Shipping Addresses */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Addresses</h3>
            
            <div className="space-y-4">
              {addresses.map((address, index) => (
                <div key={address.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={address.name}
                      onChange={(e) => handleAddressChange(index, 'name', e.target.value)}
                      placeholder="Address name (e.g., Home, Work)"
                      className="text-sm font-medium px-2 py-1 border border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-2">
                      {address.is_default && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          Default
                        </span>
                      )}
                      <button
                        onClick={() => handleSetDefaultAddress(index)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Set Default
                      </button>
                      <button
                        onClick={() => handleRemoveAddress(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <input
                      type="text"
                      value={address.address_line_1}
                      onChange={(e) => handleAddressChange(index, 'address_line_1', e.target.value)}
                      placeholder="Address Line 1"
                      className="px-2 py-1 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={address.address_line_2}
                      onChange={(e) => handleAddressChange(index, 'address_line_2', e.target.value)}
                      placeholder="Address Line 2 (Optional)"
                      className="px-2 py-1 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                      placeholder="City"
                      className="px-2 py-1 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                      placeholder="State/Province"
                      className="px-2 py-1 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={address.postal_code}
                      onChange={(e) => handleAddressChange(index, 'postal_code', e.target.value)}
                      placeholder="Postal Code"
                      className="px-2 py-1 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                      placeholder="Country"
                      className="px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
              
              {/* Add New Address */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Add New Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <input
                    type="text"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                    placeholder="Address name"
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <div></div>
                  <input
                    type="text"
                    value={newAddress.address_line_1}
                    onChange={(e) => setNewAddress({...newAddress, address_line_1: e.target.value})}
                    placeholder="Address Line 1"
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={newAddress.address_line_2}
                    onChange={(e) => setNewAddress({...newAddress, address_line_2: e.target.value})}
                    placeholder="Address Line 2 (Optional)"
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    placeholder="City"
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    placeholder="State/Province"
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={newAddress.postal_code}
                    onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                    placeholder="Postal Code"
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                    placeholder="Country"
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                </div>
                <button
                  onClick={handleAddAddress}
                  disabled={!newAddress.name || !newAddress.address_line_1 || !newAddress.city}
                  className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Address
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEdit;