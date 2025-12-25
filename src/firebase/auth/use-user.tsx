'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase';

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the auth object is not available yet, we are in a loading state.
    if (auth === undefined) {
      setLoading(true);
      return;
    }
    
    // If auth is null, it means Firebase is not initialized (e.g. missing config), so we are not loading and there's no user.
    if (auth === null) {
      setLoading(false);
      setUser(null);
      return;
    }

    // Otherwise, we can subscribe to the auth state changes.
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
};
