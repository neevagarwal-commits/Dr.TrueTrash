'use client';

import { useState, useCallback } from 'react';
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
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatWrapper
            key={chatId || 'new'}
            userId={GUEST_USER_ID}
            chatId={chatId}
            onChatIdChange={handleChatIdChange}
            onNewChat={handleNewChat}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
