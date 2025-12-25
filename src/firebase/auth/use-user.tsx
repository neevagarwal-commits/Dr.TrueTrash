'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase';

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(); // undefined means loading, null means not logged in
  const loading = user === undefined;

  useEffect(() => {
    // if auth is undefined, it's still initializing.
    // if auth is null, it means firebase is not configured.
    if (auth === undefined) {
      return; 
    }
    if (auth === null) {
      setUser(null);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
};
