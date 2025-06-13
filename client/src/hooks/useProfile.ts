import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await axios.get('/api/profile');
      return response.data;
    },
    retry: false,
  });
}