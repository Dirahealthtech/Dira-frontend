// AdminSidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, BarChart3, FileText, Truck, Heart, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/admin',
      exact: true
    },
    { 
      icon: Package, 
      label: 'Categories', 
      path: '/admin/categories' 
    },
    { 
      icon: Package, 
      label: 'Products', 
      path: '/admin/products' 
    },
    { 
      icon: ShoppingCart, 
      label: 'Orders', 
      path: '/admin/orders' 
    },
    { 
      icon: Users, 
      label: 'Users', 
      path: '/admin/users' 
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      path: '/admin/analytics' 
    },
    { 
      icon: FileText, 
      label: 'Reports', 
      path: '/admin/reports' 
    },
    { 
      icon: Truck, 
      label: 'Suppliers', 
      path: '/admin/suppliers' 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/admin/settings' 
    }
  ];

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle swipe gestures
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRightSwipe && !mobileMenuOpen) {
      setMobileMenuOpen(true);
    } else if (isLeftSwipe && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Mobile Hamburger Menu Button (fixed position)
  const MobileMenuButton = () => (
    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      aria-label="Toggle menu"
    >
      {mobileMenuOpen ? (
        <X className="h-6 w-6 text-gray-600" />
      ) : (
        <Menu className="h-6 w-6 text-gray-600" />
      )}
    </button>
  );

  // Mobile Overlay
  const MobileOverlay = () => (
    mobileMenuOpen && (
      <div
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        onClick={() => setMobileMenuOpen(false)}
      />
    )
  );

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen border-r border-gray-200 flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 bg-[#094488] rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900">Admin Panel</span>
                  <p className="text-xs text-gray-500">← Back to site</p>
                </div>
              </Link>
            )}
            {isCollapsed && (
              <Link 
                to="/" 
                className="flex items-center justify-center hover:opacity-80 transition-opacity"
                title="Back to main site"
              >
                <div className="h-8 w-8 bg-[#094488] rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
              </Link>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-[#094488] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    );
  }

  // Mobile Sidebar
  return (
    <>
      <MobileMenuButton />
      <MobileOverlay />
      
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 pt-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="h-8 w-8 bg-[#094488] rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Admin Panel</span>
              <p className="text-xs text-gray-500">← Back to site</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 overflow-y-auto h-full pb-20">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-[#094488] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;