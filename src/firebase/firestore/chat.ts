'use client';
import {
  collection,
  addDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

/**
 * Creates a new chat session in Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param title - The initial title for the chat session.
 * @returns The ID of the newly created chat session, or null on failure.
 */
export async function createChatSession(
  firestore: Firestore,
  userId: string,
  title: string
): Promise<string | null> {
  if (!firestore) return null;
  try {
    const docRef = await addDoc(collection(firestore, 'users', userId, 'chats'), {
      userId,
      title: title.substring(0, 30), // Truncate title
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e: any) {
    console.error('Error creating chat session:', e);
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/chats`,
      operation: 'create',
      requestResourceData: { userId, title },
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
    return null;
  }
}

/**
 * Adds a new message to a chat session in Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param chatId - The ID of the chat session.
 * @param message - The message object to add.
 */
export function addMessage(
  firestore: Firestore,
  userId: string,
  chatId: string,
  message: Partial<any>
) {
  if (!firestore) return;
  
  const docRef = collection(
    firestore,
    'users',
    userId,
    'chats',
    chatId,
    'messages'
  );

  addDoc(docRef, {
    ...message,
    createdAt: serverTimestamp(),
  }).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/chats/${chatId}/messages`,
      operation: 'create',
      requestResourceData: message,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}
