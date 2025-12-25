'use client';

import { useState } from 'react';
import ChatWrapper from '@/components/chat/chat-wrapper';
import Header from '@/components/layout/header';

export default function Home() {
  const [chatId, setChatId] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        <ChatWrapper chatId={chatId} onChatIdChange={setChatId} />
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
