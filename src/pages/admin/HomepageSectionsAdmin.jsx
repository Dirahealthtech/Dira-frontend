import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Check, AlertTriangle, Move } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../auth/api';

const HomepageSectionsAdmin = () => {
  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [displayOrderError, setDisplayOrderError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    display_order: '',
    is_active: true,
    product_ids: []
  });

  // Fetch sections
  const fetchSections = async () => {
    try {
      const response = await api.get('/api/v1/homepage-sections?active_only=false');
      const sortedSections = response.data.sort((a, b) => a.display_order - b.display_order);
      setSections(sortedSections);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  // Search products by name
  const searchProducts = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await api.get(`/api/v1/admin/list-products?name=${encodeURIComponent(searchTerm.trim())}`);
      setProducts(response.data.items || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Failed to search products:', error);
      toast.error('Failed to search products');
      setProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Validate display order
  const validateDisplayOrder = (value, excludeCurrentSection = false) => {
    if (value === '') {
      setDisplayOrderError('');
      return true;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setDisplayOrderError('Display order must be a number');
      return false;
    }

    if (numValue < 0) {
      setDisplayOrderError('Display order must be 0 or greater');
      return false;
    }

    // Check for duplicates
    const existingSections = excludeCurrentSection && editingSection 
      ? sections.filter(s => s.id !== editingSection.id)
      : sections;
    
    const isDuplicate = existingSections.some(section => section.display_order === numValue);
    
    if (isDuplicate) {
      setDisplayOrderError(`Display order ${numValue} is already used by another section`);
      return false;
    }

    setDisplayOrderError('');
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate display order before submission
    const displayOrderValue = formData.display_order === '' ? 0 : parseInt(formData.display_order);
    if (!validateDisplayOrder(displayOrderValue, true)) {
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      display_order: displayOrderValue,
      product_ids: selectedProducts.map(p => p.id)
    };

    try {
      if (editingSection) {
        await api.patch(`/api/v1/homepage-sections/admin/${editingSection.id}`, payload);
        toast.success('Section updated successfully');
      } else {
        await api.post('/api/v1/homepage-sections/admin', payload);
        toast.success('Section created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchSections();
    } catch (error) {
      if (error.response?.status === 422) {
        const errors = error.response.data.detail;
        if (Array.isArray(errors)) {
          errors.forEach(err => toast.error(err.msg));
        } else {
          toast.error(error.response.data.detail);
        }
      } else {
        toast.error(error.response?.data?.detail || 'Operation failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/homepage-sections/admin/${deletingSection.id}`);
      toast.success('Section deleted successfully');
      setShowDeleteModal(false);
      setDeletingSection(null);
      fetchSections();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete section');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      display_order: '',
      is_active: true,
      product_ids: []
    });
    setSelectedProducts([]);
    setEditingSection(null);
    setSearchQuery('');
    setProducts([]);
    setHasSearched(false);
    setDisplayOrderError('');
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, display_order: sections.length.toString() }));
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (section) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      description: section.description,
      display_order: section.display_order.toString(),
      is_active: section.is_active,
      product_ids: section.products?.map(p => p.id) || []
    });
    setSelectedProducts(section.products || []);
    setSearchQuery('');
    setProducts([]);
    setHasSearched(false);
    setDisplayOrderError('');
    setShowModal(true);
  };

  // Handle product search with debouncing
  const handleProductSearch = (query) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Set new timeout for debounced search
    window.searchTimeout = setTimeout(() => {
      searchProducts(query);
    }, 500);
  };

  // Toggle product selection
  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Remove selected product
  const removeSelectedProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Homepage Sections</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage sections that appear on your homepage</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#094488] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#073a75] transition-colors w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span className="whitespace-nowrap">Add Section</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="grid gap-6">
        {sections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 mb-4">
              <Move className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-600 mb-4">Create your first homepage section to get started</p>
            <button
              onClick={openCreateModal}
              className="bg-[#094488] text-white px-6 py-2 rounded-lg hover:bg-[#073a75] transition-colors"
            >
              Create Section
            </button>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                    <span className="text-sm text-gray-500">Order: {section.display_order}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      section.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {section.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{section.description}</p>
                  <div className="text-sm text-gray-500">
                    {section.products?.length || 0} products assigned
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => openEditModal(section)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingSection(section);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Products Preview */}
              {section.products && section.products.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Products:</h4>
                  <div className="flex flex-wrap gap-2">
                    {section.products.slice(0, 5).map((product) => (
                      <span
                        key={product.id}
                        className="px-3 py-1 bg-[#094488] bg-opacity-10 text-[#094488] rounded-full text-sm"
                      >
                        {product.name}
                      </span>
                    ))}
                    {section.products.length > 5 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        +{section.products.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSection ? 'Edit Section' : 'Create New Section'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094488] focus:border-transparent"
                    placeholder="e.g., Top Selling Items"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="text"
                    value={formData.display_order}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string or numbers only
                      if (value === '' || /^\d+$/.test(value)) {
                        setFormData(prev => ({ ...prev, display_order: value }));
                        validateDisplayOrder(value, true);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#094488] focus:border-transparent ${
                      displayOrderError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {displayOrderError && (
                    <p className="text-red-600 text-xs mt-1">{displayOrderError}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094488] focus:border-transparent"
                  placeholder="Brief description of this section"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-[#094488] focus:ring-[#094488] border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                  Active (visible on homepage)
                </label>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search & Assign Products
                </label>
                
                {/* Search Products */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    placeholder="Search products by name (minimum 2 characters)..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094488] focus:border-transparent"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#094488]"></div>
                    </div>
                  )}
                </div>

                {/* Selected Products */}
                {selectedProducts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Selected Products ({selectedProducts.length})
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                      {selectedProducts.map((product) => (
                        <span
                          key={product.id}
                          className="inline-flex items-center px-3 py-1 bg-[#094488] text-white rounded-full text-sm"
                        >
                          {product.name}
                          <button
                            type="button"
                            onClick={() => removeSelectedProduct(product.id)}
                            className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {hasSearched && (
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#094488] mx-auto mb-2"></div>
                        Searching products...
                      </div>
                    ) : products.length > 0 ? (
                      products.map((product) => {
                        const isSelected = selectedProducts.find(p => p.id === product.id);
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => toggleProductSelection(product)}
                            className={`w-full text-left p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 flex items-center justify-between transition-colors ${
                              isSelected ? 'bg-blue-50 border-l-4 border-l-[#094488]' : ''
                            }`}
                          >
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">SKU: {product.inventory?.sku || 'N/A'}</div>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-[#094488]" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No products found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}

                {!hasSearched && searchQuery.length === 0 && (
                  <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      Start typing to search for products to add to this section
                    </p>
                  </div>
                )}

                {!hasSearched && searchQuery.length > 0 && searchQuery.length < 2 && (
                  <div className="border border-gray-200 rounded-lg p-4 text-center bg-yellow-50">
                    <p className="text-yellow-700 text-sm">
                      Please enter at least 2 characters to search
                    </p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || displayOrderError !== ''}
                  className="px-6 py-2 bg-[#094488] text-white rounded-lg hover:bg-[#073a75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>
                    {submitting 
                      ? (editingSection ? 'Updating...' : 'Creating...') 
                      : (editingSection ? 'Update Section' : 'Create Section')
                    }
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Section</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the section "{deletingSection.title}"? 
                This will remove it from the homepage permanently.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingSection(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageSectionsAdmin;