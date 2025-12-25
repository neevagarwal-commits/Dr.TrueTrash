'use client';

import {
  collection,
  addDoc,
  serverTimestamp,
  type Firestore,
  query,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import type { Prediction } from '@/lib/types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function getChatMessagesQuery(firestore: Firestore, userId: string, chatSessionId: string) {
  // Use phone number as userId
  return query(
    collection(firestore, `users/${userId}/chatSessions/${chatSessionId}/messages`),
    orderBy('createdAt', 'asc')
  );
}

type NewMessagePayload = {
  role: 'user' | 'assistant';
  content: string;
  predictions?: Prediction[];
};

export async function addMessage(
  firestore: Firestore,
  userId: string, // phone number
  chatSessionId: string,
  payload: NewMessagePayload
): Promise<void> {
  const messagesColRef = collection(firestore, `users/${userId}/chatSessions/${chatSessionId}/messages`);
  addDoc(messagesColRef, {
    ...payload,
    createdAt: serverTimestamp(),
  }).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: messagesColRef.path,
        operation: 'create',
        requestResourceData: payload,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

export async function createChatSession(firestore: Firestore, userId: string) { // userId is phone number
  try {
    const chatSessionsCol = collection(firestore, `users/${userId}/chatSessions`);
    const newSessionRef = await addDoc(chatSessionsCol, {
      userId: userId,
      createdAt: serverTimestamp(),
      title: "New Chat"
    });
    return { id: newSessionRef.id };
  } catch (serverError) {
      const permissionError = new FirestorePermissionError({
          path: `users/${userId}/chatSessions`,
          operation: 'create',
          requestResourceData: { userId, title: 'New Chat' },
      });
      errorEmitter.emit('permission-error', permissionError);
      return null;
  }
}

export async function updateChatSessionTitle(firestore: Firestore, userId: string, chatSessionId: string, title: string) {
  const sessionDocRef = doc(firestore, `users/${userId}/chatSessions`, chatSessionId);
  updateDoc(sessionDocRef, { title }).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: sessionDocRef.path,
        operation: 'update',
        requestResourceData: { title },
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}
