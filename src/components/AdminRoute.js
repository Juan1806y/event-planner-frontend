// src/components/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../utils/roleUtils';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth(); // ✅ Usar hook

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;