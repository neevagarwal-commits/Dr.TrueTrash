
'use client';

import { Button } from '@/components/ui/button';
import { HeartPulse } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-health-green text-slate-800 py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-bold tracking-wider">
            DR.TRUETRASH
          </h1>
        </div>
        <nav className="flex items-center gap-2">
           <Button asChild variant="ghost" className="text-slate-800 hover:bg-white/20">
              <Link href="/accuracy">Check Accuracy</Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}
