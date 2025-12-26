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

  // If firestore is not available, don't attempt to query or render the component.
  if (!firestore) {
    return null;
  }

  const chatsQuery = query(collection(firestore, 'users', userId, 'chats'), orderBy('createdAt', 'desc'));
    
  const { data: chats, loading } = useCollection<ChatSession>(chatsQuery);

  const handleNewChatClick = () => {
    onNewChat();
  }

  return (
    <div className="w-64 flex flex-col bg-card rounded-l-xl shadow-lg border p-4">
      <Button onClick={handleNewChatClick} className="w-full mb-4">
        <PlusCircle className="mr-2 h-4 w-4" />
        New Chat
      </Button>
      <h2 className="text-lg font-headline mb-2 px-2">History</h2>
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && (
            <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </>
        )}
        {chats && chats.map(chat => (
          <Button 
            key={chat.id} 
            variant="ghost" 
            className={cn(
                "w-full justify-start gap-2",
                selectedChatId === chat.id && "bg-accent"
            )}
            onClick={() => onSelectChat(chat.id)}
            >
            <MessageSquare className="h-4 w-4" />
            <span className="truncate">{chat.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
