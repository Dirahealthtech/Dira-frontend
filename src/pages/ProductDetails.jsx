import React, { useState, useEffect } from 'react';
import {Star,ShoppingCart,Heart,Share2,Truck,Shield,RefreshCw,Tag,Package,Zap,ChevronLeft,ChevronRight,Plus,Minus} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../auth/api';
import ProductReviews from './ProductReviews';
import { useParams } from 'react-router-dom';
import AddToCartButton from './customer/AddToCartButton';

const ProductDetails = () => {
  const { productSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);


  useEffect(() => {
    if (productSlug) {
      fetchProductDetails();
    }
  }, [productSlug]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/user/activity/product/${productSlug}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await api.get(`/api/v1/reviews/product/${product.id}`, {
        params: {
          skip: 0,
          limit: 1 // We only need the stats, not the actual reviews
        }
      });
      
      setReviewStats({
        total: response.data.total,
        averageRating: response.data.average_rating,
        ratingBreakdown: response.data.rating_breakdown
      });
    } catch (error) {
      console.error('Error fetching review stats:', error);
      // Don't show error toast here as it's not critical
    }
  };

  useEffect(() => {
    if (product?.id) {
      fetchReviewStats();
    }
  }, [product?.id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    try {
      setIsWishlisted(!isWishlisted);
      toast.success(
        isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'
      );
    } catch (error) {
      toast.error('Failed to update wishlist');
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description?.replace(/<[^>]*>/g, '').substring(0, 100),
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (!product?.pricing?.discounted_price || !product?.pricing?.price) return 0;
    return Math.round(
      ((product.pricing.price - product.pricing.discounted_price) / product.pricing.price) * 100
    );
  };

  const renderStars = (rating, total = 5) => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: total }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getProductImages = () => {
    if (!product?.images) return [];
      return product.images
    .split(',')
    .map(img => img.trim())
    .filter(img => img)
    .map(img => `https://app.dirahealthtech.co.ke/${img}`);
  };

  const images = getProductImages();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        {/* Product Main Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                <div className={`w-full h-full flex items-center justify-center text-gray-500 ${images.length > 0 ? 'hidden' : 'flex'}`}>
                  <div className="text-center">
                    <Package className="h-24 w-24 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">No image available</p>
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(
                        selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(
                        selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Discount Badge */}
                {getDiscountPercentage() > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    -{getDiscountPercentage()}%
                  </div>
                )}

                {/* Stock Status */}
                <div className="absolute top-4 right-4">
                  {product.inventory?.stock > 0 ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      In Stock
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full hidden items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {reviewStats ? (
                      <>
                        {renderStars(Math.round(reviewStats.averageRating || 0))}
                        <span className="text-sm text-gray-600">
                          ({reviewStats.averageRating?.toFixed(1) || '0.0'}) · {reviewStats.total} {reviewStats.total === 1 ? 'review' : 'reviews'}
                        </span>
                      </>
                    ) : (
                      <>
                        {renderStars(0)}
                        <span className="text-sm text-gray-600">No reviews yet</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  {product.pricing?.discounted_price ? (
                    <>
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(product.pricing.discounted_price)}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.pricing.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(product.pricing?.price || 0)}
                    </span>
                  )}
                </div>
                {product.pricing?.tax_rate != null && product.pricing.tax_rate > 0 && (
                  <p className="text-sm text-gray-600">
                    Inclusive of {product.pricing.tax_rate}% tax
                  </p>
                )}
              </div>

              {/* Key Specifications */}
              {product.metadata?.specifications && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Key Specifications</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(product.metadata.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{key}:</span>
                        <span className="text-sm font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Actions */}
              <div className="space-y-4">
                <AddToCartButton
                  productId={product.id}
                  initialQuantity={quantity}
                  showQuantityControls={true}
                  size="large"
                  variant="primary"
                  disabled={product.inventory?.stock === 0}
                  onSuccess={() => {
                    // Optional: Reset quantity or show success message
                    setQuantity(1);
                  }}
                  className="w-full"
                />

                <div className="flex space-x-3">
                  <button
                    onClick={handleWishlist}
                    className={`flex-1 p-3 rounded-xl border transition-colors ${
                      isWishlisted
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    } flex items-center justify-center space-x-2`}
                  >
                    <Heart className={isWishlisted ? 'h-5 w-5 fill-current' : 'h-5 w-5'} />
                    <span>{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 p-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Truck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                    <p className="text-xs text-gray-600">Within Nairobi</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.warranty?.period} {product.warranty?.unit} Warranty
                    </p>
                    <p className="text-xs text-gray-600">Official warranty</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 rounded-full p-2">
                    <RefreshCw className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-600">7-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fast Delivery</p>
                    <p className="text-xs text-gray-600">Same day delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Product Information */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 lg:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping Information
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Weight: {product.shipping?.weight || 'N/A'} kg</p>
                  <p>Dimensions: {product.shipping?.dimensions ? 
                    `${product.shipping.dimensions.length} × ${product.shipping.dimensions.width} × ${product.shipping.dimensions.height} ${product.shipping.dimensions.unit}` : 'N/A'}</p>
                  <p>Free shipping within Nairobi</p>
                  <p>Same day delivery available</p>
                </div>
              </div>

              {/* Warranty Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Warranty & Support
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    {product.warranty?.period} {product.warranty?.unit} manufacturer warranty
                  </p>
                  <p>{product.warranty?.description}</p>
                  <p>24/7 customer support</p>
                  <p>Professional installation available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 lg:px-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviews productId={product.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;