import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  ChevronDown, 
  Star,
  Heart,
  Eye,
  ArrowUpDown,
  X,
  ImageIcon
} from 'lucide-react';
import api from '../auth/api';
import AddToCartButton from './customer/AddToCartButton';
import toast from 'react-hot-toast';

const ProductsOfCategory = () => {
  const { categorySlug } = useParams();
  const location = useLocation();
  const categoryData = location.state;

  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [favorites, setFavorites] = useState(new Set());

  // Filtering and sorting options
  const sortOptions = [
    { value: 'name', label: 'Name', order: 'asc' },
    { value: 'price', label: 'Price: Low to High', order: 'asc' },
    { value: 'price', label: 'Price: High to Low', order: 'desc' },
  ];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [categorySlug]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/v1/admin/list-categories');
      setCategories(response.data);
      
      // Find current category
      const current = response.data.find(cat => cat.slug === categorySlug);
      setCurrentCategory(current);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch all products and filter by category
      // In a real app, you'd have an endpoint like /api/v1/products/category/${categorySlug}
      const response = await api.get('/api/v1/user/activity/homepage');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by current category
  const getFilteredProducts = () => {
    if (!currentCategory) return [];
    
    let filtered = products.filter(product => {
      // Check if product belongs to current category or its subcategories
      if (product.category_id === currentCategory.id) return true;
      
      // Check if it's a subcategory product
      const productCategory = categories.find(cat => cat.id === product.category_id);
      if (productCategory && productCategory.parent_id === currentCategory.id) return true;
      
      return false;
    });

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product => {
      const price = product.pricing.discounted_price || product.pricing.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.pricing.discounted_price || a.pricing.price;
          bValue = b.pricing.discounted_price || b.pricing.price;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const handleSortChange = (option) => {
    setSortBy(option.value);
    setSortOrder(option.order);
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getFirstImage = (images) => {
    if (!images) return null;
    const imageArray = images.split(',');
    return imageArray[0]?.trim() || null;
  };

  const getProductImageUrl = (product) => {
    const firstImage = getFirstImage(product.images);
    if (firstImage) {
      return `${api.defaults.baseURL}/uploads/products/${firstImage}`;
    }
    return null;
  };

  const calculateDiscount = (original, discounted) => {
    if (!discounted || discounted >= original) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  const ProductCard = ({ product, viewMode }) => {
    const [imageError, setImageError] = useState(false);
    const discount = calculateDiscount(product.pricing.price, product.pricing.discounted_price);
    const finalPrice = product.pricing.discounted_price || product.pricing.price;
    const imageUrl = getProductImageUrl(product);

    if (viewMode === 'list') {
      return (
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="flex gap-4 p-4">
            {/* Image Container */}
            <div className="relative flex-shrink-0">
              {discount > 0 && (
                <div className="absolute top-1 left-1 bg-[#8ab43f] text-white px-2 py-1 rounded text-xs font-medium z-10">
                  {discount}% off
                </div>
              )}
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[#094488] line-clamp-2 cursor-pointer text-sm mb-2 hover:text-blue-600">
                {product.name}
              </h3>
              
              {/* Price */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(finalPrice)}
                  </span>
                  {product.pricing.discounted_price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.pricing.price)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      favorites.has(product.id) 
                        ? 'bg-red-100 text-red-500' 
                        : 'bg-gray-100 text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <AddToCartButton
                  productId={product.id}
                  size="medium"
                  variant="primary"
                  className="transform hover:scale-105 transition-transform duration-200"
                  onSuccess={() => toast.success(`${product.name} added to cart!`)}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Grid View
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200">
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="relative">
            <div className="absolute top-2 left-2 bg-[#8ab43f] text-white px-2 py-1 rounded text-xs font-medium z-10">
              {discount}% off
            </div>
          </div>
        )}
        
        {/* Image Container */}
        <div className="relative overflow-hidden cursor-pointer bg-white">
          <div className="aspect-square p-4">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
                <ImageIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Wishlist Button */}
          <button 
            onClick={() => toggleFavorite(product.id)}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 ${
              favorites.has(product.id) 
                ? 'bg-red-100 text-red-500' 
                : 'bg-white text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 border-t border-gray-100">
          {/* Product Name */}
          <h3 className="font-medium text-[#094488] line-clamp-2 cursor-pointer text-sm mb-2 hover:text-blue-600">
            {product.name}
          </h3>

          {/* Price */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(finalPrice)}
              </span>
              {product.pricing.discounted_price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.pricing.price)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <AddToCartButton
            productId={product.id}
            size="medium"
            variant="primary"
            className="w-full transform hover:scale-105 transition-transform duration-200"
            onSuccess={() => toast.success(`${product.name} added to cart!`)}
          />
        </div>
      </div>
    );
  };

  const filteredProducts = getFilteredProducts();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentCategory?.name || 'Category Products'}
        </h1>
        <p className="text-gray-600">
          {filteredProducts.length} products found
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [value, order] = e.target.value.split('-');
                  setSortBy(value);
                  setSortOrder(order);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={`${option.value}-${option.order}`} value={`${option.value}-${option.order}`}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'} hover:bg-gray-50 transition-colors rounded-l-lg`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'} hover:bg-gray-50 transition-colors rounded-r-lg border-l border-gray-300`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
          : 'space-y-4'
        }>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsOfCategory;