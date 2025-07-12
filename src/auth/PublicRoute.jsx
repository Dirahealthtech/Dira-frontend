import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PublicRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    // Redirect based on user role
    const redirectPath = user?.role === 'admin' ? '/admin' : '/account';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;