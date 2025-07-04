import React, { useState } from 'react';

const Products = () => {
  // Mock data for demonstration
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const loading = false;
  
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden'];
  
  const mockProducts = [
    {
      id: 1,
      name: 'Wireless Headphones',
      category: 'Electronics',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 299.99,
      image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Headphones',
      stock: 15
    },
    {
      id: 2,
      name: 'Cotton T-Shirt',
      category: 'Clothing',
      description: 'Comfortable 100% cotton t-shirt in various colors',
      price: 29.99,
      image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=T-Shirt',
      stock: 3
    },
    {
      id: 3,
      name: 'JavaScript Book',
      category: 'Books',
      description: 'Learn modern JavaScript with practical examples',
      price: 49.99,
      image: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Book',
      stock: 0
    },
    {
      id: 4,
      name: 'Garden Tools Set',
      category: 'Home & Garden',
      description: 'Complete set of essential garden tools',
      price: 89.99,
      image: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Tools',
      stock: 8
    }
  ];

  const [cartItems, setCartItems] = useState([]);

  const getFilteredProducts = () => {
    let filtered = mockProducts;
    
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default: // name
          return a.name.localeCompare(b.name);
      }
    });
    
    return filtered;
  };

  const addToCart = (product) => {
    if (!isInCart(product.id)) {
      setCartItems([...cartItems, product]);
    }
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setSortBy('name');
  };

  const filteredProducts = getFilteredProducts();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Products</h1>
          <p className="text-gray-600 text-lg">Discover our amazing collection of products</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-w-[150px] px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-[150px] px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <button 
              onClick={clearFilters} 
              className="px-6 py-3 bg-gray-600 text-white border-none rounded-md cursor-pointer font-medium hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>

          <div className="text-gray-600 font-medium">
            <span>{filteredProducts.length} products found</span>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <a href={`/product/${product.id}`} className="block no-underline text-inherit">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-48 object-cover"
                    />
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Only {product.stock} left!
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-sm text-blue-600 mb-2 font-medium">{product.category}</p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="text-xl font-bold text-gray-800">${product.price.toFixed(2)}</div>
                  </div>
                </a>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      product.stock === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : isInCart(product.id)
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 
                      ? 'Out of Stock' 
                      : isInCart(product.id) 
                        ? 'Added to Cart' 
                        : 'Add to Cart'
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button 
              onClick={clearFilters} 
              className="px-6 py-3 bg-gray-600 text-white border-none rounded-md cursor-pointer font-medium hover:bg-gray-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;