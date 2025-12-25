import ChatWrapper from '@/components/chat/chat-wrapper';
import Header from '@/components/layout/header';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import ChatHistory from '@/components/chat/chat-history';

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="offcanvas">
        <ChatHistory />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
          <Header />
          <main className="flex-1 flex flex-col items-center py-8 px-4">
            <ChatWrapper />
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
