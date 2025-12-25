'use client';

import { useMemo } from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebase = useMemo(() => {
    return initializeFirebase();
  }, []);

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
