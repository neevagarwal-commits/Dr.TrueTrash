import type { Timestamp } from 'firebase/firestore';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
};

export type Prediction = {
  healthIssue: string;
  likelihood: string;
  explanation: string;
};

// Firestore documents
export type ChatSession = {
  id: string;
  userId: string;
  createdAt: Timestamp;
  title: string;
};

export type ChatMessage = {
  id?: string;
  chatSessionId?: string;
  role: 'user' | 'assistant';
  content: string;
  predictions?: Prediction[];
  createdAt: Timestamp;
};
