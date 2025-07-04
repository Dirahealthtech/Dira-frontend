import React, { useState, useEffect, createContext, useContext } from 'react';

// Base URL for the backend
const BASE_URL = 'http://localhost:8000';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication utilities and API interceptor
class AuthAPI {
  constructor() {
    this.baseURL = `${BASE_URL}/api/v1`;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Helper method to decode JWT token
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Refresh token method
  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access_token);
      
      // Store user role from the new token
      const decodedToken = this.decodeToken(data.access_token);
      if (decodedToken && decodedToken.role) {
        localStorage.setItem('userRole', decodedToken.role);
      }
      
      return data.access_token;
    } catch (error) {
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
      throw error;
    }
  }

  // API request method with automatic token refresh
  async request(url, options = {}) {
    const makeRequest = async (token) => {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return fetch(url, {
        ...options,
        headers
      });
    };

    let response = await makeRequest(localStorage.getItem('accessToken'));

    // If unauthorized, try refreshing token
    if (response.status === 401) {
      try {
        const newToken = await this.refreshAccessToken();
        response = await makeRequest(newToken);
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    }

    return response;
  }

  // Auth specific methods
  async login(username, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    
    // Extract and store user role from access token
    const decodedToken = this.decodeToken(data.access_token);
    if (decodedToken && decodedToken.role) {
      localStorage.setItem('userRole', decodedToken.role);
    }
    
    return data;
  }

  async signup(userData) {
    // Map frontend field names to backend field names
    const backendUserData = {
      email: userData.email,
      first_name: userData.firstName || userData.first_name,
      last_name: userData.lastName || userData.last_name,
      phone_number: userData.phoneNumber || userData.phone_number,
      hashed_password: userData.password, // Backend expects hashed_password field
      role: userData.role || 'CUSTOMER' // Default role
    };

    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendUserData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Signup failed');
    }

    return response.json();
  }

  async logout() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
  }

  async getCurrentUser() {
    const response = await this.request(`${this.baseURL}/auth/user/me`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    
    // Ensure role is included from localStorage if not in response
    if (!userData.role && localStorage.getItem('userRole')) {
      userData.role = localStorage.getItem('userRole');
    }

    return userData;
  }

  async requestPasswordReset(email) {
    const response = await this.request(`${this.baseURL}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Failed to send reset email');
    }

    return response.json();
  }

  async resetPassword(token, newPassword, confirmPassword) {
    const response = await fetch(`${this.baseURL}/auth/confirm-reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_password: newPassword,
        confirm_new_password: confirmPassword
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Failed to reset password');
    }

    return response.json();
  }

  async verifyEmail(token) {
    const response = await fetch(`${this.baseURL}/auth/verify-account/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Verification failed');
    }

    return response.json();
  }

  async requestVerificationEmail(email) {
    const response = await this.request(`${this.baseURL}/auth/request-verification-link`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Failed to send verification email');
    }

    return response.json();
  }
}

// Create a singleton instance
export const authAPI = new AuthAPI();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await fetch(`${BASE_URL}/api/v1/auth/user/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            
            // Ensure role is included
            const storedRole = localStorage.getItem('userRole');
            if (!userData.role && storedRole) {
              userData.role = storedRole;
            }
            
            setUser(userData);
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userRole');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userRole');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Context login method that handles the full login flow
  const login = async (username, password) => {
    try {
      // Call the API login method
      const response = await authAPI.login(username, password);
      
      // Get user data after successful login
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Simplified context methods that don't conflict with AuthAPI
  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);
      // Refresh user data after verification
      if (user) {
        const updatedUser = await authAPI.getCurrentUser();
        setUser(updatedUser);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      return await authAPI.requestPasswordReset(email);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      return await authAPI.resetPassword(token, newPassword, confirmPassword);
    } catch (error) {
      throw error;
    }
  };

  const requestVerificationEmail = async (email) => {
    try {
      return await authAPI.requestVerificationEmail(email);
    } catch (error) {
      throw error;
    }
  };

  // Helper method to check user roles
  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAdmin = () => {
    return user?.role === UserRoles.ADMIN;
  };

  const isCustomer = () => {
    return user?.role === UserRoles.CUSTOMER;
  };

  const isServiceTech = () => {
    return user?.role === UserRoles.SERVICE_TECH;
  };

  const isSupplier = () => {
    return user?.role === UserRoles.SUPPLIER;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      login,
      signup,
      logout, 
      verifyEmail,
      requestPasswordReset,
      resetPassword,
      requestVerificationEmail,
      isLoading,
      hasRole,
      isAdmin,
      isCustomer,
      isServiceTech,
      isSupplier
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Validation utilities
export const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  password: (password) => {
    return {
      isValid: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      length: password.length
    };
  },
  
  phoneNumber: (phone) => {
    // Remove spaces and hyphens
    const cleaned = phone.replace(/[\s-]/g, '');
    // Basic international phone validation
    const re = /^\+?[1-9]\d{1,14}$/;
    return re.test(cleaned);
  },
  
  name: (name) => {
    return name.trim().length >= 2;
  }
};

// Format utilities
export const formatters = {
  phoneNumber: (phone) => {
    // Basic formatter for international phone numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
  }
};

// Error handler utility
export const handleAuthError = (error) => {
  console.error('Auth error:', error);
  
  // Handle specific error cases
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  }
  
  return error.message || 'An unexpected error occurred';
};

// User roles enum for frontend
export const UserRoles = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  SERVICE_TECH: 'service_tech',
  SUPPLIER: 'supplier'
};