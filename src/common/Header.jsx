import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, Heart, Search, Phone, ChevronDown } from 'lucide-react';

const Header = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const userMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  

  // Memoize expensive computations
  const dashboardLink = useMemo(() => {
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'customer':
        return '/account';
      case 'service_tech':
        return '/service';
      case 'supplier':
        return '/supplier';
      default:
        return '/';
    }
  }, [user?.role]);

  const isActive = useCallback((path) => {
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Stable handlers to prevent re-renders
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  }, [logout, navigate]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileSearch(false);
    }
  }, [searchQuery, navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen(prev => !prev);
  }, []);

  const toggleMobileSearch = useCallback(() => {
    setShowMobileSearch(prev => !prev);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.closest('[data-sidebar-trigger]')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
    setShowMobileSearch(false);
  }, [location.pathname]);

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 text-gray-600 hover:text-[#8ab43f] transition-colors"
              data-sidebar-trigger
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-[#094488] rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="hidden sm:block text-xl font-bold text-gray-900">
                  HealthCare Solutions
                </span>
                <span className="sm:hidden text-lg font-bold text-gray-900">
                  HCS
                </span>
              </Link>
            </div>

            {/* Search Bar - Desktop & Tablet */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8ab43f] focus:border-[#8ab43f] outline-none text-sm"
                  />
                </div>
              </form>
            </div>

            {/* Help Phone */}
            <div className="hidden lg:flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-1" />
              <a 
                href="tel:0712345678" 
                className="text-[#094488] hover:text-[#8ab43f] font-semibold ml-1"
              >
                0712345678
              </a>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Button - Mobile */}
              <button
                onClick={toggleMobileSearch}
                className="md:hidden p-2 text-gray-600 hover:text-[#8ab43f] transition-colors"
                aria-label="Search"
              >
                <Search className="h-6 w-6" />
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-[#8ab43f] transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#094488] text-white text-xs flex items-center justify-center">
                  0
                </span>
              </Link>

              {/* User Menu */}
              {!isLoading && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-1 p-2 text-gray-700 hover:text-[#8ab43f] transition-colors"
                    aria-label="User account"
                  >
                    <User className="h-6 w-6" />
                    <span className="hidden sm:block text-sm font-medium">
                      {user ? user.first_name : 'Account'}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                      {user ? (
                        <>
                          <Link
                            to={dashboardLink}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Dashboard
                          </Link>
                          <hr className="my-1" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-[#094488] hover:bg-gray-50 font-medium transition-colors"
                          >
                            Login
                          </Link>
                          <Link
                            to="/signup"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-[#094488] hover:bg-gray-50 font-medium transition-colors"
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="md:hidden pb-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8ab43f] focus:border-[#8ab43f] outline-none text-sm"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          )}
        </nav>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div
            ref={sidebarRef}
            className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link
                to="/"
                className="flex items-center space-x-2"
                onClick={() => setSidebarOpen(false)}
              >
                <div className="h-8 w-8 bg-[#094488] rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">HealthCare Solutions</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-600 hover:text-[#8ab43f] transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="p-4 flex-1">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    onClick={() => setSidebarOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${
                      isActive('/') && location.pathname === '/' ? 'bg-gray-100' : ''
                    }`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    onClick={() => setSidebarOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${
                      isActive('/products') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    onClick={() => setSidebarOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${
                      isActive('/cart') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Cart
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link
                      to={dashboardLink}
                      onClick={() => setSidebarOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${
                        isActive(dashboardLink) ? 'bg-gray-100' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* Help Section */}
            <div className="px-4 py-4 border-t border-gray-200 mt-auto">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <div>
                  <div className="font-medium">Need help?</div>
                  <a
                    href="tel:0712345678"
                    className="text-[#094488] hover:text-[#8ab43f] font-semibold"
                  >
                    Call: 0712345678
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;