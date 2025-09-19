import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Award, Users, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard'; // Import the new component
import toast from 'react-hot-toast';
import api from '../auth/api';

const Home = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomepageSections();
  }, []);

  const fetchHomepageSections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/homepage-sections');
      
      // Filter only active sections and sort by display_order
      const activeSections = response.data
        .filter(section => section.is_active)
        .sort((a, b) => a.display_order - b.display_order);
      
      setSections(activeSections);
    } catch (err) {
      console.error('Error fetching homepage sections:', err);
      setError('Failed to load products. Please try again later.');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section Skeleton */}
        <div className="bg-[#094488]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="animate-pulse space-y-6">
              <div className="h-16 bg-white/20 rounded-2xl mx-auto w-96"></div>
              <div className="h-8 bg-white/20 rounded-xl mx-auto w-128"></div>
            </div>
          </div>
        </div>
        
        {/* Products Loading */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse border border-gray-200">
                <div className="aspect-square bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <p className="text-gray-600 text-lg">{error}</p>
          <button
            onClick={fetchHomepageSections}
            className="bg-[#094488] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#094488] py-20 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Your Health, <span className="text-[#8ab43f]">Our Priority</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Discover our comprehensive range of prosthetic solutions, assistive devices, 
              and medical equipment. Quality healthcare technology made accessible.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <Award className="w-6 h-6 text-white" />
                <span className="text-white font-medium">Certified Quality</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <Users className="w-6 h-6 text-white" />
                <span className="text-white font-medium">Expert Support</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <ShoppingBag className="w-6 h-6 text-white" />
                <span className="text-white font-medium">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Sections */}
      <div className="bg-gray-50 py-8">
        {sections.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <div className="bg-white rounded-lg p-16 border border-gray-200 shadow-sm">
              <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-600 mb-4">No products available</h3>
              <p className="text-gray-500 text-lg">Check back soon for new products!</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 space-y-8">
            {sections.map((section, index) => (
              <section key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Section Header */}
                <div className="px-6 py-4 border-b border-[#B8D586]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#8ab43f]">{section.title}</h2>
                    <button className="flex items-center space-x-2 text-[#8ab43f] transition-colors group">
                      <span className="font-medium">View All</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="p-6">
                  {section.products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {section.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          viewMode="grid"
                          onFavoriteToggle={handleFavoriteToggle}
                          isFavorite={favorites.has(product.id)}
                          showDiscount={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No products in this section yet</p>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;