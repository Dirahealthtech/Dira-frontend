import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ImageIcon } from 'lucide-react';
import AddToCartButton from './customer/AddToCartButton';
import toast from 'react-hot-toast';
import api from '../auth/api';

const ProductCard = ({ 
  product, 
  viewMode = 'grid', // 'grid' or 'list'
  onFavoriteToggle,
  isFavorite = false,
  showDiscount = true,
  className = ""
}) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Helper functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getFirstImage = (images) => {
    if (!images) return null;
    const imageArray = images.split(',');
    return imageArray[0]?.trim() || null;
  };

  const getProductImageUrl = (product) => {
    if (!product.images) return null;

    // Split string by comma, take the first one, trim whitespace
    const firstImage = product.images.split(",")[0]?.trim();

    if (!firstImage) return null;

    // ✅ Build explicit URL (only filename is dynamic)
    return `http://localhost:8000/${firstImage}`;
  };

  const calculateDiscount = (originalPrice, discountedPrice) => {
    if (!discountedPrice || discountedPrice >= originalPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  const handleProductClick = () => {
    navigate(`/products/${product.slug}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(product.id);
    }
  };

  // Determine pricing structure (handle both formats from your components)
  const pricing = product.pricing || {
    price: product.price,
    discounted_price: product.discounted_price
  };

  const discount = showDiscount ? calculateDiscount(pricing.price, pricing.discounted_price) : 0;
  const finalPrice = pricing.discounted_price || pricing.price;
  const imageUrl = getProductImageUrl(product);

  // List View Component
  if (viewMode === 'list') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden ${className}`}>
        <div className="flex gap-4 p-4">
          {/* Image Container */}
          <div className="relative flex-shrink-0">
            {discount > 0 && (
              <div className="absolute top-1 left-1 bg-[#8ab43f] text-white px-2 py-1 rounded text-xs font-medium z-10">
                {discount}% off
              </div>
            )}
            <div 
              className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={handleProductClick}
            >
              {imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
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
            <h3 
              className="font-medium text-[#094488] line-clamp-2 cursor-pointer text-sm mb-2 hover:text-blue-600 transition-colors"
              onClick={handleProductClick}
            >
              {product.name}
            </h3>
            
            {/* Price */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(finalPrice)}
                </span>
                {pricing.discounted_price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(pricing.price)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFavoriteClick}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isFavorite 
                      ? 'bg-red-100 text-red-500' 
                      : 'bg-gray-100 text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
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

  // Grid View Component (default)
  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 ${className}`}>
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="relative">
          <div className="absolute top-2 left-2 bg-[#8ab43f] text-white px-2 py-1 rounded text-xs font-medium z-10">
            {discount}% off
          </div>
        </div>
      )}
      
      {/* Image Container */}
      <div 
        className="relative overflow-hidden cursor-pointer bg-white"
        onClick={handleProductClick}
      >
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
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 ${
            isFavorite 
              ? 'bg-red-100 text-red-500' 
              : 'bg-white text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 border-t border-gray-100">
        {/* Product Name */}
        <h3 
          className="font-medium text-[#094488] line-clamp-2 cursor-pointer text-sm mb-2 hover:text-blue-600 transition-colors"
          onClick={handleProductClick}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(finalPrice)}
            </span>
            {pricing.discounted_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(pricing.price)}
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

export default ProductCard;