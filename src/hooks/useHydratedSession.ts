import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useHydratedSession() {
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    setHydrated();
  }, [setHydrated]);
}
