'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser } from '@/firebase/auth/use-user';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { ChatSession } from '@/lib/types';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTitle,
} from '@/components/ui/sidebar-v2';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { createChatSession } from '@/firebase/firestore/chat';

interface ChatHistoryProps {
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export default function ChatHistory({
  currentChatId,
  onSelectChat,
  onNewChat,
}: ChatHistoryProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const userId = user?.isAnonymous ? null : user?.uid;

  const chatHistoryQuery = (userId && firestore)
    ? query(
        collection(firestore, `users/${userId}/chatSessions`),
        orderBy('createdAt', 'desc')
      )
    : null;

  const { data: chatHistory, loading } = useCollection<ChatSession>(chatHistoryQuery);

  const handleNewChatClick = async () => {
    if (userId && firestore) {
      // For registered users, create a session in Firestore
      const newSessionId = await createChatSession(firestore, userId);
      if (newSessionId) {
        onSelectChat(newSessionId);
      }
    } else {
      // For guest users, just reset the chat interface locally
      onNewChat();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader>
        <SidebarTitle>Chat History</SidebarTitle>
        <Button variant="outline" className="w-full" onClick={handleNewChatClick}>
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {!userId && (
            <div className="px-4 py-2 text-xs text-muted-foreground">
                Sign in to save your chat history.
            </div>
        )}
        {loading && userId && (
          <div className="space-y-2 px-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
        <SidebarMenu>
          {chatHistory?.map(chat => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                isActive={currentChatId === chat.id}
                onClick={() => onSelectChat(chat.id)}
                tooltip={{ children: chat.title, side: 'right' }}
              >
                <MessageSquare />
                <span className="truncate">{chat.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </div>
  );
}
