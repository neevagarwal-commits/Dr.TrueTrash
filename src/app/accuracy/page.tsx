'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { checkAccuracy } from './actions';
import { useToast } from '@/hooks/use-toast';

import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


const accuracySchema = z.object({
  validationData: z.string().min(10, 'Validation data is required and must be valid JSON.'),
  predictions: z.string().min(10, 'Predictions data is required and must be valid JSON.'),
});

export default function AccuracyPage() {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof accuracySchema>>({
    resolver: zodResolver(accuracySchema),
    defaultValues: {
      validationData: '',
      predictions: '',
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof accuracySchema>) => {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await checkAccuracy(values);
      setReport(result);
    } catch (error) {
      toast({
        title: 'Evaluation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Model Accuracy Evaluation</CardTitle>
              <CardDescription>
                Provide validation data and model predictions in JSON format to generate an accuracy report.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="validationData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validation Dataset (JSON)</FormLabel>
                        <FormControl>
                          <Textarea placeholder='e.g., [{"symptoms": ["fever"], "actual": "flu"}]' {...field} rows={8} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="predictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Predictions (JSON)</FormLabel>
                        <FormControl>
                          <Textarea placeholder='e.g., [{"symptoms": ["fever"], "predicted": "flu"}]' {...field} rows={8} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      'Evaluate Accuracy'
                    )}
                  </Button>
                </form>
              </Form>

              {report && (
                <Card className="mt-6 bg-muted">
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">Accuracy Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm font-code bg-background p-4 rounded-md border">
                      {report}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
