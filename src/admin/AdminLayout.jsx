import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  Plus,
  FileText,
  DollarSign
} from 'lucide-react';

// Admin page components
const Dashboard = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm text-gray-500">Today</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">$12,426</h3>
        <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-sm text-gray-500">Today</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">58</h3>
        <p className="text-sm text-gray-600 mt-1">New Orders</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-sm text-gray-500">Total</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">1,429</h3>
        <p className="text-sm text-gray-600 mt-1">Active Customers</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Package className="w-6 h-6 text-yellow-600" />
          </div>
          <span className="text-sm text-gray-500">In Stock</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">847</h3>
        <p className="text-sm text-gray-600 mt-1">Products</p>
      </div>
    </div>
  </div>
);

const Products = () => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Products</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
        <Plus className="w-5 h-5" />
        <span>Add Product</span>
      </button>
    </div>
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <p className="text-gray-600">Product management interface will be implemented here.</p>
      </div>
    </div>
  </div>
);

const Orders = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <p className="text-gray-600">Order management interface will be implemented here.</p>
      </div>
    </div>
  </div>
);

const Customers = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <p className="text-gray-600">Customer management interface will be implemented here.</p>
      </div>
    </div>
  </div>
);

const Analytics = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <p className="text-gray-600">Analytics and reporting interface will be implemented here.</p>
      </div>
    </div>
  </div>
);

const AdminSettings = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <p className="text-gray-600">Admin settings interface will be implemented here.</p>
      </div>
    </div>
  </div>
);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'lg:w-64' : 'lg:w-20'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <h2 className={`text-xl font-semibold text-white ${!sidebarOpen && 'lg:hidden'}`}>
              Admin Panel
            </h2>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="text-gray-400 hover:text-white lg:hidden"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden text-gray-400 hover:text-white lg:block"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    active
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                    !sidebarOpen && 'lg:justify-center'
                  }`}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <Icon
                    className={`${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    } h-6 w-6 flex-shrink-0 ${sidebarOpen ? 'mr-3' : 'lg:mr-0'}`}
                  />
                  <span className={`${!sidebarOpen && 'lg:hidden'}`}>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-gray-800 p-4">
            <div className={`flex items-center ${!sidebarOpen && 'lg:justify-center'}`}>
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">A</span>
                </div>
              </div>
              <div className={`ml-3 ${!sidebarOpen && 'lg:hidden'}`}>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">View profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex h-16 items-center justify-between bg-white px-4 shadow lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-gray-700 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;