
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeartPulse, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  userId: string;
}

export default function Header({ userId }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const [idInput, setIdInput] = useState('');
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestore = () => {
    if (idInput.trim()) {
      router.push(`/?userId=${idInput.trim()}`);
    }
  };


  return (
    <header className="bg-health-green text-slate-800 py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-bold tracking-wider">
            DR.TRUETRASH
          </h1>
        </div>

        <div className="flex-1 flex justify-center items-center gap-2">
            <Input 
              type="text" 
              placeholder="Enter your ID to restore chats" 
              className="max-w-xs bg-white/80 placeholder:text-slate-600"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
            />
            <Button onClick={handleRestore} variant="ghost" className="text-slate-800 hover:bg-white/20">
              Restore
            </Button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Your ID:</span>
          <span className="font-mono bg-white/20 px-2 py-1 rounded">{userId}</span>
          <Button size="icon" variant="ghost" onClick={handleCopy} className="h-8 w-8 text-slate-800 hover:bg-white/20">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
