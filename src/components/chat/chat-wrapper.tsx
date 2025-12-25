'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, Prediction, ChatMessage } from '@/lib/types';
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
  onChatIdChange: (id: string) => void;
}

export default function ChatWrapper({ chatId, onChatIdChange }: ChatWrapperProps) {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const userId = user?.phoneNumber; // Use phone number as ID

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
    if (firestoreMessages) {
      const mappedMessages = firestoreMessages.map(mapFirestoreMessageToComponent);
      setMessages(mappedMessages.length > 0 ? mappedMessages : [initialMessage]);
    } else {
      setMessages([initialMessage]);
    }
  }, [firestoreMessages, mapFirestoreMessageToComponent]);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (input: string) => {
    if (!userId || !firestore) return;
    
    let currentChatId = chatId;

    // Create a new chat session if one doesn't exist
    if (!currentChatId) {
        const newSession = await createChatSession(firestore, userId);
        if (newSession) {
            currentChatId = newSession.id;
            onChatIdChange(newSession.id);
        } else {
            // Handle error case where session creation fails
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


    setIsLoading(true);
    const userMessageContent = input;
    // Clear initial message on first user input
    const initialUserMessage = messages.length === 1 && messages[0].id === 'initial';
    const userMessage: Message = { id: nanoid(), role: 'user', content: userMessageContent };
    
    setMessages(prev => initialUserMessage ? [userMessage] : [...prev, userMessage]);
    

    // Save user message to Firestore
    await addMessage(firestore, userId, currentChatId, {
      role: 'user',
      content: userMessageContent,
    });

    const result = await getAiResponse(input);

    if (result.error) {
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: <p className="text-destructive">{result.error}</p>,
      };
      setMessages(prev => [...prev, errorMessage]);
      // Save error message to Firestore
      await addMessage(firestore, userId, currentChatId, {
        role: 'assistant',
        content: result.error,
      });
    } else if (result.predictions) {
      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: <PredictionsDisplay predictions={result.predictions} />,
      };
      setMessages(prev => [...prev, assistantMessage]);
      // Save assistant message with predictions to Firestore
      await addMessage(firestore, userId, currentChatId, {
        role: 'assistant',
        content: 'Based on your symptoms, here are some potential health issues.',
        predictions: result.predictions,
      });
      
      const isNewChat = firestoreMessages ? firestoreMessages.length < 2 : true;
      if (isNewChat) {
        const title = `Analysis of: ${input.substring(0,30)}...`;
        await updateChatSessionTitle(firestore, userId, currentChatId, title);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-3xl flex-1 flex flex-col bg-card rounded-xl shadow-lg border">
      <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
        {messagesLoading && messages.length <= 1 ? (
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
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading || messagesLoading || !user} />
      </div>
    </div>
  );
}
