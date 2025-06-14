import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';

import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { useProfile } from '@/hooks/useProfile';

import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { OnboardedRoute } from '@/components/OnboardedRoute';
import Dashboard from '@/pages/Dashboard';
import Conversation from '@/pages/Conversation';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import TherapistBrain from '@/pages/TherapistBrain';
import Onboarding from '@/pages/Onboarding';
import DataExport from '@/pages/DataExport';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ChangePassword from '@/pages/ChangePassword';
import NotFound from '@/pages/NotFound';

function App() {
  const { isAuthenticated } = useAuthStore();
  // Only fetch profile if authenticated
  const { data: profile, isLoading } = useProfile();
  const setProfile = useProfileStore((state) => state.setProfile);

  useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  // Show loading only for authenticated users
  if (isAuthenticated && isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        Loading...
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      
      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Container maxWidth="lg" sx={{ py: 4 }}>
                <Routes>
                  <Route
                    path="/"
                    element={<OnboardedRoute><Dashboard /></OnboardedRoute>}
                  />
                  <Route
                    path="/dashboard"
                    element={<OnboardedRoute><Dashboard /></OnboardedRoute>}
                  />
                  <Route
                    path="/conversation/:id"
                    element={<OnboardedRoute><Conversation /></OnboardedRoute>}
                  />
                  <Route
                    path="/history"
                    element={<OnboardedRoute><History /></OnboardedRoute>}
                  />
                  <Route
                    path="/profile"
                    element={<OnboardedRoute><Profile /></OnboardedRoute>}
                  />
                  <Route
                    path="/therapist-brain"
                    element={<OnboardedRoute><TherapistBrain /></OnboardedRoute>}
                  />
                  <Route
                    path="/export"
                    element={<OnboardedRoute><DataExport /></OnboardedRoute>}
                  />
                  <Route
                    path="/change-password"
                    element={<ChangePassword />}
                  />
                  <Route
                    path="/onboarding"
                    element={!profile ? <Onboarding /> : <Navigate to="/" />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Container>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;