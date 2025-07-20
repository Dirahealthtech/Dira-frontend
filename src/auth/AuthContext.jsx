import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from './api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext); 
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/api/v1/auth/user/me');
      setUser(response.data);
      
      setIsAuthenticated(true);
    } catch (error) {
      // Token might be expired, try to refresh
      await refreshToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/api/v1/auth/login', credentials);
      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      await loadUser();
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/api/v1/auth/signup', userData);
      toast.success(response.data.message || 'Account created successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Signup failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
      toast.success('Logged out successfully');
    } catch (error) {
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (!refresh_token) {
        throw new Error('No refresh token');
      }

      const response = await api.get('/api/v1/auth/refresh-token', {
        headers: {
          'Authorization': `Bearer ${refresh_token}`
        }
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      await loadUser();
      return true;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/api/v1/auth/reset-password', { email });
      toast.success(response.data.message || 'Password reset link sent to your email');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to send reset link';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, passwords) => {
    try {
      const response = await api.post(`/api/v1/auth/confirm-reset-password/${token}`, passwords);
      toast.success(response.data.message || 'Password reset successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to reset password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await api.get(`/api/v1/auth/verify-account/${token}`);
      toast.success(response.data.message || 'Email verified successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to verify email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const requestVerificationLink = async (email) => {
    try {
      const response = await api.post('/api/v1/auth/request-verification-link', { email });
      toast.success(response.data.message || 'Verification link sent to your email');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to send verification link';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    verifyEmail,
    requestVerificationLink,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};