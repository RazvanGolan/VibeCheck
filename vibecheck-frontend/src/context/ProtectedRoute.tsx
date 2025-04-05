import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

    if (loading) {
        return <div className="loading">Loading...</div>;
      }

      if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} />;
      }
    
      return <>{children}</>;
};

export default ProtectedRoute;