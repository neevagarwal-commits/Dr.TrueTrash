'use client';

import { useEffect, useState, useRef } from 'react';
import type {
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

interface UseCollectionOptions<T> {
  // You can add options here like 'initialData', 'onError', etc.
}

export const useCollection = <T extends DocumentData>(
  query: Query<T> | null,
  options?: UseCollectionOptions<T>
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("Firestore snapshot error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]); // Simplified dependency array to just query

  return { data, loading, error };
};
