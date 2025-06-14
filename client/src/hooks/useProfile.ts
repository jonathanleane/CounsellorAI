import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export function useProfile() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await profileApi.get();
      return response.data;
    },
    retry: false,
    enabled: isAuthenticated, // Only run if authenticated
  });
}