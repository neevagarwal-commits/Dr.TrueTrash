import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

type ErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// This is a simple event emitter that allows us to globally handle
// Firestore permission errors.
class FirebaseErrorEmitter extends EventEmitter {
  emit<E extends keyof ErrorEvents>(event: E, ...args: Parameters<ErrorEvents[E]>): boolean {
    return super.emit(event, ...args);
  }

  on<E extends keyof ErrorEvents>(event: E, listener: ErrorEvents[E]): this {
    return super.on(event, listener);
  }

  off<E extends keyof ErrorEvents>(event: E, listener: ErrorEvents[E]): this {
    return super.off(event, listener);
  }
}

export const errorEmitter = new FirebaseErrorEmitter();
