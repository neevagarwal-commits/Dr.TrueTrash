'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase';

export const useUser = () => {
  const auth = useAuth();
  // Start with user as undefined to represent the initial "unknown" state
  const [user, setUser] = useState<User | null | undefined>(undefined);
  
  // The loading state is true until we have a definitive user or null
  const loading = user === undefined;

  useEffect(() => {
    // If auth is not yet available, do nothing. The hook will re-run when it is.
    if (!auth) {
      // If auth is explicitly null (meaning Firebase isn't configured), we can stop loading.
      if (auth === null) {
        setUser(null);
      }
      return;
    }

    // Subscribe to Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user); // user will be null if not logged in, or a User object if logged in
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // The effect depends on the auth instance

  return { user, loading };
};
