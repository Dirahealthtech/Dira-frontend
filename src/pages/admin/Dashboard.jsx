import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import CategoryManagement from './CategoryManagement';
import ProductManagement from './ProductManagement';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
     
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="md:p-6 p-4 pt-16 md:pt-6">
            <Routes>
              <Route path="/" element={
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Dashboard management interface - To be implemented</p>
                    {/* Example of long content for testing scrolling */}
                    <div className="mt-4 space-y-4">
                      <p className="text-gray-600">This is sample content to test scrolling functionality.</p>
                    </div>
                  </div>
                </div>
              } />
              
              <Route path="/categories" element={
                <div className="space-y-6">
                  <CategoryManagement />
                </div>
              } />
              
              <Route path="/products" element={
                <div className="space-y-6">
                  <ProductManagement />
                </div>
              } />
              
              <Route path="/orders" element={
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Orders management interface - To be implemented</p>
                  </div>
                </div>
              } />
              
              <Route path="/users" element={
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Users management interface - To be implemented</p>
                  </div>
                </div>
              } />
              
              <Route path="/analytics" element={
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Analytics dashboard - To be implemented</p>
                  </div>
                </div>
              } />
              
              <Route path="/reports" element={
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Reports interface - To be implemented</p>
                  </div>
                </div>
              } />
              
              <Route path="/suppliers" element={
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Manage Suppliers</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Suppliers management interface - To be implemented</p>
                  </div>
                </div>
              } />
              
              <Route path="/settings" element={
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Admin settings interface - To be implemented</p>
                  </div>
                </div>
              } />
              
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;