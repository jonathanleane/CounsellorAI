import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProfileStore } from '@/stores/profileStore';

interface OnboardedRouteProps {
  children: React.ReactElement;
}

export function OnboardedRoute({ children }: OnboardedRouteProps) {
  const { profile } = useProfileStore();
  
  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
}