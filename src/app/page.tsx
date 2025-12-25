'use client';

import { useState } from 'react';
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
import {
  signInWithEmail,
  signUpWithEmail,
  signInAsGuest,
  sendPasswordReset,
} from '@/firebase/auth/client';
import { useAuth } from '@/firebase';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Mail, KeyRound, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function Home() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);


  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const handleGuestSignIn = async () => {
    if (!auth) return;
    setIsProcessing(true);
    setError(null);
    setInfo(null);
    try {
      await signInAsGuest(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in as guest.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!auth) return;
    setIsProcessing(true);
    setError(null);
    setInfo(null);
    try {
      await signUpWithEmail(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up. The email may already be in use.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!auth) return;
    setIsProcessing(true);
    setError(null);
    setInfo(null);
    try {
      await signInWithEmail(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please check your email and password.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!auth || !email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      await sendPasswordReset(auth, email);
      setInfo("Password reset link has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email.');
    } finally {
      setIsProcessing(false);
    }
  };


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
             <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">Welcome to DR.TRUETRASH</CardTitle>
                  <CardDescription>Sign in to save your chat history or continue as a guest.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleGuestSignIn} variant="outline" className="w-full" disabled={isProcessing}>
                    <User className="mr-2 h-4 w-4" />
                    Continue as Guest
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or with email
                      </span>
                    </div>
                  </div>
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <div className="space-y-4 pt-4">
                       <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="email" 
                          placeholder="email@example.com" 
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isProcessing}
                        />
                      </div>
                       <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="password" 
                          placeholder="Password" 
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                    <TabsContent value="signin">
                       <div className="flex flex-col gap-4 pt-4">
                          <Button onClick={handleEmailSignIn} disabled={isProcessing}>
                            {isProcessing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign In
                          </Button>
                           <Button variant="link" size="sm" className="text-muted-foreground" onClick={handlePasswordReset} disabled={isProcessing}>
                            Forgot Password?
                          </Button>
                       </div>
                    </TabsContent>
                    <TabsContent value="signup">
                       <div className="pt-4">
                         <Button onClick={handleEmailSignUp} disabled={isProcessing} className="w-full">
                            {isProcessing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Account
                          </Button>
                       </div>
                    </TabsContent>
                  </Tabs>

                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {info && <p className="text-sm text-blue-500">{info}</p>}
                </CardContent>
              </Card>
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
