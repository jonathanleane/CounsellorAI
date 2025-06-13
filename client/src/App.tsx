import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';

import { useProfileStore } from '@/stores/profileStore';
import { useProfile } from '@/hooks/useProfile';

import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Conversation from '@/pages/Conversation';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import TherapistBrain from '@/pages/TherapistBrain';
import Onboarding from '@/pages/Onboarding';
import NotFound from '@/pages/NotFound';

function App() {
  const { data: profile, isLoading } = useProfile();
  const setProfile = useProfileStore((state) => state.setProfile);

  useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  if (isLoading) {
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
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route
            path="/"
            element={profile ? <Dashboard /> : <Navigate to="/onboarding" />}
          />
          <Route
            path="/conversation/:id"
            element={profile ? <Conversation /> : <Navigate to="/onboarding" />}
          />
          <Route
            path="/history"
            element={profile ? <History /> : <Navigate to="/onboarding" />}
          />
          <Route
            path="/profile"
            element={profile ? <Profile /> : <Navigate to="/onboarding" />}
          />
          <Route
            path="/therapist-brain"
            element={profile ? <TherapistBrain /> : <Navigate to="/onboarding" />}
          />
          <Route
            path="/onboarding"
            element={!profile ? <Onboarding /> : <Navigate to="/" />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </Layout>
  );
}

export default App;