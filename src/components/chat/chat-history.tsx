
'use client';

import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTitle,
} from '@/components/ui/sidebar-v2';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Mock data for chat history
const MOCK_HISTORY = [
  {
    id: '1',
    title: 'Fever and Headache',
    date: '2024-07-29',
  },
  {
    id: '2',
    title: 'Sore Throat Analysis',
    date: '2024-07-28',
  },
  {
    id: '3',
    title: 'General Fatigue Check',
    date: '2024-07-27',
  },
];

export default function ChatHistory() {
  const handleNewChat = () => {
    // In a real app, this would clear the current chat and start a new session.
    console.log('Starting new chat...');
  };

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader>
        <SidebarTitle>Chat History</SidebarTitle>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleNewChat}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {MOCK_HISTORY.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                tooltip={{ children: chat.title, side: 'right' }}
              >
                <div className="flex flex-col items-start text-left">
                  <span className="truncate">{chat.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {chat.date}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </div>
  );
}
