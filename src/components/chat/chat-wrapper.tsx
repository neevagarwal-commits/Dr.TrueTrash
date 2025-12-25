'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '@/lib/types';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import { getAiResponse } from '@/app/actions';
import PredictionsDisplay from './predictions-display';
import { nanoid } from 'nanoid';
import { LoaderCircle } from 'lucide-react';

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

  useEffect(() => {
    // When chatId changes (e.g., for a new chat), reset messages
    setMessages([initialMessage]);
  }, [chatId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (input: string) => {
    const isFirstUserMessage = messages.length <= 1;

    const userMessageContent = input;
    const userMessage: Message = { id: nanoid(), role: 'user', content: userMessageContent };
    
    setMessages(isFirstUserMessage ? [userMessage] : (prev) => [...prev, userMessage]);
    
    setIsLoading(true);

    const result = await getAiResponse(input);

    let assistantMessage: Message;

    if (result.error) {
       assistantMessage = {
        id: nanoid(),
        role: 'assistant',
        content: <p className="text-destructive">{result.error}</p>,
      };
    } else if (result.predictions) {
      assistantMessage = {
        id: nanoid(),
        role: 'assistant',
        content: <PredictionsDisplay predictions={result.predictions} />,
      };
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
        <ChatMessages messages={messages} />

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
  );
}
