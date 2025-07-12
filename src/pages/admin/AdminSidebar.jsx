// AdminSidebar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, BarChart3, FileText, Truck, Heart, ChevronLeft, ChevronRight} from 'lucide-react';

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/admin',
      exact: true
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

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    } min-h-screen border-r border-gray-200`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-[#094488] rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Admin Panel</span>
            </div>
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
      <nav className="p-4">
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
};

export default AdminSidebar;