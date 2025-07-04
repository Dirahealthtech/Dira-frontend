import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRoles } from './auth/AuthContext';

// Import components
import Header from './common/Header';
import Login from './auth/Login';
import SignUp from './auth/SignUp';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import VerifyEmail from './auth/VerifyEmail';
import AdminLayout from './admin/AdminLayout'

// Placeholder components for routes
const Home = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Welcome to MedEquip Solutions</h1></div>;
const Products = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Our Products</h1></div>;
const ProductDetail = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Product Detail</h1></div>;
const Cart = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Shopping Cart</h1></div>;
const Checkout = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Checkout</h1></div>;

const UserProfile = () => {
  const { user } = useAuth();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">User Profile</h1>
      <div className="mt-4">
        <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Verified:</strong> {user?.is_verified ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

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

// Service Tech Dashboard
const ServiceTechDashboard = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold">Service Technician Dashboard</h1>
  </div>
);

// Supplier Dashboard
const SupplierDashboard = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold">Supplier Dashboard</h1>
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="pt-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              
              {/* Protected Routes - Any authenticated user */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              
              {/* Customer-specific routes */}
              <Route path="/checkout" element={
                <ProtectedRoute allowedRoles={[UserRoles.CUSTOMER]} requireVerified={true}>
                  <Checkout />
                </ProtectedRoute>
              } />
              
              {/* Service Tech Routes */}
              <Route path="/service/*" element={
                <ProtectedRoute allowedRoles={[UserRoles.SERVICE_TECH]}>
                  <Routes>
                    <Route index element={<ServiceTechDashboard />} />
                    <Route path="requests" element={<div>Service Requests</div>} />
                    <Route path="schedule" element={<div>Service Schedule</div>} />
                    <Route path="inventory" element={<div>Parts Inventory</div>} />
                  </Routes>
                </ProtectedRoute>
              } />
              
              {/* Supplier Routes */}
              <Route path="/supplier/*" element={
                <ProtectedRoute allowedRoles={[UserRoles.SUPPLIER]}>
                  <Routes>
                    <Route index element={<SupplierDashboard />} />
                    <Route path="products" element={<div>Manage Products</div>} />
                    <Route path="orders" element={<div>Supplier Orders</div>} />
                    <Route path="inventory" element={<div>Inventory Management</div>} />
                  </Routes>
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={[UserRoles.ADMIN]}>
                  <AdminLayout />
                </ProtectedRoute>
              }/>
              
              {/* Catch all - 404 */}
              <Route path="*" element={
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;