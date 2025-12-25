'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatWrapper from '@/components/chat/chat-wrapper';
import Header from '@/components/layout/header';
import { nanoid } from 'nanoid';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FirebaseClientProvider } from '@/firebase';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const idFromStorage = localStorage.getItem('userId');
    const idFromUrl = searchParams.get('userId');

    if (idFromUrl) {
      if (idFromUrl !== idFromStorage) {
        localStorage.setItem('userId', idFromUrl);
      }
      setUserId(idFromUrl);
    } else if (idFromStorage) {
      // If there's an ID in storage but not in URL, update URL
      router.replace(`${pathname}?userId=${idFromStorage}`, { scroll: false });
      setUserId(idFromStorage);
    } else {
      // If no ID anywhere, create a new one
      const newId = nanoid();
      localStorage.setItem('userId', newId);
      router.replace(`${pathname}?userId=${newId}`, { scroll: false });
      setUserId(newId);
    }
  }, [searchParams, pathname, router]);

  const handleChatIdChange = useCallback((id: string | null) => {
    setChatId(id);
  }, []);

  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <FirebaseClientProvider>
      <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
        <Header userId={userId} />
        <main className="flex-1 flex flex-col items-center py-8 px-4">
          <ChatWrapper
            key={userId}
            userId={userId}
            chatId={chatId}
            onChatIdChange={handleChatIdChange}
          />
        </main>
        <footer className="py-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} DR.TRUETRASH. All rights
            reserved.
          </p>
        </footer>
      </div>
    </FirebaseClientProvider>
  );
}
