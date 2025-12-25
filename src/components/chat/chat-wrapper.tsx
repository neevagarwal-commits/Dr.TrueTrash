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

export default function ChatWrapper({ userId, chatId, onChatIdChange, onNewChat }: ChatWrapperProps) {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();

  const messagesQuery =
    firestore && chatId && userId
      ? query(collection(firestore, 'users', userId, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
      : null;

  const { data: chatMessages, loading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);
  
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      const loadedMessages: Message[] = chatMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.predictions ? <PredictionsDisplay predictions={msg.predictions} /> : msg.content,
      }));
      setMessages(loadedMessages);
    } else if (!messagesLoading && !chatId) {
      setMessages([initialMessage]);
    }
  }, [chatMessages, messagesLoading, chatId]);
  

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (input: string) => {
    setIsLoading(true);
    let currentChatId = chatId;
    
    // Create a new chat session if it's the first message of a new chat
    if (!currentChatId && firestore && userId) {
      const newChatId = await createChatSession(firestore, userId);
      if (newChatId) {
        onChatIdChange(newChatId);
        currentChatId = newChatId;
        setMessages([]); // Clear initial message to start fresh
      } else {
        console.error("Failed to create chat session");
        setIsLoading(false);
        return;
      }
    }

    if (!currentChatId) {
        console.error("No chat ID available to send message");
        setIsLoading(false);
        return;
    }

    const userMessageContent = input;
    const userMessage: Message = { id: nanoid(), role: 'user', content: userMessageContent };
    
    setMessages(prev => [...prev, userMessage]);
    if(firestore && userId){
      addMessage(firestore, userId, currentChatId, { role: 'user', content: input });
    }
    
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

    if(firestore && userId) {
      addMessage(firestore, userId, currentChatId, assistantMessageForDb);
    }

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-4xl flex-1 flex h-[calc(100vh-180px)]">
      <ChatHistory userId={userId} onSelectChat={onChatIdChange} onNewChat={onNewChat} selectedChatId={chatId} />
      <div className="flex-1 flex flex-col bg-card rounded-r-xl shadow-lg border">
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
          {messagesLoading && !chatId ? (
            <div className="flex items-center justify-center h-full">
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
          <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
