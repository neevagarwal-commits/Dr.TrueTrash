
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { HeartPulse, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase/auth/use-user';
import { signOut } from '@/firebase/auth/client';
import { useAuth } from '@/firebase';

export default function Header() {
  const { user, loading } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <header className="bg-health-green text-slate-800 py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user && <SidebarTrigger className="md:hidden" />}
          <HeartPulse className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-bold tracking-wider">
            DR.TRUETRASH
          </h1>
        </div>
        <nav className="flex items-center gap-2">
          {user && !user.isAnonymous && (
            <Button asChild variant="ghost" className="text-slate-800 hover:bg-white/20">
              <Link href="/accuracy">Check Accuracy</Link>
            </Button>
          )}
          {loading ? null : user ? (
            <Button onClick={handleSignOut} variant="ghost" className="text-slate-800 hover:bg-white/20">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          ) : null }
        </nav>
      </div>
    </header>
  );
}
