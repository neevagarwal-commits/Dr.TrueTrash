'use client';

import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import type { ChatSession } from '@/lib/types';
import { Button } from '../ui/button';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  userId: string;
  onSelectChat: (chatId: string | null) => void;
  onNewChat: () => void;
  selectedChatId: string | null;
}

export default function ChatHistory({ userId, onSelectChat, onNewChat, selectedChatId }: ChatHistoryProps) {
  const firestore = useFirestore();

  if (!firestore) {
    return null;
  }

  const chatsQuery = query(collection(firestore, 'users', userId, 'chats'), orderBy('createdAt', 'desc'));
    
  const { data: chats, loading } = useCollection<ChatSession>(chatsQuery);

  const handleNewChatClick = () => {
    onNewChat();
  }

  return (
    <div className="w-72 flex flex-col bg-muted/30 border-r p-4 hidden md:flex">
      <Button onClick={handleNewChatClick} className="w-full mb-6" variant="default">
        <PlusCircle className="mr-2 h-4 w-4" />
        New Consultation
      </Button>
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent History</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {loading && (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )}
        {chats && chats.map(chat => (
          <Button 
            key={chat.id} 
            variant="ghost" 
            className={cn(
                "w-full justify-start gap-3 h-11 px-3 font-normal",
                selectedChatId === chat.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
            )}
            onClick={() => onSelectChat(chat.id)}
            >
            <MessageSquare className={cn("h-4 w-4", selectedChatId === chat.id ? "text-primary" : "text-muted-foreground")} />
            <span className="truncate flex-1 text-left">{chat.title}</span>
          </Button>
        ))}
        {!loading && (!chats || chats.length === 0) && (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">No previous chats</p>
          </div>
        )}
      </div>
    </div>
  );
}
