import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, checkAuth, hasChecked } = useAuthStore();
  const [loading, setLoading] = useState(!hasChecked);

  useEffect(() => {
    // Only check auth if we haven't checked yet
    if (!hasChecked) {
      const verifyAuth = async () => {
        await checkAuth();
        setLoading(false);
      };
      
      verifyAuth();
    } else {
      setLoading(false);
    }
  }, [checkAuth, hasChecked]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}