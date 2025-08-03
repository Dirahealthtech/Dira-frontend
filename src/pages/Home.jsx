import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, ShoppingCart, Eye, Heart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../auth/api';

const Home = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    fetchHomepageSections();
  }, []);

  const fetchHomepageSections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/homepage-sections');
      setSections(response.data.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      toast.error('Failed to load homepage content. Please try again.');
      console.error('Error fetching homepage sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (slug) => {
    // Navigate to product detail page
    window.location.href = `/products/${slug}`;
  };

  const handleViewAllClick = (sectionTitle) => {
    // Navigate to section page
    const sectionSlug = sectionTitle.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/sections/${sectionSlug}`;
  };

  const getProductImage = (product) => {
    if (!product.images) {
      return null;
    }
    const firstImage = product.images.split(',')[0];
    return `http://localhost:8000/${firstImage}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateDiscount = (originalPrice, discountedPrice) => {
    if (!discountedPrice || discountedPrice >= originalPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  const ProductCard = ({ product }) => {
    const discountPercentage = calculateDiscount(product.price, product.discounted_price);
    const isOnSale = discountPercentage > 0;

    return (
      <div
        className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer transform hover:-translate-y-1"
        onMouseEnter={() => setHoveredProduct(product.id)}
        onMouseLeave={() => setHoveredProduct(null)}
        onClick={() => handleProductClick(product.slug)}
      >
        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{discountPercentage}%
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className={`absolute top-3 right-3 z-10 flex flex-col gap-2 transition-opacity duration-300 ${
          hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
        }`}>
          <button 
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Added to wishlist!');
            }}
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Quick view opened!');
            }}
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {getProductImage(product) ? (
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
          
          {/* Add to Cart Overlay */}
          <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
            hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
          }`}>
            <button 
              className="w-full bg-white text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                toast.success('Added to cart!');
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-900 transition-colors" style={{ '--hover-color': '#094488' }} onMouseEnter={(e) => e.target.style.color = '#094488'} onMouseLeave={(e) => e.target.style.color = ''}>
            {product.name}
          </h3>
          
          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-1">(24)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            {isOnSale ? (
              <>
                <span className="text-lg font-bold" style={{ color: '#8ab43f' }}>
                  {formatPrice(product.discounted_price)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-800">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, onViewAll }) => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
        <div className="w-16 h-1 rounded-full" style={{ backgroundColor: '#8ab43f' }}></div>
      </div>
      <button
        onClick={onViewAll}
        className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
        style={{ backgroundColor: '#094488' }}
      >
        View All
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white" style={{ backgroundColor: '#094488' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Discover Amazing Products
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Shop the latest trends and find exactly what you're looking for with our curated collections
            </p>
            <button className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors" style={{ color: '#094488' }}>
              Start Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {sections.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products available</h3>
            <p className="text-gray-500">Check back soon for exciting new arrivals!</p>
          </div>
        ) : (
          sections
            .filter(section => section.products && section.products.length > 0)
            .map((section) => (
              <section key={section.id} className="mb-20">
                <SectionHeader
                  title={section.title}
                  onViewAll={() => handleViewAllClick(section.title)}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                  {section.products.slice(0, 12).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
          ))
        )}
      </div>

      {/* Newsletter Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Stay Updated with Our Latest Offers
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about new arrivals, exclusive deals, and special promotions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium" style={{ backgroundColor: '#8ab43f' }}>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;