'use client';

import { useState, useEffect } from 'react';
import ChatWrapper from '@/components/chat/chat-wrapper';
import Header from '@/components/layout/header';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import ChatHistory from '@/components/chat/chat-history';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { signInWithPhoneNumber, confirmVerificationCode } from '@/firebase/auth/client';
import { useAuth } from '@/firebase';
import { Input } from '@/components/ui/input';
import { LoaderCircle } from 'lucide-react';
import type { ConfirmationResult } from 'firebase/auth';

export default function Home() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const handleSendCode = async () => {
    if (auth && phoneNumber) {
      setIsSendingCode(true);
      setError(null);
      try {
        // Ensure the phone number includes the country code and is prefixed with '+'
        const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        const result = await signInWithPhoneNumber(auth, formattedPhoneNumber);
        setConfirmationResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send verification code.');
      } finally {
        setIsSendingCode(false);
      }
    }
  };

  const handleVerifyCode = async () => {
    if (confirmationResult && verificationCode) {
      setIsVerifyingCode(true);
      setError(null);
      try {
        await confirmVerificationCode(confirmationResult, verificationCode);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Invalid verification code.');
      } finally {
        setIsVerifyingCode(false);
      }
    }
  }

  if (loading) {
    return (
       <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </main>
      </div>
    )
  }

  if (!user) {
    return (
       <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="max-w-md space-y-4">
              <h2 className="text-2xl font-bold">Welcome to DR.TRUETRASH</h2>
              <p className="text-muted-foreground">Please sign in with your phone number to start a new chat session and save your history.</p>

              {!confirmationResult ? (
                <div className="flex flex-col gap-4">
                   <div id="recaptcha-container"></div>
                   <Input 
                    type="tel"
                    placeholder="e.g. 15551234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isSendingCode}
                  />
                  <Button onClick={handleSendCode} disabled={!auth || !phoneNumber || isSendingCode}>
                    {isSendingCode ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Send Verification Code
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Input 
                    type="text"
                    placeholder="Verification Code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isVerifyingCode}
                  />
                  <Button onClick={handleVerifyCode} disabled={!verificationCode || isVerifyingCode}>
                     {isVerifyingCode ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify and Sign In
                  </Button>
                </div>
              )}
               {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          </main>
           <footer className="py-4 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} DR.TRUETRASH. All rights
              reserved.
            </p>
          </footer>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="offcanvas">
        <ChatHistory
          currentChatId={currentChatId}
          onSelectChat={setCurrentChatId}
          onNewChat={handleNewChat}
        />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
          <Header />
          <main className="flex-1 flex flex-col items-center py-8 px-4">
            <ChatWrapper chatId={currentChatId} onChatIdChange={setCurrentChatId} />
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