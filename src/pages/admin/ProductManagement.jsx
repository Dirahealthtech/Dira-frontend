import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import toast from 'react-hot-toast';
import api from '../../auth/api';
import { Edit2, Trash2, Plus, Minus } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [filters, setFilters] = useState({
    name: '',
    category_id: '',
    is_active: '',
    skip: 0,
    limit: 20
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 0, page: 0 });
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    supplier_id: '',
    price: '',
    discounted_price: '',
    tax_rate: '',
    sku: '',
    stock: '',
    reorder_level: '',
    requires_prescription: false,
    is_active: true,
    weight: '',
    weight_unit: 'kg',
    dimensions_length: '',
    dimensions_width: '',
    dimensions_height: '',
    dimensions_unit: 'cm',
    warranty_period: '',
    warranty_unit: 'months',
    warranty_description: '',
    tags: '',
    specifications: [{ key: '', value: '' }], // Changed to array for key-value pairs
    images: []
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/api/v1/admin/list-products?${params}`);
      setProducts(response.data.items || []);
      setPagination({
        total: response.data.total || 0,
        pages: response.data.pages || 0,
        page: response.data.page || 0
      });
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/v1/admin/list-categories');
      setCategories(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      supplier_id: '',
      price: '',
      discounted_price: '',
      tax_rate: '',
      sku: '',
      stock: '',
      reorder_level: '',
      requires_prescription: false,
      is_active: true,
      weight: '',
      weight_unit: 'kg',
      dimensions_length: '',
      dimensions_width: '',
      dimensions_height: '',
      dimensions_unit: 'cm',
      warranty_period: '',
      warranty_unit: 'months',
      warranty_description: '',
      tags: '',
      specifications: [{ key: '', value: '' }],
      images: []
    });
    setEditingProduct(null);
    if (editorRef.current) {
      editorRef.current.setContent('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  // Handlers for specifications key-value pairs
  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const updateSpecification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }));
  };

  const validateForm = () => {
    const required = ['name', 'category_id', 'price', 'sku', 'stock'];
    for (let field of required) {
      if (!formData[field]) {
        toast.error(`${field.replace('_', ' ')} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const submitData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          value.forEach(file => submitData.append('images', file));
        } else if (key === 'specifications') {
          // Convert specifications array to JSON object
          const specsObj = {};
          value.forEach(spec => {
            if (spec.key && spec.value) {
              specsObj[spec.key] = spec.value;
            }
          });
          submitData.append('specifications', JSON.stringify(specsObj));
        } else if (value !== '' && value !== null && value !== undefined) {
          submitData.append(key, value);
        }
      });

      // Get description from TinyMCE
      if (editorRef.current) {
        submitData.set('description', editorRef.current.getContent());
      }

      let response;
      if (editingProduct) {
        response = await api.patch(`/api/v1/admin/products/${editingProduct.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        response = await api.post('/api/v1/admin/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }

      setIsFormOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    
    // Convert specifications object to array format
    let specificationsArray = [{ key: '', value: '' }];
    if (product.metadata?.specifications && typeof product.metadata.specifications === 'object') {
      specificationsArray = Object.entries(product.metadata.specifications).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      if (specificationsArray.length === 0) {
        specificationsArray = [{ key: '', value: '' }];
      }
    }

    setFormData({
      name: product.name || '',
      description: product.description || '',
      category_id: product.category_id || '',
      supplier_id: product.supplier_id || '',
      price: product.pricing?.price || '',
      discounted_price: product.pricing?.discounted_price || '',
      tax_rate: product.pricing?.tax_rate || '',
      sku: product.inventory?.sku || '',
      stock: product.inventory?.stock || '',
      reorder_level: product.inventory?.reorder_level || '',
      requires_prescription: product.inventory?.requires_prescription || false,
      is_active: product.inventory?.is_active !== undefined ? product.inventory.is_active : true,
      weight: product.shipping?.weight || '',
      weight_unit: product.shipping?.weight_unit || 'kg',
      dimensions_length: product.shipping?.dimensions?.length || '',
      dimensions_width: product.shipping?.dimensions?.width || '',
      dimensions_height: product.shipping?.dimensions?.height || '',
      dimensions_unit: product.shipping?.dimensions?.unit || 'cm',
      warranty_period: product.warranty?.period || '',
      warranty_unit: product.warranty?.unit || 'months',
      warranty_description: product.warranty?.description || '',
      tags: product.metadata?.tags?.join(', ') || '',
      specifications: specificationsArray,
      images: []
    });
    
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.setContent(product.description || '');
      }
    }, 100);
    
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      setLoading(true);
      await api.delete(`/api/v1/admin/products/${deleteModal.product.id}`);
      toast.success('Product deleted successfully');
      setDeleteModal({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      skip: 0 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      skip: newPage * prev.limit
    }));
  };

  return (
    <div className="min-h-screen bg-gray-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your product inventory</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              style={{ backgroundColor: '#094488' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="whitespace-nowrap">Add Product</span>
            </button>
          </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Product name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="is_active"
                value={filters.is_active}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Per Page</label>
              <select
                name="limit"
                value={filters.limit}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.inventory?.sku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {categories.find(c => c.id === product.category_id)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          KES {product.pricing?.price}
                          {product.pricing?.discounted_price && (
                            <div className="text-green-600 text-xs">
                              Sale: KES {product.pricing.discounted_price}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.inventory?.stock}</div>
                        {product.inventory?.reorder_level && product.inventory.stock <= product.inventory.reorder_level && (
                          <div className="text-red-600 text-xs">Low Stock</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.inventory?.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inventory?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, product })}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{pagination.page * filters.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min((pagination.page + 1) * filters.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const pageNum = i + Math.max(0, pagination.page - 2);
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description
                  </label>
                  <Editor
                    apiKey="0g0quw2xhiykrzmohzogh3ir35z2ddwhbp41y787gk2m0zaz"
                    onInit={(evt, editor) => editorRef.current = editor}
                    initialValue=""
                    init={{
                      height: 250,
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discounted Price
                    </label>
                    <input
                      type="number"
                      name="discounted_price"
                      value={formData.discounted_price}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      name="tax_rate"
                      value={formData.tax_rate}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Inventory Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Product SKU"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      name="reorder_level"
                      value={formData.reorder_level}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier ID
                    </label>
                    <input
                      type="number"
                      name="supplier_id"
                      value={formData.supplier_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Supplier ID"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping & Physical Properties Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Shipping & Physical Properties</h4>
                
                {/* Weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight Unit
                    </label>
                    <select
                      name="weight_unit"
                      value={formData.weight_unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="oz">Ounces (oz)</option>
                      <option value="lb">Pounds (lb)</option>
                    </select>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Length
                    </label>
                    <input
                      type="number"
                      name="dimensions_length"
                      value={formData.dimensions_length}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width
                    </label>
                    <input
                      type="number"
                      name="dimensions_width"
                      value={formData.dimensions_width}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height
                    </label>
                    <input
                      type="number"
                      name="dimensions_height"
                      value={formData.dimensions_height}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensions Unit
                    </label>
                    <select
                      name="dimensions_unit"
                      value={formData.dimensions_unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="mm">Millimeters (mm)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="m">Meters (m)</option>
                      <option value="in">Inches (in)</option>
                      <option value="ft">Feet (ft)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Warranty Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Warranty Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Period
                    </label>
                    <input
                      type="number"
                      name="warranty_period"
                      value={formData.warranty_period}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Unit
                    </label>
                    <select
                      name="warranty_unit"
                      value={formData.warranty_unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Description
                  </label>
                  <textarea
                    name="warranty_description"
                    value={formData.warranty_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe warranty terms and conditions..."
                  />
                </div>
              </div>

              {/* Metadata Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                
                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="electronics, mobile, smartphone, android"
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                {/* Specifications */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Specifications
                    </label>
                    <button
                      type="button"
                      onClick={addSpecification}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Specification
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.specifications.map((spec, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg bg-white">
                        <div>
                          <input
                            type="text"
                            value={spec.key}
                            onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                            placeholder="Specification name (e.g., Color, Material)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                            placeholder="Specification value (e.g., Blue, Cotton)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {formData.specifications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSpecification(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Add key-value pairs to describe product specifications (e.g., Color: Blue, Material: Cotton)
                  </p>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">Select multiple images for this product (JPG, PNG, WebP)</p>
                </div>
              </div>

              {/* Settings Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Settings</h4>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requires_prescription"
                      name="requires_prescription"
                      checked={formData.requires_prescription}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requires_prescription" className="ml-3 block text-sm text-gray-700">
                      <span className="font-medium">Requires Prescription</span>
                      <p className="text-gray-500">Check if this product requires a prescription to purchase</p>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-3 block text-sm text-gray-700">
                      <span className="font-medium">Product is Active</span>
                      <p className="text-gray-500">Uncheck to disable this product from being sold</p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 min-w-[120px]"
                  style={{ backgroundColor: loading ? '#94a3b8' : '#094488' }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingProduct ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-5">
                Delete Product
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{deleteModal.product?.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setDeleteModal({ open: false, product: null })}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement