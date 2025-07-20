import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Folder, FolderOpen, Search, Save, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../auth/api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: null,
    is_active: true
  });
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/categories');
      setCategories(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = 'Failed to fetch categories';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create or update category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.patch(`/api/v1/admin/categories/${editingCategory.id}`, {
          ...formData,
          parent_id: formData.parent_id || null
        });
        toast.success('Category updated successfully!');
      } else {
        await api.post('/api/v1/admin/categories', {
          ...formData,
          parent_id: formData.parent_id || null
        });
        toast.success('Category created successfully!');
      }
      
      fetchCategories();
      resetForm();
    } catch (err) {
      const errorMessage = editingCategory ? 'Failed to update category' : 'Failed to create category';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Delete category
  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/admin/categories/${categoryToDelete.id}`);
      toast.success('Category deleted successfully!');
      fetchCategories();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      const errorMessage = 'Failed to delete category';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Show delete confirmation
  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // Edit category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id,
      is_active: category.is_active
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', description: '', parent_id: null, is_active: true });
    setEditingCategory(null);
    setShowForm(false);
  };

  // Toggle category expansion
  const toggleExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Build category tree
  const buildCategoryTree = (categories, parentId = null) => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get parent categories for dropdown
  const parentCategories = categories.filter(cat => cat.parent_id === null);

  // Render category tree
  const renderCategory = (category, level = 0) => {
    const subcategories = buildCategoryTree(categories, category.id);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="mb-2">
        <div 
          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
            category.is_active 
              ? 'bg-white border-gray-200 hover:border-blue-300' 
              : 'bg-gray-50 border-gray-300 opacity-70'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex items-center space-x-3">
            {hasSubcategories && (
              <button
                onClick={() => toggleExpansion(category.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {isExpanded ? (
                  <FolderOpen className="h-5 w-5" style={{ color: '#094488' }} />
                ) : (
                  <Folder className="h-5 w-5" style={{ color: '#094488' }} />
                )}
              </button>
            )}
            {!hasSubcategories && (
              <div className="w-7 h-7 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-gray-500">Slug: {category.slug}</span>
                {!category.is_active && (
                  <>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-red-500">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(category)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              style={{ color: '#094488' }}
              title="Edit category"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => confirmDelete(category)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {hasSubcategories && isExpanded && (
          <div className="mt-2">
            {subcategories.map(subcat => renderCategory(subcat, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-2 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="my-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Management</h1>
        <p className="text-gray-600">Organize your product categories with hierarchical structure</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ focusRingColor: '#094488' }}
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
          style={{ backgroundColor: '#094488' }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#094488' }}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#094488' }}
                >
                  <option value="">None (Top Level)</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#094488' }}
                placeholder="Enter category description"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
                style={{ accentColor: '#094488' }}
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{editingCategory ? 'Update' : 'Create'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Category</h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {categories.length} categories
          </p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderBottomColor: '#094488' }}></div>
              <p className="text-gray-600 mt-2">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No categories found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {buildCategoryTree(searchTerm ? filteredCategories : categories).map(category => 
                renderCategory(category)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;