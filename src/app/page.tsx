import Header from '@/components/layout/header';
import ChatWrapper from '@/components/chat/chat-wrapper';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        <ChatWrapper />
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HealthWise AI. All rights reserved.</p>
        <Link href="/accuracy" className="underline hover:text-primary">
          Check Model Accuracy
        </Link>
      </footer>
    </div>
  );
}
