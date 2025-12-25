'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, ChatMessage } from '@/lib/types';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import { getAiResponse } from '@/app/actions';
import PredictionsDisplay from './predictions-display';
import { nanoid } from 'nanoid';
import { LoaderCircle } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { addMessage, getChatMessagesQuery, updateChatSessionTitle, createChatSession } from '@/firebase/firestore/chat';

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
  chatId: string | null;
  onChatIdChange: (id: string | null) => void;
}

export default function ChatWrapper({ chatId, onChatIdChange }: ChatWrapperProps) {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const userId = user?.isAnonymous ? null : user?.uid;

  const messagesQuery = (chatId && userId && firestore) ? getChatMessagesQuery(firestore, userId, chatId) : null;
  const { data: firestoreMessages, loading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);

  const mapFirestoreMessageToComponent = useCallback((msg: ChatMessage): Message => {
    let content: React.ReactNode;
    if (msg.role === 'assistant' && msg.predictions) {
      content = <PredictionsDisplay predictions={msg.predictions} />;
    } else {
      content = msg.content;
    }
    return {
      id: msg.id,
      role: msg.role,
      content: content,
    };
  }, []);

  useEffect(() => {
    if (!chatId) {
        setMessages([initialMessage]);
        return;
    }
    if (firestoreMessages) {
      const mappedMessages = firestoreMessages.map(mapFirestoreMessageToComponent);
      setMessages(mappedMessages.length > 0 ? mappedMessages : [initialMessage]);
    }
  }, [chatId, firestoreMessages, mapFirestoreMessageToComponent]);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (input: string) => {
    // Determine if this is the very first message a user sends in a new/guest chat.
    const isFirstUserMessage = (chatId === null && messages.length <= 1) || (!!chatId && firestoreMessages?.length === 0);

    const userMessageContent = input;
    const userMessage: Message = { id: nanoid(), role: 'user', content: userMessageContent };
    
    // If it's the initial message, replace the welcome message. Otherwise, append.
    setMessages(isFirstUserMessage ? [userMessage] : (prev) => [...prev, userMessage]);
    
    setIsLoading(true);

    let currentChatId = chatId;
    
    // For registered users, handle Firestore logic
    if (userId && firestore) {
      // If there's no chatId, it's a new chat for a registered user.
      if (!currentChatId) {
          const newSessionId = await createChatSession(firestore, userId);
          if (newSessionId) {
              currentChatId = newSessionId;
              onChatIdChange(newSessionId);
          } else {
              setIsLoading(false);
              const errorMessage: Message = {
                  id: nanoid(),
                  role: 'assistant',
                  content: <p className="text-destructive">Could not start a new chat session. Please try again.</p>,
              };
              setMessages(prev => [...prev, errorMessage]);
              return;
          }
      }
      // Add the user message to Firestore
      await addMessage(firestore, userId, currentChatId, {
        role: 'user',
        content: userMessageContent,
      });
    }

    const result = await getAiResponse(input);

    let assistantMessage: Message;

    if (result.error) {
       assistantMessage = {
        id: nanoid(),
        role: 'assistant',
        content: <p className="text-destructive">{result.error}</p>,
      };
      if (userId && firestore && currentChatId) {
        // Log the error response to Firestore as well
        await addMessage(firestore, userId, currentChatId, {
          role: 'assistant',
          content: result.error,
        });
      }
    } else if (result.predictions) {
      assistantMessage = {
        id: nanoid(),
        role: 'assistant',
        content: <PredictionsDisplay predictions={result.predictions} />,
      };
       if (userId && firestore && currentChatId) {
        // Save the successful prediction to Firestore
        await addMessage(firestore, userId, currentChatId, {
          role: 'assistant',
          content: 'Based on your symptoms, here are some potential health issues.',
          predictions: result.predictions,
        });
        
        // Update the chat title if it's the first message of the session
        if (isFirstUserMessage) {
            const title = `Analysis: ${input.substring(0,30)}${input.length > 30 ? '...' : ''}`;
            await updateChatSessionTitle(firestore, userId, currentChatId, title);
        }
      }
    } else {
        assistantMessage = {
            id: nanoid(),
            role: 'assistant',
            content: <p className="text-destructive">An unknown error occurred.</p>,
        };
    }

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-3xl flex-1 flex flex-col bg-card rounded-xl shadow-lg border">
      <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
        {(messagesLoading && userId) ? (
          <div className="flex justify-center items-center h-full">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ChatMessages messages={messages} />
        )}

        {isLoading && (
            <div className="flex items-start gap-4 mt-4">
                <div className="flex-shrink-0 size-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <LoaderCircle className="animate-spin h-5 w-5" />
                </div>
                <div className="p-4 rounded-lg bg-muted max-w-[80%]">
                    <p className="text-muted-foreground">Analyzing symptoms...</p>
                </div>
            </div>
        )}
      </div>
      <div className="p-4 border-t">
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading || (messagesLoading && !!userId)} />
      </div>
    </div>
  );
}
