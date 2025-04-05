import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus, location]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
};

export default ProtectedRoute; 