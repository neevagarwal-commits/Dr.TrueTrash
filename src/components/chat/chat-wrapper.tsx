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
    // Show an error and stop, but keep the AI flow going for a stateless experience.
    if (!firestore) {
      console.warn("Firestore is not configured. Chat history will not be saved.");
      const result = await getAiResponse(input);
      let assistantMessage: Message;

      if (result.error) {
        assistantMessage = { id: nanoid(), role: 'assistant', content: <p className="text-destructive">{result.error}</p> };
      } else if (result.predictions) {
        assistantMessage = { id: nanoid(), role: 'assistant', content: <PredictionsDisplay predictions={result.predictions} /> };
      } else {
        assistantMessage = { id: nanoid(), role: 'assistant', content: <p className="text-destructive">An unknown error occurred.</p> };
      }

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      return;
    }


    // --- Firestore is available, proceed with saving history ---
    
    let chatId = currentChatId;

    // 1. If it's a new chat, create the session first.
    if (!chatId) {
      const newChatId = await createChatSession(firestore, userId);
      if (newChatId) {
        chatId = newChatId;
        onChatIdChange(newChatId); // Update parent state
      } else {
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
