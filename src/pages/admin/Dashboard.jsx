import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Bashboard management interface - To be implemented</p>
              </div>
            </div>
          } />
          <Route path="/products" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Manage Products</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Products management interface - To be implemented</p>
              </div>
            </div>
          } />
          <Route path="/orders" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Manage Orders</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Orders management interface - To be implemented</p>
              </div>
            </div>
          } />
          <Route path="/users" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Manage Users</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Users management interface - To be implemented</p>
              </div>
            </div>
          } />
          <Route path="/analytics" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Analytics dashboard - To be implemented</p>
              </div>
            </div>
          } />
          <Route path="/reports" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Reports interface - To be implemented</p>
              </div>
            </div>
          } />
          <Route path="/suppliers" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Manage Suppliers</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Suppliers management interface - To be implemented</p>
              </div>
            </div>
          } />
          <Route path="/settings" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Settings</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Admin settings interface - To be implemented</p>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;