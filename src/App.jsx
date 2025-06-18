import React, { useState, useContext, createContext, useEffect } from 'react';
import { ShoppingCart, User, Package, Search, Menu, X, ChevronDown, Plus, Minus, Star, Filter } from 'lucide-react';

// Auth Context
const AuthContext = createContext();
const CartContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token and set user
      setUser({ id: '1', email: 'user@example.com', role: 'customer' });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    localStorage.setItem('authToken', 'fake-token');
    setUser({ id: '1', email, role: 'customer' });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Cart Context
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      let newCart;
      
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity }];
      }
      
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Sample product data
const sampleProducts = [
  {
    id: 1,
    name: "Advanced Prosthetic Hand - Model X5",
    category: "Upper Limb",
    price: 2499.99,
    image: "https://images.unsplash.com/photo-1620287341056-49a2f1ab2fdc?w=400",
    description: "State-of-the-art prosthetic hand with advanced grip patterns",
    inStock: true,
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    name: "Carbon Fiber Running Blade",
    category: "Lower Limb",
    price: 3299.99,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400",
    description: "Lightweight carbon fiber blade for athletic activities",
    inStock: true,
    rating: 4.9,
    reviews: 89
  },
  {
    id: 3,
    name: "Prosthetic Knee Joint - FlexiKnee Pro",
    category: "Components",
    price: 1899.99,
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400",
    description: "Hydraulic knee joint with natural movement patterns",
    inStock: true,
    rating: 4.7,
    reviews: 67
  },
  {
    id: 4,
    name: "Silicone Prosthetic Liner",
    category: "Accessories",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
    description: "Comfortable silicone liner for all-day wear",
    inStock: true,
    rating: 4.6,
    reviews: 234
  },
  {
    id: 5,
    name: "Myoelectric Control System",
    category: "Electronics",
    price: 4999.99,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    description: "Advanced EMG control system for prosthetic devices",
    inStock: false,
    rating: 4.9,
    reviews: 45
  },
  {
    id: 6,
    name: "Prosthetic Foot - Natural Gait",
    category: "Lower Limb",
    price: 1599.99,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400",
    description: "Anatomically designed prosthetic foot",
    inStock: true,
    rating: 4.5,
    reviews: 156
  }
];

// Header Component
const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount, setIsCartOpen } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">ProstheticHub</h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">Shop</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">Categories</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">About</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Search className="h-5 w-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition relative"
            >
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition">
                  <User className="h-5 w-5 text-gray-600" />
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</a>
                  {user.role === 'admin' && (
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</a>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                Login
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="px-4 py-2 space-y-2">
            <a href="#" className="block py-2 text-gray-700 hover:text-blue-600">Home</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-blue-600">Shop</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-blue-600">Categories</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-blue-600">About</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-blue-600">Contact</a>
          </nav>
        </div>
      )}
    </header>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <span className="text-xs text-blue-600 font-semibold">{product.category}</span>
        <h3 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        
        <div className="mt-2 flex items-center">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
            <span className="ml-1 text-sm text-gray-400">({product.reviews})</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">${product.price}</span>
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className={`px-4 py-2 rounded-md transition ${
              product.inStock
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// Cart Drawer Component
const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-gray-600 text-sm">${item.price}</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="mx-3 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-xl">${cartTotal.toFixed(2)}</span>
            </div>
            <button
              className={`w-full py-3 rounded-md transition ${
                user
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Main Shop Component
const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Upper Limb', 'Lower Limb', 'Components', 'Accessories', 'Electronics'];

  const filteredProducts = sampleProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Advanced Prosthetic Solutions</h1>
          <p className="text-xl mb-8">Empowering mobility and independence with cutting-edge prosthetic technology</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for prosthetic devices, components, or accessories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md transition ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Price Range</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-700">Under $500</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-700">$500 - $1000</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-700">$1000 - $2500</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-700">Over $2500</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Availability</h3>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-gray-700">In Stock</span>
              </label>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Component
const Login = ({ onClose }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
      onClose && onClose();
    } else {
      // Handle registration
      console.log('Register:', email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Package className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLogin ? 'Sign in' : 'Register'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Revenue', value: '$45,231', change: '+12%' },
    { label: 'Orders Today', value: '23', change: '+5%' },
    { label: 'Active Products', value: '156', change: '0%' },
    { label: 'Customers', value: '1,234', change: '+8%' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['overview', 'products', 'orders', 'inventory', 'customers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #ORD-001
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          John Doe
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          $2,499.99
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Processing
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">View</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Product Management</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    Add New Product
                  </button>
                </div>
                <p className="text-gray-600">Manage your product catalog, update prices, and control inventory.</p>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Order Management</h2>
                <p className="text-gray-600">Process orders, update shipping status, and handle returns.</p>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Inventory Control</h2>
                <p className="text-gray-600">Track stock levels, set reorder points, and manage suppliers.</p>
              </div>
            )}

            {activeTab === 'customers' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Customer Management</h2>
                <p className="text-gray-600">View customer profiles, order history, and communication logs.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <Header />
          <CartDrawer />
          
          {showLogin ? (
            <Login onClose={() => setShowLogin(false)} />
          ) : showAdmin ? (
            <AdminDashboard />
          ) : (
            <Shop />
          )}
          
          {/* Footer */}
          <footer className="bg-gray-800 text-white py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">About ProstheticHub</h3>
                  <p className="text-gray-400 text-sm">
                    Your trusted marketplace for advanced prosthetic solutions, 
                    empowering independence and mobility.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#" className="hover:text-white">Shop</a></li>
                    <li><a href="#" className="hover:text-white">About Us</a></li>
                    <li><a href="#" className="hover:text-white">Contact</a></li>
                    <li><a href="#" className="hover:text-white">FAQs</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#" className="hover:text-white">Shipping Info</a></li>
                    <li><a href="#" className="hover:text-white">Returns</a></li>
                    <li><a href="#" className="hover:text-white">Warranty</a></li>
                    <li><a href="#" className="hover:text-white">Support</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Connect</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Stay updated with our latest products and offers
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="bg-gray-700 text-white px-3 py-2 rounded-md flex-1"
                    />
                    <button className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
                <p>&copy; 2024 ProstheticHub. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;