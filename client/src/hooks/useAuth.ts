import { useQuery } from '@tanstack/react-query';
import { defaultQueryFn } from '@/lib/queryClient';

export function useAuth() {
  const { data: admin, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: defaultQueryFn,
    retry: false,
  });

  return {
    admin: admin?.admin,
    isLoading,
    isAuthenticated: !!admin?.admin,
  };
}