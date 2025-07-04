import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRoles } from './auth/AuthContext';

import Header from './common/Header';
import Login from './auth/Login';
import SignUp from './auth/SignUp';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import VerifyEmail from './auth/VerifyEmail';
import AdminLayout from './admin/AdminLayout';
import Profile from './pages/Profile';

// Placeholder components for routes
const Home = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Welcome to MedEquip Solutions</h1></div>;
const Products = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Products</h1></div>;
const Checkout = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Checkout</h1></div>;

// Protected Route Component with Role-Based Access Control
const ProtectedRoute = ({ children, allowedRoles = [], requireVerified = false }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if email verification is required
  if (requireVerified && !user.is_verified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Email Verification Required</h2>
          <p className="text-yellow-700">Please verify your email address to access this page.</p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-700">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Layout wrapper for non-admin routes
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-8">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Admin Routes - No header, uses its own layout */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={[UserRoles.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          } />
          
          {/* All other routes use the main layout with header */}
          <Route path="/*" element={
            <MainLayout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                
                {/* Protected Routes - Any authenticated user */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Customer-specific routes */}
                <Route path="/checkout" element={
                  <ProtectedRoute allowedRoles={[UserRoles.CUSTOMER]} requireVerified={true}>
                    <Checkout />
                  </ProtectedRoute>
                } />
                
                {/* Catch all - 404 */}
                <Route path="*" element={
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
                  </div>
                } />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;