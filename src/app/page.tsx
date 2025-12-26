'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatWrapper from '@/components/chat/chat-wrapper';
import Header from '@/components/layout/header';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { adjectives, nouns } from '@/lib/words';

function generateMemorableId() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This effect runs only once on the client to establish the user ID.
    let id = localStorage.getItem('userId');
    if (!id) {
      id = generateMemorableId();
      localStorage.setItem('userId', id);
    }
    setUserId(id);
  }, []);

  useEffect(() => {
    // This effect synchronizes the URL with the established userId.
    if (userId && searchParams.get('userId') !== userId) {
      router.replace(`${pathname}?userId=${userId}`, { scroll: false });
    }
  }, [userId, searchParams, pathname, router]);

  const handleChatIdChange = useCallback((id: string | null) => {
    setChatId(id);
  }, []);
  
  const handleNewChat = useCallback(() => {
    setChatId(null);
  }, []);

  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
      <Header userId={userId} />
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        <ChatWrapper
          key={chatId || 'new'}
          userId={userId}
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
  );
}
