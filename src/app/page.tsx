'use client';

import { useState, useCallback, useEffect } from 'react';
import ChatWrapper from '@/components/chat/chat-wrapper';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';

const GUEST_USER_ID = 'guest-session';

export default function Home() {
  const [chatId, setChatId] = useState<string | null>(null);

  const handleChatIdChange = useCallback((id: string | null) => {
    setChatId(id);
  }, []);

  const handleNewChat = useCallback(() => {
    setChatId(null);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center py-8 px-4">
          <ChatWrapper
            key={chatId || 'new'}
            userId={GUEST_USER_ID}
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
    </SidebarProvider>
  );
}
