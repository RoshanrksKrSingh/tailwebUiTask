import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useSelector((state) => state.auth);

  // 1. If no user is logged in, redirect to Login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. If a specific role is required (e.g., "teacher") and user doesn't match, redirect
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // 3. If all checks pass, render the page
  return children;
};

export default ProtectedRoute;