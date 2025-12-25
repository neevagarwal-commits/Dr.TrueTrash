'use client';

import { useState } from 'react';
import ChatWrapper from '@/components/chat/chat-wrapper';
import Header from '@/components/layout/header';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import ChatHistory from '@/components/chat/chat-history';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { signInWithGoogle } from '@/firebase/auth/client';
import { useAuth } from '@/firebase';

export default function Home() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const handleSignIn = async () => {
    if (auth) {
      await signInWithGoogle(auth);
    }
  };

  if (loading) {
    return (
       <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
            <p>Loading...</p>
          </main>
      </div>
    )
  }

  if (!user) {
    return (
       <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="max-w-md space-y-4">
              <h2 className="text-2xl font-bold">Welcome to DR.TRUETRASH</h2>
              <p className="text-muted-foreground">Please sign in to start a new chat session and save your history.</p>
              <Button onClick={handleSignIn}>
                <LogIn className="mr-2 h-4 w-4" /> Sign In with Google
              </Button>
            </div>
          </main>
           <footer className="py-4 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} DR.TRUETRASH. All rights
              reserved.
            </p>
          </footer>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="offcanvas">
        <ChatHistory
          currentChatId={currentChatId}
          onSelectChat={setCurrentChatId}
          onNewChat={handleNewChat}
        />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
          <Header />
          <main className="flex-1 flex flex-col items-center py-8 px-4">
            <ChatWrapper chatId={currentChatId} />
          </main>
          <footer className="py-4 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} DR.TRUETRASH. All rights
              reserved.
            </p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
