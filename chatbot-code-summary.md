
# Chatbot Code Summary

This document contains all the essential code for the symptom checker chatbot application.

---
## `package.json`
*Defines project metadata and dependencies.*
```json
{
  "name": "nextn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
    "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
    "build": "NODE_ENV=production next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@genkit-ai/google-genai": "^1.20.0",
    "@genkit-ai/next": "^1.20.0",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^16.5.0",
    "embla-carousel-react": "^8.6.0",
    "firebase": "^11.9.1",
    "genkit": "^1.20.0",
    "lucide-react": "^0.475.0",
    "nanoid": "^5.0.7",
    "next": "15.5.9",
    "patch-package": "^8.0.0",
    "react": "^19.2.1",
    "react-day-picker": "^9.11.3",
    "react-dom": "^19.2.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19.2.1",
    "@types/react-dom": "^19.2.1",
    "genkit-cli": "^1.20.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---
## `src/app/layout.tsx`
*The root layout for the Next.js application.*
```tsx
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';


export const metadata: Metadata = {
  title: 'DR.TRUETRASH',
  description: 'Your personal AI health assistant for symptom analysis.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

---
## `src/app/page.tsx`
*The main page component that renders the chat interface.*
```tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import ChatWrapper from '@/components/chat/chat-wrapper';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';

const GUEST_USER_ID = 'guest-session';

export default function Home() {
  const [chatId, setChatId] = useState<string | null>(null);

  const handleChatIdChange = useCallback((id: string | null) => {
    setChatId(id);
  }, []);

  const handleNewChat = useCallback(() => {
    setChatId(null);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center py-8 px-4">
          <ChatWrapper
            key={chatId || 'new'}
            userId={GUEST_USER_ID}
            chatId={chatId}
            onChatIdChange={handleChatIdChange}
            onNewChat={handleNewChat}
          />
        </main>
        <footer className="py-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} DR.TRUETRASH. All rights
            reserved.
          </p>
        </footer>
      </div>
    </SidebarProvider>
  );
}
```

---
## `src/components/chat/chat-wrapper.tsx`
*The main component that wraps all chat functionality, state, and logic.*
```tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, ChatMessage } from '@/lib/types';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import { getAiResponse } from '@/app/actions';
import PredictionsDisplay from './predictions-display';
import { nanoid } from 'nanoid';
import { LoaderCircle } from 'lucide-react';
import ChatHistory from './chat-history';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { addMessage, createChatSession } from '@/firebase/firestore/chat';
import { collection, query, orderBy } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const initialMessage: Message = {
  id: 'initial',
  role: 'assistant',
  content: (
    <div className="space-y-2">
      <p>Hello! I'm DR.TRUETRASH, your personal health assistant.</p>
      <p>Please describe your symptoms, separated by commas (e.g., "fever, headache, sore throat").</p>
    </div>
  ),
};

interface ChatWrapperProps {
  userId: string;
  chatId: string | null;
  onChatIdChange: (id: string | null) => void;
  onNewChat: () => void;
}

export default function ChatWrapper({ userId, chatId: currentChatId, onChatIdChange, onNewChat }: ChatWrapperProps) {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();

  const messagesQuery =
    firestore && currentChatId && userId
      ? query(collection(firestore, 'users', userId, 'chats', currentChatId, 'messages'), orderBy('createdAt', 'asc'))
      : null;

  const { data: chatMessages, loading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);
  
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      const loadedMessages: Message[] = chatMessages.map(msg => ({
        id: msg.id || nanoid(),
        role: msg.role,
        content: msg.predictions ? <PredictionsDisplay predictions={msg.predictions} /> : msg.content,
      }));
      setMessages(loadedMessages);
    } else if (!messagesLoading && !currentChatId) {
      setMessages([initialMessage]);
    }
  }, [chatMessages, messagesLoading, currentChatId]);
  

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);


  const handleSubmit = async (input: string) => {
    setIsLoading(true);
    const userMessage: Message = { id: nanoid(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
  
    // If firestore isn't configured, we can't save history.
    if (!firestore) {
      console.warn("Firestore is not configured. Chat history will not be saved.");
      setMessages(prev => [
        ...prev,
        {
          id: nanoid(),
          role: 'assistant',
          content: <p className="text-destructive">Error: Cannot create a new chat. Firebase is not configured.</p>
        }
      ]);
      setIsLoading(false);
      return;
    }
  
    let chatId = currentChatId;
  
    // 1. If it's a new chat, create the session first.
    if (!chatId) {
      const newChatId = await createChatSession(firestore, userId);
      if (newChatId) {
        chatId = newChatId;
        onChatIdChange(newChatId); // Update parent state
      } else {
        // createChatSession failed, show error and stop.
        const errorMessage: Message = {
          id: nanoid(),
          role: 'assistant',
          content: <p className="text-destructive">Error: Could not create a new chat session in the database.</p>,
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }
    }
  
    // At this point, we must have a valid chatId.
    if (!chatId) {
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: <p className="text-destructive">Error: Chat session ID is missing.</p>,
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      return;
    }
  
    // 2. Add user message to DB
    addMessage(firestore, userId, chatId, { role: 'user', content: input });
  
    // 3. Get AI response
    const result = await getAiResponse(input);
  
    let assistantMessage: Message;
    let assistantMessageForDb: Partial<ChatMessage>;
  
    if (result.error) {
      assistantMessage = {
        id: nanoid(),
        role: 'assistant',
        content: <p className="text-destructive">{result.error}</p>,
      };
      assistantMessageForDb = { role: 'assistant', content: result.error };
    } else if (result.predictions) {
      assistantMessage = {
        id: nanoid(),
        role: 'assistant',
        content: <PredictionsDisplay predictions={result.predictions} />,
      };
      assistantMessageForDb = { role: 'assistant', content: "prediction", predictions: result.predictions };
    } else {
      assistantMessage = {
        id: nanoid(),
        role: 'assistant',
        content: <p className="text-destructive">An unknown error occurred.</p>,
      };
      assistantMessageForDb = { role: 'assistant', content: 'An unknown error occurred.' };
    }
  
    // 4. Add AI response to DB and UI.
    addMessage(firestore, userId, chatId, assistantMessageForDb);
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };
  

  return (
    <div className="w-full max-w-4xl flex-1 flex h-[calc(100vh-180px)]">
      {firestore && <ChatHistory userId={userId} onSelectChat={onChatIdChange} onNewChat={onNewChat} selectedChatId={currentChatId} />}
      <div className={`flex-1 flex flex-col bg-card shadow-lg border ${firestore ? 'rounded-r-xl' : 'rounded-xl'}`}>
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
          {messagesLoading && !chatMessages ? (
            <div className="flex items-center justify-center h-full">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ChatMessages messages={messages} />
          )}

          {isLoading && (
              <div className="flex items-start gap-4 mt-4">
                  <div className="flex-shrink-0 size-8 rounded-full flex items-center justify-center">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <LoaderCircle className="animate-spin h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="p-4 rounded-lg bg-muted max-w-[80%]">
                      <p className="text-muted-foreground">Analyzing symptoms...</p>
                  </div>
              </div>
          )}
        </div>
        <div className="p-4 border-t">
          <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
```

---
## `src/components/chat/chat-history.tsx`
*Displays the list of past chat sessions.*
```tsx
'use client';

import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import type { ChatSession } from '@/lib/types';
import { Button } from '../ui/button';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  userId: string;
  onSelectChat: (chatId: string | null) => void;
  onNewChat: () => void;
  selectedChatId: string | null;
}

export default function ChatHistory({ userId, onSelectChat, onNewChat, selectedChatId }: ChatHistoryProps) {
  const firestore = useFirestore();

  // If firestore is not available, don't attempt to query or render the component.
  if (!firestore) {
    return null;
  }

  const chatsQuery = query(collection(firestore, 'users', userId, 'chats'), orderBy('createdAt', 'desc'));
    
  const { data: chats, loading } = useCollection<ChatSession>(chatsQuery);

  const handleNewChatClick = () => {
    onNewChat();
  }

  return (
    <div className="w-64 flex flex-col bg-card rounded-l-xl shadow-lg border p-4">
      <Button onClick={handleNewChatClick} className="w-full mb-4">
        <PlusCircle className="mr-2 h-4 w-4" />
        New Chat
      </Button>
      <h2 className="text-lg font-headline mb-2 px-2">History</h2>
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && (
            <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </>
        )}
        {chats && chats.map(chat => (
          <Button 
            key={chat.id} 
            variant="ghost" 
            className={cn(
                "w-full justify-start gap-2",
                selectedChatId === chat.id && "bg-accent"
            )}
            onClick={() => onSelectChat(chat.id)}
            >
            <MessageSquare className="h-4 w-4" />
            <span className="truncate">{chat.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
```

---
## `src/components/chat/chat-input.tsx`
*The text input area for the user to type their symptoms.*
```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

const formSchema = z.object({
  prompt: z.string().min(1, { message: 'Please enter at least one symptom.' }),
});

interface ChatInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values.prompt);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex items-center gap-2">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  placeholder="e.g., fever, headache, sore throat"
                  className="resize-none"
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(handleFormSubmit)();
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} size="icon">
          <ArrowUp className="h-5 w-5" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </Form>
  );
}
```

---
## `src/components/chat/chat-messages.tsx`
*Displays the conversation history between the user and the AI.*
```tsx
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-4 ${
            message.role === 'user' ? 'justify-end' : ''
          }`}
        >
          {message.role === 'assistant' && (
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          )}
          <div
            className={`p-4 rounded-lg max-w-[80%] break-words ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {message.content}
          </div>
          {message.role === 'user' && (
             <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  );
}
```

---
## `src/components/chat/predictions-display.tsx`
*Formats and displays the AI's health predictions.*
```tsx
import type { Prediction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface PredictionsDisplayProps {
  predictions: Prediction[];
}

const getLikelihoodProps = (likelihood: string) => {
  const lowerLikelihood = likelihood.toLowerCase();
  if (lowerLikelihood.includes('high')) {
    return { variant: 'destructive' as const, icon: <AlertCircle className="h-4 w-4" /> };
  }
  if (lowerLikelihood.includes('medium')) {
    return { variant: 'secondary' as const, icon: <ShieldAlert className="h-4 w-4" /> };
  }
  return { variant: 'outline' as const, icon: <CheckCircle className="h-4 w-4" /> };
};

export default function PredictionsDisplay({ predictions }: PredictionsDisplayProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">Based on your symptoms, here are some potential health issues. This is not a medical diagnosis.</p>
      {predictions.map((prediction, index) => {
        const { variant, icon } = getLikelihoodProps(prediction.likelihood);
        return (
          <Card key={index} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-headline">{prediction.healthIssue}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                Likelihood:
                <Badge variant={variant} className="flex items-center gap-1">
                  {icon}
                  {prediction.likelihood}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-sm">View Explanation</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {prediction.explanation}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
       <p className="text-xs text-muted-foreground pt-4">Disclaimer: HealthWise AI provides potential insights based on symptoms and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
    </div>
  );
}
```

---
## `src/app/actions.ts`
*Server Action to handle communication with the AI backend.*
```ts
'use server';

import { reasonAboutSymptoms } from '@/ai/flows/reason-about-symptoms';
import type { Prediction } from '@/lib/types';

export async function getAiResponse(symptoms: string): Promise<{error?: string; predictions?: Prediction[]}> {
  try {
    // Sanitize input: handle different separators (commas, spaces, newlines), trim whitespace, remove empty strings, and convert to lowercase.
    const symptomsArray = symptoms
      .split(/[\s,;\n]+/)
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);

    if (symptomsArray.length === 0) {
      return { error: 'Please enter at least one symptom.' };
    }

    const result = await reasonAboutSymptoms({
      symptoms: symptomsArray,
    });

    if (!result.predictions || result.predictions.length === 0) {
      return { error: 'The AI could not determine any potential health issues from the symptoms provided. Please try describing them differently or consult a healthcare professional.' };
    }

    return { predictions: result.predictions };

  } catch (error) {
    console.error("AI action failed:", error);
    return { error: 'An unexpected error occurred while analyzing your symptoms. Please try again later.' };
  }
}
```

---
## `src/ai/flows/reason-about-symptoms.ts`
*The core Genkit AI flow that analyzes symptoms and returns predictions.*
```ts
'use server';
/**
 * @fileOverview AI agent for reasoning about symptoms and predicting potential health issues.
 * This flow simulates a classic machine learning model like a Decision Tree or Naive Bayes.
 *
 * - reasonAboutSymptoms - A function that takes a list of symptoms and predicts potential health issues.
 * - ReasonAboutSymptomsInput - The input type for the reasonAboutSymptoms function.
 * - ReasonAboutSymptomsOutput - The return type for the reasonAboutSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasonAboutSymptomsInputSchema = z.object({
  symptoms: z.array(z.string()).describe('A list of symptoms provided by the user.'),
});
export type ReasonAboutSymptomsInput = z.infer<typeof ReasonAboutSymptomsInputSchema>;

const ReasonAboutSymptomsOutputSchema = z.object({
  predictions: z.array(
    z.object({
      healthIssue: z.string().describe('The predicted health issue.'),
      likelihood: z.string().describe('The likelihood of the health issue based on the symptoms (e.g., High, Medium, Low).'),
      explanation: z.string().describe('An explanation of why the health issue is predicted based on the symptoms.'),
    })
  ).describe('A list of predicted health issues and their likelihood.'),
});
export type ReasonAboutSymptomsOutput = z.infer<typeof ReasonAboutSymptomsOutputSchema>;

export async function reasonAboutSymptoms(input: ReasonAboutSymptomsInput): Promise<ReasonAboutSymptomsOutput> {
  return reasonAboutSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasonAboutSymptomsPrompt',
  input: {schema: ReasonAboutSymptomsInputSchema},
  output: {schema: ReasonAboutSymptomsOutputSchema},
  prompt: `You are simulating a classic machine learning model (like a Decision Tree or Naive Bayes) for predicting health issues from symptoms.

You will receive a list of symptoms from the user. First, you will preprocess these symptoms by cleaning the data, handling any missing values, and extracting relevant features.

**IMPORTANT**: Your reasoning should mimic a simple, rule-based model. Do not use complex medical knowledge. Base your predictions strictly on the input features. For example, if the features are "fever" and "cough", a reasonable prediction is "Common Cold" or "Flu".

Symptoms: {{{symptoms}}}

Based on these symptoms, provide a list of potential health issues, their likelihood, and a simple, rule-based explanation for each prediction. Use the output schema to guide your response formatting.`, 
});

const reasonAboutSymptomsFlow = ai.defineFlow(
  {
    name: 'reasonAboutSymptomsFlow',
    inputSchema: ReasonAboutSymptomsInputSchema,
    outputSchema: ReasonAboutSymptomsOutputSchema,
  },
  async input => {
    // Combined preprocessing and prediction into a single AI call
    const {output} = await prompt(input);
    return output!;
  }
);
```

---
## `src/firebase/index.ts`
*Initializes and exports Firebase services.*
```ts
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This object represents a "null" or "disabled" Firebase state.
const nullFirebase = {
  app: null,
  auth: null,
  firestore: null,
};

// This function is memoized in the client provider, so it's safe to call it multiple times.
function initializeFirebase(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
} {
  // Check if we are in a browser environment
  if (typeof window === 'undefined') {
    return nullFirebase;
  }

  // Check if the config is valid (not placeholder)
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('your-')) {
    console.warn("Firebase config is not set. Chat history and other features requiring Firebase will be disabled.");
    return nullFirebase;
  }

  try {
    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    return { app, auth, firestore };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return nullFirebase;
  }
}

export { initializeFirebase };

export * from './provider';
export * from './client-provider';
```

---
## `src/firebase/firestore/chat.ts`
*Contains functions for creating and updating chat data in Firestore.*
```ts
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
 * Creates a new chat session in Firestore with a timestamp-based title.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @returns The ID of the newly created chat session, or null on failure.
 */
export async function createChatSession(
  firestore: Firestore,
  userId: string
): Promise<string | null> {
  if (!firestore) return null;
  
  const title = new Date().toLocaleString();

  try {
    const docRef = await addDoc(collection(firestore, 'users', userId, 'chats'), {
      userId,
      title: title,
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
```

---
## `src/lib/types.ts`
*Defines the data structures and types used throughout the application.*
```ts
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
```
