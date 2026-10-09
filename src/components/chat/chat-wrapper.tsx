'use client';

import { useState, useRef, useEffect } from 'react';
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

    if (!firestore) {
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

    let chatId = currentChatId;

    if (!chatId) {
      const newChatId = await createChatSession(firestore, userId);
      if (newChatId) {
        chatId = newChatId;
        onChatIdChange(newChatId);
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

    addMessage(firestore, userId, chatId, { role: 'user', content: input });
    
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
    
    addMessage(firestore, userId, chatId, assistantMessageForDb);
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };
  

  return (
    <div className="w-full flex-1 flex overflow-hidden">
      {firestore && (
        <ChatHistory 
          userId={userId} 
          onSelectChat={onChatIdChange} 
          onNewChat={onNewChat} 
          selectedChatId={currentChatId} 
        />
      )}
      <div className="flex-1 flex flex-col bg-card border-l">
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
          {messagesLoading && !chatMessages ? (
            <div className="flex items-center justify-center h-full">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full">
              <ChatMessages messages={messages} />
            </div>
          )}

          {isLoading && (
              <div className="max-w-4xl mx-auto w-full flex items-start gap-4 mt-4">
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
        <div className="p-4 border-t bg-background">
          <div className="max-w-4xl mx-auto w-full">
            <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
