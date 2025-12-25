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
import type { ChatMessage, Prediction } from '@/lib/types';

export function getChatMessagesQuery(firestore: Firestore, chatSessionId: string) {
  return query(
    collection(firestore, `chats/${chatSessionId}/messages`),
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
  chatSessionId: string,
  payload: NewMessagePayload
): Promise<void> {
  const messagesCol = collection(firestore, `users/${chatSessionId}/messages`);
  await addDoc(messagesCol, {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export async function createChatSession(firestore: Firestore, userId: string) {
  const chatSessionsCol = collection(firestore, `users/${userId}/chatSessions`);
  const newSessionRef = await addDoc(chatSessionsCol, {
    userId: userId,
    createdAt: serverTimestamp(),
    title: "New Chat"
  });
  return { id: newSessionRef.id };
}

export async function updateChatSessionTitle(firestore: Firestore, userId: string, chatSessionId: string, title: string) {
  const sessionDoc = doc(firestore, `users/${userId}/chatSessions`, chatSessionId);
  await updateDoc(sessionDoc, { title });
}
