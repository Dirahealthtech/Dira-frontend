import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600">
          This is your customer dashboard. More features coming soon.
        </p>
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/orders" element={<div>Orders Page - To be implemented</div>} />
      <Route path="/settings" element={<div>Settings Page - To be implemented</div>} />
      <Route path="*" element={<Navigate to="/account" replace />} />
    </Routes>
  );
};

export default CustomerDashboard;