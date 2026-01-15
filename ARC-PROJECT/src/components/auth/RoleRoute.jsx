import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useArc } from './ArcContext';
import { useAuth } from '../../context/AuthContext';

const RoleRoute = ({ allow, children }) => {
  const { role, setActiveRole } = useArc();
  const { user, isAuthenticated } = useAuth();

  // Sync ArcContext role with AuthContext user role
  useEffect(() => {
    if (isAuthenticated && user && user.role && role !== user.role) {
      setActiveRole(user.role, user.name);
    }
  }, [isAuthenticated, user, role, setActiveRole]);

  // Check authentication first
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role matches the required role
  if (user.role !== allow) {
    return <Navigate to="/access" replace />;
  }

  // Ensure ArcContext role is set
  if (role !== allow && user.role === allow) {
    setActiveRole(allow, user.name);
  }

  return children;
};

export default RoleRoute;