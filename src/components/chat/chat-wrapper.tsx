'use client';

import { useState, useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import { getAiResponse } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
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

export default function ChatWrapper() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (input: string) => {
    setIsLoading(true);
    const userMessage: Message = { id: nanoid(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    const result = await getAiResponse(input);

    if (result.error) {
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: <p className="text-destructive">{result.error}</p>,
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: 'An error occurred',
        description: result.error,
        variant: 'destructive',
      });
    } else if (result.predictions) {
      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: <PredictionsDisplay predictions={result.predictions} />,
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
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
