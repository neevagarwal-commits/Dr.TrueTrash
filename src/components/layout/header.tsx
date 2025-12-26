
'use client';

import { HeartPulse } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-health-green text-slate-800 py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <HeartPulse className="h-8 w-8" />
            <h1 className="text-2xl font-headline font-bold tracking-wider">
              DR.TRUETRASH
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
