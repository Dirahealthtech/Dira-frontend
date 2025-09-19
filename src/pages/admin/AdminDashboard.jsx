import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {LayoutDashboard,Users,Package,ShoppingCart,BarChart3,Settings,LogOut,Menu,X,Home,Bell,Search,ChevronDown,Eye,Edit,Trash2,Plus,Filter,Download,RefreshCw,TrendingUp,TrendingDown,DollarSign,Package2,UserCheck} from 'lucide-react';
import ProductManagement from "./ProductManagement"
import CategoryManagement from "./CategoryManagement"
import HomepageSectionsAdmin from './HomepageSectionsAdmin';
import OrderManagement from './OrderManagement';

// Admin Dashboard Main Component
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const toggleProfileMenu = useCallback(() => {
    setProfileMenuOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  const handleBackToSite = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
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

  const sidebarItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/categories', icon: LayoutDashboard, label: 'Categories', exact: true },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/sections', icon: Package, label: 'Home Sections' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const isActivePath = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#094488] rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path, item.exact);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#094488] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-4"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {location.pathname === '/admin' ? 'Dashboard Overview' : 
               location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToSite}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Site
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<>Hello </>} />
            <Route path="/users" element={<>Hello </>} />
            <Route path="/categories" element={<CategoryManagement /> } />
            <Route path="/products" element={<ProductManagement /> } />
            <Route path="/sections" element={<HomepageSectionsAdmin /> } />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/analytics" element={<>Hello </>} />
            <Route path="/settings" element={<>Hello </>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
export default AdminDashboard;