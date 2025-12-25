'use client';

import { useEffect, useState, useRef } from 'react';
import type {
  DocumentReference,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

interface UseDocOptions<T> {
  // Options if needed
}

export const useDoc = <T extends DocumentData>(
  docRef: DocumentReference<T> | null,
  options?: UseDocOptions<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const docRefRef = useRef(docRef);

  if(docRefRef.current?.path !== docRef?.path) {
    docRefRef.current = docRef;
  }

  useEffect(() => {
    if (!docRefRef.current) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      docRefRef.current,
      (snapshot: DocumentSnapshot<T>) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("Firestore document snapshot error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRefRef.current]);

  return { data, loading, error };
};
