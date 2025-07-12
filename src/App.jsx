import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext';
import Header from './common/Header';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicRoute from './auth/PublicRoute';
import Login from './auth/Login';
import Signup from './auth/SignUp';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import VerifyEmail from './auth/VerifyEmail';
import CustomerDashboard from './pages/customer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#094488',
                color: '#fff',
                marginTop: '60px',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#8ab43f',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#8ab43f',
                  secondary: '#094488',
                },
              },
            }}
          />
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<div>Home Page - To be implemented</div>} />
              <Route path="/products" element={<div>Products Page - To be implemented</div>} />
              <Route path="/products/:id" element={<div>Product Detail - To be implemented</div>} />
              <Route path="/cart" element={<div>Shopping Cart - To be implemented</div>} />
              
              {/* Auth Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/api/v1/auth/confirm-reset-password/:token" element={<ResetPassword />} />
                <Route path="/api/v1/auth/verify-account/:token" element={<VerifyEmail />} />
              </Route>
              
              {/* Protected Customer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                <Route path="/account/*" element={<CustomerDashboard />} />
                <Route path="/checkout" element={<div>Checkout - To be implemented</div>} />
              </Route>
              
              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>
              
              {/* Protected Service Tech Routes */}
              <Route element={<ProtectedRoute allowedRoles={['service_tech']} />}>
                <Route path="/service/*" element={<div>Service Tech Dashboard - To be implemented</div>} />
              </Route>
              
              {/* Protected Supplier Routes */}
              <Route element={<ProtectedRoute allowedRoles={['supplier']} />}>
                <Route path="/supplier/*" element={<div>Supplier Dashboard - To be implemented</div>} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;